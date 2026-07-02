import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { fulfillAndNotify } from "@/lib/fulfillment";
import { verifyAdminToken } from "@/lib/admin-guard";

export const runtime = "nodejs";

const ADMIN_COOKIE = "simkuu_admin_session";
async function requireAdmin(): Promise<boolean> {
  const c = await cookies();
  return verifyAdminToken(c.get(ADMIN_COOKIE)?.value);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  try {
    const { id } = await params;
    const body = await req.json();

    // Special action: mark crypto order as paid → trigger fulfillment
    if (body.action === "mark_paid") {
      const order = await db.order.findUnique({ where: { id } });
      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      if (order.status === "ACTIVE") return NextResponse.json({ error: "Order already completed" }, { status: 400 });

      const result = await fulfillAndNotify(id, "admin_manual");
      if (!result.ok) {
        return NextResponse.json(
          { error: result.reason === "no_inventory" ? "No eSIM inventory available for this plan" : result.message },
          { status: 422 }
        );
      }

      return NextResponse.json({ ok: true, esim: result.esim });
    }

    // Generic status update — validate against the real enum so arbitrary
    // input can't reach Prisma, and never silently downgrade a delivered order.
    const VALID_STATUSES = ["PENDING", "PROCESSING", "ACTIVE", "EXPIRED", "CANCELLED", "REFUNDED"];
    const nextStatus = body.status ? String(body.status).toUpperCase() : undefined;
    if (nextStatus && !VALID_STATUSES.includes(nextStatus)) {
      return NextResponse.json({ error: `Invalid status: ${body.status}` }, { status: 400 });
    }
    if (nextStatus) {
      const current = await db.order.findUnique({ where: { id }, select: { status: true } });
      if (!current) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      // A delivered (ACTIVE) order can only move to a terminal state, never back
      // to PENDING/PROCESSING — the eSIM is already in the customer's hands.
      if (current.status === "ACTIVE" && ["PENDING", "PROCESSING"].includes(nextStatus)) {
        return NextResponse.json(
          { error: "Cannot revert a delivered order to a pre-fulfillment status" },
          { status: 409 }
        );
      }
    }

    const order = await db.order.update({
      where: { id },
      data: {
        ...(nextStatus && { status: nextStatus }),
      },
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true, carrier: { select: { name: true } } } },
      },
    });
    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

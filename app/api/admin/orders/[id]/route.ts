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

    // Generic status update
    const order = await db.order.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status.toUpperCase() }),
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

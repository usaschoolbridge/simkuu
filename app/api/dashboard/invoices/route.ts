export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const invoices = await db.invoice.findMany({
      where: { order: { userId: session.userId } },
      include: {
        order: {
          select: {
            orderNo: true,
            planId: true,
            plan: { select: { name: true } },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json(
      invoices.map((inv: (typeof invoices)[number]) => ({
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        orderNo: inv.order.orderNo,
        orderDisplayId: `ORD-${new Date(inv.issuedAt).getFullYear()}-${String(inv.order.orderNo).padStart(6, "0")}`,
        plan: inv.order.plan?.name ?? "eSIM Plan",
        amount: Number(inv.amount),
        currency: inv.currency,
        issuedAt: new Date(inv.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        paidAt: inv.paidAt ? new Date(inv.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null,
      }))
    );
  } catch (err) {
    console.error("[dashboard/invoices]", err);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

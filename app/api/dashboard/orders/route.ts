export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const orders = await db.order.findMany({
      where: { userId: session.userId },
      include: {
        plan: { include: { carrier: true } },
        invoice: { select: { invoiceNo: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      orders.map(o => ({
        id: o.id,
        displayId: `ORD-${new Date(o.createdAt).getFullYear()}-${String(o.orderNo).padStart(6, "0")}`,
        invoiceNo: o.invoice?.invoiceNo ?? null,
        plan: o.plan?.name ?? "eSIM Plan",
        carrier: o.plan?.carrier?.name ?? "Unknown",
        date: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        amount: `$${Number(o.amount).toFixed(2)}`,
        status: o.status.toLowerCase(),
        paymentProvider: o.paymentProvider ?? "Unknown",
      }))
    );
  } catch (err) {
    console.error("[dashboard/orders]", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

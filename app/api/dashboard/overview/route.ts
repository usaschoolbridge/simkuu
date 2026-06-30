export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

/** GET /api/dashboard/overview — stats, recent orders, customer ID for the signed-in user */
export async function GET() {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [user, orders, activeEsims] = await Promise.all([
      db.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, customerNo: true, email: true, createdAt: true, walletBalance: true },
      }),
      db.order.findMany({
        where: { userId: session.userId },
        include: {
          plan: { include: { carrier: true } },
          invoice: { select: { invoiceNo: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.eSim.count({ where: { userId: session.userId, status: "ACTIVE" } }),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    type OrderItem = (typeof orders)[number];
    const totalSpent = orders
      .filter((o: OrderItem) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
      .reduce((sum: number, o: OrderItem) => sum + Number(o.amount), 0);

    const customerId = `SIM${String(user.customerNo).padStart(6, "0")}`;

    const recentOrders = orders.map((o: OrderItem) => ({
      id: o.id,
      orderNo: o.orderNo,
      displayId: `ORD-${new Date(o.createdAt).getFullYear()}-${String(o.orderNo).padStart(6, "0")}`,
      invoiceNo: o.invoice?.invoiceNo ?? null,
      plan: o.plan?.name ?? "eSIM Plan",
      carrier: o.plan?.carrier?.name ?? "Unknown",
      date: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amount: `$${Number(o.amount).toFixed(2)}`,
      status: o.status.toLowerCase(),
    }));

    return NextResponse.json({
      customerId,
      customerNo: user.customerNo,
      name: user.name,
      email: user.email,
      memberSince: new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      stats: {
        activeEsims,
        totalOrders: orders.length,
        totalSpent: `$${totalSpent.toFixed(2)}`,
        walletBalance: `$${Number(user.walletBalance).toFixed(2)}`,
      },
      recentOrders,
    });
  } catch (err) {
    console.error("[dashboard/overview]", err);
    return NextResponse.json({ error: "Failed to load overview" }, { status: 500 });
  }
}

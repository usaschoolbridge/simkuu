import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalRevenue,
      lastMonthRevenue,
      totalOrders,
      lastMonthOrders,
      activeCustomers,
      lastMonthCustomers,
      activeEsims,
      recentOrders,
      openTickets,
    ] = await Promise.all([
      db.order.aggregate({ _sum: { amount: true }, where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } } }),
      db.order.aggregate({ _sum: { amount: true }, where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.order.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      db.user.count({ where: { role: "USER" } }),
      db.user.count({ where: { role: "USER", createdAt: { lt: startOfMonth } } }),
      db.eSim.count({ where: { status: "ACTIVE" } }),
      db.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          plan: { select: { name: true, carrier: { select: { name: true } } } },
        },
      }),
      db.supportTicket.count({ where: { status: "OPEN" } }),
    ]);

    const revChange = lastMonthRevenue._sum.amount
      ? ((Number(totalRevenue._sum.amount ?? 0) - Number(lastMonthRevenue._sum.amount)) / Number(lastMonthRevenue._sum.amount)) * 100
      : 0;
    const ordChange = lastMonthOrders > 0
      ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100
      : 0;
    const custChange = lastMonthCustomers > 0
      ? ((activeCustomers - lastMonthCustomers) / lastMonthCustomers) * 100
      : 0;

    return NextResponse.json({
      stats: {
        totalRevenue: Number(totalRevenue._sum.amount ?? 0),
        revenueChange: revChange,
        totalOrders,
        ordersChange: ordChange,
        activeCustomers,
        customersChange: custChange,
        activeEsims,
      },
      recentOrders,
      openTickets,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const now = new Date();
    const startOfToday    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth    = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth= new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      todayRevenue,
      todayOrders,
      totalRevenue,
      lastMonthRevenue,
      totalOrders,
      lastMonthOrders,
      activeCustomers,
      lastMonthCustomers,
      activeEsims,
      pendingOrders,
      confirmedOrders,
      expiredOrders,
      cryptoOrders,
      recentOrders,
      openTickets,
      availableInventory,
      lowStockPlans,
    ] = await Promise.all([
      // Today
      db.order.aggregate({ _sum: { amount: true }, where: { status: "ACTIVE", createdAt: { gte: startOfToday } } }),
      db.order.count({ where: { createdAt: { gte: startOfToday } } }),

      // This month
      db.order.aggregate({ _sum: { amount: true }, where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfMonth } } }),
      db.order.aggregate({ _sum: { amount: true }, where: { status: { not: "CANCELLED" }, createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
      db.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      db.order.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),

      // Customers
      db.user.count({ where: { role: "USER" } }),
      db.user.count({ where: { role: "USER", createdAt: { lt: startOfMonth } } }),

      // Active eSIMs
      db.eSim.count({ where: { status: "ACTIVE" } }),

      // Order status breakdown
      db.order.count({ where: { status: "PENDING" } }),
      db.order.count({ where: { status: "ACTIVE" } }),
      db.order.count({ where: { status: "CANCELLED" } }),

      // Crypto orders this month
      db.order.count({ where: { paymentProvider: "CRYPTO", createdAt: { gte: startOfMonth } } }),

      // Recent orders
      db.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          plan: { select: { name: true, carrier: { select: { name: true } } } },
        },
      }),

      // Support
      db.supportTicket.count({ where: { status: "OPEN" } }),

      // Inventory
      db.inventoryItem.count({ where: { status: "AVAILABLE" } }),
      db.plan.findMany({
        where: { isActive: true },
        select: {
          id: true, name: true,
          inventory: { where: { status: "AVAILABLE" }, select: { id: true } },
        },
      }),
    ]);

    const revChange = lastMonthRevenue._sum.amount
      ? ((Number(totalRevenue._sum.amount ?? 0) - Number(lastMonthRevenue._sum.amount)) / Number(lastMonthRevenue._sum.amount)) * 100
      : 0;
    const ordChange = lastMonthOrders > 0
      ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0;
    const custChange = lastMonthCustomers > 0
      ? ((activeCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0;

    // Low stock = plans with fewer than 5 available items
    type PlanStock = { id: string; name: string; inventory: { id: string }[] };
    const lowStockAlerts = (lowStockPlans as PlanStock[])
      .filter((p) => p.inventory.length < 5)
      .map((p) => ({ planId: p.id, planName: p.name, available: p.inventory.length }));

    return NextResponse.json({
      stats: {
        todayRevenue: Number(todayRevenue._sum.amount ?? 0),
        todayOrders,
        totalRevenue: Number(totalRevenue._sum.amount ?? 0),
        revenueChange: revChange,
        totalOrders,
        ordersChange: ordChange,
        activeCustomers,
        customersChange: custChange,
        activeEsims,
        pendingOrders,
        confirmedOrders,
        expiredOrders,
        cryptoOrders,
        availableInventory,
      },
      recentOrders,
      openTickets,
      lowStockAlerts,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}

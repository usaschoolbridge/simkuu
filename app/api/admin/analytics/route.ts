import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Total revenue, orders, customers
    const [totalRevenue, totalOrders, totalCustomers, recentOrders, topPlans] = await Promise.all([
      db.order.aggregate({
        _sum: { amount: true },
        where: { status: { not: "CANCELLED" }, createdAt: { gte: sixMonthsAgo } },
      }),
      db.order.count({ where: { createdAt: { gte: sixMonthsAgo } } }),
      db.user.count({ where: { role: "USER", createdAt: { gte: sixMonthsAgo } } }),
      db.order.findMany({
        where: { createdAt: { gte: sixMonthsAgo }, status: { not: "CANCELLED" } },
        select: { amount: true, createdAt: true, status: true },
        orderBy: { createdAt: "asc" },
      }),
      db.order.groupBy({
        by: ["planId"],
        where: { createdAt: { gte: sixMonthsAgo }, status: { not: "CANCELLED" } },
        _sum: { amount: true },
        _count: { id: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 5,
      }),
    ]);

    // Build monthly breakdown
    const monthlyMap: Record<string, { revenue: number; orders: number }> = {};
    for (const order of recentOrders) {
      const key = order.createdAt.toISOString().slice(0, 7); // "2026-01"
      if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, orders: 0 };
      monthlyMap[key].revenue += Number(order.amount);
      monthlyMap[key].orders += 1;
    }

    const monthly = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleString("en", { month: "short" }),
        ...data,
      }));

    // Resolve plan names
    const planIds = topPlans.map((p: { planId: string }) => p.planId);
    const plans = await db.plan.findMany({
      where: { id: { in: planIds } },
      select: { id: true, name: true },
    });
    const planMap = Object.fromEntries(plans.map((p: { id: string; name: string }) => [p.id, p.name]));

    const topPlansList = topPlans.map((p: { planId: string; _sum: { amount?: unknown }; _count: { id: number } }) => ({
      name: planMap[p.planId] ?? p.planId,
      revenue: `$${Number(p._sum.amount ?? 0).toLocaleString()}`,
      orders: p._count.id,
    }));

    const avgOrderValue = totalOrders > 0
      ? Number(totalRevenue._sum.amount ?? 0) / totalOrders
      : 0;

    return NextResponse.json({
      totalRevenue: Number(totalRevenue._sum.amount ?? 0),
      totalOrders,
      totalCustomers,
      avgOrderValue,
      monthly,
      topPlans: topPlansList,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

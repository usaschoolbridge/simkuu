export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      include: {
        carrier: true,
        _count: { select: { inventory: { where: { status: "AVAILABLE" } } } },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Attach inventoryCount to each plan
    const plansWithStock = plans.map((p: (typeof plans)[number]) => ({
      ...p,
      inventoryCount: p._count.inventory,
      inStock: p._count.inventory > 0,
    }));

    return NextResponse.json(plansWithStock);
  } catch (err) {
    console.error("[api/plans]", err);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

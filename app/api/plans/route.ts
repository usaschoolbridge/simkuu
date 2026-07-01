export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [plans, carrierStatusRow] = await Promise.all([
      db.plan.findMany({
        where: { isActive: true },
        include: {
          carrier: true,
          _count: { select: { inventory: { where: { status: "AVAILABLE" } } } },
        },
        orderBy: { sortOrder: "asc" },
      }),
      db.siteSettings.findUnique({ where: { key: "carrier_out_of_stock" } }),
    ]);

    const carrierOutOfStock: Record<string, boolean> =
      (carrierStatusRow?.value as Record<string, boolean>) ?? {};

    // Attach inventoryCount and carrier out-of-stock flag to each plan
    const plansWithStock = plans.map((p: (typeof plans)[number]) => {
      const carrierBlocked = carrierOutOfStock[p.carrierId] === true;
      return {
        ...p,
        inventoryCount: p._count.inventory,
        inStock: p._count.inventory > 0 && !carrierBlocked,
        carrierOutOfStock: carrierBlocked,
      };
    });

    return NextResponse.json(plansWithStock);
  } catch (err) {
    console.error("[api/plans]", err);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

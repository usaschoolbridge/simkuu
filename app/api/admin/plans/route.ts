import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";

// GET /api/admin/plans — list all plans
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const plans = await db.plan.findMany({
      include: { carrier: true, _count: { select: { orders: true } } },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(plans);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

// POST /api/admin/plans — create a plan
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const plan = await db.plan.create({
      data: {
        name: body.name,
        carrierId: body.carrierId,
        tier: body.tier ?? "STANDARD",
        interval: body.interval ?? "MONTHLY",
        price: parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        data: body.data,
        calls: body.calls ?? "Unlimited",
        sms: body.sms ?? "Unlimited",
        hotspot: body.hotspot ?? false,
        fiveG: body.fiveG ?? false,
        voip: body.voip ?? false,
        international: body.international ?? false,
        features: body.features ?? [],
        badge: body.badge ?? null,
        stripePriceId: body.stripePriceId ?? `price_${Date.now()}`,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json(plan, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}

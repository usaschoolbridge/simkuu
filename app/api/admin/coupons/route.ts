import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(coupons);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const body = await req.json();
    const coupon = await db.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        discountType: body.discountType === "percent" ? "PERCENTAGE" : "FIXED",
        discountValue: parseFloat(body.value),
        maxUses: body.maxUses ? parseInt(body.maxUses) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        minOrderAmount: body.minOrderAmount ? parseFloat(body.minOrderAmount) : null,
        isActive: true,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  code: z.string().min(1),
  planId: z.string().optional(), // only needed when coupon has plan restrictions
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { code, planId, amount } = parsed.data;

  try {
    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

    if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    if (!coupon.isActive) return NextResponse.json({ error: "This coupon is inactive" }, { status: 400 });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }
    if (coupon.minOrderAmount !== null && amount < Number(coupon.minOrderAmount)) {
      return NextResponse.json({
        error: `This coupon requires a minimum order of $${Number(coupon.minOrderAmount).toFixed(2)}`,
      }, { status: 400 });
    }
    // If plan-restricted, validate plan
    if (coupon.applicablePlans.length > 0 && planId && !coupon.applicablePlans.includes(planId)) {
      return NextResponse.json({ error: "This coupon is not valid for this plan" }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (amount * Number(coupon.discountValue)) / 100;
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), amount);
    }
    const finalAmount = Math.max(0, amount - discountAmount);

    return NextResponse.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2)),
    });
  } catch (err) {
    console.error("[coupon/validate]", err);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}

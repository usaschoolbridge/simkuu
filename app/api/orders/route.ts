export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, checkoutLimiter } from "@/lib/rate-limit";

const bodySchema = z.object({
  planId: z.string().min(1),
  name: z.string().min(2, "Name required").max(120),
  email: z.string().email("Valid email required"),
  phone: z.string().max(30).optional().or(z.literal("")),
  country: z.string().max(60).optional().or(z.literal("")),
  paymentProvider: z
    .enum(["STRIPE", "PAYPAL", "CRYPTO", "RAZORPAY", "APPLE_PAY", "GOOGLE_PAY"])
    .default("STRIPE"),
  couponCode: z.string().optional(),
  compat: z.string().optional(),
});

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const limit = await rateLimit(req, checkoutLimiter);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let data: z.infer<typeof bodySchema>;
  try {
    data = bodySchema.parse(await req.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message ?? "Invalid input" : "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    const plan = await db.plan.findUnique({ where: { id: data.planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not available" }, { status: 404 });
    }

    // ── Inventory check ───────────────────────────────────────────────────────
    const availableCount = await db.inventoryItem.count({
      where: { planId: data.planId, status: "AVAILABLE" },
    });
    if (availableCount === 0) {
      return NextResponse.json(
        { error: "This plan is currently out of stock. Please check back soon or choose a different plan." },
        { status: 409 }
      );
    }

    // ── Coupon validation + atomic increment ──────────────────────────────────
    let coupon = null;
    let discountAmount = 0;

    if (data.couponCode) {
      const rawCoupon = await db.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase().trim() },
      });

      if (
        rawCoupon &&
        rawCoupon.isActive &&
        !(rawCoupon.expiresAt && new Date(rawCoupon.expiresAt) < new Date()) &&
        !(rawCoupon.maxUses !== null && rawCoupon.usedCount >= rawCoupon.maxUses)
      ) {
        const planPrice = Number(plan.price);
        if (!rawCoupon.minOrderAmount || planPrice >= Number(rawCoupon.minOrderAmount)) {
          // Atomic increment — only succeeds if still under the usage limit
          const atomicResult = await db.coupon.updateMany({
            where: {
              id: rawCoupon.id,
              isActive: true,
              ...(rawCoupon.maxUses !== null
                ? { usedCount: { lt: rawCoupon.maxUses } }
                : {}),
            },
            data: { usedCount: { increment: 1 } },
          });

          if (atomicResult.count === 0) {
            return NextResponse.json(
              { error: "This coupon has reached its usage limit." },
              { status: 409 }
            );
          }

          coupon = rawCoupon;
          if (rawCoupon.discountType === "PERCENTAGE") {
            discountAmount = (planPrice * Number(rawCoupon.discountValue)) / 100;
          } else {
            discountAmount = Math.min(Number(rawCoupon.discountValue), planPrice);
          }
          discountAmount = parseFloat(discountAmount.toFixed(2));
        }
      }
    }

    const TAX_RATE = 0.09;
    // Enforce minimum $1 order amount — prevent $0 orders via coupon abuse
    const priceAfterDiscount = Math.max(1, Number(plan.price) - discountAmount);
    const taxAmount = parseFloat((priceAfterDiscount * TAX_RATE).toFixed(2));
    const finalAmount = parseFloat((priceAfterDiscount + taxAmount).toFixed(2));

    const email = data.email.toLowerCase().trim();
    const user = await db.user.upsert({
      where: { email },
      update: { name: data.name, ...(data.phone ? { phone: data.phone } : {}) },
      create: { email, name: data.name, ...(data.phone ? { phone: data.phone } : {}) },
    });

    const order = await db.order.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: "PENDING",
        amount: finalAmount,
        currency: "USD",
        paymentProvider: data.paymentProvider,
        ...(coupon && discountAmount > 0 ? { couponId: coupon.id, discountAmount } : {}),
        metadata: {
          ...(data.compat ? { compat: data.compat } : {}),
          ...(data.country ? { country: data.country } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
        },
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: finalAmount,
      currency: "USD",
      discountAmount,
      taxAmount,
      originalAmount: Number(plan.price),
    });
  } catch (err) {
    console.error("[orders] create failed", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

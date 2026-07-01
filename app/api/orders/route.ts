export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, checkoutLimiter } from "@/lib/rate-limit";

/**
 * POST /api/orders
 * Creates a PENDING order for a guest (or logged-in) buyer and returns its id.
 * The id is then handed to the payment provider as metadata.orderId so the
 * webhook can fulfill it. Minimal guest fields: name + email (phone optional).
 */

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

    // Coupon validation
    let coupon = null;
    let discountAmount = 0;
    if (data.couponCode) {
      coupon = await db.coupon.findUnique({ where: { code: data.couponCode.toUpperCase().trim() } });
      if (coupon && coupon.isActive &&
          !(coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) &&
          !(coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)) {
        const planPrice = Number(plan.price);
        if (!coupon.minOrderAmount || planPrice >= Number(coupon.minOrderAmount)) {
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (planPrice * Number(coupon.discountValue)) / 100;
          } else {
            discountAmount = Math.min(Number(coupon.discountValue), planPrice);
          }
          discountAmount = parseFloat(discountAmount.toFixed(2));
        }
      }
    }

    const TAX_RATE = 0.09;
    const priceAfterDiscount = Math.max(0, Number(plan.price) - discountAmount);
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

    // Increment coupon usage after successful order creation
    if (coupon && discountAmount > 0) {
      await db.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }

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

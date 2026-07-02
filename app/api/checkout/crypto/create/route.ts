export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, checkoutLimiter } from "@/lib/rate-limit";
import { generateQrDataUrl } from "@/lib/fulfillment";
import { createPayment, coinMeta, getMinPaymentUsd, NOWPAYMENTS_API_KEY, COIN_META } from "@/lib/payments/nowpayments";
import { sendCryptoOrderPlaced } from "@/lib/email";

const ALLOWED_CURRENCIES = new Set(Object.keys(COIN_META));

const schema = z.object({
  planId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
  country: z.string().max(60).optional().or(z.literal("")),
  payCurrency: z.string().min(2).max(20),
  couponCode: z.string().optional(),
  compat: z.string().optional(),
});

function buildCryptoPayUri(
  payCurrency: string,
  address: string,
  amount: number,
  extraId?: string | null
): string {
  const c = payCurrency.toLowerCase();
  if (c === "btc")  return `bitcoin:${address}?amount=${amount}`;
  if (c === "ltc")  return `litecoin:${address}?amount=${amount}`;
  if (c === "doge") return `dogecoin:${address}?amount=${amount}`;
  if (c === "sol")  return `solana:${address}?amount=${amount}`;
  if (c === "trx" || c === "usdttrc20") {
    return extraId
      ? `tron:${address}?amount=${amount}&memo=${extraId}`
      : `tron:${address}?amount=${amount}`;
  }
  if (c === "eth" || c.includes("erc20") || c === "usdc")
    return `ethereum:${address}?value=${amount}`;
  return `${c.replace(/[0-9].*$/, "")}:${address}?amount=${amount}`;
}

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  if (!NOWPAYMENTS_API_KEY) {
    return NextResponse.json(
      { error: "Crypto payments are not enabled yet. Please choose another method or contact support." },
      { status: 503 }
    );
  }

  const limit = await rateLimit(req, checkoutLimiter);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { planId, email, name, phone, country, payCurrency, couponCode, compat } = parsed.data;

  // ── Currency allowlist ────────────────────────────────────────────────────
  if (!ALLOWED_CURRENCIES.has(payCurrency.toLowerCase())) {
    return NextResponse.json({ error: "Unsupported cryptocurrency." }, { status: 400 });
  }

  try {
    const plan = await db.plan.findUnique({ where: { id: planId }, include: { carrier: true } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not available" }, { status: 404 });
    }

    // ── Inventory check ───────────────────────────────────────────────────────
    const availableCount = await db.inventoryItem.count({
      where: { planId, status: "AVAILABLE" },
    });
    if (availableCount === 0) {
      return NextResponse.json(
        { error: "This plan is currently out of stock. Please choose a different plan." },
        { status: 409 }
      );
    }

    // ── Coupon validation + atomic increment ──────────────────────────────────
    // We validate and increment in one atomic updateMany to prevent race
    // conditions where concurrent requests all pass the usedCount < maxUses check.
    let coupon = null;
    let discountAmount = 0;

    if (couponCode) {
      const rawCoupon = await db.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });

      if (
        rawCoupon &&
        rawCoupon.isActive &&
        !(rawCoupon.expiresAt && new Date(rawCoupon.expiresAt) < new Date()) &&
        !(rawCoupon.maxUses !== null && rawCoupon.usedCount >= rawCoupon.maxUses)
      ) {
        const planPrice = Number(plan.price);
        if (!rawCoupon.minOrderAmount || planPrice >= Number(rawCoupon.minOrderAmount)) {
          if (rawCoupon.applicablePlans.length === 0 || rawCoupon.applicablePlans.includes(planId)) {
            // Atomic increment — only succeeds if still under the limit
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
            discountAmount =
              rawCoupon.discountType === "PERCENTAGE"
                ? (planPrice * Number(rawCoupon.discountValue)) / 100
                : Math.min(Number(rawCoupon.discountValue), planPrice);
            discountAmount = parseFloat(discountAmount.toFixed(2));
          }
        }
      }
    }

    const TAX_RATE = 0.09;
    const priceAfterDiscount = Math.max(1, Number(plan.price) - discountAmount);
    const taxAmount = parseFloat((priceAfterDiscount * TAX_RATE).toFixed(2));
    const finalAmount = parseFloat((priceAfterDiscount + taxAmount).toFixed(2));

    // Preflight: NOWPayments rejects payments below a per-coin minimum (network
    // fees make tiny amounts uneconomical). A deep coupon can push the total
    // under that floor — catch it here with a clear message instead of a
    // generic "could not create payment", and roll back the coupon we claimed.
    const minUsd = await getMinPaymentUsd(payCurrency);
    if (minUsd !== null && finalAmount < minUsd) {
      if (coupon) {
        await db.coupon.updateMany({
          where: { id: coupon.id },
          data: { usedCount: { decrement: 1 } },
        }).catch(() => {});
      }
      return NextResponse.json(
        {
          error: `The minimum for ${coinMeta(payCurrency).name} is about $${minUsd.toFixed(2)}. Your total is $${finalAmount.toFixed(2)} — choose a different coin, or pay by card.`,
          code: "below_min_amount",
          minUsd,
          finalAmount,
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await db.user.upsert({
      where: { email: cleanEmail },
      update: { name, ...(phone ? { phone } : {}) },
      create: { email: cleanEmail, name, ...(phone ? { phone } : {}) },
    });

    const meta = coinMeta(payCurrency);

    const order = await db.order.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: "PENDING",
        amount: finalAmount,
        currency: "USD",
        paymentProvider: "CRYPTO",
        ...(coupon && discountAmount > 0 ? { couponId: coupon.id, discountAmount } : {}),
        metadata: {
          payCurrency: payCurrency.toLowerCase(),
          coinName: meta.name,
          network: meta.network,
          ...(phone ? { phone } : {}),
          ...(country ? { country } : {}),
          ...(compat ? { compat } : {}),
        },
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://simkuu.com";
    const payment = await createPayment({
      amount: finalAmount,
      orderId: order.id,
      description: `${plan.name} — eSIM Plan`,
      payCurrency,
      callbackUrl: `${baseUrl}/api/webhooks/nowpayments`,
    });

    await db.order.update({
      where: { id: order.id },
      data: {
        paymentId: payment.paymentId,
        metadata: {
          payCurrency: payment.payCurrency,
          coinName: meta.name,
          network: payment.network,
          payAddress: payment.payAddress,
          payAmount: payment.payAmount,
          paymentId: payment.paymentId,
          ...(payment.payinExtraId ? { payinExtraId: payment.payinExtraId } : {}),
          ...(phone ? { phone } : {}),
          ...(country ? { country } : {}),
          ...(compat ? { compat } : {}),
        },
      },
    });

    sendCryptoOrderPlaced(cleanEmail, {
      name,
      orderId: order.id,
      planName: plan.name,
      coinName: meta.name,
      network: payment.network,
      payAmount: payment.payAmount,
      payCurrency: payment.payCurrency,
      usdAmount: finalAmount,
    }).catch((e) => console.error("[crypto-create] order-placed email failed", e));

    const payUri = buildCryptoPayUri(
      payment.payCurrency,
      payment.payAddress,
      payment.payAmount,
      payment.payinExtraId
    );
    const qrDataUrl = await generateQrDataUrl(payUri).catch(() => null);

    return NextResponse.json({
      orderId: order.id,
      paymentId: payment.paymentId,
      paymentStatus: payment.paymentStatus,
      payAddress: payment.payAddress,
      payAmount: payment.payAmount,
      payCurrency: payment.payCurrency,
      network: payment.network,
      coinName: meta.name,
      payinExtraId: payment.payinExtraId,
      usdAmount: finalAmount,
      originalAmount: Number(plan.price),
      discountAmount,
      expiresAt: payment.expiresAt,
      qrDataUrl,
    });
  } catch (err) {
    console.error("[crypto-create]", err);
    // Surface NOWPayments' minimum-amount rejection clearly if the preflight
    // was skipped (e.g. min-amount API was briefly unreachable).
    const msg = err instanceof Error ? err.message.toLowerCase() : "";
    if (msg.includes("amount") && (msg.includes("minimal") || msg.includes("minimum") || msg.includes("too small") || msg.includes("less than"))) {
      return NextResponse.json(
        {
          error: "Your total is below the minimum for this coin. Choose a different cryptocurrency, remove the coupon, or pay by card.",
          code: "below_min_amount",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Could not create the crypto payment. Please try again." },
      { status: 502 }
    );
  }
}

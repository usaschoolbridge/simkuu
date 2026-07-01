export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, checkoutLimiter } from "@/lib/rate-limit";
import { generateQrDataUrl } from "@/lib/fulfillment";
import { createPayment, coinMeta, NOWPAYMENTS_API_KEY } from "@/lib/payments/nowpayments";
import { sendCryptoOrderPlaced } from "@/lib/email";

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

/**
 * Build a crypto URI that wallet apps can scan to auto-fill the amount.
 * Follows BIP-21 for BTC/LTC, EIP-681 simplified for ETH, Solana Pay for SOL,
 * and a generic currency:address?amount=X for others.
 */
function buildCryptoPayUri(
  payCurrency: string,
  address: string,
  amount: number,
  extraId?: string | null,
): string {
  const c = payCurrency.toLowerCase();

  if (c === "btc") return `bitcoin:${address}?amount=${amount}`;
  if (c === "ltc") return `litecoin:${address}?amount=${amount}`;
  if (c === "doge") return `dogecoin:${address}?amount=${amount}`;
  if (c === "sol") return `solana:${address}?amount=${amount}`;
  if (c === "trx" || c === "usdttrc20") {
    const base = `tron:${address}?amount=${amount}`;
    return extraId ? `${base}&memo=${extraId}` : base;
  }
  if (c === "eth" || c === "usdcerc20" || c === "usdc") {
    // EIP-681 simplified — amount in ETH for ETH; token transfers need contract but most wallets fall back gracefully
    return `ethereum:${address}?value=${amount}`;
  }
  if (c === "usdterc20" || c === "usdtbsc") {
    return `ethereum:${address}?value=${amount}`;
  }
  // Generic fallback — covers XMR, TON, BNB, MATIC, etc.
  const scheme = c.replace(/[0-9].*$/, ""); // strip trailing numbers/network suffix
  const base = `${scheme}:${address}?amount=${amount}`;
  return extraId ? `${base}&memo=${extraId}` : base;
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { planId, email, name, phone, country, payCurrency, couponCode, compat } = parsed.data;

  try {
    const plan = await db.plan.findUnique({ where: { id: planId }, include: { carrier: true } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not available" }, { status: 404 });
    }

    // ── Coupon validation (same logic as /api/orders) ────────────────────────
    let coupon = null;
    let discountAmount = 0;
    if (couponCode) {
      coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase().trim() } });
      if (
        coupon && coupon.isActive &&
        !(coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) &&
        !(coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
      ) {
        const planPrice = Number(plan.price);
        if (!coupon.minOrderAmount || planPrice >= Number(coupon.minOrderAmount)) {
          if (coupon.applicablePlans.length === 0 || coupon.applicablePlans.includes(planId)) {
            if (coupon.discountType === "PERCENTAGE") {
              discountAmount = (planPrice * Number(coupon.discountValue)) / 100;
            } else {
              discountAmount = Math.min(Number(coupon.discountValue), planPrice);
            }
            discountAmount = parseFloat(discountAmount.toFixed(2));
          }
        }
      }
    }

    const finalAmount = Math.max(0.5, parseFloat((Number(plan.price) - discountAmount).toFixed(2)));

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
        amount: finalAmount,       // ← DISCOUNTED amount stored on order
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

    // Increment coupon usage
    if (coupon && discountAmount > 0) {
      await db.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://simkuu.com";

    // ── Create payment with FINAL (discounted) amount ────────────────────────
    const payment = await createPayment({
      amount: finalAmount,          // ← DISCOUNTED amount sent to NOWPayments
      orderId: order.id,
      description: `${plan.name} — eSIM Plan`,
      payCurrency,
      callbackUrl: `${baseUrl}/api/webhooks/nowpayments`,
    });

    // Persist provider payment id + on-chain details on the order.
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

    // Order-placed confirmation email (best effort)
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

    // ── QR encodes full payment URI (address + amount) ────────────────────────
    // This lets wallet apps (Trust Wallet, Coinbase, MetaMask, etc.) auto-fill
    // the exact amount when the user scans — no manual entry required.
    const payUri = buildCryptoPayUri(
      payment.payCurrency,
      payment.payAddress,
      payment.payAmount,
      payment.payinExtraId,
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
    return NextResponse.json({ error: "Could not create the crypto payment. Please try again." }, { status: 502 });
  }
}

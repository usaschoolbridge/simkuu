export const runtime = "nodejs";

/**
 * POST /api/checkout/crypto/create
 * Creates a PENDING order and returns the admin's static wallet address for
 * the selected coin — no external payment gateway needed.
 * Admin manually confirms payment in the admin panel → triggers eSIM fulfillment.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, checkoutLimiter } from "@/lib/rate-limit";
import { coinMeta } from "@/lib/payments/nowpayments";
import { getWalletAddress } from "@/app/api/checkout/crypto/currencies/route";
import { sendCryptoOrderPlaced } from "@/lib/email";
import QRCode from "qrcode";

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

/** Build a crypto URI that wallet apps can scan to auto-fill the amount. */
function buildCryptoPayUri(payCurrency: string, address: string): string {
  const c = payCurrency.toLowerCase();
  if (c === "btc")       return `bitcoin:${address}`;
  if (c === "ltc")       return `litecoin:${address}`;
  if (c === "doge")      return `dogecoin:${address}`;
  if (c === "sol")       return `solana:${address}`;
  if (c === "trx" || c === "usdttrc20") return `tron:${address}`;
  if (c === "eth" || c.includes("erc20") || c === "usdc") return `ethereum:${address}`;
  return address; // plain address for unknown coins
}

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const limit = await rateLimit(req, checkoutLimiter);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { planId, email, name, phone, country, payCurrency, couponCode, compat } = parsed.data;

  // Check wallet address is configured
  const walletAddress = getWalletAddress(payCurrency);
  if (!walletAddress) {
    return NextResponse.json(
      { error: `${payCurrency.toUpperCase()} is not configured for payments. Please choose a different coin.` },
      { status: 400 }
    );
  }

  try {
    const plan = await db.plan.findUnique({ where: { id: planId }, include: { carrier: true } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not available" }, { status: 404 });
    }

    // ── Coupon validation ─────────────────────────────────────────────────────
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
            discountAmount = coupon.discountType === "PERCENTAGE"
              ? (planPrice * Number(coupon.discountValue)) / 100
              : Math.min(Number(coupon.discountValue), planPrice);
            discountAmount = parseFloat(discountAmount.toFixed(2));
          }
        }
      }
    }

    const finalAmount = parseFloat(Math.max(0, Number(plan.price) - discountAmount).toFixed(2));

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
          payAddress: walletAddress,
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

    // Generate QR code — encode just the address URI so any wallet can scan it
    const payUri = buildCryptoPayUri(payCurrency, walletAddress);
    const qrDataUrl = await QRCode.toDataURL(payUri, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 300,
      color: { dark: "#000000", light: "#FFFFFF" },
    }).catch(() => null);

    // Send order-placed email (best effort)
    sendCryptoOrderPlaced(cleanEmail, {
      name,
      orderId: order.id,
      planName: plan.name,
      coinName: meta.name,
      network: meta.network,
      payAmount: finalAmount,   // USD amount — no crypto conversion
      payCurrency: "USD",
      usdAmount: finalAmount,
    }).catch((e) => console.error("[crypto-create] email failed", e));

    return NextResponse.json({
      orderId: order.id,
      payAddress: walletAddress,
      payCurrency: payCurrency.toLowerCase(),
      coinName: meta.name,
      network: meta.network,
      usdAmount: finalAmount,
      originalAmount: Number(plan.price),
      discountAmount,
      qrDataUrl,
      // No payAmount / paymentId / expiresAt — these are manual payments
      payAmount: null,
      paymentId: null,
      payinExtraId: null,
      expiresAt: null,
    });
  } catch (err) {
    console.error("[crypto-create]", err);
    return NextResponse.json({ error: "Could not create your order. Please try again." }, { status: 500 });
  }
}

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, checkoutLimiter } from "@/lib/rate-limit";
import QRCode from "qrcode";
import { createPayment, coinMeta, NOWPAYMENTS_API_KEY } from "@/lib/payments/nowpayments";
import { sendCryptoOrderPlaced } from "@/lib/email";

const schema = z.object({
  planId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
  country: z.string().max(60).optional().or(z.literal("")),
  payCurrency: z.string().min(2).max(20),
  compat: z.string().optional(),
});

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
  const { planId, email, name, phone, country, payCurrency, compat } = parsed.data;

  try {
    const plan = await db.plan.findUnique({ where: { id: planId }, include: { carrier: true } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not available" }, { status: 404 });
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
        amount: plan.price,
        currency: "USD",
        paymentProvider: "CRYPTO",
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
      amount: Number(plan.price),
      orderId: order.id,
      description: `${plan.name} — eSIM Plan`,
      payCurrency,
      callbackUrl: `${baseUrl}/api/webhooks/nowpayments`,
    });

    // Persist the provider payment id + on-chain details on the order.
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

    // Order-placed confirmation email (best effort — never blocks payment).
    sendCryptoOrderPlaced(cleanEmail, {
      name,
      orderId: order.id,
      planName: plan.name,
      coinName: meta.name,
      network: payment.network,
      payAmount: payment.payAmount,
      payCurrency: payment.payCurrency,
      usdAmount: Number(plan.price),
    }).catch((e) => console.error("[crypto-create] order-placed email failed", e));

    const qrDataUrl = await QRCode.toDataURL(payment.payAddress, {
      errorCorrectionLevel: "M", margin: 1, width: 320,
      color: { dark: "#000000", light: "#FFFFFF" },
    }).catch(() => null);

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
      usdAmount: Number(plan.price),
      expiresAt: payment.expiresAt,
      qrDataUrl,
    });
  } catch (err) {
    console.error("[crypto-create]", err);
    return NextResponse.json({ error: "Could not create the crypto payment. Please try again." }, { status: 502 });
  }
}

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { rateLimit, checkoutLimiter } from "@/lib/rate-limit";

/**
 * POST /api/checkout/stripe
 * Creates a real Stripe Checkout Session for an existing PENDING order and
 * returns its hosted URL. The order id is attached as metadata.orderId so the
 * /api/webhooks/stripe handler can fulfill the eSIM after payment.
 *
 * Body: { orderId: string }
 *
 * Card, Apple Pay and Google Pay all route here — Stripe Checkout surfaces the
 * wallets automatically on supported devices based on your dashboard settings.
 */

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, checkoutLimiter);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Card payments are not enabled yet. Please choose another method or contact support." },
      { status: 503 }
    );
  }

  try {
    const { orderId } = (await req.json()) as { orderId?: string };
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { user: true, plan: true },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://simkuu.com";
    const unitAmount = Math.round(Number(order.amount) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: (order.currency || "usd").toLowerCase(),
            unit_amount: unitAmount,
            product_data: { name: `${order.plan.name} — eSIM Plan` },
          },
        },
      ],
      customer_email: order.user.email,
      success_url: `${appUrl}/checkout/success?orderId=${order.id}`,
      cancel_url: `${appUrl}/checkout?cancelled=1`,
      metadata: { orderId: order.id },
      payment_intent_data: { metadata: { orderId: order.id } },
    });

    await db.order
      .update({ where: { id: order.id }, data: { invoiceUrl: session.url ?? undefined } })
      .catch(() => {});

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[stripe-checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillAndNotify } from "@/lib/fulfillment";

/**
 * POST /api/webhooks/stripe
 * Setup: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *
 * The order id must be passed as session.metadata.orderId (or
 * payment_intent metadata) when the Checkout Session is created.
 */

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  // apiVersion left to SDK default; cast keeps us version-agnostic.
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripe();

  if (!webhookSecret || !stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          const r = await fulfillAndNotify(orderId, session.payment_intent as string);
          if (!r.ok) console.error("[stripe-webhook] fulfillment failed:", r.reason, r.message);
        } else {
          console.error("[stripe-webhook] checkout.session.completed missing metadata.orderId");
        }
        break;
      }
      case "payment_intent.payment_failed":
        console.log("[stripe-webhook] payment failed:", (event.data.object as Stripe.PaymentIntent).id);
        break;
      case "charge.refunded":
        console.log("[stripe-webhook] refund:", (event.data.object as Stripe.Charge).id);
        break;
    }
  } catch (e) {
    console.error("[stripe-webhook] handler error", e);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

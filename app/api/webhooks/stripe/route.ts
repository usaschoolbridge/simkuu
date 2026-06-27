import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events.
 *
 * Setup: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 *
 * Uncomment when stripe is installed:
 * import Stripe from "stripe";
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18" });
 */

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // --- Signature verification (uncomment when stripe is installed) ---
  // let event: Stripe.Event;
  // try {
  //   event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  // } catch (err) {
  //   console.error("[Stripe webhook] Invalid signature:", err);
  //   return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  // }

  // --- Event handling ---
  // switch (event.type) {
  //   case "checkout.session.completed": {
  //     const session = event.data.object as Stripe.Checkout.Session;
  //     await handleCheckoutComplete(session);
  //     break;
  //   }
  //   case "payment_intent.payment_failed": {
  //     const intent = event.data.object as Stripe.PaymentIntent;
  //     await handlePaymentFailed(intent);
  //     break;
  //   }
  //   case "charge.refunded": {
  //     const charge = event.data.object as Stripe.Charge;
  //     await handleRefund(charge);
  //     break;
  //   }
  // }

  return NextResponse.json({ received: true });
}

// async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
//   const { planId, planName } = session.metadata ?? {};
//   const customerId = session.customer as string;
//   // 1. Create Order in DB
//   // 2. Generate eSIM QR code
//   // 3. Send confirmation email via Resend
//   // 4. Update customer's plan in DB
// }

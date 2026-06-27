import { NextRequest, NextResponse } from "next/server";
import { STRIPE_PLANS } from "@/lib/payments/stripe";
import { rateLimit, checkoutLimiter } from "@/lib/rate-limit";

/**
 * POST /api/checkout/stripe
 * Creates a Stripe Checkout Session and returns the session URL.
 *
 * Body: { planId: string; couponCode?: string; customerId?: string }
 *
 * Uncomment when stripe is installed:
 * import Stripe from "stripe";
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-12-18" });
 */

export async function POST(req: NextRequest) {
  // Rate limit: 10 checkout attempts per minute per IP
  const limit = await rateLimit(req, checkoutLimiter);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": "60", "X-RateLimit-Remaining": String(limit.remaining) } }
    );
  }

  try {
    const body = await req.json() as { planId: string; couponCode?: string; customerId?: string };
    const { planId, couponCode } = body;

    const plan = STRIPE_PLANS[planId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // --- Stripe session creation (uncomment when stripe is installed) ---
    // const session = await stripe.checkout.sessions.create({
    //   mode: "payment",
    //   payment_method_types: ["card", "apple_pay", "google_pay", "link"],
    //   line_items: [{ price: plan.priceId, quantity: 1 }],
    //   ...(couponCode && { discounts: [{ coupon: couponCode }] }),
    //   success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${appUrl}/checkout/cancel`,
    //   metadata: { planId, planName: plan.name },
    //   customer_email: body.email,
    //   allow_promotion_codes: !couponCode,
    //   billing_address_collection: "auto",
    //   phone_number_collection: { enabled: false },
    // });
    // return NextResponse.json({ url: session.url, sessionId: session.id });

    // --- Placeholder response ---
    return NextResponse.json({
      url: `${appUrl}/checkout/success?session_id=demo_session_${Date.now()}`,
      sessionId: `demo_session_${Date.now()}`,
    });
  } catch (err) {
    console.error("[Stripe checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

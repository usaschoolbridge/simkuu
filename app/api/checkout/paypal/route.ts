import { NextRequest, NextResponse } from "next/server";
import { STRIPE_PLANS } from "@/lib/payments/stripe";

/**
 * POST /api/checkout/paypal
 * Creates a PayPal order and returns the approval URL.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { planId: string };
    const plan = STRIPE_PLANS[body.planId];
    if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    // In production:
    // const order = await createPayPalOrder(plan.amount, "USD", plan.name);
    // const approvalUrl = order.links.find((l: { rel: string }) => l.rel === "approve")?.href;
    // return NextResponse.json({ orderId: order.id, approvalUrl });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.json({
      orderId: `PAYPAL-${Date.now()}`,
      approvalUrl: `${appUrl}/checkout/success?provider=paypal`,
    });
  } catch (err) {
    console.error("[PayPal checkout]", err);
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}

/**
 * PATCH /api/checkout/paypal
 * Captures a PayPal order after user approves.
 */
export async function PATCH(req: NextRequest) {
  try {
    const { orderId } = await req.json() as { orderId: string };
    // const capture = await capturePayPalOrder(orderId);
    // return NextResponse.json(capture);
    return NextResponse.json({ status: "COMPLETED", orderId });
  } catch (err) {
    console.error("[PayPal capture]", err);
    return NextResponse.json({ error: "Failed to capture PayPal order" }, { status: 500 });
  }
}

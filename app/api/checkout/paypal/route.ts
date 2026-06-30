export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder, PAYPAL_CONFIGURED } from "@/lib/payments/paypal";
import { db } from "@/lib/db";
import { rateLimit, checkoutLimiter } from "@/lib/rate-limit";

/**
 * POST /api/checkout/paypal
 * Creates a real PayPal order for an existing PENDING order and returns the
 * approval URL. After the buyer approves, PayPal redirects to
 * /api/checkout/paypal/return which captures the payment and fulfills the eSIM.
 *
 * Body: { orderId: string }
 */
export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, checkoutLimiter);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  if (!PAYPAL_CONFIGURED) {
    return NextResponse.json(
      { error: "PayPal is not enabled yet. Please choose another method or contact support." },
      { status: 503 }
    );
  }

  try {
    const { orderId } = (await req.json()) as { orderId?: string };
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const order = await db.order.findUnique({ where: { id: orderId }, include: { plan: true } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://simkuu.com";

    const paypalOrder = await createPayPalOrder({
      amount: Number(order.amount),
      currency: order.currency || "USD",
      description: `${order.plan.name} — eSIM Plan`,
      orderId: order.id,
      returnUrl: `${appUrl}/api/checkout/paypal/return?orderId=${order.id}`,
      cancelUrl: `${appUrl}/checkout?cancelled=1`,
    });

    await db.order
      .update({ where: { id: order.id }, data: { paymentId: paypalOrder.id } })
      .catch(() => {});

    return NextResponse.json({ orderId: order.id, approvalUrl: paypalOrder.approvalUrl });
  } catch (err) {
    console.error("[paypal-checkout]", err);
    return NextResponse.json({ error: "Failed to create PayPal order" }, { status: 500 });
  }
}

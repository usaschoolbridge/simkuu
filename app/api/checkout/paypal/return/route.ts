export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/payments/paypal";
import { fulfillAndNotify } from "@/lib/fulfillment";

/**
 * GET /api/checkout/paypal/return?orderId=<ourOrderId>&token=<paypalOrderId>
 * PayPal redirects here after the buyer approves. We capture the payment and,
 * on success, fulfill the eSIM, then bounce the buyer to the success page.
 */
export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://simkuu.com";
  const url = new URL(req.url);
  const ourOrderId = url.searchParams.get("orderId") ?? "";
  const paypalOrderId = url.searchParams.get("token") ?? ""; // PayPal returns ?token=<orderId>

  if (!paypalOrderId) {
    return NextResponse.redirect(`${appUrl}/checkout?error=paypal_cancelled`);
  }

  try {
    const capture = await capturePayPalOrder(paypalOrderId);
    const orderId = capture.orderId || ourOrderId;

    if (capture.status === "COMPLETED" && orderId) {
      const r = await fulfillAndNotify(orderId, capture.captureId);
      if (!r.ok) console.error("[paypal-return] fulfillment failed:", r.reason, r.message);
      return NextResponse.redirect(`${appUrl}/checkout/success?orderId=${encodeURIComponent(orderId)}`);
    }

    console.error("[paypal-return] capture not completed:", capture.status);
    return NextResponse.redirect(`${appUrl}/checkout?error=paypal_failed`);
  } catch (err) {
    console.error("[paypal-return]", err);
    return NextResponse.redirect(`${appUrl}/checkout?error=paypal_error`);
  }
}

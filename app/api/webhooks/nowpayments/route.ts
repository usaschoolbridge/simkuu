export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, PAID_STATUSES, FAILED_STATUSES } from "@/lib/payments/nowpayments";
import { fulfillAndNotify } from "@/lib/fulfillment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const sig = req.headers.get("x-nowpayments-sig") ?? "";

    console.log("[nowpayments-webhook] Received:", {
      payment_id: body.payment_id,
      payment_status: body.payment_status,
      order_id: body.order_id,
      price_amount: body.price_amount,
      actually_paid: body.actually_paid,
    });

    // Verify signature
    const isValid = verifyWebhookSignature(body, sig);
    if (!isValid) {
      console.error("[nowpayments-webhook] Invalid signature — rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const status = body.payment_status as string;
    const orderId = body.order_id as string;
    const paymentId = body.payment_id as string | number;
    const actuallyPaid = body.actually_paid as string;
    const payCurrency = body.pay_currency as string;

    if (PAID_STATUSES.includes(status)) {
      console.log(`[nowpayments-webhook] PAID — orderId: ${orderId}, paid: ${actuallyPaid} ${payCurrency}`);
      const r = await fulfillAndNotify(orderId, String(paymentId));
      if (!r.ok) console.error("[nowpayments-webhook] fulfillment failed:", r.reason, r.message);

    } else if (FAILED_STATUSES.includes(status)) {
      console.log(`[nowpayments-webhook] FAILED — orderId: ${orderId}, status: ${status}`);

      // await db.order.update({
      //   where: { reference: orderId },
      //   data: { status: "FAILED" },
      // });

    } else {
      console.log(`[nowpayments-webhook] Status update — ${status} for orderId: ${orderId}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[nowpayments-webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

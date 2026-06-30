export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSign, PAID_STATUSES, FAILED_STATUSES } from "@/lib/payments/cryptomus";
import { fulfillAndNotify } from "@/lib/fulfillment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;

    console.log("[cryptomus-webhook] Received:", {
      type: body.type,
      order_id: body.order_id,
      status: body.status,
      payment_amount: body.payment_amount,
      currency: body.currency,
      payer_currency: body.payer_currency,
    });

    // Verify signature
    const isValid = verifyWebhookSign(body);
    if (!isValid) {
      console.error("[cryptomus-webhook] Invalid signature — rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const type = body.type as string;
    const status = body.status as string;
    const orderId = body.order_id as string;
    const uuid = body.uuid as string;
    const paymentAmount = body.payment_amount as string;
    const payerCurrency = body.payer_currency as string;
    const txid = body.txid as string | undefined;

    if (type !== "payment") {
      // Ignore non-payment webhook types (wallet, etc.)
      return NextResponse.json({ received: true });
    }

    if (PAID_STATUSES.includes(status)) {
      console.log(`[cryptomus-webhook] PAID — orderId: ${orderId}, amount: ${paymentAmount} ${payerCurrency}, txid: ${txid}`);
      const r = await fulfillAndNotify(orderId, uuid);
      if (!r.ok) console.error("[cryptomus-webhook] fulfillment failed:", r.reason, r.message);

    } else if (FAILED_STATUSES.includes(status)) {
      console.log(`[cryptomus-webhook] FAILED — orderId: ${orderId}, status: ${status}`);

      // TODO: Mark order as failed
      // await db.order.update({
      //   where: { reference: orderId },
      //   data: { status: "FAILED" },
      // });

    } else if (status === "refund_paid") {
      console.log(`[cryptomus-webhook] REFUNDED — orderId: ${orderId}`);
      // TODO: Handle refund
    } else {
      console.log(`[cryptomus-webhook] Status update — ${status} for orderId: ${orderId}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[cryptomus-webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

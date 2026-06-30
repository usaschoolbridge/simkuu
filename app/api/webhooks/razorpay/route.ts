export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { fulfillAndNotify } from "@/lib/fulfillment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET not set");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    // Verify signature
    const expectedSig = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
    if (signature !== expectedSig) {
      console.error("[razorpay-webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("[razorpay-webhook] Event:", event.event);

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        console.log("[razorpay-webhook] Payment captured:", payment.id, payment.amount, payment.currency);
        const orderId = payment.notes?.orderId as string | undefined;
        if (orderId) {
          const r = await fulfillAndNotify(orderId, payment.id);
          if (!r.ok) console.error("[razorpay-webhook] fulfillment failed:", r.reason, r.message);
        }
        else console.error("[razorpay-webhook] payment.captured missing notes.orderId");
        break;
      }
      case "payment.failed": {
        const payment = event.payload.payment.entity;
        console.log("[razorpay-webhook] Payment failed:", payment.id);
        // TODO: Update order status in DB
        break;
      }
      case "refund.created": {
        const refund = event.payload.refund.entity;
        console.log("[razorpay-webhook] Refund created:", refund.id);
        // TODO: Update order status in DB
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[razorpay-webhook]", e);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

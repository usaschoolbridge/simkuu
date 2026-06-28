export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { planId, currency = "USD" } = body;

    if (!planId) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 });
    }

    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Razorpay order creation — requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 });
    }

    const amountInPaise = Math.round(plan.price * 100); // Razorpay uses smallest currency unit

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency === "INR" ? "INR" : "USD",
        receipt: `order_${Date.now()}`,
        notes: {
          planId: plan.id,
          planName: plan.name,
          userId: session.userId,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("[razorpay] Order creation failed:", err);
      return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
    }

    const order = await response.json();
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId,
    });
  } catch (e) {
    console.error("[razorpay]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

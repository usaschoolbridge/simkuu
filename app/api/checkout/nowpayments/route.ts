export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createInvoice, NOWPAYMENTS_API_KEY } from "@/lib/payments/nowpayments";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  planId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    if (!NOWPAYMENTS_API_KEY) {
      return NextResponse.json(
        { error: "Crypto payments not configured. Please contact support." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const { planId, email, name } = parsed.data;

    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const orderId = `SIMKUU-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://simkuu.com";

    const invoice = await createInvoice({
      amount: Number(plan.price),
      currency: "usd",
      orderId,
      description: `${plan.name} — eSIM Plan`,
      callbackUrl: `${baseUrl}/api/webhooks/nowpayments`,
      successUrl: `${baseUrl}/checkout/success?orderId=${orderId}&method=crypto`,
      cancelUrl: `${baseUrl}/checkout?cancelled=1`,
    });

    // Store pending order metadata for webhook lookup
    await db.order.create({
      data: {
        reference: orderId,
        planId,
        customerEmail: email,
        customerName: name,
        amount: plan.price,
        currency: "USD",
        status: "PENDING",
        paymentMethod: "CRYPTO",
        paymentReference: invoice.id,
      },
    }).catch(() => {
      // Order table may not exist yet — non-blocking
    });

    return NextResponse.json({
      success: true,
      paymentUrl: invoice.invoiceUrl,
      invoiceId: invoice.id,
      orderId,
      amount: invoice.priceAmount,
      currency: invoice.priceCurrency,
    });
  } catch (err) {
    console.error("[nowpayments-checkout]", err);
    return NextResponse.json(
      { error: "Failed to create crypto payment. Please try again." },
      { status: 500 }
    );
  }
}

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
    if (!db) {
      return NextResponse.json({ error: "DB not configured" }, { status: 503 });
    }
    if (!NOWPAYMENTS_API_KEY) {
      return NextResponse.json(
        { error: "Crypto payments are not enabled yet. Please choose another method or contact support." },
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
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not available" }, { status: 404 });
    }

    // Upsert the buyer and create a real PENDING order. The order's cuid is
    // used as the NOWPayments order_id so the IPN webhook can fulfill it.
    const cleanEmail = email.toLowerCase().trim();
    const user = await db.user.upsert({
      where: { email: cleanEmail },
      update: { name },
      create: { email: cleanEmail, name },
    });

    const order = await db.order.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: "PENDING",
        amount: plan.price,
        currency: "USD",
        paymentProvider: "CRYPTO",
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://simkuu.com";

    const invoice = await createInvoice({
      amount: Number(plan.price),
      currency: "usd",
      orderId: order.id,
      description: `${plan.name} — eSIM Plan`,
      callbackUrl: `${baseUrl}/api/webhooks/nowpayments`,
      successUrl: `${baseUrl}/checkout/success?orderId=${order.id}&method=crypto`,
      cancelUrl: `${baseUrl}/checkout?cancelled=1`,
    });

    // Persist the hosted invoice URL + provider reference on the order.
    await db.order
      .update({
        where: { id: order.id },
        data: { invoiceUrl: invoice.invoiceUrl, paymentId: invoice.id },
      })
      .catch(() => {});

    return NextResponse.json({
      success: true,
      paymentUrl: invoice.invoiceUrl,
      invoiceId: invoice.id,
      orderId: order.id,
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

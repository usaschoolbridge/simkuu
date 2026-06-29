export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createCryptomusInvoice, getPaymentInfo, CRYPTOMUS_MERCHANT_ID, CRYPTOMUS_API_KEY } from "@/lib/payments/cryptomus";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  planId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  currency: z.enum(["USD", "INR"]).default("USD"),
});

export async function POST(req: NextRequest) {
  try {
    // Check credentials configured
    if (!CRYPTOMUS_MERCHANT_ID || !CRYPTOMUS_API_KEY) {
      return NextResponse.json(
        { error: "Crypto payments not configured. Please contact support." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const { planId, email, name, currency } = parsed.data;

    // Fetch plan from DB
    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Generate unique order ID
    const orderId = `SIMKUU-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://simkuu.com";

    // Create Cryptomus invoice
    const invoice = await createCryptomusInvoice({
      amount: plan.price.toFixed(2),
      currency: "USD", // always charge in USD, Cryptomus converts
      orderId,
      urlCallback: `${baseUrl}/api/webhooks/cryptomus`,
      urlSuccess: `${baseUrl}/checkout/success?orderId=${orderId}&method=crypto`,
      urlReturn: `${baseUrl}/checkout?cancelled=1`,
      lifetime: 3600, // 1 hour
      additionalData: JSON.stringify({ planId, email, name }).slice(0, 255),
    });

    return NextResponse.json({
      success: true,
      paymentUrl: invoice.url,
      invoiceUuid: invoice.uuid,
      orderId,
      amount: invoice.amount,
      currency: invoice.currency,
      expiredAt: invoice.expiredAt,
    });
  } catch (err) {
    console.error("[cryptomus-checkout]", err);
    return NextResponse.json(
      { error: "Failed to create crypto payment. Please try again." },
      { status: 500 }
    );
  }
}

// Poll payment status
export async function GET(req: NextRequest) {
  const uuid = req.nextUrl.searchParams.get("uuid");
  if (!uuid) {
    return NextResponse.json({ error: "uuid required" }, { status: 400 });
  }

  try {
    const info = await getPaymentInfo(uuid);
    return NextResponse.json(info);
  } catch (err) {
    console.error("[cryptomus-status]", err);
    return NextResponse.json({ error: "Failed to get payment status" }, { status: 500 });
  }
}

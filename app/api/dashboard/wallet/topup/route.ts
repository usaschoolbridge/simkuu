export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { createPayment, coinMeta, NOWPAYMENTS_API_KEY } from "@/lib/payments/nowpayments";

const schema = z.object({
  amount: z.number().min(5, "Minimum top-up is $5").max(1000, "Maximum top-up is $1000"),
  payCurrency: z.string().min(2).max(20),
});

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!NOWPAYMENTS_API_KEY) {
    return NextResponse.json({ error: "Crypto payments not configured" }, { status: 503 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { amount, payCurrency } = parsed.data;

  try {
    const user = await db.user.findUnique({ where: { id: session.userId }, select: { id: true, walletBalance: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Create pending wallet transaction — id used as order_id for NowPayments
    const tx = await db.walletTransaction.create({
      data: {
        userId: session.userId,
        type: "TOPUP",
        amount,
        balanceAfter: Number(user.walletBalance), // will be updated on success
        description: `Wallet top-up — $${amount.toFixed(2)}`,
        status: "PENDING",
        metadata: { payCurrency: payCurrency.toLowerCase() },
      },
    });

    const meta = coinMeta(payCurrency);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://simkuu.com";

    const payment = await createPayment({
      amount,
      orderId: tx.id, // wallet tx id as order id
      description: `Simkuu Wallet Top-Up — $${amount.toFixed(2)}`,
      payCurrency,
      callbackUrl: `${baseUrl}/api/webhooks/nowpayments`,
    });

    // Store payment id on the transaction
    await db.walletTransaction.update({
      where: { id: tx.id },
      data: { paymentId: String(payment.paymentId), metadata: { payCurrency: payCurrency.toLowerCase(), coinName: meta.name } },
    });

    return NextResponse.json({
      txId: tx.id,
      paymentId: String(payment.paymentId),
      payAddress: payment.payAddress,
      payAmount: payment.payAmount,
      payCurrency: payment.payCurrency,
      coinName: meta.name,
      network: meta.network,
      qrData: `${payCurrency.toLowerCase()}:${payment.payAddress}?amount=${payment.payAmount}`,
      expiresAt: payment.expiresAt,
    });
  } catch (err) {
    console.error("[wallet/topup]", err);
    return NextResponse.json({ error: "Failed to create payment. Please try again." }, { status: 500 });
  }
}

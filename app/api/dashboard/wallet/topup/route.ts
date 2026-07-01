export const runtime = "nodejs";
// route: POST /api/dashboard/wallet/topup
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
    return NextResponse.json({ error: "Crypto payments not configured on this server." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { amount, payCurrency } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, walletBalance: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const meta = coinMeta(payCurrency);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://simkuu.com";

    // Generate a temporary order reference — NOT saved to DB yet
    const tempOrderRef = `wallet_${session.userId}_${Date.now()}`;

    // Call NOWPayments FIRST — only create DB record if this succeeds
    let payment;
    try {
      payment = await createPayment({
        amount,
        orderId: tempOrderRef,
        description: `Simkuu Wallet Top-Up — $${amount.toFixed(2)}`,
        payCurrency,
        callbackUrl: `${baseUrl}/api/webhooks/nowpayments`,
      });
    } catch (npErr) {
      const errMsg = npErr instanceof Error ? npErr.message : String(npErr);
      console.error("[wallet/topup] NOWPayments error:", errMsg);

      // Return a user-friendly message based on the error
      if (errMsg.includes("422") || errMsg.includes("currency")) {
        return NextResponse.json({
          error: `${meta.name} is temporarily unavailable. Please try a different coin.`,
        }, { status: 422 });
      }
      if (errMsg.includes("401") || errMsg.includes("403")) {
        return NextResponse.json({
          error: "Payment gateway authentication failed. Please contact support.",
        }, { status: 502 });
      }
      return NextResponse.json({
        error: "Payment gateway is temporarily unavailable. Please try again in a moment.",
      }, { status: 502 });
    }

    // NOWPayments succeeded — NOW create the DB record
    const tx = await db.walletTransaction.create({
      data: {
        userId: session.userId,
        type: "TOPUP",
        amount,
        balanceAfter: Number(user.walletBalance), // updated on webhook confirmation
        description: `Wallet top-up — $${amount.toFixed(2)}`,
        status: "PENDING",
        paymentId: String(payment.paymentId),
        metadata: {
          payCurrency: payCurrency.toLowerCase(),
          coinName: meta.name,
          network: meta.network,
          nowPaymentsOrderId: tempOrderRef,
        },
      },
    });

    return NextResponse.json({
      txId: tx.id,
      paymentId: String(payment.paymentId),
      payAddress: payment.payAddress,
      payAmount: payment.payAmount,
      payCurrency: payment.payCurrency,
      coinName: meta.name,
      network: payment.network ?? meta.network,
      qrData: `${payCurrency.toLowerCase()}:${payment.payAddress}?amount=${payment.payAmount}`,
      payinExtraId: payment.payinExtraId ?? null,
      expiresAt: payment.expiresAt ?? null,
    });
  } catch (err) {
    console.error("[wallet/topup]", err);
    return NextResponse.json({ error: "Failed to create payment. Please try again." }, { status: 500 });
  }
}

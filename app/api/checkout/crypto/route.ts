import { NextRequest, NextResponse } from "next/server";
import { STRIPE_PLANS } from "@/lib/payments/stripe";
import { CRYPTO_CURRENCIES, convertUsdToCrypto, generatePaymentRef } from "@/lib/payments/crypto";

/**
 * POST /api/checkout/crypto
 * Returns crypto payment address + expected amount for the chosen coin.
 */
export async function POST(req: NextRequest) {
  try {
    const { planId, coinId } = await req.json() as { planId: string; coinId: string };

    const plan = STRIPE_PLANS[planId];
    if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

    const coin = CRYPTO_CURRENCIES.find((c) => c.id === coinId);
    if (!coin) return NextResponse.json({ error: "Invalid coin" }, { status: 400 });

    const cryptoAmount = await convertUsdToCrypto(plan.amount, coinId);
    const ref = generatePaymentRef();

    return NextResponse.json({
      ref,
      coin: coin.symbol,
      network: coin.network,
      address: coin.address,
      amount: cryptoAmount,
      usdAmount: plan.amount / 100,
      planName: plan.name,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
    });
  } catch (err) {
    console.error("[Crypto checkout]", err);
    return NextResponse.json({ error: "Failed to create crypto payment" }, { status: 500 });
  }
}

/**
 * GET /api/checkout/crypto?ref=PAY-xxx
 * Polls payment status (in production: check blockchain or NOWPayments API)
 */
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) return NextResponse.json({ error: "Missing ref" }, { status: 400 });

  // In production: query your DB or NOWPayments API for payment status
  return NextResponse.json({
    ref,
    status: "waiting", // "waiting" | "confirming" | "confirmed" | "expired"
    confirmations: 0,
    requiredConfirmations: 2,
  });
}

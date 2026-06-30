export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getEstimate, coinMeta, NOWPAYMENTS_API_KEY } from "@/lib/payments/nowpayments";

const schema = z.object({
  planId: z.string().min(1),
  payCurrency: z.string().min(2).max(20),
});

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  if (!NOWPAYMENTS_API_KEY) {
    return NextResponse.json(
      { error: "Crypto payments are not enabled yet. Please choose another method or contact support." },
      { status: 503 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const plan = await db.plan.findUnique({ where: { id: parsed.data.planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not available" }, { status: 404 });
    }

    const est = await getEstimate(Number(plan.price), parsed.data.payCurrency);
    return NextResponse.json({
      payCurrency: est.payCurrency,
      estimatedAmount: est.estimatedAmount,
      usdAmount: Number(plan.price),
      ...coinMeta(est.payCurrency),
    });
  } catch (err) {
    console.error("[crypto-estimate]", err);
    return NextResponse.json({ error: "Could not estimate the amount. Try a different coin." }, { status: 502 });
  }
}

export const runtime = "nodejs";

/**
 * POST /api/admin/payment-testing/simulate
 * Sandbox-only: build a signed NOWPayments-style IPN for an existing order (or
 * wallet transaction) and deliver it to our own webhook, exercising the full
 * webhook → fulfillment → email pipeline exactly as a real callback would.
 *
 * Body: { orderId: string, status: SimulatableStatus, paidFactor?: number }
 *   paidFactor: 1 = exact payment, 0.5 = underpayment, 1.2 = overpayment
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  testingGuard,
  signWebhookPayload,
  buildSimulatedPayload,
  SIMULATABLE_STATUSES,
} from "@/lib/payments/testing";

const schema = z.object({
  orderId: z.string().min(1),
  status: z.enum(SIMULATABLE_STATUSES),
  paidFactor: z.number().min(0).max(10).optional(),
});

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const guard = testingGuard(req); // admin + sandbox required
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { orderId, status, paidFactor } = parsed.data;

  // Resolve target: standard order or wallet transaction
  const order = await db.order.findUnique({ where: { id: orderId }, include: { plan: true } });
  const walletTx = order ? null : await db.walletTransaction.findUnique({ where: { id: orderId } });
  if (!order && !walletTx) {
    return NextResponse.json({ error: "No order or wallet transaction with that id" }, { status: 404 });
  }

  const meta = (order?.metadata as Record<string, unknown> | null) ?? {};
  const priceAmount = Number(order?.amount ?? walletTx?.amount ?? 0);
  const payCurrency = String(meta.payCurrency ?? "usdttrc20");
  const payAmount = Number(meta.payAmount ?? priceAmount);
  const paymentId =
    order?.paymentId ?? walletTx?.paymentId ?? `sandbox_${Date.now()}`;

  const payload = buildSimulatedPayload({
    orderId,
    paymentId: String(paymentId),
    status,
    priceAmount,
    payCurrency,
    payAmount,
    paidFactor,
  });
  const sig = signWebhookPayload(payload);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const res = await fetch(`${baseUrl}/api/webhooks/nowpayments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-nowpayments-sig": sig },
    body: JSON.stringify(payload),
  });
  const webhookResult = await res.json().catch(() => ({}));

  return NextResponse.json({
    simulated: true,
    status,
    payload,
    webhookHttpStatus: res.status,
    webhookResult,
  });
}

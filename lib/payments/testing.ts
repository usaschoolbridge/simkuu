/**
 * Payment testing utilities — sandbox-only helpers used by the admin
 * Payment Testing page. Every entry point double-checks sandbox mode so none
 * of this can run against production payments.
 */

import crypto from "crypto";
import { NextRequest } from "next/server";
import { getNowPaymentsProvider, isSandboxMode } from "./provider";

export const ADMIN_COOKIE_NAME = "simkuu_admin_session";

/** True when the request carries a valid admin session cookie. */
export function isAdminRequest(req: NextRequest): boolean {
  return req.cookies.get(ADMIN_COOKIE_NAME)?.value === "authenticated";
}

/**
 * Guard for payment-testing mutation routes (simulate / replay / delete):
 * requires BOTH an admin session AND sandbox mode. Read-only routes only
 * require the admin session.
 */
export function testingGuard(
  req: NextRequest,
  opts: { requireSandbox?: boolean } = { requireSandbox: true }
): { ok: true } | { ok: false; status: number; error: string } {
  if (!isAdminRequest(req)) {
    return { ok: false, status: 401, error: "Admin authentication required" };
  }
  if (opts.requireSandbox && !isSandboxMode()) {
    return {
      ok: false,
      status: 403,
      error: "This action is only available in sandbox mode (NOWPAYMENTS_MODE=sandbox).",
    };
  }
  return { ok: true };
}

/** Sign a payload exactly the way NOWPayments signs IPN callbacks. */
export function signWebhookPayload(payload: Record<string, unknown>): string {
  const secret = getNowPaymentsProvider().ipnSecret;
  const sorted = Object.keys(payload)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = payload[k];
      return acc;
    }, {});
  return crypto.createHmac("sha512", secret).update(JSON.stringify(sorted)).digest("hex");
}

/** All statuses the simulator supports, mapped to what they exercise. */
export const SIMULATABLE_STATUSES = [
  "waiting",
  "confirming",
  "confirmed",
  "sending",
  "finished",
  "partially_paid", // underpayment
  "failed",
  "refunded",
  "expired",
] as const;

export type SimulatableStatus = (typeof SIMULATABLE_STATUSES)[number];

/**
 * Build a realistic NOWPayments IPN payload for a simulated status.
 * `paidFactor` scales actually_paid vs pay_amount: 1 = exact, 0.5 = underpay,
 * 1.2 = overpay, 0 = nothing received yet.
 */
export function buildSimulatedPayload(opts: {
  orderId: string;
  paymentId: string;
  status: SimulatableStatus;
  priceAmount: number;
  payCurrency: string;
  payAmount: number;
  paidFactor?: number;
}): Record<string, unknown> {
  const factor =
    opts.paidFactor ??
    (opts.status === "waiting" ? 0 : opts.status === "partially_paid" ? 0.5 : 1);
  const actuallyPaid = parseFloat((opts.payAmount * factor).toFixed(8));

  return {
    payment_id: opts.paymentId,
    payment_status: opts.status,
    pay_address: "SANDBOX_TEST_ADDRESS",
    price_amount: opts.priceAmount,
    price_currency: "usd",
    pay_amount: opts.payAmount,
    actually_paid: actuallyPaid,
    pay_currency: opts.payCurrency,
    order_id: opts.orderId,
    order_description: "Sandbox simulated payment",
    purchase_id: `sandbox_${opts.paymentId}`,
    outcome_amount: actuallyPaid,
    outcome_currency: opts.payCurrency,
    payin_hash: opts.status === "waiting" ? null : `sandbox_tx_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

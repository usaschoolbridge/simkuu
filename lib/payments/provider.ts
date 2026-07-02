/**
 * NOWPayments provider abstraction.
 *
 * Set NOWPAYMENTS_MODE=sandbox to use the sandbox API.
 * Set NOWPAYMENTS_MODE=production (or omit) for live payments.
 *
 * Env vars:
 *   NOWPAYMENTS_MODE                  = "sandbox" | "production"
 *   NOWPAYMENTS_SANDBOX_API_KEY       = sandbox key from dashboard
 *   NOWPAYMENTS_SANDBOX_IPN_SECRET    = sandbox IPN secret
 *   NOWPAYMENTS_PRODUCTION_API_KEY    = live key (or legacy NOWPAYMENTS_API_KEY)
 *   NOWPAYMENTS_PRODUCTION_IPN_SECRET = live IPN secret (or legacy NOWPAYMENTS_IPN_SECRET)
 */

export type PaymentMode = "sandbox" | "production";

export interface NowPaymentsProvider {
  readonly mode: PaymentMode;
  readonly apiKey: string;
  readonly ipnSecret: string;
  readonly apiBase: string;
}

/**
 * Returns the active provider based on NOWPAYMENTS_MODE env var.
 * Called on every request so hot-reloads in dev pick up .env changes.
 */
export function getNowPaymentsProvider(): NowPaymentsProvider {
  const mode: PaymentMode =
    process.env.NOWPAYMENTS_MODE === "sandbox" ? "sandbox" : "production";

  if (mode === "sandbox") {
    return {
      mode: "sandbox",
      apiKey: process.env.NOWPAYMENTS_SANDBOX_API_KEY ?? "",
      ipnSecret: process.env.NOWPAYMENTS_SANDBOX_IPN_SECRET ?? "",
      apiBase: "https://api-sandbox.nowpayments.io/v1",
    };
  }

  return {
    mode: "production",
    // Fall back to legacy NOWPAYMENTS_API_KEY for backward compatibility
    apiKey:
      process.env.NOWPAYMENTS_PRODUCTION_API_KEY ??
      process.env.NOWPAYMENTS_API_KEY ??
      "",
    ipnSecret:
      process.env.NOWPAYMENTS_PRODUCTION_IPN_SECRET ??
      process.env.NOWPAYMENTS_IPN_SECRET ??
      "",
    apiBase: "https://api.nowpayments.io/v1",
  };
}

export function isSandboxMode(): boolean {
  return process.env.NOWPAYMENTS_MODE === "sandbox";
}

export function getPaymentMode(): PaymentMode {
  return process.env.NOWPAYMENTS_MODE === "sandbox" ? "sandbox" : "production";
}

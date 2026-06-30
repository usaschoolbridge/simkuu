import crypto from "crypto";

const API_BASE = "https://api.nowpayments.io/v1";

export const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY ?? "";
export const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET ?? "";

export interface CreateInvoiceParams {
  amount: number;
  currency: string;   // "usd"
  orderId: string;
  description: string;
  callbackUrl: string;
  successUrl: string;
  cancelUrl: string;
  payCurrency?: string; // pre-selected coin, e.g. "btc", "usdttrc20"
}

export interface NOWPaymentsInvoice {
  id: string;
  invoiceUrl: string;
  orderId: string;
  priceAmount: number;
  priceCurrency: string;
  createdAt: string;
}

export async function createInvoice(
  params: CreateInvoiceParams
): Promise<NOWPaymentsInvoice> {
  const res = await fetch(`${API_BASE}/invoice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": NOWPAYMENTS_API_KEY,
    },
    body: JSON.stringify({
      price_amount: params.amount,
      price_currency: params.currency,
      order_id: params.orderId,
      order_description: params.description,
      ipn_callback_url: params.callbackUrl,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      ...(params.payCurrency ? { pay_currency: params.payCurrency } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`NOWPayments API error ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    id: string;
    invoice_url: string;
    order_id: string;
    price_amount: number;
    price_currency: string;
    created_at: string;
  };

  return {
    id: data.id,
    invoiceUrl: data.invoice_url,
    orderId: data.order_id,
    priceAmount: data.price_amount,
    priceCurrency: data.price_currency,
    createdAt: data.created_at,
  };
}

/**
 * Verify NOWPayments IPN webhook signature.
 * HMAC-SHA512 of the JSON-sorted body using the IPN secret.
 */
export function verifyWebhookSignature(
  payload: Record<string, unknown>,
  receivedSig: string
): boolean {
  if (!receivedSig || !NOWPAYMENTS_IPN_SECRET) return false;

  // Sort keys alphabetically as required by NOWPayments
  const sortedPayload = Object.keys(payload)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = payload[key];
      return acc;
    }, {});

  const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
  hmac.update(JSON.stringify(sortedPayload));
  const expected = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedSig.toLowerCase()),
      Buffer.from(expected.toLowerCase())
    );
  } catch {
    return false;
  }
}

// NOWPayments payment statuses
export const PAID_STATUSES = ["finished", "confirmed", "sending", "partially_paid"];
export const FAILED_STATUSES = ["failed", "refunded", "expired"];

// ─────────────────────────────────────────────────────────────────────────────
// EMBEDDED PAYMENT API (no hosted-invoice redirect)
// ─────────────────────────────────────────────────────────────────────────────

function npHeaders() {
  return { "Content-Type": "application/json", "x-api-key": NOWPAYMENTS_API_KEY };
}

async function npGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: npHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`NOWPayments GET ${path} → ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

/**
 * Coin display metadata. NOWPayments uses provider-specific codes (e.g.
 * `usdttrc20`) — we map them to a friendly name, network label, and the
 * cryptocurrency-icons logo symbol used by the UI.
 */
export const COIN_META: Record<string, { name: string; network: string; logo: string }> = {
  btc:        { name: "Bitcoin",      network: "Bitcoin",          logo: "btc" },
  eth:        { name: "Ethereum",     network: "Ethereum (ERC20)", logo: "eth" },
  usdttrc20:  { name: "USDT",         network: "Tron (TRC20)",     logo: "usdt" },
  usdterc20:  { name: "USDT",         network: "Ethereum (ERC20)", logo: "usdt" },
  usdtbsc:    { name: "USDT",         network: "BNB Chain (BEP20)",logo: "usdt" },
  usdcerc20:  { name: "USDC",         network: "Ethereum (ERC20)", logo: "usdc" },
  usdc:       { name: "USDC",         network: "Ethereum (ERC20)", logo: "usdc" },
  ltc:        { name: "Litecoin",     network: "Litecoin",         logo: "ltc" },
  sol:        { name: "Solana",       network: "Solana",           logo: "sol" },
  bnbbsc:     { name: "BNB",          network: "BNB Chain (BEP20)",logo: "bnb" },
  bnbmainnet: { name: "BNB",          network: "BNB Beacon Chain", logo: "bnb" },
  doge:       { name: "Dogecoin",     network: "Dogecoin",         logo: "doge" },
  trx:        { name: "TRON",         network: "Tron",             logo: "trx" },
  xmr:        { name: "Monero",       network: "Monero",           logo: "xmr" },
  ton:        { name: "Toncoin",      network: "TON",              logo: "ton" },
  matic:      { name: "Polygon",      network: "Polygon",          logo: "matic" },
};

export function coinMeta(code: string) {
  const c = code.toLowerCase();
  return COIN_META[c] ?? { name: code.toUpperCase(), network: code.toUpperCase(), logo: c.replace(/[0-9].*$/, "") };
}

/** The coins enabled on this NOWPayments merchant account. */
export async function getAvailableCoins(): Promise<string[]> {
  const data = await npGet<{ selectedCurrencies?: string[] }>("/merchant/coins");
  return (data.selectedCurrencies ?? []).map((c) => c.toLowerCase());
}

export interface EstimateResult {
  payCurrency: string;
  estimatedAmount: number;
  amountFrom: number;
  currencyFrom: string;
}

/** How much crypto is needed to cover `amount` USD. */
export async function getEstimate(amount: number, payCurrency: string): Promise<EstimateResult> {
  const data = await npGet<{
    currency_from: string; amount_from: number; currency_to: string; estimated_amount: number;
  }>(`/estimate?amount=${amount}&currency_from=usd&currency_to=${payCurrency.toLowerCase()}`);
  return {
    payCurrency: data.currency_to,
    estimatedAmount: data.estimated_amount,
    amountFrom: data.amount_from,
    currencyFrom: data.currency_from,
  };
}

export interface CreatePaymentParams {
  amount: number;        // USD
  orderId: string;
  description: string;
  payCurrency: string;   // e.g. "btc", "usdttrc20"
  callbackUrl: string;
}

export interface CryptoPaymentDetails {
  paymentId: string;
  paymentStatus: string;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  priceAmount: number;
  priceCurrency: string;
  network: string;
  payinExtraId: string | null;  // memo/tag for coins that need it
  expiresAt: string | null;
}

/**
 * Create an on-chain payment. Returns the deposit address + exact amount the
 * buyer must send — displayed inside our checkout, no redirect.
 */
export async function createPayment(params: CreatePaymentParams): Promise<CryptoPaymentDetails> {
  const res = await fetch(`${API_BASE}/payment`, {
    method: "POST",
    headers: npHeaders(),
    body: JSON.stringify({
      price_amount: params.amount,
      price_currency: "usd",
      pay_currency: params.payCurrency.toLowerCase(),
      order_id: params.orderId,
      order_description: params.description,
      ipn_callback_url: params.callbackUrl,
      is_fee_paid_by_user: true,
    }),
  });
  if (!res.ok) throw new Error(`NOWPayments create payment ${res.status}: ${await res.text()}`);
  const d = await res.json() as {
    payment_id: string | number; payment_status: string; pay_address: string;
    pay_amount: number; pay_currency: string; price_amount: number; price_currency: string;
    network?: string; payin_extra_id?: string | null; expiration_estimate_date?: string; valid_until?: string;
  };
  return {
    paymentId: String(d.payment_id),
    paymentStatus: d.payment_status,
    payAddress: d.pay_address,
    payAmount: d.pay_amount,
    payCurrency: d.pay_currency,
    priceAmount: d.price_amount,
    priceCurrency: d.price_currency,
    network: d.network ?? coinMeta(d.pay_currency).network,
    payinExtraId: d.payin_extra_id ?? null,
    expiresAt: d.valid_until ?? d.expiration_estimate_date ?? null,
  };
}

export interface PaymentStatusResult {
  paymentId: string;
  paymentStatus: string;
  payCurrency: string;
  actuallyPaid: number;
  payAmount: number;
  outcomeAmount: number;
  network: string;
  orderId: string | null;
  txHash: string | null;
}

/** Poll a single payment's live status. */
export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResult> {
  const d = await npGet<{
    payment_id: string | number; payment_status: string; pay_currency: string;
    actually_paid?: number; pay_amount?: number; outcome_amount?: number;
    network?: string; order_id?: string; payin_hash?: string | null;
  }>(`/payment/${paymentId}`);
  return {
    paymentId: String(d.payment_id),
    paymentStatus: d.payment_status,
    payCurrency: d.pay_currency,
    actuallyPaid: d.actually_paid ?? 0,
    payAmount: d.pay_amount ?? 0,
    outcomeAmount: d.outcome_amount ?? 0,
    network: d.network ?? coinMeta(d.pay_currency).network,
    orderId: d.order_id ?? null,
    txHash: d.payin_hash ?? null,
  };
}

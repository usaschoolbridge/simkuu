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

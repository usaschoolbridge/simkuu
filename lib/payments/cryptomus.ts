import crypto from "crypto";

const API_BASE = "https://api.cryptomus.com/v1";

export const CRYPTOMUS_MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID ?? "";
export const CRYPTOMUS_API_KEY = process.env.CRYPTOMUS_PAYMENT_KEY ?? "";

/**
 * Generate Cryptomus request signature.
 * sign = MD5( base64(JSON.stringify(body)) + apiKey )
 */
export function generateSign(body: Record<string, unknown>): string {
  const json = JSON.stringify(body);
  const base64 = Buffer.from(json).toString("base64");
  return crypto.createHash("md5").update(base64 + CRYPTOMUS_API_KEY).digest("hex");
}

/**
 * Verify a Cryptomus webhook signature.
 * Remove `sign` from payload, then re-compute and compare.
 */
export function verifyWebhookSign(payload: Record<string, unknown>): boolean {
  const receivedSign = payload.sign as string | undefined;
  if (!receivedSign) return false;

  // Clone without sign field
  const { sign: _sign, ...rest } = payload;
  const json = JSON.stringify(rest);
  const base64 = Buffer.from(json).toString("base64");
  const expected = crypto.createHash("md5").update(base64 + CRYPTOMUS_API_KEY).digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(receivedSign.toLowerCase()),
    Buffer.from(expected.toLowerCase())
  );
}

export interface CreateInvoiceParams {
  amount: string;          // e.g. "15.00"
  currency: string;        // "USD"
  orderId: string;         // unique per order
  urlCallback: string;     // webhook URL
  urlSuccess: string;      // redirect after success
  urlReturn: string;       // redirect on cancel/back
  lifetime?: number;       // seconds, default 3600
  additionalData?: string; // max 255 chars
}

export interface CryptomusInvoice {
  uuid: string;
  orderId: string;
  amount: string;
  currency: string;
  paymentStatus: string;
  url: string;           // Cryptomus-hosted payment page
  expiredAt: number;
  isFinalized: boolean;
}

export async function createCryptomusInvoice(
  params: CreateInvoiceParams
): Promise<CryptomusInvoice> {
  const body: Record<string, unknown> = {
    amount: params.amount,
    currency: params.currency,
    order_id: params.orderId,
    url_callback: params.urlCallback,
    url_success: params.urlSuccess,
    url_return: params.urlReturn,
    lifetime: params.lifetime ?? 3600,
    is_payment_multiple: false,
  };

  if (params.additionalData) {
    body.additional_data = params.additionalData;
  }

  const sign = generateSign(body);

  const res = await fetch(`${API_BASE}/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      merchant: CRYPTOMUS_MERCHANT_ID,
      sign,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cryptomus API error ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    state: number;
    result: {
      uuid: string;
      order_id: string;
      amount: string;
      currency: string;
      payment_status: string;
      url: string;
      expired_at: number;
      is_final: boolean;
    };
    message?: string;
  };

  if (data.state !== 0) {
    throw new Error(`Cryptomus error: ${data.message ?? "Unknown error"}`);
  }

  return {
    uuid: data.result.uuid,
    orderId: data.result.order_id,
    amount: data.result.amount,
    currency: data.result.currency,
    paymentStatus: data.result.payment_status,
    url: data.result.url,
    expiredAt: data.result.expired_at,
    isFinalized: data.result.is_final,
  };
}

/**
 * Get payment info by UUID or order_id
 */
export async function getPaymentInfo(uuid: string): Promise<{
  uuid: string;
  orderId: string;
  paymentStatus: string;
  paymentAmount: string;
  currency: string;
  isFinalized: boolean;
}> {
  const body = { uuid };
  const sign = generateSign(body);

  const res = await fetch(`${API_BASE}/payment/info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      merchant: CRYPTOMUS_MERCHANT_ID,
      sign,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json() as {
    state: number;
    result: {
      uuid: string;
      order_id: string;
      payment_status: string;
      payment_amount: string;
      currency: string;
      is_final: boolean;
    };
  };

  return {
    uuid: data.result.uuid,
    orderId: data.result.order_id,
    paymentStatus: data.result.payment_status,
    paymentAmount: data.result.payment_amount,
    currency: data.result.currency,
    isFinalized: data.result.is_final,
  };
}

// Payment statuses that mean "paid"
export const PAID_STATUSES = ["paid", "paid_over", "confirm_check"];
// Payment statuses that mean "failed"
export const FAILED_STATUSES = ["fail", "wrong_amount", "cancel", "system_fail"];

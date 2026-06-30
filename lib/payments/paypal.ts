/**
 * PayPal Orders v2 REST helpers — no SDK required, just fetch.
 *
 * Env:
 *   PAYPAL_CLIENT_ID      — REST app client id
 *   PAYPAL_CLIENT_SECRET  — REST app secret
 *   PAYPAL_ENVIRONMENT    — "live" | "sandbox" (defaults to "sandbox")
 */

export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID ?? "";
export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET ?? "";
export const PAYPAL_CONFIGURED = Boolean(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);

const PAYPAL_BASE =
  process.env.PAYPAL_ENVIRONMENT === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  if (!PAYPAL_CONFIGURED) throw new Error("PayPal credentials not set");
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal auth failed ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export interface PayPalCreatedOrder {
  id: string;
  approvalUrl: string;
}

/**
 * Create a PayPal order. `orderId` is our internal order id, stored as
 * custom_id so the capture step can resolve it back to fulfillment.
 */
export async function createPayPalOrder(params: {
  amount: number; // major units, e.g. 29.99
  currency: string; // "USD"
  description: string;
  orderId: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<PayPalCreatedOrder> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: params.orderId,
          description: params.description.slice(0, 127),
          amount: { currency_code: params.currency.toUpperCase(), value: params.amount.toFixed(2) },
        },
      ],
      application_context: {
        brand_name: "Simkuu",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
      },
    }),
  });
  if (!res.ok) throw new Error(`PayPal create order failed ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { id: string; links: { rel: string; href: string }[] };
  const approvalUrl = data.links.find((l) => l.rel === "approve")?.href;
  if (!approvalUrl) throw new Error("PayPal approval URL missing from response");
  return { id: data.id, approvalUrl };
}

export interface PayPalCaptureResult {
  status: string; // COMPLETED | ...
  captureId?: string;
  orderId?: string; // our internal order id (custom_id)
}

/** Capture an approved PayPal order. Returns status + our internal order id. */
export async function capturePayPalOrder(paypalOrderId: string): Promise<PayPalCaptureResult> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`PayPal capture failed ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    status: string;
    purchase_units?: {
      custom_id?: string;
      payments?: { captures?: { id: string; custom_id?: string }[] };
    }[];
  };
  const unit = data.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  return { status: data.status, captureId: capture?.id, orderId: unit?.custom_id ?? capture?.custom_id };
}

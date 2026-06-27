/**
 * PayPal REST API v2 client
 *
 * Install: npm install @paypal/react-paypal-js
 *
 * Add to .env.local:
 *   PAYPAL_CLIENT_ID=AYour...
 *   PAYPAL_CLIENT_SECRET=EYour...
 *   PAYPAL_ENVIRONMENT=sandbox   # or "live"
 *   NEXT_PUBLIC_PAYPAL_CLIENT_ID=AYour...
 */

const PAYPAL_BASE = process.env.PAYPAL_ENVIRONMENT === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken(): Promise<string> {
  const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) throw new Error("PayPal credentials not set");

  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

export async function createPayPalOrder(amount: number, currency = "USD", description: string) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        amount: { currency_code: currency, value: (amount / 100).toFixed(2) },
        description,
      }],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
        brand_name: "Simkuu",
        user_action: "PAY_NOW",
      },
    }),
  });
  return res.json();
}

export async function capturePayPalOrder(orderId: string) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return res.json();
}

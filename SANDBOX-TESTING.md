# NOWPayments sandbox — end-to-end testing guide

Test the entire purchase flow with zero real crypto. Everything below is mode-gated: production data and inventory are never touched while sandbox is on.

## 1. Switching modes

One env var controls everything:

```env
# sandbox (testing)
NOWPAYMENTS_MODE=sandbox
NOWPAYMENTS_SANDBOX_API_KEY=<from account-sandbox.nowpayments.io>
NOWPAYMENTS_SANDBOX_IPN_SECRET=<sandbox IPN secret>

# production (live)
NOWPAYMENTS_MODE=production   # or unset — production is the default
NOWPAYMENTS_PRODUCTION_API_KEY=...
NOWPAYMENTS_PRODUCTION_IPN_SECRET=...
```

`lib/payments/provider.ts` resolves the key, IPN secret, and API base
(`api-sandbox.nowpayments.io` vs `api.nowpayments.io`) from `NOWPAYMENTS_MODE`.
No code changes needed to switch — change the var and restart/redeploy.

**Sandbox mode guarantees:**
- Fulfillment never consumes real inventory — buyers get a synthetic eSIM
  (ICCID prefixed `SANDBOX`, activation code `LPA:1$sandbox.simkuu.test$...`).
- The webhook verifies signatures with the **sandbox** IPN secret only.
- All logs/webhook rows are tagged `mode: "sandbox"` and can be bulk-deleted.
- Simulate / replay / delete APIs return 403 unless sandbox mode is on.

## 2. Admin Payment Testing page

`/admin/payment-testing` (sidebar → Operations → Payment Testing). Requires the
admin session cookie. In production mode the page is read-only and all testing
actions are disabled server-side.

Features:
- View all webhook events + payment logs, filter by status, search by order ID / payment ID
- Inspect full webhook payloads and API logs (expand any row)
- **Simulate** any payment status against an order or wallet tx
- **Replay** any stored sandbox webhook event (bypasses dedup, tagged `replayOf`)
- **Delete sandbox data** (only rows with `mode=sandbox`)

## 3. Creating a test payment

1. Set `NOWPAYMENTS_MODE=sandbox` and restart.
2. Go through checkout as a customer (register → verify email → pick plan →
   crypto checkout). The payment is created against the NOWPayments sandbox API —
   QR code, address, amount, and polling all work as in production.
3. Copy the Order ID (from the checkout URL, order confirmation, or admin → Orders).

## 4. Simulating every payment status

On the Payment Testing page, paste the Order ID, pick a status, hit **Send webhook**.
This builds a real NOWPayments-shaped IPN, signs it with the sandbox IPN secret
(HMAC-SHA512, sorted keys), and POSTs it to `/api/webhooks/nowpayments` — the exact
path a real callback takes.

| Status | Effect | Paid factor |
|---|---|---|
| `waiting` | UI shows "waiting for payment" | 0 |
| `confirming` | UI shows confirming | 1 |
| `confirmed` / `sending` / `finished` | Fulfillment: eSIM assigned, order ACTIVE, email sent | 1 |
| `partially_paid` | Underpayment — order stays pending | 0.5 (default) |
| `failed` / `expired` / `refunded` | Order CANCELLED | 1 |

- **Underpayment**: status `partially_paid` (or any status with paid factor `0.5`)
- **Overpayment**: status `finished` with paid factor `1.2`
- **Invalid payment**: POST any payload with a wrong signature to the webhook — it's rejected 400 and logged with `error: invalid_signature`
- **Wallet top-ups**: paste the WalletTransaction ID instead of an Order ID — `finished` credits the wallet, `failed` marks the tx FAILED

## 5. Replaying webhooks

Every incoming webhook is stored in `WebhookEvent`. Click **Replay** on any sandbox
event to re-deliver it with a fresh signature and the `x-simkuu-replay` header, which
skips dedup so the full pipeline re-runs. The new event records `replayOf` for audit.

Duplicate detection: sending the same payment_id + status twice **without** replay
returns `{ received: true, duplicate: true }` and does not re-fulfill.

## 6. End-to-end test checklist

1. Register → receive OTP email → verify → logged in
2. Buy a plan with crypto checkout → QR + address shown, polling active
3. Refresh the checkout page → payment resumes (order/payment persisted)
4. Simulate `waiting` → `confirming` → `finished` for the order
5. Checkout UI flips to success; sandbox eSIM QR displayed
6. Order confirmation email received with QR
7. Dashboard → Order history shows order ACTIVE with eSIM
8. Wallet top-up: create top-up, simulate `finished` on the tx ID → balance credited, notification created
9. Simulate `expired` on a fresh order → order CANCELLED, UI shows failure
10. Replay the `finished` event → processed again (replay tag), no duplicate eSIM (fulfillment is idempotent)
11. Delete sandbox data → events/logs cleared; production rows untouched

## 7. Files involved

- `lib/payments/provider.ts` — mode/credential resolution
- `lib/payments/nowpayments.ts` — API client (mode-aware)
- `lib/payments/testing.ts` — simulator, signer, admin/sandbox guards
- `lib/fulfillment.ts` — sandbox synthetic eSIM guard
- `app/api/webhooks/nowpayments/route.ts` — verify, dedup, log, replay support
- `app/api/admin/payment-testing/{route,simulate/route,replay/route}.ts` — testing APIs
- `app/(admin)/admin/payment-testing/page.tsx` + `components/admin/admin-payment-testing.tsx` — UI
- Prisma: `PaymentLog`, `WebhookEvent` models

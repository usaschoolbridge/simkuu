export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  PAID_STATUSES,
  FAILED_STATUSES,
} from "@/lib/payments/nowpayments";
import { getPaymentMode, isSandboxMode } from "@/lib/payments/provider";
import { fulfillAndNotify } from "@/lib/fulfillment";
import { db } from "@/lib/db";

// ─── helpers ─────────────────────────────────────────────────────────────────

async function log(
  event: string,
  opts: {
    paymentId?: string;
    orderId?: string;
    status?: string;
    payload?: unknown;
    error?: string;
  }
) {
  try {
    await db?.paymentLog.create({
      data: {
        mode: getPaymentMode(),
        event,
        paymentId: opts.paymentId ?? null,
        orderId: opts.orderId ?? null,
        status: opts.status ?? null,
        payload: opts.payload as never ?? null,
        error: opts.error ?? null,
      },
    });
  } catch {
    // logging must never crash the webhook
  }
}

async function mergeOrderMeta(orderId: string, patch: Record<string, unknown>) {
  if (!db) return;
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { metadata: true },
    });
    const prev = (order?.metadata as Record<string, unknown> | null) ?? {};
    await db.order.update({
      where: { id: orderId },
      data: { metadata: { ...prev, ...patch } },
    });
  } catch {
    /* order may not exist yet — non-fatal */
  }
}

async function handleWalletTopup(walletTxId: string, paymentId: string | number) {
  if (!db) return;
  try {
    const walletTx = await db.walletTransaction.findUnique({
      where: { id: walletTxId },
    });
    if (!walletTx || walletTx.status === "COMPLETED") return;

    const amount = Number(walletTx.amount);

    // Atomic claim + credit in one transaction. Two concurrent PAID webhooks
    // ("confirmed" and "finished" arrive together) both pass the read above;
    // the updateMany with a status guard ensures only one performs the credit.
    const newBalance = await db.$transaction(async (tx: typeof db) => {
      const claimed = await tx.walletTransaction.updateMany({
        where: { id: walletTxId, status: { not: "COMPLETED" } },
        data: { status: "COMPLETED", paymentId: String(paymentId) },
      });
      if (claimed.count === 0) return null; // another webhook already credited

      const updatedUser = await tx.user.update({
        where: { id: walletTx.userId },
        data: { walletBalance: { increment: amount } },
        select: { walletBalance: true },
      });
      const balance = Number(updatedUser.walletBalance);

      await tx.walletTransaction.update({
        where: { id: walletTxId },
        data: { balanceAfter: balance },
      });
      return balance;
    });
    if (newBalance === null) return;

    await db.notification.create({
      data: {
        userId: walletTx.userId,
        title: "Wallet topped up",
        body: `$${amount.toFixed(2)} added. New balance: $${newBalance.toFixed(2)}`,
        type: "wallet",
        href: "/dashboard/wallet",
      },
    });

    console.log(
      `[nowpayments-webhook] Wallet top-up ✓ — userId: ${walletTx.userId}, amount: $${amount}, balance: $${newBalance}`
    );
  } catch (err) {
    console.error("[nowpayments-webhook] Wallet topup error:", err);
  }
}

async function handleWalletTopupFailed(walletTxId: string) {
  if (!db) return;
  try {
    await db.walletTransaction.update({
      where: { id: walletTxId },
      data: { status: "FAILED" },
    }).catch(() => {});
  } catch { /* non-fatal */ }
}

// ─── main handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const mode = getPaymentMode();
  let body: Record<string, unknown>;

  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sig = req.headers.get("x-nowpayments-sig") ?? "";
  // Sandbox-only replay marker set by the admin Payment Testing page.
  // Forces re-processing (skips dedup) and records the source event id.
  const replayOf = isSandboxMode() ? req.headers.get("x-simkuu-replay") : null;
  const paymentId = String(body.payment_id ?? "");
  const status = String(body.payment_status ?? "");
  const orderId = String(body.order_id ?? "");

  console.log("[nowpayments-webhook] Received:", {
    mode,
    payment_id: paymentId,
    payment_status: status,
    order_id: orderId,
    price_amount: body.price_amount,
    actually_paid: body.actually_paid,
  });

  // ── Signature verification ──────────────────────────────────────────────
  const sigValid = verifyWebhookSignature(body, sig);
  if (!sigValid) {
    console.error("[nowpayments-webhook] ✗ Invalid signature —", mode);
    await log("webhook_received", {
      paymentId,
      orderId,
      status,
      payload: body,
      error: "invalid_signature",
    });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Duplicate detection ─────────────────────────────────────────────────
  // Same payment_id + status already processed → skip fulfillment, still log.
  let isDuplicate = false;
  let webhookEventId: string | null = null;
  if (db && paymentId) {
    if (!replayOf) {
      const existing = await db.webhookEvent.findFirst({
        where: {
          paymentId,
          status,
          mode,
          isDuplicate: false,
          replayOf: null,
          processedAt: { not: null },
        },
      });
      isDuplicate = !!existing;
    }

    // Persist this webhook event
    try {
      const evt = await db.webhookEvent.create({
        data: {
          paymentId,
          orderId: orderId || null,
          mode,
          status,
          payload: body as never,
          sigValid: true,
          isDuplicate,
          ...(replayOf ? { replayOf } : {}),
        },
      });
      webhookEventId = evt.id;
    } catch {
      /* non-fatal */
    }
  }

  await log("webhook_received", {
    paymentId,
    orderId,
    status,
    payload: { ...body, _webhookEventId: webhookEventId, _isDuplicate: isDuplicate },
  });

  if (isDuplicate) {
    console.log(`[nowpayments-webhook] Duplicate ignored — paymentId: ${paymentId}, status: ${status}`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // ── Mark processed ──────────────────────────────────────────────────────
  if (db && webhookEventId) {
    await db.webhookEvent.update({
      where: { id: webhookEventId },
      data: { processedAt: new Date() },
    }).catch(() => {});
  }

  const actuallyPaid = String(body.actually_paid ?? "");
  const payCurrency = String(body.pay_currency ?? "");
  const txHash = body.payin_hash as string | undefined;

  // ── Wallet top-up? ──────────────────────────────────────────────────────
  const walletTx = db
    ? await db.walletTransaction.findUnique({ where: { id: orderId } })
    : null;

  if (walletTx) {
    if (PAID_STATUSES.includes(status)) {
      console.log(`[nowpayments-webhook] WALLET TOPUP PAID — txId: ${orderId}`);
      await handleWalletTopup(orderId, paymentId);
      await log("wallet_topup", { paymentId, orderId, status });
    } else if (FAILED_STATUSES.includes(status)) {
      console.log(`[nowpayments-webhook] WALLET TOPUP FAILED — txId: ${orderId}`);
      await handleWalletTopupFailed(orderId);
      await log("wallet_topup_failed", { paymentId, orderId, status });
    }
    return NextResponse.json({ received: true });
  }

  // ── Standard eSIM order ─────────────────────────────────────────────────
  await mergeOrderMeta(orderId, {
    paymentStatus: status,
    ...(txHash ? { txHash } : {}),
    ...(actuallyPaid ? { actuallyPaid } : {}),
    ...(payCurrency ? { payCurrency } : {}),
  });

  if (PAID_STATUSES.includes(status)) {
    console.log(
      `[nowpayments-webhook] PAID [${mode}] — orderId: ${orderId}, paid: ${actuallyPaid} ${payCurrency}`
    );
    const r = await fulfillAndNotify(orderId, String(paymentId));
    if (r.ok) {
      await log("fulfillment", { paymentId, orderId, status: "fulfilled" });
    } else {
      console.error("[nowpayments-webhook] fulfillment failed:", r.reason, r.message);
      await log("fulfillment", {
        paymentId,
        orderId,
        status: "error",
        error: `${r.reason}: ${r.message}`,
      });
    }
  } else if (FAILED_STATUSES.includes(status)) {
    console.log(`[nowpayments-webhook] FAILED [${mode}] — orderId: ${orderId}, status: ${status}`);
    if (db) {
      // Never downgrade a fulfilled order: the customer already holds the eSIM.
      // A late refunded/expired webhook on a fulfilled order needs a human —
      // mark REFUNDED (refunds) or leave ACTIVE (expired/failed) and log it.
      const fulfilled = await db.eSim.findUnique({ where: { orderId }, select: { id: true } });
      if (fulfilled) {
        if (status === "refunded") {
          await db.order.update({
            where: { id: orderId },
            data: { status: "REFUNDED" },
          }).catch(() => {});
        }
        console.error(
          `[nowpayments-webhook] ⚠ ${status} received for FULFILLED order ${orderId} — manual review required (eSIM already delivered)`
        );
        await log("post_fulfillment_failure", { paymentId, orderId, status, error: "needs_manual_review" });
      } else {
        await db.order.updateMany({
          where: { id: orderId, status: { in: ["PENDING", "PROCESSING"] } },
          data: { status: "CANCELLED" },
        }).catch(() => {});
      }
    }
    await log("order_cancelled", { paymentId, orderId, status });
  } else {
    console.log(
      `[nowpayments-webhook] Status update [${mode}] — ${status} for orderId: ${orderId}`
    );
    await log("status_update", { paymentId, orderId, status });
  }

  return NextResponse.json({ received: true });
}

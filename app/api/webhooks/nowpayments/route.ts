export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, PAID_STATUSES, FAILED_STATUSES } from "@/lib/payments/nowpayments";
import { fulfillAndNotify } from "@/lib/fulfillment";
import { db } from "@/lib/db";

/** Merge partial fields into an order's metadata JSON without dropping existing keys. */
async function mergeOrderMeta(orderId: string, patch: Record<string, unknown>) {
  if (!db) return;
  try {
    const order = await db.order.findUnique({ where: { id: orderId }, select: { metadata: true } });
    const prev = (order?.metadata as Record<string, unknown> | null) ?? {};
    await db.order.update({ where: { id: orderId }, data: { metadata: { ...prev, ...patch } } });
  } catch {
    /* order may not exist yet — non-fatal */
  }
}

/** Handle a confirmed wallet top-up payment */
async function handleWalletTopup(walletTxId: string, paymentId: string | number) {
  if (!db) return;
  try {
    const walletTx = await db.walletTransaction.findUnique({ where: { id: walletTxId } });
    if (!walletTx || walletTx.status === "COMPLETED") return; // already processed

    const amount = Number(walletTx.amount);

    // Credit wallet atomically
    const updatedUser = await db.user.update({
      where: { id: walletTx.userId },
      data: { walletBalance: { increment: amount } },
      select: { walletBalance: true, email: true, name: true },
    });

    const newBalance = Number(updatedUser.walletBalance);

    // Mark transaction completed with new balance
    await db.walletTransaction.update({
      where: { id: walletTxId },
      data: {
        status: "COMPLETED",
        balanceAfter: newBalance,
        paymentId: String(paymentId),
      },
    });

    // Create a notification
    await db.notification.create({
      data: {
        userId: walletTx.userId,
        title: "Wallet topped up",
        body: `$${amount.toFixed(2)} has been added to your wallet. New balance: $${newBalance.toFixed(2)}`,
        type: "wallet",
        href: "/dashboard/wallet",
      },
    });

    console.log(`[nowpayments-webhook] Wallet top-up credited — userId: ${walletTx.userId}, amount: $${amount}, newBalance: $${newBalance}`);
  } catch (err) {
    console.error("[nowpayments-webhook] Wallet topup error:", err);
  }
}

/** Fail a wallet top-up */
async function handleWalletTopupFailed(walletTxId: string) {
  if (!db) return;
  try {
    await db.walletTransaction.update({
      where: { id: walletTxId },
      data: { status: "FAILED" },
    }).catch(() => {});
  } catch { /* non-fatal */ }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const sig = req.headers.get("x-nowpayments-sig") ?? "";

    console.log("[nowpayments-webhook] Received:", {
      payment_id: body.payment_id,
      payment_status: body.payment_status,
      order_id: body.order_id,
      price_amount: body.price_amount,
      actually_paid: body.actually_paid,
    });

    // Verify signature
    const isValid = verifyWebhookSignature(body, sig);
    if (!isValid) {
      console.error("[nowpayments-webhook] Invalid signature — rejecting");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const status = body.payment_status as string;
    const orderId = body.order_id as string;
    const paymentId = body.payment_id as string | number;
    const actuallyPaid = body.actually_paid as string;
    const payCurrency = body.pay_currency as string;
    const txHash = body.payin_hash as string | undefined;

    // Check if this is a wallet top-up (wallet tx ids are cuid format, order ids too,
    // but we distinguish by checking WalletTransaction table first)
    const walletTx = db ? await db.walletTransaction.findUnique({ where: { id: orderId } }) : null;
    const isWalletTopup = !!walletTx;

    if (isWalletTopup) {
      if (PAID_STATUSES.includes(status)) {
        console.log(`[nowpayments-webhook] WALLET TOPUP PAID — txId: ${orderId}`);
        await handleWalletTopup(orderId, paymentId);
      } else if (FAILED_STATUSES.includes(status)) {
        console.log(`[nowpayments-webhook] WALLET TOPUP FAILED — txId: ${orderId}`);
        await handleWalletTopupFailed(orderId);
      }
      return NextResponse.json({ received: true });
    }

    // Standard eSIM order flow
    await mergeOrderMeta(orderId, {
      paymentStatus: status,
      ...(txHash ? { txHash } : {}),
      ...(actuallyPaid ? { actuallyPaid } : {}),
      ...(payCurrency ? { payCurrency } : {}),
    });

    if (PAID_STATUSES.includes(status)) {
      console.log(`[nowpayments-webhook] PAID — orderId: ${orderId}, paid: ${actuallyPaid} ${payCurrency}`);
      const r = await fulfillAndNotify(orderId, String(paymentId));
      if (!r.ok) console.error("[nowpayments-webhook] fulfillment failed:", r.reason, r.message);

    } else if (FAILED_STATUSES.includes(status)) {
      console.log(`[nowpayments-webhook] FAILED — orderId: ${orderId}, status: ${status}`);
      if (db) {
        await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } }).catch(() => {});
      }

    } else {
      console.log(`[nowpayments-webhook] Status update — ${status} for orderId: ${orderId}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[nowpayments-webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

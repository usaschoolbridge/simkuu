export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentStatus, PAID_STATUSES, FAILED_STATUSES, NOWPAYMENTS_API_KEY } from "@/lib/payments/nowpayments";
import { fulfillAndNotify } from "@/lib/fulfillment";
import { getSession } from "@/lib/session";

/**
 * GET /api/checkout/crypto/status?orderId=<id>
 * Polled by the checkout UI. Reads live status from NOWPayments, and when the
 * payment is paid, fulfills the order (idempotent) so the buyer doesn't have to
 * wait for the webhook. Returns a normalized state the UI can render.
 */
export async function GET(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  if (!NOWPAYMENTS_API_KEY) {
    return NextResponse.json({ error: "Crypto payments are not enabled yet." }, { status: 503 });
  }

  const orderId = new URL(req.url).searchParams.get("orderId") ?? "";
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const order = await db.order.findUnique({ where: { id: orderId }, include: { esim: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // IDOR guard: if the caller is authenticated, they may only view their own orders.
  // Guest callers (no session) are allowed — they only know the orderId from the
  // checkout page they just completed, which is sufficient authorization.
  const session = await getSession();
  if (session && order.userId && order.userId !== session.userId) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Already fulfilled — short-circuit.
  if (order.esim) {
    return NextResponse.json({
      state: "completed",
      orderStatus: order.status,
      esim: { iccid: order.esim.iccid, activationCode: order.esim.activationCode, qrCode: order.esim.qrCode },
    });
  }

  const paymentId = order.paymentId;
  if (!paymentId) return NextResponse.json({ state: "waiting", orderStatus: order.status });

  try {
    const status = await getPaymentStatus(paymentId);

    // Persist tx hash / actually-paid as they appear.
    const prevMeta = (order.metadata as Record<string, unknown> | null) ?? {};
    await db.order.update({
      where: { id: order.id },
      data: {
        metadata: {
          ...prevMeta,
          paymentStatus: status.paymentStatus,
          ...(status.txHash ? { txHash: status.txHash } : {}),
          ...(status.actuallyPaid ? { actuallyPaid: status.actuallyPaid } : {}),
        },
      },
    }).catch(() => {});

    if (PAID_STATUSES.includes(status.paymentStatus)) {
      const r = await fulfillAndNotify(order.id, paymentId);
      if (r.ok) {
        return NextResponse.json({
          state: "completed",
          orderStatus: "ACTIVE",
          esim: { iccid: r.esim.iccid, activationCode: r.esim.activationCode, qrCode: r.esim.qrCode },
        });
      }
      return NextResponse.json({ state: "processing", orderStatus: order.status, paymentStatus: status.paymentStatus });
    }

    if (FAILED_STATUSES.includes(status.paymentStatus)) {
      await db.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } }).catch(() => {});
      return NextResponse.json({ state: "failed", orderStatus: "CANCELLED", paymentStatus: status.paymentStatus });
    }

    return NextResponse.json({
      state: status.paymentStatus === "confirming" ? "confirming" : "waiting",
      orderStatus: order.status,
      paymentStatus: status.paymentStatus,
    });
  } catch (err) {
    console.error("[crypto-status]", err);
    return NextResponse.json({ state: "waiting", orderStatus: order.status, error: "status_unavailable" });
  }
}

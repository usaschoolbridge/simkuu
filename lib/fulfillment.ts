/**
 * eSIM fulfillment service.
 *
 * Given a PAID order, atomically:
 *   1. Lock the first AVAILABLE inventory row for the plan (FOR UPDATE SKIP LOCKED)
 *   2. Mark it SOLD and bind it to the order
 *   3. Generate a QR PNG (data URL) from the LPA activation string
 *   4. Create the ESim record carrying the LPA + QR
 *
 * The whole thing runs in a single DB transaction so an item can never be
 * double-allocated, and it is idempotent per order: calling it twice for the
 * same order returns the existing eSIM instead of consuming another item.
 */

import QRCode from "qrcode";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";

export type FulfillmentResult =
  | {
      ok: true;
      alreadyFulfilled: boolean;
      esim: {
        id: string;
        iccid: string;
        activationCode: string;
        qrCode: string;
        planName: string;
        carrier: string;
      };
    }
  | { ok: false; reason: "no_inventory" | "order_not_found" | "error"; message: string };

/** Build a QR data-URL (PNG) from an LPA activation string. */
export async function generateQrDataUrl(lpa: string): Promise<string> {
  return QRCode.toDataURL(lpa, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

/**
 * Fulfill a single order. Safe to retry — idempotent on orderId.
 */
export async function fulfillOrder(orderId: string): Promise<FulfillmentResult> {
  if (!db) return { ok: false, reason: "error", message: "Database not available" };

  // Idempotency fast-path: eSIM already exists for this order.
  const existing = await db.eSim.findUnique({
    where: { orderId },
    include: { plan: true },
  });
  if (existing) {
    return {
      ok: true,
      alreadyFulfilled: true,
      esim: {
        id: existing.id,
        iccid: existing.iccid,
        activationCode: existing.activationCode,
        qrCode: existing.qrCode,
        planName: existing.plan?.name ?? "eSIM Plan",
        carrier: String(existing.carrier),
      },
    };
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { plan: true },
  });
  if (!order) return { ok: false, reason: "order_not_found", message: `Order ${orderId} not found` };

  try {
    const result = await db.$transaction(async (tx: typeof db) => {
      // Re-check inside the transaction for idempotency under concurrency.
      const dup = await tx.eSim.findUnique({ where: { orderId } });
      if (dup) return { kind: "dup" as const, esimId: dup.id };

      // Lock the first AVAILABLE inventory row for this plan (or carrier
      // fallback) without blocking on rows other workers already hold.
      const rows = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "InventoryItem"
        WHERE "status" = 'AVAILABLE'
          AND ("planId" = ${order.planId} OR ("planId" IS NULL AND "carrier" = ${order.plan.carrierId}::"CarrierId"))
        ORDER BY "createdAt" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      `;
      if (rows.length === 0) return { kind: "no_inventory" as const };

      const itemId = rows[0].id;
      const item = await tx.inventoryItem.update({
        where: { id: itemId },
        data: { status: "SOLD", orderId, soldAt: new Date() },
      });

      const qrCode = await generateQrDataUrl(item.lpaActivationString);

      const esim = await tx.eSim.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          planId: order.planId,
          carrier: order.plan.carrierId,
          iccid: item.iccid,
          qrCode,
          activationCode: item.lpaActivationString,
          status: "ACTIVE",
          activatedAt: new Date(),
          expiresAt: item.expiresAt ?? null,
        },
      });

      // Cache QR on the inventory row too (handy for admin/debug).
      await tx.inventoryItem.update({ where: { id: itemId }, data: { qrCode } });

      // Move the order forward.
      const updatedOrder = await tx.order.update({ where: { id: order.id }, data: { status: "ACTIVE" } });

      // Create Invoice record if not already present
      const existingInvoice = await tx.invoice.findUnique({ where: { orderId: order.id } });
      if (!existingInvoice) {
        const year = new Date().getFullYear();
        const invoiceNo = `INV-${year}-${String(updatedOrder.orderNo).padStart(6, "0")}`;
        await tx.invoice.create({
          data: {
            orderId: order.id,
            invoiceNo,
            amount: order.amount,
            currency: order.currency,
            issuedAt: new Date(),
            paidAt: new Date(),
          },
        });
      }

      return { kind: "created" as const, esimId: esim.id };
    });

    if (result.kind === "no_inventory") {
      return { ok: false, reason: "no_inventory", message: `No inventory available for plan ${order.planId}` };
    }

    const esim = await db.eSim.findUniqueOrThrow({
      where: { id: result.esimId },
      include: { plan: true },
    });

    return {
      ok: true,
      alreadyFulfilled: result.kind === "dup",
      esim: {
        id: esim.id,
        iccid: esim.iccid,
        activationCode: esim.activationCode,
        qrCode: esim.qrCode,
        planName: esim.plan?.name ?? "eSIM Plan",
        carrier: String(esim.carrier),
      },
    };
  } catch (e) {
    console.error("[fulfillment] failed for order", orderId, e);
    return { ok: false, reason: "error", message: e instanceof Error ? e.message : "Unknown error" };
  }
}

/**
 * Mark a payment id on the order (best-effort), fulfill it, and email the QR.
 * Idempotent: safe to call from a webhook that may fire more than once.
 * Returns the fulfillment result so callers can decide HTTP status.
 */
export async function fulfillAndNotify(orderId: string, paymentId?: string): Promise<FulfillmentResult> {
  if (db && paymentId) {
    try {
      await db.order.update({ where: { id: orderId }, data: { paymentId } });
    } catch {
      /* order may not exist yet / already set — fulfillOrder reports the real error */
    }
  }

  const result = await fulfillOrder(orderId);
  if (!result.ok) return result;

  // Only email on first fulfillment to avoid duplicate sends on webhook retries.
  if (!result.alreadyFulfilled && db) {
    try {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });
      const email = order?.user?.email;
      if (email) {
        await sendOrderConfirmation(email, {
          name: order?.user?.name ?? "there",
          orderId,
          planName: result.esim.planName,
          carrier: result.esim.carrier,
          activationCode: result.esim.activationCode,
          qrUrl: result.esim.qrCode,
        });
      }
    } catch (e) {
      console.error("[fulfillment] email send failed for order", orderId, e);
      // Email failure must not fail the webhook — eSIM is already provisioned.
    }
  }

  return result;
}

/** Count AVAILABLE inventory, optionally per plan. Used for low-stock alerts. */
export async function availableStock(planId?: string): Promise<number> {
  if (!db) return 0;
  return db.inventoryItem.count({
    where: { status: "AVAILABLE", ...(planId ? { planId } : {}) },
  });
}

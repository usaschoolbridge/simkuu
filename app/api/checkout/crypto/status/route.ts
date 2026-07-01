export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/checkout/crypto/status?orderId=<id>
 * Polled by the checkout UI. Reads order status from DB.
 * No external payment gateway — admin confirms payment manually.
 */
export async function GET(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const orderId = new URL(req.url).searchParams.get("orderId") ?? "";
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { esim: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Already fulfilled by admin
  if (order.esim) {
    return NextResponse.json({
      state: "completed",
      orderStatus: order.status,
      esim: {
        iccid: order.esim.iccid,
        activationCode: order.esim.activationCode,
        qrCode: order.esim.qrCode,
      },
    });
  }

  if (order.status === "ACTIVE") {
    return NextResponse.json({ state: "completed", orderStatus: order.status });
  }
  if (order.status === "CANCELLED") {
    return NextResponse.json({ state: "failed", orderStatus: order.status });
  }

  // Still waiting for admin to mark as paid
  return NextResponse.json({ state: "waiting", orderStatus: order.status });
}

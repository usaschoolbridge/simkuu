export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/orders/:id
 * Returns the order status and, once fulfilled, the eSIM (QR + LPA).
 * The id is an unguessable cuid, so this is safe for guest QR retrieval
 * on the success page without a session.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      plan: { include: { carrier: true } },
      esim: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    fulfilled: !!order.esim,
    plan: { name: order.plan.name, carrier: order.plan.carrier?.name, data: order.plan.data },
    customer: { name: order.user?.name, email: order.user?.email },
    esim: order.esim
      ? {
          iccid: order.esim.iccid,
          qrCode: order.esim.qrCode,
          activationCode: order.esim.activationCode,
          status: order.esim.status,
        }
      : null,
  });
}

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { fulfillAndNotify } from "@/lib/fulfillment";

/**
 * POST /api/orders/:id/demo-pay
 *
 * Simulates a captured payment so the end-to-end journey (allocate inventory
 * → generate QR → email) can be exercised before live payment keys exist.
 *
 * Guarded: only runs when SIMKUU_DEMO_CHECKOUT="1". In production with the
 * flag unset this returns 403, so it can never be used to obtain a free eSIM.
 * Once real provider keys are configured, the webhook path supersedes this.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.SIMKUU_DEMO_CHECKOUT !== "1") {
    return NextResponse.json({ error: "Demo checkout disabled" }, { status: 403 });
  }

  const { id } = await params;
  const result = await fulfillAndNotify(id, `demo_${Date.now()}`);

  if (!result.ok) {
    const status = result.reason === "no_inventory" ? 409 : result.reason === "order_not_found" ? 404 : 500;
    return NextResponse.json({ error: result.message, reason: result.reason }, { status });
  }

  return NextResponse.json({ ok: true, esim: result.esim, alreadyFulfilled: result.alreadyFulfilled });
}

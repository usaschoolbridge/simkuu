export const runtime = "nodejs";

/**
 * POST /api/admin/payment-testing/replay
 * Sandbox-only: re-deliver a stored webhook event to our webhook endpoint.
 * The x-simkuu-replay header makes the webhook skip dedup and tag the new
 * event with replayOf so the chain is auditable.
 *
 * Body: { eventId: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { testingGuard, signWebhookPayload } from "@/lib/payments/testing";

const schema = z.object({ eventId: z.string().min(1) });

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const guard = testingGuard(req); // admin + sandbox required
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const event = await db.webhookEvent.findUnique({ where: { id: parsed.data.eventId } });
  if (!event) return NextResponse.json({ error: "Webhook event not found" }, { status: 404 });
  if (event.mode !== "sandbox") {
    return NextResponse.json({ error: "Only sandbox events can be replayed" }, { status: 403 });
  }

  const payload = event.payload as Record<string, unknown>;
  const sig = signWebhookPayload(payload);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const res = await fetch(`${baseUrl}/api/webhooks/nowpayments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-nowpayments-sig": sig,
      "x-simkuu-replay": event.id,
    },
    body: JSON.stringify(payload),
  });
  const webhookResult = await res.json().catch(() => ({}));

  return NextResponse.json({
    replayed: true,
    sourceEventId: event.id,
    webhookHttpStatus: res.status,
    webhookResult,
  });
}

export const runtime = "nodejs";

/**
 * GET  /api/admin/payment-testing — list webhook events + payment logs (admin only)
 * DELETE /api/admin/payment-testing — wipe sandbox test data (admin + sandbox only)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPaymentMode } from "@/lib/payments/provider";
import { testingGuard, SIMULATABLE_STATUSES } from "@/lib/payments/testing";

export async function GET(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const guard = testingGuard(req, { requireSandbox: false });
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();
  const mode = searchParams.get("mode") ?? getPaymentMode();

  const whereEvents: Record<string, unknown> = { mode };
  if (status && status !== "all") whereEvents.status = status;
  if (search) {
    whereEvents.OR = [
      { paymentId: { contains: search, mode: "insensitive" } },
      { orderId: { contains: search, mode: "insensitive" } },
    ];
  }

  const whereLogs: Record<string, unknown> = { mode };
  if (search) {
    whereLogs.OR = [
      { paymentId: { contains: search, mode: "insensitive" } },
      { orderId: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [events, logs] = await Promise.all([
      db.webhookEvent.findMany({ where: whereEvents, orderBy: { createdAt: "desc" }, take: 100 }),
      db.paymentLog.findMany({ where: whereLogs, orderBy: { createdAt: "desc" }, take: 200 }),
    ]);

    return NextResponse.json({
      mode: getPaymentMode(),
      sandboxEnabled: getPaymentMode() === "sandbox",
      statuses: SIMULATABLE_STATUSES,
      events,
      logs,
    });
  } catch (err) {
    console.error("[payment-testing] list failed", err);
    return NextResponse.json({ error: "Failed to load testing data" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const guard = testingGuard(req); // sandbox required for destructive cleanup
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  try {
    // Only ever deletes sandbox-mode rows — production audit data is untouched.
    const [events, logs] = await Promise.all([
      db.webhookEvent.deleteMany({ where: { mode: "sandbox" } }),
      db.paymentLog.deleteMany({ where: { mode: "sandbox" } }),
    ]);
    return NextResponse.json({ deletedEvents: events.count, deletedLogs: logs.count });
  } catch (err) {
    console.error("[payment-testing] cleanup failed", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

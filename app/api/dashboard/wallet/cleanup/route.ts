export const runtime = "nodejs";
// route: POST /api/dashboard/wallet/cleanup
// Deletes PENDING wallet topup transactions older than 2 hours (expired payments)

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST() {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const { count } = await db.walletTransaction.deleteMany({
      where: {
        userId: session.userId,
        type: "TOPUP",
        status: "PENDING",
        createdAt: { lt: twoHoursAgo },
      },
    });

    return NextResponse.json({ ok: true, deleted: count });
  } catch (err) {
    console.error("[wallet/cleanup]", err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}

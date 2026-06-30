export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

/** GET /api/dashboard/esims — the signed-in user's eSIMs with QR + LPA. */
export async function GET() {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const esims = await db.eSim.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { plan: { include: { carrier: true } } },
  });

  return NextResponse.json(
    esims.map((e: (typeof esims)[number]) => ({
      id: e.id,
      carrier: e.plan?.carrier?.name ?? String(e.carrier),
      plan: e.plan?.name ?? "eSIM Plan",
      signal: e.plan?.fiveG ? "5G" : "4G LTE",
      iccid: e.iccid,
      qrCode: e.qrCode,
      activationCode: e.activationCode,
      status: e.status === "ACTIVE" ? "active" : e.status === "EXPIRED" ? "expired" : "pending",
      dataUsed: e.dataUsedMb ? +(e.dataUsedMb / 1024).toFixed(1) : 0,
      dataTotal: e.dataLimitMb ? +(e.dataLimitMb / 1024).toFixed(1) : null,
      activatedAt: e.activatedAt ? new Date(e.activatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
      expiresAt: e.expiresAt ? new Date(e.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    })),
  );
}

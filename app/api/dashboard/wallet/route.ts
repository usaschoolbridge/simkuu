export const runtime = "nodejs";
// route: GET /api/dashboard/wallet
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [user, transactions] = await Promise.all([
      db.user.findUnique({
        where: { id: session.userId },
        select: { walletBalance: true },
      }),
      db.walletTransaction.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    type Tx = (typeof transactions)[number];

    const totalTopup = transactions
      .filter((t: Tx) => t.type === "TOPUP" && t.status === "COMPLETED")
      .reduce((s: number, t: Tx) => s + Number(t.amount), 0);

    const totalSpent = transactions
      .filter((t: Tx) => t.type === "PURCHASE" && t.status === "COMPLETED")
      .reduce((s: number, t: Tx) => s + Number(t.amount), 0);

    const totalReferral = transactions
      .filter((t: Tx) => t.type === "REFERRAL_REWARD" && t.status === "COMPLETED")
      .reduce((s: number, t: Tx) => s + Number(t.amount), 0);

    return NextResponse.json({
      balance: Number(user.walletBalance),
      stats: { totalTopup, totalSpent, totalReferral },
      transactions: transactions.map((t: Tx) => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        balanceAfter: Number(t.balanceAfter),
        description: t.description,
        reference: t.reference ?? null,
        status: t.status,
        createdAt: new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        createdAtIso: t.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[dashboard/wallet]", err);
    return NextResponse.json({ error: "Failed to load wallet" }, { status: 500 });
  }
}

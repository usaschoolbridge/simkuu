export const runtime = "nodejs";
// route: GET /api/dashboard/referrals
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        referralCode: true,
        referrals: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            orders: {
              where: { status: { in: ["ACTIVE", "PROCESSING"] } },
              select: { id: true },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
        },
        referralEarnings: {
          select: { id: true, amount: true, isPaid: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://simkuu.com";
    const referralLink = `${baseUrl}/ref/${user.referralCode}`;

    type Ref = (typeof user.referrals)[number];
    type Earning = (typeof user.referralEarnings)[number];

    const referrals = user.referrals.map((r: Ref) => ({
      id: r.id,
      name: r.name ?? "Anonymous",
      email: r.email.replace(/^(.{1})(.*)(@.*)$/, "$1***$3"),
      joined: new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: r.orders.length > 0 ? "converted" : "pending",
    }));

    const totalEarned = user.referralEarnings
      .filter((e: Earning) => e.isPaid)
      .reduce((s: number, e: Earning) => s + Number(e.amount), 0);

    const converted = referrals.filter((r: { status: string }) => r.status === "converted").length;
    const pending = referrals.filter((r: { status: string }) => r.status === "pending").length;

    const earnings = user.referralEarnings.map((e: Earning) => ({
      id: e.id,
      amount: Number(e.amount),
      isPaid: e.isPaid,
      date: new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }));

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink,
      stats: {
        total: referrals.length,
        converted,
        pending,
        totalEarned,
      },
      referrals,
      earnings,
    });
  } catch (err) {
    console.error("[dashboard/referrals]", err);
    return NextResponse.json({ error: "Failed to load referrals" }, { status: 500 });
  }
}

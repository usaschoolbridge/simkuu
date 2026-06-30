export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "throwaway.email", "guerrillamail.com",
  "0mail.net", "maildrop.cc", "sharklasers.com", "yopmail.com", "trashmail.com",
  "fakeinbox.com", "spamgourmet.com", "mailnull.com", "spamfree24.org",
  "mt2015.com", "dispostable.com", "getairmail.com", "filzmail.com",
  "spambog.com", "spamspot.com", "hmamail.com", "tempr.email",
  "discard.email", "despam.it", "jetable.fr", "mintemail.com",
  "tempinbox.com", "spamoff.de", "trashmail.io", "spamtest.de",
]);

function isDisposable(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return DISPOSABLE_DOMAINS.has(domain);
}

function isTestEmail(email: string) {
  return /^(test|temp|fake|spam|noreply|trash|dummy)[+@]/.test(email.toLowerCase());
}

function riskScore(flags: string[]): number {
  let score = 0;
  for (const f of flags) {
    if (f.includes("Disposable")) score += 40;
    else if (f.includes("test email")) score += 30;
    else if (f.includes("3+ orders")) score += 45;
    else if (f.includes("2 orders")) score += 25;
    else if (f.includes("High-value")) score += 20;
    else if (f.includes("REFUNDED")) score += 35;
    else if (f.includes("CANCELLED")) score += 10;
  }
  return Math.min(score, 99);
}

function checkAdmin() {
  const jar = cookies();
  return jar.get("simkuu_admin_session")?.value === "authenticated";
}

export async function GET(_req: NextRequest) {
  if (!checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  try {
    // Get all users with their orders in the last 30 days
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const users = await db.user.findMany({
      where: {
        role: "USER",
        orders: { some: { createdAt: { gte: since } } },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        orders: {
          where: { createdAt: { gte: since } },
          select: {
            id: true,
            orderNo: true,
            amount: true,
            status: true,
            createdAt: true,
            paymentProvider: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const flags: {
      id: string;
      orderId: string;
      customer: string;
      email: string;
      amount: string;
      reason: string;
      riskScore: number;
      time: string;
      status: string;
    }[] = [];

    for (const user of users) {
      const reasons: string[] = [];

      if (isDisposable(user.email)) reasons.push("Disposable email domain detected");
      if (isTestEmail(user.email)) reasons.push("Suspicious test email pattern");

      const refundedOrders = user.orders.filter(o => o.status === "REFUNDED");
      if (refundedOrders.length > 0) reasons.push(`${refundedOrders.length} REFUNDED order(s) in last 30 days`);

      const cancelledOrders = user.orders.filter(o => o.status === "CANCELLED");
      if (cancelledOrders.length >= 2) reasons.push(`${cancelledOrders.length} CANCELLED orders in last 30 days`);

      // Velocity check — multiple orders in 24h window
      const ordersByDay = new Map<string, number>();
      for (const o of user.orders) {
        const day = o.createdAt.toISOString().slice(0, 10);
        ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);
      }
      for (const [day, count] of ordersByDay) {
        if (count >= 3) reasons.push(`3+ orders placed on ${day} (velocity check)`);
        else if (count === 2) reasons.push(`2 orders placed on ${day}`);
      }

      // High-value orders
      for (const o of user.orders) {
        if (Number(o.amount) >= 100) {
          reasons.push(`High-value order ($${Number(o.amount).toFixed(2)}) — manual review recommended`);
          break;
        }
      }

      if (reasons.length === 0) continue;

      const latestOrder = user.orders[0];
      if (!latestOrder) continue;

      const score = riskScore(reasons);
      if (score < 20) continue; // Only flag meaningful risks

      const timeMs = Date.now() - latestOrder.createdAt.getTime();
      const timeStr = timeMs < 3600000
        ? `${Math.floor(timeMs / 60000)}m ago`
        : timeMs < 86400000
        ? `${Math.floor(timeMs / 3600000)}h ago`
        : latestOrder.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      flags.push({
        id: `flag-${user.id}`,
        orderId: `ORD-${new Date(latestOrder.createdAt).getFullYear()}-${String(latestOrder.orderNo).padStart(6, "0")}`,
        customer: user.name ?? "Unknown User",
        email: user.email,
        amount: `$${Number(latestOrder.amount).toFixed(2)}`,
        reason: reasons.join("; "),
        riskScore: score,
        time: timeStr,
        status: "pending",
      });
    }

    // Sort by risk score descending
    flags.sort((a, b) => b.riskScore - a.riskScore);

    // Real stats from DB
    const [totalOrders, refundedCount] = await Promise.all([
      db.order.count({ where: { createdAt: { gte: since } } }),
      db.order.count({ where: { status: "REFUNDED", createdAt: { gte: since } } }),
    ]);

    const refundedRevenue = await db.order.aggregate({
      where: { status: "REFUNDED", createdAt: { gte: since } },
      _sum: { amount: true },
    });

    return NextResponse.json({
      flags,
      stats: {
        pendingReview: flags.filter(f => f.status === "pending").length,
        blockedToday: refundedCount,
        totalOrdersApproved: totalOrders - refundedCount,
        fraudPrevented: `$${Number(refundedRevenue._sum.amount ?? 0).toFixed(2)}`,
      },
    });
  } catch (err) {
    console.error("[admin/fraud]", err);
    return NextResponse.json({ error: "Failed to load fraud data" }, { status: 500 });
  }
}

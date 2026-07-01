export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ?count=1 — return only the unread count (used by shell header)
  const countOnly = req.nextUrl.searchParams.get("count") === "1";
  if (countOnly) {
    const unread = await db.notification.count({ where: { userId: session.userId, isRead: false } });
    return NextResponse.json({ unread });
  }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    type N = (typeof notifications)[number];
    return NextResponse.json(
      notifications.map((n: N) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        href: n.href,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString(),
        timeAgo: timeAgo(n.createdAt),
      }))
    );
  } catch (err) {
    console.error("[dashboard/notifications]", err);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (body.action === "mark_all_read") {
      await db.notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.id) {
      await db.notification.update({
        where: { id: body.id, userId: session.userId },
        data: { isRead: true },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    console.error("[dashboard/notifications PATCH]", err);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

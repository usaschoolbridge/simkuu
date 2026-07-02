import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const tickets = await db.supportTicket.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { author: { select: { name: true } } },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(tickets);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

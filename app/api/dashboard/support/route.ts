export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
// getSession uses cookies() — no req param needed
import { db } from "@/lib/db";

/** GET /api/dashboard/support — list tickets for the authenticated user */
export async function GET(_req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tickets = await db.supportTicket.findMany({
      where: { userId: session.userId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(tickets);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

/** POST /api/dashboard/support — create a new ticket */
export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.subject || !body.message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const ticket = await db.supportTicket.create({
      data: {
        userId: session.userId,
        subject: body.subject.trim(),
        category: body.category?.trim() ?? "General",
        priority: "MEDIUM",
        status: "OPEN",
        messages: {
          create: {
            authorId: session.userId,
            isAgent: false,
            content: body.message.trim(),
          },
        },
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}

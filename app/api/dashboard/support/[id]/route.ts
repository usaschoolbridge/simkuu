export const runtime = "nodejs";
// route: GET/POST /api/dashboard/support/[id]
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

/** GET /api/dashboard/support/[id] — full ticket with all messages */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const ticket = await db.supportTicket.findFirst({
      where: { id, userId: session.userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { name: true, image: true } } },
        },
      },
    });

    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    return NextResponse.json({
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      messages: ticket.messages.map((m: (typeof ticket.messages)[number]) => ({
        id: m.id,
        content: m.content,
        isAgent: m.isAgent,
        authorName: m.isAgent ? "Simkuu Support" : (m.author?.name ?? "You"),
        authorImage: m.author?.image ?? null,
        attachments: m.attachments,
        createdAt: m.createdAt.toISOString(),
        timeAgo: timeAgo(m.createdAt),
      })),
    });
  } catch (err) {
    console.error("[dashboard/support/[id] GET]", err);
    return NextResponse.json({ error: "Failed to load ticket" }, { status: 500 });
  }
}

/** POST /api/dashboard/support/[id] — customer reply */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    // Verify the ticket belongs to this user
    const ticket = await db.supportTicket.findFirst({
      where: { id, userId: session.userId },
      select: { id: true, status: true },
    });
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    if (ticket.status === "CLOSED") {
      return NextResponse.json({ error: "This ticket is closed" }, { status: 400 });
    }

    const message = await db.ticketMessage.create({
      data: {
        ticketId: id,
        authorId: session.userId,
        isAgent: false,
        content: body.content.trim(),
        attachments: [],
      },
      include: { author: { select: { name: true, image: true } } },
    });

    // Reopen ticket if resolved/closed when customer replies
    if (ticket.status === "RESOLVED") {
      await db.supportTicket.update({ where: { id }, data: { status: "OPEN", updatedAt: new Date() } });
    } else {
      await db.supportTicket.update({ where: { id }, data: { updatedAt: new Date() } });
    }

    return NextResponse.json({
      id: message.id,
      content: message.content,
      isAgent: false,
      authorName: message.author?.name ?? "You",
      createdAt: message.createdAt.toISOString(),
      timeAgo: "just now",
    }, { status: 201 });
  } catch (err) {
    console.error("[dashboard/support/[id] POST]", err);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

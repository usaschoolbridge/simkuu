import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { name: true, role: true } } },
        },
      },
    });
    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(ticket);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const body = await req.json();

    // Handle posting a reply message
    if (body.message) {
      // Find an admin/super-admin user; fall back to any user as system author
      const admin =
        (await db.user.findFirst({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } })) ??
        (await db.user.findFirst({ orderBy: { createdAt: "asc" } }));
      if (!admin) return NextResponse.json({ error: "No users found in system" }, { status: 400 });

      const message = await db.ticketMessage.create({
        data: {
          ticketId: id,
          authorId: admin.id,
          isAgent: true,
          content: body.message,
        },
      });
      return NextResponse.json(message);
    }

    // Handle status update
    const ticket = await db.supportTicket.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status.toUpperCase() }),
        ...(body.priority && { priority: body.priority.toUpperCase() }),
      },
    });
    return NextResponse.json(ticket);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

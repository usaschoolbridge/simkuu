import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const body = await req.json();
    const order = await db.order.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status.toUpperCase() }),
      },
      include: {
        user: { select: { name: true, email: true } },
        plan: { select: { name: true, carrier: { select: { name: true } } } },
      },
    });
    return NextResponse.json(order);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

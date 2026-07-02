import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  try {
    const { id } = await params;
    const body = await req.json();
    const user = await db.user.update({
      where: { id },
      data: {
        ...(body.role && { role: body.role }),
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
      },
    });
    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

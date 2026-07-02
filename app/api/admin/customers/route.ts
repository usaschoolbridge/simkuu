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
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { role: "USER" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await db.user.findMany({
      where,
      include: {
        _count: { select: { orders: true } },
        orders: { select: { amount: true }, where: { status: { not: "REFUNDED" } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

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
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }
    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { plan: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orders = await db.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        plan: { select: { id: true, name: true, carrier: { select: { name: true } } } },
        esim: { select: { id: true, iccid: true, activationCode: true, status: true, activatedAt: true } },
        inventoryItem: { select: { id: true, iccid: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

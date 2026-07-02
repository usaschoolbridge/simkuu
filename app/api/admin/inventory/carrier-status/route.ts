export const runtime = "nodejs";
// GET/POST /api/admin/inventory/carrier-status
// Manages per-carrier out-of-stock status stored in SiteSettings table.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyAdminToken } from "@/lib/admin-guard";

const ADMIN_COOKIE = "simkuu_admin_session";
const SETTINGS_KEY = "carrier_out_of_stock";

async function requireAdmin(): Promise<boolean> {
  const c = await cookies();
  return verifyAdminToken(c.get(ADMIN_COOKIE)?.value);
}

type CarrierStatusMap = Record<string, boolean>; // carrierId -> true means OUT OF STOCK

async function getStatusMap(): Promise<CarrierStatusMap> {
  if (!db) return {};
  const row = await db.siteSettings.findUnique({ where: { key: SETTINGS_KEY } });
  if (!row) return {};
  return (row.value as CarrierStatusMap) ?? {};
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const map = await getStatusMap();
  return NextResponse.json({ carrierStatus: map });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body.carrier !== "string" || typeof body.outOfStock !== "boolean") {
    return NextResponse.json({ error: "Invalid body: need { carrier, outOfStock }" }, { status: 400 });
  }

  const { carrier, outOfStock } = body;
  const existing = await getStatusMap();
  const updated: CarrierStatusMap = { ...existing, [carrier]: outOfStock };

  await db.siteSettings.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: updated },
    create: { key: SETTINGS_KEY, value: updated },
  });

  return NextResponse.json({ ok: true, carrierStatus: updated });
}

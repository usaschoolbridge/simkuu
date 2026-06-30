export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const ADMIN_COOKIE = "simkuu_admin_session";

async function requireAdmin(): Promise<boolean> {
  const c = await cookies();
  return c.get(ADMIN_COOKIE)?.value === "authenticated";
}

type Carrier = "TMOBILE" | "VERIZON" | "ATT" | "MVNO";
const CARRIERS: Carrier[] = ["TMOBILE", "VERIZON", "ATT", "MVNO"];

/**
 * GET /api/admin/inventory
 * Stock summary per plan + carrier, with low-stock flags. Used for the admin
 * dashboard and low-stock alerts.
 */
export async function GET() {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const LOW_STOCK_THRESHOLD = 5;

  const [byStatus, byPlan, plans] = await Promise.all([
    db.inventoryItem.groupBy({ by: ["status"], _count: { _all: true } }),
    db.inventoryItem.groupBy({ by: ["planId", "status"], _count: { _all: true } }),
    db.plan.findMany({ where: { isActive: true }, select: { id: true, name: true, carrierId: true } }),
  ]);

  const totals = { AVAILABLE: 0, RESERVED: 0, SOLD: 0 };
  for (const r of byStatus) totals[r.status as keyof typeof totals] = r._count._all;

  const perPlan = plans.map((p: (typeof plans)[number]) => {
    const available = byPlan.find((b: (typeof byPlan)[number]) => b.planId === p.id && b.status === "AVAILABLE")?._count._all ?? 0;
    return { planId: p.id, name: p.name, carrier: p.carrierId, available, low: available <= LOW_STOCK_THRESHOLD };
  });

  return NextResponse.json({
    totals,
    perPlan,
    lowStock: perPlan.filter((p: (typeof perPlan)[number]) => p.low),
    threshold: LOW_STOCK_THRESHOLD,
  });
}

/**
 * POST /api/admin/inventory
 * Bulk upload LPA inventory. Body: { rows: [...] } or { csv: "..." }.
 * Each row: carrier, lpaActivationString, iccid, planId?, country?, expiresAt?.
 * Duplicate ICCIDs are skipped (createMany skipDuplicates), so re-uploading a
 * batch is safe.
 */
export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rows: Record<string, string>[];
  try {
    const body = await req.json();
    rows = Array.isArray(body.rows) ? body.rows : body.csv ? parseCsv(body.csv) : [];
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (rows.length === 0) return NextResponse.json({ error: "No rows provided" }, { status: 400 });

  const batchId = `batch_${Date.now()}`;
  const errors: string[] = [];
  const valid: {
    carrier: Carrier; iccid: string; lpaActivationString: string;
    planId: string | null; country: string; expiresAt: Date | null; batchId: string;
  }[] = [];

  rows.forEach((r, i) => {
    const carrier = String(r.carrier ?? "").toUpperCase().trim() as Carrier;
    const iccid = String(r.iccid ?? "").trim();
    const lpa = String(r.lpaActivationString ?? r.lpa ?? "").trim();
    if (!CARRIERS.includes(carrier)) { errors.push(`Row ${i + 1}: invalid carrier "${r.carrier}"`); return; }
    if (!iccid) { errors.push(`Row ${i + 1}: missing iccid`); return; }
    if (!lpa) { errors.push(`Row ${i + 1}: missing lpaActivationString`); return; }
    const expRaw = String(r.expiresAt ?? "").trim();
    const exp = expRaw ? new Date(expRaw) : null;
    valid.push({
      carrier, iccid, lpaActivationString: lpa,
      planId: r.planId ? String(r.planId).trim() : null,
      country: r.country ? String(r.country).trim() : "US",
      expiresAt: exp && !isNaN(exp.getTime()) ? exp : null,
      batchId,
    });
  });

  if (valid.length === 0) {
    return NextResponse.json({ error: "No valid rows", details: errors }, { status: 400 });
  }

  const result = await db.inventoryItem.createMany({ data: valid, skipDuplicates: true });

  return NextResponse.json({
    inserted: result.count,
    skippedDuplicates: valid.length - result.count,
    invalidRows: errors.length,
    errors: errors.slice(0, 20),
    batchId,
  });
}

/** Minimal CSV parser: header row defines keys, comma-separated. */
function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (cells[i] ?? "").trim(); });
    return row;
  });
}

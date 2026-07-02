export const runtime = "nodejs";
export const maxDuration = 60; // Vercel max for Pro; hobby gets 10s but better than default

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import QRCode from "qrcode";
import { verifyAdminToken } from "@/lib/admin-guard";

const ADMIN_COOKIE = "simkuu_admin_session";

async function requireAdmin(): Promise<boolean> {
  const c = await cookies();
  return verifyAdminToken(c.get(ADMIN_COOKIE)?.value);
}

type Carrier = "TMOBILE" | "VERIZON" | "ATT" | "MVNO";
const CARRIERS: Carrier[] = ["TMOBILE", "VERIZON", "ATT", "MVNO"];

/**
 * GET /api/admin/inventory
 * Stock summary per plan + carrier, with low-stock flags.
 * All values come from the real InventoryItem table — no hardcoded values.
 */
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const LOW_STOCK_THRESHOLD = 5;

  const [byStatus, byPlan, plans] = await Promise.all([
    db.inventoryItem.groupBy({ by: ["status"], _count: { _all: true } }),
    db.inventoryItem.groupBy({ by: ["planId", "status"], _count: { _all: true } }),
    db.plan.findMany({ where: { isActive: true }, select: { id: true, name: true, carrierId: true } }),
  ]);

  const totals = { AVAILABLE: 0, RESERVED: 0, SOLD: 0 };
  for (const r of byStatus) totals[r.status as keyof typeof totals] = r._count._all;

  type PlanRow = { id: string; name: string; carrierId: string };
  type ByPlanRow = { planId: string | null; status: string; _count: { _all: number } };

  const perPlan = plans.map((p: PlanRow) => {
    const available = byPlan.find((b: ByPlanRow) => b.planId === p.id && b.status === "AVAILABLE")?._count._all ?? 0;
    return { planId: p.id, name: p.name, carrier: p.carrierId, available, low: available <= LOW_STOCK_THRESHOLD };
  });

  // Auto-detect carrier out-of-stock: carrier is out if ALL its plans have 0 available
  const autoCarrierStatus: Record<string, boolean> = {};
  type PerPlanRow = { planId: string; name: string; carrier: string; available: number; low: boolean };
  const typedPerPlan = perPlan as PerPlanRow[];
  const allCarrierIds = [...new Set(plans.map((p: PlanRow) => p.carrierId))];
  for (const carrierId of allCarrierIds) {
    const carrierPlans = typedPerPlan.filter((pp: PerPlanRow) => pp.carrier === carrierId);
    autoCarrierStatus[String(carrierId)] = carrierPlans.length > 0 && carrierPlans.every((pp: PerPlanRow) => pp.available === 0);
  }

  return NextResponse.json({
    totals,
    perPlan: typedPerPlan,
    lowStock: typedPerPlan.filter((pp: PerPlanRow) => pp.low),
    threshold: LOW_STOCK_THRESHOLD,
    autoCarrierStatus,
  });
}

/**
 * POST /api/admin/inventory
 * Bulk upload LPA inventory. Accepts chunked batches to avoid timeouts.
 * Body: { csv?: string, rows?: Record<string,string>[], chunk?: number, totalChunks?: number }
 *
 * Rules:
 * - carrier is required (TMOBILE / VERIZON / ATT / MVNO)
 * - iccid is OPTIONAL — auto-generated as UNKNOWN-{timestamp}-{i} if missing
 * - lpaActivationString is required and must start with LPA:
 * - Duplicate ICCIDs are skipped with a clear reason
 * - QR code is generated server-side for each valid row
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  let rows: Record<string, string>[];
  let chunk = 1;
  let totalChunks = 1;

  try {
    const body = await req.json();
    chunk = body.chunk ?? 1;
    totalChunks = body.totalChunks ?? 1;
    rows = Array.isArray(body.rows)
      ? body.rows
      : body.csv
        ? parseCsvRobust(body.csv)
        : [];
  } catch {
    return NextResponse.json({ error: "Invalid body — expected JSON with csv or rows field" }, { status: 400 });
  }

  if (rows.length === 0) return NextResponse.json({ error: "No rows provided" }, { status: 400 });

  const batchId = `batch_${Date.now()}`;
  const ts = Date.now();

  type FailedRow = { row: number; iccid: string; reason: string; rawLine: string };
  const failed: FailedRow[] = [];
  const valid: {
    carrier: Carrier; iccid: string; lpaActivationString: string; qrCode: string;
    planId: string | null; country: string; expiresAt: Date | null; batchId: string;
  }[] = [];

  // Pre-fetch existing ICCIDs for de-duplication (only for rows that have an ICCID)
  const candidateIccids = rows
    .map((r) => String(r.iccid ?? "").trim())
    .filter(Boolean);

  const existingIccidSet = new Set<string>();
  if (candidateIccids.length > 0) {
    const existing = await db.inventoryItem.findMany({
      where: { iccid: { in: candidateIccids } },
      select: { iccid: true },
    });
    for (const e of existing) existingIccidSet.add(e.iccid);
  }

  // Also track ICCIDs we're about to insert (within this batch) to catch intra-batch dupes
  const batchIccidSet = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNum = i + 2; // 1-based + header row
    const rawLine = Object.values(r).join(",");

    const carrier = String(r.carrier ?? "").toUpperCase().trim() as Carrier;
    const rawIccid = String(r.iccid ?? "").trim();
    const lpa = String(r.lpaActivationString ?? r.lpa ?? "").trim();

    // Validate carrier
    if (!CARRIERS.includes(carrier)) {
      failed.push({
        row: rowNum, iccid: rawIccid || "(missing)",
        reason: `Invalid carrier "${r.carrier}" — must be TMOBILE, VERIZON, ATT, or MVNO`,
        rawLine,
      });
      continue;
    }

    // Validate LPA (required)
    if (!lpa) {
      failed.push({ row: rowNum, iccid: rawIccid || "(missing)", reason: "Missing lpaActivationString", rawLine });
      continue;
    }
    if (!lpa.startsWith("LPA:")) {
      failed.push({
        row: rowNum, iccid: rawIccid || "(missing)",
        reason: `LPA string must start with "LPA:" — got "${lpa.slice(0, 30)}"`,
        rawLine,
      });
      continue;
    }

    // ICCID: optional — auto-generate if missing
    const iccid = rawIccid || `UNKNOWN-${ts}-${String(i).padStart(6, "0")}`;

    // Duplicate check
    if (existingIccidSet.has(iccid)) {
      failed.push({ row: rowNum, iccid, reason: "Duplicate — ICCID already in inventory", rawLine });
      continue;
    }
    if (batchIccidSet.has(iccid)) {
      failed.push({ row: rowNum, iccid, reason: "Duplicate — ICCID appears more than once in this upload", rawLine });
      continue;
    }
    batchIccidSet.add(iccid);

    // Generate QR code from LPA string
    let qrCode: string;
    try {
      qrCode = await QRCode.toDataURL(lpa, { width: 256, margin: 1, errorCorrectionLevel: "M" });
    } catch {
      failed.push({ row: rowNum, iccid, reason: "Failed to generate QR code", rawLine });
      continue;
    }

    const expRaw = String(r.expiresAt ?? "").trim();
    const exp = expRaw ? new Date(expRaw) : null;

    valid.push({
      carrier, iccid, lpaActivationString: lpa, qrCode,
      planId: r.planId ? String(r.planId).trim() || null : null,
      country: r.country ? String(r.country).trim() || "US" : "US",
      expiresAt: exp && !isNaN(exp.getTime()) ? exp : null,
      batchId,
    });
  }

  let inserted = 0;
  if (valid.length > 0) {
    try {
      const result = await db.inventoryItem.createMany({ data: valid, skipDuplicates: true });
      inserted = result.count;
    } catch (err) {
      console.error("[inventory/bulk] createMany failed:", err);
      return NextResponse.json({ error: "Database insert failed. Please try again." }, { status: 500 });
    }
  }

  const failedCsv = failed.length > 0 ? buildFailedCsv(failed) : null;

  return NextResponse.json({
    inserted,
    failed: failed.length,
    total: rows.length,
    batchId,
    chunk,
    totalChunks,
    errors: failed.slice(0, 100).map((f) => `Row ${f.row} (${f.iccid}): ${f.reason}`),
    failedCsv,
  });
}

/** RFC 4180-compliant CSV parser. Handles quoted fields with commas, escaped quotes, CRLF. */
function parseCsvRobust(csv: string): Record<string, string>[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const fields: string[] = [];
    let i = 0;
    while (i <= line.length) {
      if (i === line.length) { fields.push(""); break; }
      if (line[i] === '"') {
        let field = "";
        i++;
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') { field += '"'; i += 2; }
          else if (line[i] === '"') { i++; break; }
          else { field += line[i++]; }
        }
        fields.push(field);
        if (line[i] === ",") i++;
        else break;
      } else {
        const end = line.indexOf(",", i);
        if (end === -1) { fields.push(line.slice(i).trim()); break; }
        else { fields.push(line.slice(i, end).trim()); i = end + 1; }
      }
    }
    return fields;
  };

  const headers = parseRow(lines[0]).map((h) => h.trim().toLowerCase()
    // normalise common header variants
    .replace(/lpa.*/i, "lpaActivationString")
    .replace(/activation.?code/i, "lpaActivationString")
    .replace(/esim.?profile/i, "lpaActivationString")
    .replace(/plan.?id/i, "planId")
    .replace(/expires.?at/i, "expiresAt")
  );

  const result: Record<string, string>[] = [];
  for (let li = 1; li < lines.length; li++) {
    const line = lines[li].trim();
    if (!line) continue;
    const cells = parseRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = cells[idx] ?? ""; });
    result.push(row);
  }
  return result;
}

function buildFailedCsv(failed: { row: number; iccid: string; reason: string; rawLine: string }[]): string {
  const header = "row,iccid,reason,original_data";
  const rows = failed.map(
    (f) => `${f.row},"${f.iccid}","${f.reason.replace(/"/g, '""')}","${f.rawLine.replace(/"/g, '""')}"`
  );
  return Buffer.from([header, ...rows].join("\n")).toString("base64");
}

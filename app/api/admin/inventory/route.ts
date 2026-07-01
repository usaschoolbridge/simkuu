export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import QRCode from "qrcode";

const ADMIN_COOKIE = "simkuu_admin_session";

async function requireAdmin(): Promise<boolean> {
  const c = await cookies();
  return c.get(ADMIN_COOKIE)?.value === "authenticated";
}

type Carrier = "TMOBILE" | "VERIZON" | "ATT" | "MVNO";
const CARRIERS: Carrier[] = ["TMOBILE", "VERIZON", "ATT", "MVNO"];

/**
 * GET /api/admin/inventory
 * Stock summary per plan + carrier, with low-stock flags.
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
 * Bulk upload LPA inventory. Body: { csv: "..." }.
 * Each row: carrier, iccid, lpaActivationString, planId?, country?, expiresAt?.
 * Generates QR code server-side for each valid row.
 * Returns per-row results with downloadable failed-rows CSV.
 */
export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let rows: Record<string, string>[];
  try {
    const body = await req.json();
    rows = Array.isArray(body.rows) ? body.rows : body.csv ? parseCsvRobust(body.csv) : [];
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (rows.length === 0) return NextResponse.json({ error: "No rows provided" }, { status: 400 });

  const batchId = `batch_${Date.now()}`;

  type FailedRow = { row: number; iccid: string; reason: string; rawLine: string };
  const failed: FailedRow[] = [];
  const valid: {
    carrier: Carrier; iccid: string; lpaActivationString: string; qrCode: string;
    planId: string | null; country: string; expiresAt: Date | null; batchId: string;
  }[] = [];

  // Check which ICCIDs already exist
  const candidateIccids = rows
    .map((r) => String(r.iccid ?? "").trim())
    .filter(Boolean);
  const existingItems = await db.inventoryItem.findMany({
    where: { iccid: { in: candidateIccids } },
    select: { iccid: true },
  });
  const existingIccidSet = new Set(existingItems.map((e: { iccid: string }) => e.iccid));

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNum = i + 2; // 1-based + header
    const rawLine = Object.values(r).join(",");

    const carrier = String(r.carrier ?? "").toUpperCase().trim() as Carrier;
    const iccid = String(r.iccid ?? "").trim();
    const lpa = String(r.lpaActivationString ?? r.lpa ?? "").trim();

    if (!CARRIERS.includes(carrier)) {
      failed.push({ row: rowNum, iccid, reason: `Invalid carrier "${r.carrier}" — must be TMOBILE, VERIZON, ATT, or MVNO`, rawLine });
      continue;
    }
    if (!iccid) {
      failed.push({ row: rowNum, iccid: "(missing)", reason: "Missing ICCID", rawLine });
      continue;
    }
    if (!lpa) {
      failed.push({ row: rowNum, iccid, reason: "Missing lpaActivationString", rawLine });
      continue;
    }
    if (!lpa.startsWith("LPA:")) {
      failed.push({ row: rowNum, iccid, reason: `LPA string must start with "LPA:" — got "${lpa.slice(0, 20)}"`, rawLine });
      continue;
    }
    if (existingIccidSet.has(iccid)) {
      failed.push({ row: rowNum, iccid, reason: "Duplicate — ICCID already in inventory", rawLine });
      continue;
    }

    // Generate QR code
    let qrCode: string;
    try {
      qrCode = await QRCode.toDataURL(lpa, { width: 300, margin: 2 });
    } catch {
      failed.push({ row: rowNum, iccid, reason: "Failed to generate QR code", rawLine });
      continue;
    }

    const expRaw = String(r.expiresAt ?? "").trim();
    const exp = expRaw ? new Date(expRaw) : null;

    valid.push({
      carrier, iccid, lpaActivationString: lpa, qrCode,
      planId: r.planId ? String(r.planId).trim() : null,
      country: r.country ? String(r.country).trim() : "US",
      expiresAt: exp && !isNaN(exp.getTime()) ? exp : null,
      batchId,
    });
  }

  let inserted = 0;
  if (valid.length > 0) {
    const result = await db.inventoryItem.createMany({ data: valid, skipDuplicates: true });
    inserted = result.count;
  }

  // Build downloadable failed-rows CSV
  const failedCsv = failed.length > 0
    ? buildFailedCsv(failed)
    : null;

  return NextResponse.json({
    inserted,
    failed: failed.length,
    total: rows.length,
    batchId,
    errors: failed.slice(0, 50).map((f) => `Row ${f.row} (${f.iccid}): ${f.reason}`),
    failedCsv, // base64-encoded CSV of failed rows with reason column
  });
}

/** RFC 4180-compliant CSV parser. Handles quoted fields, commas inside quotes, escaped quotes. */
function parseCsvRobust(csv: string): Record<string, string>[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const parseRow = (line: string): string[] => {
    const fields: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        // Quoted field
        let field = "";
        i++; // skip opening quote
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') {
            field += '"'; i += 2; // escaped quote
          } else if (line[i] === '"') {
            i++; break; // closing quote
          } else {
            field += line[i++];
          }
        }
        fields.push(field);
        if (line[i] === ",") i++; // skip comma separator
      } else {
        // Unquoted field
        const end = line.indexOf(",", i);
        if (end === -1) {
          fields.push(line.slice(i).trim());
          break;
        } else {
          fields.push(line.slice(i, end).trim());
          i = end + 1;
        }
      }
    }
    return fields;
  };

  const headers = parseRow(lines[0]).map((h) => h.trim());
  const result: Record<string, string>[] = [];
  for (let li = 1; li < lines.length; li++) {
    const line = lines[li].trim();
    if (!line) continue;
    const cells = parseRow(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ""; });
    result.push(row);
  }
  return result;
}

function buildFailedCsv(failed: { row: number; iccid: string; reason: string; rawLine: string }[]): string {
  const header = "row,iccid,reason,original_data";
  const rows = failed.map((f) =>
    `${f.row},"${f.iccid}","${f.reason.replace(/"/g, '""')}","${f.rawLine.replace(/"/g, '""')}"`
  );
  return Buffer.from([header, ...rows].join("\n")).toString("base64");
}

export const runtime = "nodejs";
// POST /api/admin/inventory/esim
// Add a single eSIM by:
//   Method A — LPA string (server generates QR from it)
//   Method B — QR image upload (client decodes QR → sends LPA + original QR data URL)
//
// ICCID is OPTIONAL. If not provided, a unique fallback ID is generated automatically.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import QRCode from "qrcode";
import { verifyAdminToken } from "@/lib/admin-guard";

const ADMIN_COOKIE = "simkuu_admin_session";
type Carrier = "TMOBILE" | "VERIZON" | "ATT" | "MVNO";
const CARRIERS: Carrier[] = ["TMOBILE", "VERIZON", "ATT", "MVNO"];

async function requireAdmin(): Promise<boolean> {
  const c = await cookies();
  return verifyAdminToken(c.get(ADMIN_COOKIE)?.value);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const {
    iccid: iccidRaw,
    lpaActivationString,
    carrier: carrierRaw,
    planId,
    country,
    confirmationCode,
    qrCodeDataUrl, // optional: original QR image from client (used when admin uploads a QR photo)
  } = body;

  // ── Carrier (required) ──────────────────────────────────────────────────────
  const carrier = String(carrierRaw ?? "").toUpperCase().trim() as Carrier;
  if (!CARRIERS.includes(carrier)) {
    return NextResponse.json(
      { error: `Invalid carrier. Must be one of: ${CARRIERS.join(", ")}` },
      { status: 400 },
    );
  }

  // ── LPA activation string (required) ───────────────────────────────────────
  const lpaRaw = String(lpaActivationString ?? "").trim();
  if (!lpaRaw) {
    return NextResponse.json({ error: "LPA Activation String is required" }, { status: 400 });
  }
  if (!lpaRaw.startsWith("LPA:")) {
    return NextResponse.json(
      { error: 'LPA string must start with "LPA:" (e.g. LPA:1$server$activationcode)' },
      { status: 400 },
    );
  }

  // ── ICCID (optional) ────────────────────────────────────────────────────────
  // If the admin/supplier doesn't provide an ICCID, generate a unique placeholder.
  const iccidClean = String(iccidRaw ?? "").trim();
  const iccid = iccidClean || `QR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  // ── Duplicate check ─────────────────────────────────────────────────────────
  if (iccidClean) {
    const existing = await db.inventoryItem.findUnique({ where: { iccid } });
    if (existing) {
      return NextResponse.json(
        { error: `ICCID ${iccid} already exists in inventory` },
        { status: 409 },
      );
    }
  }

  // ── QR code ─────────────────────────────────────────────────────────────────
  // Priority: original QR image from client > server-generated from LPA string
  let qrCode: string;
  try {
    if (qrCodeDataUrl) {
      // Admin uploaded a QR photo — store the original image so customer receives it as-is
      qrCode = qrCodeDataUrl;
    } else {
      // Generate clean QR from LPA string
      qrCode = await QRCode.toDataURL(lpaRaw, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: "M",
        color: { dark: "#000000", light: "#FFFFFF" },
      });
    }
  } catch {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }

  // Append confirmation code to LPA if provided
  const lpaFinal = confirmationCode ? `${lpaRaw}$${confirmationCode}` : lpaRaw;

  try {
    const item = await db.inventoryItem.create({
      data: {
        carrier,
        iccid,
        lpaActivationString: lpaFinal,
        qrCode,
        planId: planId ? String(planId).trim() || null : null,
        country: country ? String(country).trim() || "US" : "US",
        status: "AVAILABLE",
        batchId: `single_${Date.now()}`,
      },
    });

    return NextResponse.json({
      ok: true,
      id: item.id,
      iccid: item.iccid,
      autoIccid: !iccidClean, // tells client we generated the ICCID
    });
  } catch (err) {
    console.error("[esim/single]", err);
    return NextResponse.json({ error: "Failed to save eSIM" }, { status: 500 });
  }
}

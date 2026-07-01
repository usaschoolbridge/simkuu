export const runtime = "nodejs";
// POST /api/admin/inventory/esim
// Add a single eSIM by LPA string (server generates QR) or by providing both LPA + QR.

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import QRCode from "qrcode";

const ADMIN_COOKIE = "simkuu_admin_session";
type Carrier = "TMOBILE" | "VERIZON" | "ATT" | "MVNO";
const CARRIERS: Carrier[] = ["TMOBILE", "VERIZON", "ATT", "MVNO"];

async function requireAdmin(): Promise<boolean> {
  const c = await cookies();
  return c.get(ADMIN_COOKIE)?.value === "authenticated";
}

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const {
    iccid,
    lpaActivationString,
    carrier: carrierRaw,
    planId,
    country,
    confirmationCode,
    // For QR-upload method: client already decoded LPA from QR image
    qrCodeDataUrl, // optional: pre-supplied base64 data URL from client
  } = body;

  // Validate required fields
  const carrier = String(carrierRaw ?? "").toUpperCase().trim() as Carrier;
  const iccidClean = String(iccid ?? "").trim();
  const lpa = String(lpaActivationString ?? "").trim();

  if (!CARRIERS.includes(carrier)) {
    return NextResponse.json({ error: `Invalid carrier. Must be one of: ${CARRIERS.join(", ")}` }, { status: 400 });
  }
  if (!iccidClean) return NextResponse.json({ error: "ICCID is required" }, { status: 400 });
  if (!lpa) return NextResponse.json({ error: "LPA Activation String is required" }, { status: 400 });
  if (!lpa.startsWith("LPA:")) {
    return NextResponse.json({ error: "LPA string must start with LPA: (e.g. LPA:1$server$code)" }, { status: 400 });
  }

  // Check duplicate
  const existing = await db.inventoryItem.findUnique({ where: { iccid: iccidClean } });
  if (existing) {
    return NextResponse.json({ error: `ICCID ${iccidClean} already exists in inventory` }, { status: 409 });
  }

  // Generate QR code from LPA string (server-side) if not supplied by client
  let qrCode: string;
  try {
    qrCode = qrCodeDataUrl ?? await QRCode.toDataURL(lpa, { width: 300, margin: 2 });
  } catch {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }

  // Build confirmation code suffix if provided (some LPA strings need it)
  const lpaFinal = confirmationCode ? `${lpa}$${confirmationCode}` : lpa;

  try {
    const item = await db.inventoryItem.create({
      data: {
        carrier,
        iccid: iccidClean,
        lpaActivationString: lpaFinal,
        qrCode,
        planId: planId ? String(planId).trim() : null,
        country: country ? String(country).trim() : "US",
        status: "AVAILABLE",
        batchId: `single_${Date.now()}`,
      },
    });

    return NextResponse.json({ ok: true, id: item.id, iccid: item.iccid });
  } catch (err) {
    console.error("[esim/single]", err);
    return NextResponse.json({ error: "Failed to save eSIM" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { rateLimit, adminAuthLimiter } from "@/lib/rate-limit";
import { signAdminToken, ADMIN_COOKIE_NAME, ADMIN_SESSION_DAYS, adminAudit } from "@/lib/admin-guard";

export const runtime = "nodejs";

// Trim to tolerate a stray trailing newline/space in the Vercel env var, a
// common cause of "correct password rejected".
const ADMIN_PASSWORD = (process.env.ADMIN_SECRET_KEY ?? "simkuu-admin-2024").trim();

function timingSafeCompare(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// POST /api/admin/auth — login
export async function POST(req: NextRequest) {
  const limit = await rateLimit(req, adminAuthLimiter);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many attempts. Wait a minute." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password.trim() : "";

  if (!password || !timingSafeCompare(password, ADMIN_PASSWORD)) {
    await adminAudit("login_failed", { ip: req.headers.get("x-forwarded-for") ?? "unknown" });
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  await adminAudit("login_success", {});
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, signAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * ADMIN_SESSION_DAYS,
    path: "/",
  });
  return res;
}

// DELETE /api/admin/auth — logout
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}

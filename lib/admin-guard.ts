/**
 * Shared server-side admin authentication.
 *
 * Admin sessions are signed JWTs (HMAC-SHA256) carrying { role: "admin" } with
 * a 7-day expiry, stored in the simkuu_admin_session httpOnly cookie. Every
 * /api/admin/* route must call requireAdmin() before any business logic —
 * never rely on page-level protection or hidden UI.
 */

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const ADMIN_COOKIE_NAME = "simkuu_admin_session";
export const ADMIN_SESSION_DAYS = 7;

function adminSecret(): string {
  const secret = process.env.ADMIN_SECRET_KEY || process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    console.error("[SECURITY] ADMIN_SECRET_KEY / AUTH_SECRET not set — admin sessions use an insecure default.");
  }
  return secret || "simkuu-admin-jwt-fallback-change-me";
}

export function signAdminToken(): string {
  return jwt.sign({ role: "admin" }, adminSecret(), { expiresIn: `${ADMIN_SESSION_DAYS}d` });
}

/** Verify an admin JWT. Returns true only for a valid, unexpired admin token. */
export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, adminSecret()) as jwt.JwtPayload;
    return decoded?.role === "admin";
  } catch {
    return false; // invalid signature, malformed, or expired
  }
}

/**
 * Guard for admin API routes. Call at the top of every handler:
 *
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 *
 * Returns null when the requester holds a valid admin session, otherwise a
 * 401 NextResponse. (403 is reserved for authenticated-but-not-permitted
 * cases like production-mode testing actions.)
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * Best-effort audit log for sensitive admin actions (deletes, resets,
 * simulations). Never throws — auditing must not break the action itself.
 */
export async function adminAudit(action: string, details?: Record<string, unknown>) {
  try {
    await db?.paymentLog.create({
      data: {
        mode: "admin",
        event: `admin:${action}`,
        payload: (details ?? {}) as never,
      },
    });
  } catch {
    /* non-fatal */
  }
  console.log(`[admin-audit] ${action}`, details ?? "");
}

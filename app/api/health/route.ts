import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0; // never cache

/**
 * GET /api/health
 *
 * Health check endpoint for uptime monitors, load balancers, and Vercel.
 * Returns 200 when the app is running, 503 if critical services are down.
 *
 * Add real checks by uncommenting the db/redis blocks below.
 */
export async function GET() {
  const start = Date.now();

  const checks: Record<string, { status: "ok" | "error"; latencyMs?: number; detail?: string }> = {
    app: { status: "ok" },
  };

  // ── Database check ──────────────────────────────────────────────────────
  // try {
  //   const t = Date.now();
  //   await db.$queryRaw`SELECT 1`;
  //   checks.database = { status: "ok", latencyMs: Date.now() - t };
  // } catch (err) {
  //   checks.database = { status: "error", detail: String(err) };
  // }

  // ── Redis check ─────────────────────────────────────────────────────────
  // try {
  //   const t = Date.now();
  //   await redis.ping();
  //   checks.redis = { status: "ok", latencyMs: Date.now() - t };
  // } catch (err) {
  //   checks.redis = { status: "error", detail: String(err) };
  // }

  const allOk = Object.values(checks).every((c) => c.status === "ok");
  const totalMs = Date.now() - start;

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      version: process.env.npm_package_version ?? "0.1.0",
      environment: process.env.NODE_ENV,
      uptime: process.uptime?.() ?? null,
      latencyMs: totalMs,
      checks,
      timestamp: new Date().toISOString(),
    },
    {
      status: allOk ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    }
  );
}

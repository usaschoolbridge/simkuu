/**
 * Rate limiting utility.
 *
 * In production with Upstash Redis configured, uses sliding-window rate limiting
 * backed by a global Redis store — works across serverless function instances.
 *
 * Falls back to in-memory rate limiting for local development.
 *
 * Usage in API routes:
 *   const result = await rateLimit(req, { limit: 10, window: "60s" });
 *   if (!result.success) return new Response("Too many requests", { status: 429 });
 */

import { NextRequest } from "next/server";

export interface RateLimitConfig {
  /** Max requests per window */
  limit: number;
  /** Window size as string: "10s" | "60s" | "1m" | "1h" */
  window: string;
  /** Optional identifier prefix */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp ms
}

// ── In-memory fallback (dev / no Upstash) ────────────────────────────────────

const store = new Map<string, { count: number; resetAt: number }>();

function parseWindowMs(window: string): number {
  const match = window.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 60_000;
  const n = parseInt(match[1]);
  const unit = match[2];
  return n * { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit as "s" | "m" | "h" | "d"];
}

function inMemoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  return {
    success: entry.count <= limit,
    limit,
    remaining,
    reset: entry.resetAt,
  };
}

// ── Main rate limiter ─────────────────────────────────────────────────────────

export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  const key = `${config.prefix ?? "rl"}:${ip}`;
  const windowMs = parseWindowMs(config.window);

  // ── Production: Upstash Redis ─────────────────────────────────────────────
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    try {
      // Lazy import to avoid loading Upstash in dev
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { Redis } = await import("@upstash/redis");

      const redis = Redis.fromEnv();
      const limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.limit, config.window as Parameters<typeof Ratelimit.slidingWindow>[1]),
        prefix: config.prefix ?? "Simkuu",
        analytics: true,
      });

      const result = await limiter.limit(ip);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (err) {
      // Fall through to in-memory if Redis is unavailable
      console.warn("[rateLimit] Upstash unavailable, using in-memory fallback:", err);
    }
  }

  // ── Development / fallback: in-memory ─────────────────────────────────────
  return inMemoryLimit(key, config.limit, windowMs);
}

// ── Preset limiters ───────────────────────────────────────────────────────────

/** Standard API: 100 req / minute */
export const apiLimiter: RateLimitConfig = { limit: 100, window: "60s", prefix: "api" };

/** Checkout: 10 attempts / minute (anti-fraud) */
export const checkoutLimiter: RateLimitConfig = { limit: 10, window: "60s", prefix: "checkout" };

/** Auth endpoints: 5 attempts / minute */
export const authLimiter: RateLimitConfig = { limit: 5, window: "60s", prefix: "auth" };

/** Password reset: 3 attempts / 5 minutes */
export const passwordResetLimiter: RateLimitConfig = { limit: 3, window: "5m", prefix: "pwreset" };

/** Webhook: 1000 req / minute (Stripe sends bursts) */
export const webhookLimiter: RateLimitConfig = { limit: 1000, window: "60s", prefix: "webhook" };

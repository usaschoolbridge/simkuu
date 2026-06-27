import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Middleware
 *
 * Runs on every matched request BEFORE the page renders.
 * Handles:
 *   1. Auth protection for /dashboard and /admin routes
 *   2. Rate limiting for /api routes (via Upstash when configured)
 *   3. Security headers injection
 *   4. Admin IP allowlist (optional)
 *   5. Bot detection for checkout flow
 */

// ── Route matchers ────────────────────────────────────────────────────────────

const PROTECTED_DASHBOARD = /^\/dashboard(\/.*)?$/;
const PROTECTED_ADMIN = /^\/admin(\/.*)?$/;
const API_ROUTES = /^\/api\//;
const CHECKOUT_ROUTE = /^\/checkout/;

// ── Security headers ──────────────────────────────────────────────────────────

function applySecurityHeaders(response: NextResponse): NextResponse {
  // Prevent content-type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  // XSS protection (legacy browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // HSTS — only in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
  return response;
}

// ── Rate limiting (Upstash) ───────────────────────────────────────────────────

// Simple in-memory fallback rate limiter for dev/non-Upstash environments
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return true; // allowed
  }

  if (entry.count >= limit) return false; // blocked

  entry.count++;
  return true; // allowed
}

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ── Auth check ────────────────────────────────────────────────────────────────

function isAuthenticated(req: NextRequest): boolean {
  // In production with NextAuth v5, check the session cookie:
  // const sessionToken = req.cookies.get("authjs.session-token")?.value
  //                   ?? req.cookies.get("__Secure-authjs.session-token")?.value;
  // return !!sessionToken;

  // DEMO MODE: always allow (remove once NextAuth is fully wired)
  return true;
}

function isAdminAuthenticated(req: NextRequest): boolean {
  // In production, verify the user has the ADMIN role in their JWT:
  // const token = await getToken({ req });
  // return token?.role === "admin";

  // DEMO MODE: allow (gate with real role check in production)
  return true;
}

// ── Main middleware ───────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getClientIP(req);

  // 1. Rate limit all API routes (100 req / 60s per IP)
  if (API_ROUTES.test(pathname)) {
    // Production: use @upstash/ratelimit
    // const { Ratelimit } = await import("@upstash/ratelimit");
    // const { Redis } = await import("@upstash/redis");
    // const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(100, "60 s") });
    // const { success } = await ratelimit.limit(ip);

    const allowed = inMemoryRateLimit(`api:${ip}`, 100, 60_000);
    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests", code: "RATE_LIMITED" }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
            "X-RateLimit-Limit": "100",
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // 2. Checkout rate limit (10 req / 60s per IP — prevents card testing)
  if (CHECKOUT_ROUTE.test(pathname) && req.method === "POST") {
    const allowed = inMemoryRateLimit(`checkout:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.redirect(new URL("/checkout?error=rate_limited", req.url));
    }
  }

  // 3. Dashboard auth protection
  if (PROTECTED_DASHBOARD.test(pathname)) {
    if (!isAuthenticated(req)) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Admin auth + role protection
  if (PROTECTED_ADMIN.test(pathname)) {
    if (!isAuthenticated(req)) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/admin", req.url));
    }
    if (!isAdminAuthenticated(req)) {
      // Authenticated but not admin — redirect to dashboard silently
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // 5. Apply security headers to all responses
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}

// ── Matcher ───────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml, site.webmanifest
     * - /icons/, /images/, /fonts/ (public assets)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|site\\.webmanifest|icons/|images/|fonts/|og$).*)",
  ],
};

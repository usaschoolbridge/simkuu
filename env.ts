/**
 * Environment variable validation using Zod.
 * Imported at the top of next.config.ts so the app fails fast at build time
 * if any required variables are missing or malformed.
 *
 * Usage:
 *   import { env } from "@/env";
 *   const stripe = new Stripe(env.STRIPE_SECRET_KEY);
 */

import { z } from "zod";

// ── Schema ────────────────────────────────────────────────────────────────────

const envSchema = z.object({
  // ── App ───────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // ── Auth (NextAuth v5) ────────────────────────────────────────────────────
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters").optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().url().optional(),

  // ── Stripe ────────────────────────────────────────────────────────────────
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),

  // ── PayPal ───────────────────────────────────────────────────────────────
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_ENVIRONMENT: z.enum(["sandbox", "live"]).default("sandbox"),

  // ── Crypto wallets ────────────────────────────────────────────────────────
  CRYPTO_BTC_ADDRESS: z.string().optional(),
  CRYPTO_ETH_ADDRESS: z.string().optional(),
  CRYPTO_USDT_ERC20_ADDRESS: z.string().optional(),
  CRYPTO_USDT_TRC20_ADDRESS: z.string().optional(),
  CRYPTO_USDC_ADDRESS: z.string().optional(),

  // ── Email (Resend) ────────────────────────────────────────────────────────
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
  RESEND_FROM_EMAIL: z.string().email().default("noreply@simkuu.com"),

  // ── Redis / Rate limiting (Upstash) ──────────────────────────────────────
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // ── File uploads (UploadThing) ────────────────────────────────────────────
  UPLOADTHING_SECRET: z.string().optional(),
  UPLOADTHING_APP_ID: z.string().optional(),

  // ── Analytics ─────────────────────────────────────────────────────────────
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),

  // ── Error tracking ────────────────────────────────────────────────────────
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),

  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMIN_SECRET_KEY: z.string().min(16).optional(),
});

// ── Validate ──────────────────────────────────────────────────────────────────

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const missing = parsed.error.issues.map((e: any) => `  ✗ ${e.path.join(".")}: ${e.message}`);
    console.error(
      "\n❌ Invalid environment variables:\n" + missing.join("\n") + "\n"
    );
    // Only throw in production — dev can run with partial config
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables — see above");
    }
  }

  return parsed.success ? parsed.data : envSchema.parse({ ...process.env, NODE_ENV: "development" });
}

export const env = validateEnv();

// ── Type export ───────────────────────────────────────────────────────────────
export type Env = z.infer<typeof envSchema>;

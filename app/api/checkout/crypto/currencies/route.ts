export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { coinMeta } from "@/lib/payments/nowpayments";

/**
 * GET /api/checkout/crypto/currencies
 * Returns only the coins for which an admin wallet address is configured in env vars.
 * No external API calls — instant response.
 *
 * Configure wallet addresses in Vercel env vars:
 *   CRYPTO_WALLET_BTC, CRYPTO_WALLET_ETH, CRYPTO_WALLET_USDTTRC20,
 *   CRYPTO_WALLET_USDTERC20, CRYPTO_WALLET_USDC, CRYPTO_WALLET_LTC,
 *   CRYPTO_WALLET_SOL, CRYPTO_WALLET_TRX, CRYPTO_WALLET_DOGE, CRYPTO_WALLET_XMR
 */

const WALLET_ENV_MAP: Record<string, string> = {
  btc:       "CRYPTO_WALLET_BTC",
  eth:       "CRYPTO_WALLET_ETH",
  usdttrc20: "CRYPTO_WALLET_USDTTRC20",
  usdterc20: "CRYPTO_WALLET_USDTERC20",
  usdc:      "CRYPTO_WALLET_USDC",
  ltc:       "CRYPTO_WALLET_LTC",
  sol:       "CRYPTO_WALLET_SOL",
  trx:       "CRYPTO_WALLET_TRX",
  doge:      "CRYPTO_WALLET_DOGE",
  xmr:       "CRYPTO_WALLET_XMR",
};

const PREFERRED_ORDER = ["usdttrc20", "usdc", "usdterc20", "btc", "eth", "sol", "ltc", "trx", "doge", "xmr"];

export function getWalletAddress(coin: string): string | null {
  const envKey = WALLET_ENV_MAP[coin.toLowerCase()];
  if (!envKey) return null;
  return process.env[envKey] ?? null;
}

export async function GET() {
  const configured = PREFERRED_ORDER
    .filter((coin) => {
      const envKey = WALLET_ENV_MAP[coin];
      return envKey && !!process.env[envKey];
    })
    .map((code) => ({ code, ...coinMeta(code) }));

  if (configured.length === 0) {
    return NextResponse.json(
      { error: "Crypto payments are not configured yet. Please add wallet addresses to your environment variables." },
      { status: 503 }
    );
  }

  return NextResponse.json({ currencies: configured });
}

/**
 * Crypto payment utilities
 *
 * Supported: Bitcoin (BTC), Ethereum (ETH), USDT ERC-20, USDT TRC-20, USDC ERC-20
 *
 * For production integrate with:
 * - NOWPayments API (https://nowpayments.io) — easiest, supports 300+ coins
 * - Coinbase Commerce (https://commerce.coinbase.com)
 * - BitPay (https://bitpay.com)
 *
 * Add to .env.local:
 *   NOWPAYMENTS_API_KEY=your_key
 *   CRYPTO_BTC_ADDRESS=bc1q...
 *   CRYPTO_ETH_ADDRESS=0x...
 *   CRYPTO_USDT_ERC20_ADDRESS=0x...
 *   CRYPTO_USDT_TRC20_ADDRESS=T...
 *   CRYPTO_USDC_ADDRESS=0x...
 */

export const CRYPTO_CURRENCIES = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    network: "Bitcoin",
    icon: "₿",
    color: "from-orange-400 to-amber-500",
    confirmations: 2,
    estimatedTime: "10–30 min",
    address: process.env.CRYPTO_BTC_ADDRESS ?? "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    network: "ERC-20",
    icon: "Ξ",
    color: "from-blue-400 to-indigo-500",
    confirmations: 12,
    estimatedTime: "2–5 min",
    address: process.env.CRYPTO_ETH_ADDRESS ?? "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  },
  {
    id: "usdt-erc20",
    symbol: "USDT",
    name: "Tether USD",
    network: "ERC-20",
    icon: "₮",
    color: "from-emerald-400 to-teal-500",
    confirmations: 12,
    estimatedTime: "2–5 min",
    address: process.env.CRYPTO_USDT_ERC20_ADDRESS ?? "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  },
  {
    id: "usdt-trc20",
    symbol: "USDT",
    name: "Tether USD",
    network: "TRC-20",
    icon: "₮",
    color: "from-red-400 to-rose-500",
    confirmations: 20,
    estimatedTime: "1–3 min",
    address: process.env.CRYPTO_USDT_TRC20_ADDRESS ?? "TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    network: "ERC-20",
    icon: "◎",
    color: "from-blue-500 to-cyan-500",
    confirmations: 12,
    estimatedTime: "2–5 min",
    address: process.env.CRYPTO_USDC_ADDRESS ?? "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  },
] as const;

export type CryptoCurrencyId = typeof CRYPTO_CURRENCIES[number]["id"];

/** Convert USD cents to crypto amount (uses CoinGecko free API in production) */
export async function convertUsdToCrypto(usdCents: number, coinId: string): Promise<number> {
  try {
    const usd = usdCents / 100;
    const geckoIds: Record<string, string> = {
      btc: "bitcoin", eth: "ethereum",
      "usdt-erc20": "tether", "usdt-trc20": "tether", usdc: "usd-coin",
    };
    const geckoId = geckoIds[coinId];
    if (!geckoId) return usd;

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`,
      { next: { revalidate: 60 } } // cache 60s
    );
    const data = await res.json() as Record<string, { usd: number }>;
    const price = data[geckoId]?.usd ?? 1;
    return parseFloat((usd / price).toFixed(8));
  } catch {
    return usdCents / 100; // fallback
  }
}

/** Generate a unique payment reference ID */
export function generatePaymentRef(): string {
  return `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

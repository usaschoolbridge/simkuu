export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAvailableCoins, coinMeta, NOWPAYMENTS_API_KEY } from "@/lib/payments/nowpayments";

// Preferred display order; coins not in this list are appended alphabetically.
const PREFERRED = [
  "btc", "eth", "usdttrc20", "usdterc20", "usdtbsc",
  "usdcerc20", "usdc", "bnbbsc", "sol", "ltc", "doge", "trx",
];

export async function GET() {
  if (!NOWPAYMENTS_API_KEY) {
    return NextResponse.json(
      { error: "Crypto payments are not enabled yet. Please choose another method or contact support." },
      { status: 503 }
    );
  }

  try {
    const coins = await getAvailableCoins();
    const ranked = [...coins].sort((a, b) => {
      const ia = PREFERRED.indexOf(a), ib = PREFERRED.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    return NextResponse.json({
      currencies: ranked.map((code) => ({ code, ...coinMeta(code) })),
    });
  } catch (err) {
    console.error("[crypto-currencies]", err);
    return NextResponse.json({ error: "Could not load cryptocurrencies. Please try again." }, { status: 502 });
  }
}

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Currency = "USD" | "INR";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rate: number; // INR per 1 USD
  format: (usdPrice: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: () => {},
  rate: 84,
  format: (p) => `$${p}`,
  symbol: "$",
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

// Detect India by timezone or browser locale
function detectIndianUser(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz.startsWith("Asia/Kolkata") || tz.startsWith("Asia/Calcutta")) return true;
    const lang = navigator.language || "";
    if (lang === "en-IN" || lang.endsWith("-IN")) return true;
  } catch {
    // ignore
  }
  return false;
}

const FALLBACK_RATE = 84; // ₹84 per $1

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [rate, setRate] = useState(FALLBACK_RATE);

  // Auto-detect Indian users on first load
  useEffect(() => {
    const saved = localStorage.getItem("simkuu_currency") as Currency | null;
    if (saved === "USD" || saved === "INR") {
      setCurrencyState(saved);
    } else if (detectIndianUser()) {
      setCurrencyState("INR");
    }
  }, []);

  // Fetch live exchange rate once (free public API, no key required)
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((data) => {
        const liveRate = data?.rates?.INR;
        if (liveRate && typeof liveRate === "number") {
          setRate(Math.round(liveRate));
        }
      })
      .catch(() => setRate(FALLBACK_RATE));
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("simkuu_currency", c);
  }, []);

  const symbol = currency === "INR" ? "₹" : "$";

  const format = useCallback(
    (usdPrice: number): string => {
      if (currency === "INR") {
        const inr = Math.ceil(usdPrice * rate);
        return `₹${inr.toLocaleString("en-IN")}`;
      }
      return `$${usdPrice}`;
    },
    [currency, rate]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate, format, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

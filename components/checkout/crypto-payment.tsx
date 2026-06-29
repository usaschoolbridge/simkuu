"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bitcoin, Loader2, ExternalLink, ShieldCheck,
  Clock, Zap, Globe, ChevronRight, AlertCircle,
} from "lucide-react";

interface CryptoPaymentProps {
  planId: string;
  planName: string;
  usdAmount: number;
  customerEmail: string;
  customerName: string;
  onSuccess?: () => void;
}

const SUPPORTED_CRYPTOS = [
  { symbol: "BTC", name: "Bitcoin", icon: "₿", color: "from-orange-400 to-amber-500" },
  { symbol: "ETH", name: "Ethereum", icon: "Ξ", color: "from-blue-400 to-indigo-500" },
  { symbol: "USDT", name: "Tether USD", icon: "₮", color: "from-emerald-400 to-teal-500" },
  { symbol: "USDC", name: "USD Coin", icon: "◎", color: "from-blue-500 to-cyan-500" },
  { symbol: "LTC", name: "Litecoin", icon: "Ł", color: "from-gray-400 to-slate-500" },
  { symbol: "TRX", name: "TRON", icon: "⬡", color: "from-red-400 to-rose-500" },
  { symbol: "DOGE", name: "Dogecoin", icon: "Ð", color: "from-yellow-400 to-amber-400" },
  { symbol: "BNB", name: "BNB", icon: "B", color: "from-yellow-500 to-orange-400" },
];

export function CryptoPayment({
  planId,
  planName,
  usdAmount,
  customerEmail,
  customerName,
  onSuccess,
}: CryptoPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout/nowpayments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          email: customerEmail,
          name: customerName,
          currency: "USD",
        }),
      });

      const data = await res.json() as {
        success?: boolean;
        paymentUrl?: string;
        error?: string;
      };

      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to create payment. Please try again.");
        return;
      }

      if (data.paymentUrl) {
        // Redirect to Cryptomus hosted payment page
        window.location.href = data.paymentUrl;
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Bitcoin className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-sm text-black">Pay with Cryptocurrency</div>
          <div className="text-xs text-black/50">Powered by NOWPayments — secure, instant settlement</div>
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-black/[0.02] border border-black/[0.06] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-black/50">Plan</span>
          <span className="text-sm font-semibold text-black">{planName}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-black/50">Amount</span>
          <span className="text-lg font-black text-black">${usdAmount.toFixed(2)} USD</span>
        </div>
      </div>

      {/* Supported coins grid */}
      <div>
        <p className="text-xs font-semibold text-black/40 uppercase tracking-wider mb-3">Accepted cryptocurrencies</p>
        <div className="grid grid-cols-4 gap-2">
          {SUPPORTED_CRYPTOS.map((coin) => (
            <div key={coin.symbol}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-black/[0.06] bg-white hover:border-black/20 transition-colors cursor-default">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${coin.color} flex items-center justify-center text-white text-sm font-black`}>
                {coin.icon}
              </div>
              <span className="text-[10px] font-bold text-black/60">{coin.symbol}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-black/30 mt-2 text-center">+ 100 more coins supported</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: <Zap className="w-3.5 h-3.5" />, label: "Instant" },
          { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: "Secure" },
          { icon: <Globe className="w-3.5 h-3.5" />, label: "Worldwide" },
        ].map(({ icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-black/[0.02] border border-black/[0.04]">
            <span className="text-blue-500">{icon}</span>
            <span className="text-[10px] font-semibold text-black/50">{label}</span>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-black/40 uppercase tracking-wider">How it works</p>
        {[
          { step: "1", text: "Click the button below to open the NOWPayments payment page" },
          { step: "2", text: "Choose your preferred cryptocurrency (BTC, ETH, USDT, etc.)" },
          { step: "3", text: "Send the exact amount to the provided wallet address" },
          { step: "4", text: "Your eSIM is delivered instantly to your email after confirmation" },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">
              {step}
            </div>
            <p className="text-xs text-black/50 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl"
        >
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Pay button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handlePay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-orange-500/20"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating payment…
          </>
        ) : (
          <>
            <Bitcoin className="w-4 h-4" />
            Pay ${usdAmount.toFixed(2)} with Crypto
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </>
        )}
      </motion.button>

      <p className="text-center text-[10px] text-black/25 flex items-center justify-center gap-1">
        <Clock className="w-3 h-3" />
        Payment link expires in 60 minutes · Powered by NOWPayments
      </p>
    </div>
  );
}

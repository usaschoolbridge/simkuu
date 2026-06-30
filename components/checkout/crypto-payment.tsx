"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bitcoin, Loader2, ExternalLink, ShieldCheck,
  Clock, Zap, Globe, AlertCircle, Lock,
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

/** Real coin logo from the public cryptocurrency-icons CDN, with a graceful
 *  gradient-badge fallback if the image fails to load. */
function CoinLogo({ symbol, icon, color }: { symbol: string; icon: string; color: string }) {
  const [failed, setFailed] = useState(false);
  const src = `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${symbol.toLowerCase()}.svg`;
  if (failed) {
    return (
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-black`}>
        {icon}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={symbol}
      width={32}
      height={32}
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-8 h-8 rounded-lg"
    />
  );
}

export function CryptoPayment({
  planId,
  planName,
  usdAmount,
  customerEmail,
  customerName,
}: CryptoPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
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
        }),
      });

      const data = await res.json() as {
        success?: boolean;
        paymentUrl?: string;
        error?: string;
      };

      if (!res.ok || !data.success || !data.paymentUrl) {
        setError(data.error ?? "Failed to create payment. Please try again.");
        setLoading(false);
        return;
      }

      // Show the visual redirect state, then send the buyer to the
      // NOWPayments hosted checkout page.
      setRedirecting(true);
      setTimeout(() => { window.location.href = data.paymentUrl!; }, 900);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  };

  // ── Visual redirect / processing screen ──────────────────────────────
  if (redirecting) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center py-8 px-4"
      >
        {/* Animated coin cluster */}
        <div className="relative w-28 h-28 mb-6">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-amber-300"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          {SUPPORTED_CRYPTOS.slice(0, 6).map((c, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const r = 46;
            return (
              <motion.div
                key={c.symbol}
                className="absolute top-1/2 left-1/2"
                style={{ x: Math.cos(angle) * r - 14, y: Math.sin(angle) * r - 14 }}
                animate={{ y: [Math.sin(angle) * r - 14, Math.sin(angle) * r - 20, Math.sin(angle) * r - 14] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
              >
                <CoinLogo symbol={c.symbol} icon={c.icon} color={c.color} />
              </motion.div>
            );
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
              <Bitcoin className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-black font-semibold text-sm mb-1">
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
          Opening secure crypto checkout…
        </div>
        <p className="text-xs text-black/50 max-w-[260px]">
          Redirecting you to the NOWPayments page for <span className="font-semibold text-black">{planName}</span> · ${usdAmount.toFixed(2)}.
          Don&apos;t close this window.
        </p>
        <div className="mt-4 flex items-center gap-1.5 text-[10px] text-black/30">
          <Lock className="w-3 h-3" /> 256-bit encrypted · Powered by NOWPayments
        </div>
      </motion.div>
    );
  }

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
              <CoinLogo symbol={coin.symbol} icon={coin.icon} color={coin.color} />
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
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl"
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

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

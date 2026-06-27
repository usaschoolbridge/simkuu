"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Clock, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { CRYPTO_CURRENCIES } from "@/lib/payments/crypto";

interface CryptoPaymentProps {
  planId: string;
  planName: string;
  usdAmount: number;
  onSuccess?: () => void;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-black/10 text-xs font-medium text-black/50 hover:bg-black/5 transition-colors">
      {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy {label}</>}
    </button>
  );
}

function QrGrid({ address }: { address: string }) {
  // Generate a deterministic pattern from the address
  const cells = Array.from({ length: 100 }, (_, i) => {
    const charCode = address.charCodeAt(i % address.length);
    return (charCode + i * 7) % 3 !== 0;
  });
  return (
    <div className="w-36 h-36 bg-white border border-black/10 rounded-xl p-2 grid grid-cols-10 gap-0.5">
      {cells.map((filled, i) => (
        <div key={i} className={`rounded-[1px] ${filled ? "bg-black" : "bg-transparent"}`} />
      ))}
    </div>
  );
}

export function CryptoPayment({ planId, planName, usdAmount, onSuccess }: CryptoPaymentProps) {
  const [selectedCoin, setSelectedCoin] = useState(CRYPTO_CURRENCIES[2]); // USDT ERC-20 default
  const [paymentData, setPaymentData] = useState<{
    ref: string; address: string; amount: number; expiresAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 min
  const [confirmations, setConfirmations] = useState(0);
  const [status, setStatus] = useState<"selecting" | "waiting" | "confirming" | "confirmed">("selecting");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, coinId: selectedCoin.id }),
      });
      const data = await res.json() as { ref: string; address: string; amount: number; expiresAt: string };
      setPaymentData(data);
      setStatus("waiting");
      setTimeLeft(1800);
      // Start countdown
      timerRef.current = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  // Demo: simulate confirmation after 5s
  const simulateConfirm = async () => {
    setStatus("confirming");
    setConfirmations(1);
    await new Promise(r => setTimeout(r, 1500));
    setConfirmations(2);
    await new Promise(r => setTimeout(r, 1000));
    setStatus("confirmed");
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => onSuccess?.(), 1500);
  };

  if (status === "confirmed") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-display font-bold text-xl text-black mb-2">Payment confirmed!</h3>
        <p className="text-black/50 text-sm">Your eSIM will be delivered in seconds.</p>
      </motion.div>
    );
  }

  if (status === "waiting" || status === "confirming") {
    const coin = selectedCoin;
    const addr = paymentData?.address ?? coin.address;
    return (
      <div className="space-y-4">
        {/* Status bar */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${status === "confirming" ? "bg-blue-50 border-blue-100" : "bg-amber-50 border-amber-100"}`}>
          {status === "confirming" ? (
            <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
          ) : (
            <Clock className="w-4 h-4 text-amber-500" />
          )}
          <div className="flex-1">
            <div className={`text-sm font-semibold ${status === "confirming" ? "text-blue-700" : "text-amber-700"}`}>
              {status === "confirming" ? `Confirming… (${confirmations}/${coin.confirmations})` : "Awaiting payment"}
            </div>
            <div className={`text-xs ${status === "confirming" ? "text-blue-500" : "text-amber-500"}`}>
              {status === "confirming" ? "Do not close this window" : `Expires in ${minutes}:${seconds}`}
            </div>
          </div>
          {timeLeft > 0 && status === "waiting" && (
            <div className="font-mono text-lg font-bold text-amber-700">{minutes}:{seconds}</div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-5 items-center">
          {/* QR */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <QrGrid address={addr} />
            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${coin.color} text-white`}>
              {coin.icon} {coin.symbol} · {coin.network}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 w-full space-y-3">
            <div>
              <div className="text-xs font-semibold text-black/40 mb-1.5 uppercase tracking-wide">Send exactly</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-black/[0.03] border border-black/5 rounded-xl px-3 py-2.5">
                  <span className="font-mono text-sm font-bold text-black">
                    {paymentData?.amount ?? "—"} {coin.symbol}
                  </span>
                  <span className="text-black/30 text-xs ml-2">(${usdAmount.toFixed(2)} USD)</span>
                </div>
                <CopyButton text={String(paymentData?.amount ?? "")} label="amount" />
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-black/40 mb-1.5 uppercase tracking-wide">To address ({coin.network})</div>
              <div className="flex items-start gap-2">
                <div className="flex-1 bg-black/[0.03] border border-black/5 rounded-xl px-3 py-2.5">
                  <code className="font-mono text-xs text-black break-all leading-relaxed">{addr}</code>
                </div>
                <CopyButton text={addr} label="address" />
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Send only <strong>{coin.symbol}</strong> on the <strong>{coin.network}</strong> network. Wrong coin or network = permanent loss of funds.
              </p>
            </div>
          </div>
        </div>

        {/* Payment ref */}
        <div className="flex items-center justify-between text-xs text-black/30 border-t border-black/5 pt-3">
          <span>Ref: <code className="font-mono">{paymentData?.ref}</code></span>
          <button onClick={simulateConfirm} className="text-blue-500 hover:underline">Demo: simulate payment →</button>
        </div>
      </div>
    );
  }

  // Coin selection
  return (
    <div className="space-y-3">
      <p className="text-sm text-black/50 mb-4">Select cryptocurrency to pay <strong className="text-black">${usdAmount.toFixed(2)}</strong> for <strong className="text-black">{planName}</strong></p>

      <div className="grid grid-cols-1 gap-2">
        {CRYPTO_CURRENCIES.map((coin) => (
          <button key={coin.id} onClick={() => setSelectedCoin(coin)}
            className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
              selectedCoin.id === coin.id
                ? "border-blue-500 bg-blue-50/30"
                : "border-black/[0.06] hover:border-black/20 bg-white"
            }`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${coin.color} flex items-center justify-center text-white text-lg font-black flex-shrink-0`}>
              {coin.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base text-black">{coin.symbol}</span>
                <span className="text-xs text-black/30 border border-black/10 px-1.5 py-0.5 rounded-full">{coin.network}</span>
              </div>
              <div className="text-xs text-black/40">{coin.name} · ~{coin.estimatedTime} · {coin.confirmations} confirmations</div>
            </div>
            {selectedCoin.id === coin.id && <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />}
          </button>
        ))}
      </div>

      <motion.button whileTap={{ scale: 0.98 }} onClick={initPayment} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/80 disabled:opacity-50 transition-all shadow-md shadow-black/10">
        {loading ? "Generating address…" : <>Pay with {selectedCoin.symbol} <ChevronRight className="w-4 h-4" /></>}
      </motion.button>
    </div>
  );
}

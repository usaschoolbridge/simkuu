"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bitcoin, Loader2, ShieldCheck, Zap, Globe, AlertCircle,
  Lock, Check, Copy, ChevronLeft, ExternalLink,
} from "lucide-react";

interface CryptoPaymentProps {
  planId: string;
  planName: string;
  usdAmount: number;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerCountry?: string;
  onSuccess?: (orderId: string) => void;
}

interface Currency {
  code: string;
  name: string;
  network: string;
  logo: string;
}

interface PaymentData {
  orderId: string;
  paymentId: string;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  network: string;
  coinName: string;
  payinExtraId: string | null;
  usdAmount: number;
  expiresAt: string | null;
  qrDataUrl: string | null;
}

type Stage = "select" | "paying" | "details" | "done";

/** Real coin logo from the cryptocurrency-icons CDN, gradient fallback. */
function CoinLogo({ logo, size = 32 }: { logo: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const src = `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.1/svg/color/${logo}.svg`;
  if (failed) {
    return (
      <div style={{ width: size, height: size }}
        className="rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-black">
        {logo.slice(0, 3).toUpperCase()}
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={logo} width={size} height={size} loading="lazy"
    onError={() => setFailed(true)} className="rounded-lg" style={{ width: size, height: size }} />;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };
  return (
    <div>
      <p className="text-[10px] font-semibold text-black/40 uppercase tracking-wider mb-1">{label}</p>
      <button onClick={copy} type="button"
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-black/10 bg-white hover:border-amber-400 transition-all text-left">
        <span className="flex-1 font-mono text-xs text-black break-all">{value}</span>
        {copied ? <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <Copy className="w-4 h-4 text-black/30 flex-shrink-0" />}
      </button>
    </div>
  );
}

export function CryptoPayment({
  planId, planName, usdAmount, customerEmail, customerName,
  customerPhone, customerCountry, onSuccess,
}: CryptoPaymentProps) {
  const [stage, setStage] = useState<Stage>("select");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [currenciesError, setCurrenciesError] = useState("");
  const [selected, setSelected] = useState<string>("");

  const [estimate, setEstimate] = useState<number | null>(null);
  const [estimating, setEstimating] = useState(false);

  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [error, setError] = useState("");

  const [statusLabel, setStatusLabel] = useState("Waiting for payment");
  const [esim, setEsim] = useState<{ iccid: string; activationCode: string; qrCode: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedCoin = currencies.find((c) => c.code === selected);

  // ── Load supported currencies ────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingCurrencies(true);
      setCurrenciesError("");
      try {
        const res = await fetch("/api/checkout/crypto/currencies");
        const data = await res.json();
        if (!res.ok) { if (alive) setCurrenciesError(data.error ?? "Could not load cryptocurrencies."); return; }
        if (alive) {
          setCurrencies(data.currencies ?? []);
          setSelected(data.currencies?.[0]?.code ?? "");
        }
      } catch {
        if (alive) setCurrenciesError("Network error loading cryptocurrencies.");
      } finally {
        if (alive) setLoadingCurrencies(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // ── Live estimate whenever the selected coin changes ──────────────────────
  useEffect(() => {
    if (!selected) return;
    let alive = true;
    setEstimating(true);
    setEstimate(null);
    (async () => {
      try {
        const res = await fetch("/api/checkout/crypto/estimate", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, payCurrency: selected }),
        });
        const data = await res.json();
        if (alive && res.ok) setEstimate(data.estimatedAmount);
      } catch { /* estimate is best-effort */ }
      finally { if (alive) setEstimating(false); }
    })();
    return () => { alive = false; };
  }, [selected, planId]);

  // ── Status polling ────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const poll = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/checkout/crypto/status?orderId=${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (!res.ok) return;
      switch (data.state) {
        case "completed":
          stopPolling();
          setEsim(data.esim ?? null);
          setStatusLabel("Payment confirmed");
          setStage("done");
          break;
        case "confirming": setStatusLabel("Confirming on-chain…"); break;
        case "processing": setStatusLabel("Payment received — provisioning…"); break;
        case "failed":
          stopPolling();
          setStatusLabel("Payment expired or failed");
          setError("This payment expired or failed. Please start a new checkout.");
          break;
        default: setStatusLabel("Waiting for payment");
      }
    } catch { /* keep polling */ }
  }, [stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // ── Create the on-chain payment ───────────────────────────────────────────
  const handleContinue = async () => {
    if (!selected) return;
    setStage("paying");
    setError("");
    try {
      const res = await fetch("/api/checkout/crypto/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId, email: customerEmail, name: customerName, payCurrency: selected,
          ...(customerPhone ? { phone: customerPhone } : {}),
          ...(customerCountry ? { country: customerCountry } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not create payment."); setStage("select"); return; }
      setPayment(data);
      setStage("details");
      // Begin polling immediately, then every 8s.
      poll(data.orderId);
      pollRef.current = setInterval(() => poll(data.orderId), 8000);
    } catch {
      setError("Network error. Please try again.");
      setStage("select");
    }
  };

  // ── DONE ──────────────────────────────────────────────────────────────────
  if (stage === "done") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center py-6 px-2">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-black text-black mb-1">Payment confirmed!</h3>
        <p className="text-sm text-black/50 mb-5 max-w-[280px]">Your eSIM for {planName} is ready. We&apos;ve emailed your QR code to {customerEmail}.</p>
        {esim?.qrCode && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={esim.qrCode} alt="eSIM QR" width={180} height={180} className="rounded-xl border-2 border-black/10 mb-4" />
        )}
        {esim?.activationCode && (
          <div className="w-full mb-4"><CopyRow label="Activation string" value={esim.activationCode} /></div>
        )}
        <button onClick={() => payment && onSuccess?.(payment.orderId)} type="button"
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black text-white font-bold text-sm hover:bg-black/80 transition-all">
          Go to Dashboard <ExternalLink className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  // ── PAYING (spinner while creating) ───────────────────────────────────────
  if (stage === "paying") {
    return (
      <div className="flex flex-col items-center text-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-semibold text-black">Generating your {selectedCoin?.name} payment…</p>
        <p className="text-xs text-black/40 mt-1">Locking in the live exchange rate</p>
      </div>
    );
  }

  // ── DETAILS (address + QR + live status) ──────────────────────────────────
  if (stage === "details" && payment) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <CoinLogo logo={selectedCoin?.logo ?? payment.payCurrency} size={32} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-black">Send {payment.coinName} ({payment.payCurrency.toUpperCase()})</div>
            <div className="text-xs text-black/50">{payment.network} network</div>
          </div>
        </div>

        {/* Live status */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-sm font-medium text-blue-700">{statusLabel}</span>
        </div>

        {/* QR */}
        {payment.qrDataUrl && (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={payment.qrDataUrl} alt="Payment address QR" width={180} height={180}
              className="rounded-xl border-2 border-black/10" />
          </div>
        )}

        {/* Amount + address */}
        <div className="space-y-3">
          <CopyRow label={`Amount (${payment.payCurrency.toUpperCase()})`} value={String(payment.payAmount)} />
          <CopyRow label="Send to address" value={payment.payAddress} />
          {payment.payinExtraId && (
            <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl">
              <CopyRow label="⚠ Required memo / tag" value={payment.payinExtraId} />
              <p className="text-[10px] text-red-500 mt-1">You must include this memo or your payment will be lost.</p>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-black/[0.02] border border-black/[0.04]">
            <div className="text-[10px] text-black/40 uppercase tracking-wider">USD value</div>
            <div className="text-sm font-bold text-black">${payment.usdAmount.toFixed(2)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/[0.02] border border-black/[0.04]">
            <div className="text-[10px] text-black/40 uppercase tracking-wider">Confirmation</div>
            <div className="text-sm font-bold text-black">~5–30 min</div>
          </div>
        </div>

        <p className="text-center text-[11px] text-black/40">
          Send the <strong>exact</strong> amount. This page updates automatically once your payment is detected — keep it open.
        </p>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <button onClick={() => { stopPolling(); setStage("select"); setPayment(null); }} type="button"
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-black/40 hover:text-black/70 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Choose a different coin
        </button>
      </motion.div>
    );
  }

  // ── SELECT (default) ──────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Bitcoin className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold text-sm text-black">Pay with Cryptocurrency</div>
          <div className="text-xs text-black/50">Choose a coin — pay without leaving this page</div>
        </div>
      </div>

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

      <div>
        <p className="text-xs font-semibold text-black/40 uppercase tracking-wider mb-3">Choose cryptocurrency</p>

        {loadingCurrencies ? (
          <div className="flex items-center justify-center py-8 gap-2 text-black/40">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading coins…
          </div>
        ) : currenciesError ? (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{currenciesError}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
              {currencies.map((coin) => {
                const active = coin.code === selected;
                return (
                  <button key={coin.code} type="button" onClick={() => setSelected(coin.code)} aria-pressed={active}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 bg-white transition-all ${
                      active ? "border-amber-500 ring-2 ring-amber-200 shadow-sm" : "border-black/[0.06] hover:border-black/20"
                    }`}>
                    {active && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                    <CoinLogo logo={coin.logo} size={28} />
                    <span className={`text-[10px] font-bold leading-tight ${active ? "text-black" : "text-black/60"}`}>{coin.name}</span>
                    <span className="text-[8px] text-black/35 leading-tight">{coin.network}</span>
                  </button>
                );
              })}
            </div>

            {/* Estimate */}
            <div className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="text-xs text-black/50">
                You&apos;ll pay with <span className="font-semibold text-black">{selectedCoin?.name}</span>
              </span>
              <span className="text-sm font-bold text-black">
                {estimating ? <Loader2 className="w-3.5 h-3.5 animate-spin inline text-amber-500" />
                  : estimate != null ? `≈ ${estimate} ${selected.toUpperCase()}` : "—"}
              </span>
            </div>
          </>
        )}
      </div>

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

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <motion.button whileTap={{ scale: 0.98 }} onClick={handleContinue}
        disabled={loadingCurrencies || !selected || !!currenciesError}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20">
        {selectedCoin ? <><CoinLogo logo={selectedCoin.logo} size={20} /> Continue with {selectedCoin.name}</> : "Select a coin"}
      </motion.button>

      <p className="text-center text-[10px] text-black/25 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> 256-bit encrypted · Powered by NOWPayments
      </p>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Smartphone, Search, Hash, Camera, CheckCircle2, AlertTriangle,
  HelpCircle, Loader2, ArrowRight, ChevronRight,
} from "lucide-react";
import {
  CompatResult, detectFromUserAgent, searchDevices, matchDevice,
  evaluateImeiEid, parseOcrText,
} from "@/lib/compat/devices";

type Method = "auto" | "search" | "imei" | "ocr";

const METHODS: { id: Method; label: string; icon: typeof Smartphone; hint: string }[] = [
  { id: "auto", label: "Auto-detect", icon: Smartphone, hint: "Fastest — we read your current device" },
  { id: "search", label: "Search model", icon: Search, hint: "Type your phone model" },
  { id: "imei", label: "Dial *#06#", icon: Hash, hint: "Enter your IMEI or EID" },
  { id: "ocr", label: "Upload screenshot", icon: Camera, hint: "We'll read it for you" },
];

function verdictTone(v: CompatResult["verdict"]) {
  if (v === "compatible") return { Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", title: "Compatible" };
  if (v === "incompatible") return { Icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", title: "Not compatible" };
  return { Icon: HelpCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", title: "Likely works" };
}

export function CompatibilityModal({
  open, onClose, planId,
}: { open: boolean; onClose: () => void; planId: string }) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("auto");
  const [result, setResult] = useState<CompatResult | null>(null);
  const [busy, setBusy] = useState(false);

  // method-specific state
  const [query, setQuery] = useState("");
  const [imei, setImei] = useState("");
  const [imei2, setImei2] = useState("");
  const [eid, setEid] = useState("");
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const goCheckout = () => router.push(`/checkout?planId=${encodeURIComponent(planId)}&compat=${result?.verdict ?? "skipped"}`);

  // Auto-detect as soon as the modal opens on the default tab.
  useEffect(() => {
    if (!open) return;
    setMethod("auto");
    setResult(null);
    setQuery(""); setImei(""); setImei2(""); setEid(""); setOcrProgress(null);
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    setResult(detectFromUserAgent(ua));
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  const suggestions = method === "search" && query.trim() ? searchDevices(query) : [];

  async function runOcr(file: File) {
    setBusy(true);
    setOcrProgress(0);
    setResult(null);
    try {
      const { default: Tesseract } = await import("tesseract.js");
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") setOcrProgress(Math.round(m.progress * 100));
        },
      });
      setResult(parseOcrText(data.text));
    } catch {
      // OCR engine failed to load/run — fall back to model confirmation, never block.
      setResult({
        verdict: "unknown",
        reason: "We couldn't scan that image. Confirm your phone model below instead.",
        confidence: 0,
        method: "ocr",
      });
      setMethod("search");
    } finally {
      setBusy(false);
      setOcrProgress(null);
    }
  }

  if (!open) return null;
  const tone = result ? verdictTone(result.verdict) : null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog" aria-modal="true" aria-label="eSIM compatibility check"
      >
        <motion.div
          className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
          initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
            <div>
              <h2 className="font-display font-bold text-black text-base">Check eSIM compatibility</h2>
              <p className="text-xs text-black/40">Recommended before purchase · ~20 seconds</p>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-black/5 text-black/40">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Method tabs */}
          <div className="grid grid-cols-4 gap-1 px-3 pt-3">
            {METHODS.map((m) => {
              const Icon = m.icon;
              const active = method === m.id;
              return (
                <button key={m.id}
                  onClick={() => { setMethod(m.id); setResult(null); }}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-medium transition-all ${
                    active ? "bg-black text-white" : "text-black/50 hover:bg-black/5"}`}>
                  <Icon className="w-4 h-4" />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="px-5 py-4 overflow-y-auto flex-1">
            <p className="text-xs text-black/40 mb-3">{METHODS.find((m) => m.id === method)?.hint}</p>

            {method === "search" && (
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                  <input
                    autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. iPhone 14, Galaxy S24, Pixel 9"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                {suggestions.length > 0 && (
                  <ul className="mt-2 border border-black/[0.06] rounded-xl divide-y divide-black/[0.04] overflow-hidden">
                    {suggestions.map((s) => (
                      <li key={s.label}>
                        <button onClick={() => { setQuery(s.label); setResult(matchDevice(s.label)); }}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-black/[0.02] text-left">
                          <span><span className="text-black/40">{s.brand}</span> · {s.label}</span>
                          <ChevronRight className="w-4 h-4 text-black/20" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {query.trim() && (
                  <button onClick={() => setResult(matchDevice(query))}
                    className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">
                    Check &ldquo;{query}&rdquo; →
                  </button>
                )}
              </div>
            )}

            {method === "imei" && (
              <div className="space-y-3">
                <p className="text-xs text-black/50 rounded-lg bg-black/[0.03] p-2.5">
                  Dial <span className="font-mono font-semibold">*#06#</span> on your phone. The
                  <span className="font-semibold"> EID</span> (32 digits) is the surest sign of eSIM support.
                </p>
                <Field label="EID (best)" value={eid} onChange={setEid} placeholder="32-digit EID" mono />
                <Field label="IMEI" value={imei} onChange={setImei} placeholder="15-digit IMEI" mono />
                <Field label="IMEI2 (optional)" value={imei2} onChange={setImei2} placeholder="second IMEI" mono />
                <button onClick={() => setResult(evaluateImeiEid({ imei, imei2, eid }))}
                  className="w-full py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80">
                  Check
                </button>
              </div>
            )}

            {method === "ocr" && (
              <div>
                <button onClick={() => fileRef.current?.click()} disabled={busy}
                  className="w-full border-2 border-dashed border-black/15 rounded-2xl py-8 flex flex-col items-center gap-2 text-black/50 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-60">
                  {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                  <span className="text-sm font-medium">
                    {busy ? `Reading… ${ocrProgress ?? 0}%` : "Upload a *#06# / Settings / SIM Manager screenshot"}
                  </span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) runOcr(f); }} />
                <p className="text-[11px] text-black/35 mt-2">Processed on your device — the image never leaves your phone.</p>
              </div>
            )}

            {method === "auto" && (
              <button onClick={() => setResult(detectFromUserAgent(navigator.userAgent))}
                className="text-sm font-medium text-blue-600 hover:text-blue-700">
                Re-run detection →
              </button>
            )}

            {/* Result */}
            <AnimatePresence>
              {result && tone && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mt-4 rounded-2xl border p-4 ${tone.bg} ${tone.border}`}>
                  <div className="flex items-start gap-3">
                    <tone.Icon className={`w-6 h-6 shrink-0 ${tone.color}`} />
                    <div className="min-w-0">
                      <div className={`font-display font-bold ${tone.color}`}>{tone.title}</div>
                      {result.device && <div className="text-sm text-black/70 font-medium">{result.device}</div>}
                      <p className="text-sm text-black/55 mt-0.5">{result.reason}</p>
                      {result.verdict === "incompatible" && (
                        <p className="text-xs text-black/45 mt-2">
                          Try a different device, or continue anyway if you believe this is wrong.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-black/[0.06] flex items-center gap-3">
            <button onClick={goCheckout} className="text-sm text-black/40 hover:text-black/70 font-medium">
              Skip for now
            </button>
            <button
              onClick={goCheckout}
              className={`ml-auto flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all ${
                result?.verdict === "incompatible"
                  ? "bg-black/70 hover:bg-black"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"}`}>
              {result?.verdict === "incompatible" ? "Continue anyway" : "Continue to checkout"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({
  label, value, onChange, placeholder, mono,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-black/50">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`mt-1 w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 ${mono ? "font-mono" : ""}`} />
    </label>
  );
}
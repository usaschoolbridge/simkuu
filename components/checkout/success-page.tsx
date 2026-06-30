"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Mail, Wifi, Download, ArrowRight, Copy, Check, QrCode, Loader2 } from "lucide-react";

type EsimData = {
  iccid: string;
  qrCode: string;
  activationCode: string;
  status: string;
};

type OrderData = {
  orderId: string;
  status: string;
  fulfilled: boolean;
  plan: { name: string; carrier?: string; data?: string };
  customer: { name?: string; email?: string };
  esim: EsimData | null;
};

export function SuccessPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? params.get("order_id");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const poll = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
      if (!res.ok) { setError("We couldn't find your order. Check your email — your QR was sent there."); return; }
      const data = (await res.json()) as OrderData;
      setOrder(data);
    } catch {
      setError("Network issue while loading your eSIM. Your QR is also in your email.");
    }
  }, [orderId]);

  // Poll until the webhook finishes provisioning (or give up after ~30s).
  useEffect(() => {
    if (!orderId) { setError("Missing order reference."); return; }
    poll();
  }, [orderId, poll]);

  useEffect(() => {
    if (!order || order.fulfilled || attempts > 15) return;
    const t = setTimeout(() => { setAttempts((a) => a + 1); poll(); }, 2000);
    return () => clearTimeout(t);
  }, [order, attempts, poll]);

  const lpa = order?.esim?.activationCode ?? "";
  const copyCode = () => {
    if (!lpa) return;
    navigator.clipboard.writeText(lpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const downloadQr = () => {
    if (!order?.esim?.qrCode) return;
    const a = document.createElement("a");
    a.href = order.esim.qrCode;
    a.download = `simkuu-esim-${order.esim.iccid}.png`;
    a.click();
  };

  const fulfilled = order?.fulfilled && order.esim;
  const planLabel = order ? `${order.plan.carrier ?? ""} ${order.plan.name}`.trim() : "your eSIM";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Wifi className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-black text-base text-black">Simkuu</span>
          </Link>
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Payment confirmed
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-lg text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </motion.div>

          <h1 className="font-display text-3xl font-black text-black mb-2">You&apos;re all set! 🎉</h1>
          <p className="text-black/50 mb-8">
            {planLabel} is ready to activate{order?.customer?.email ? ` — confirmation sent to ${order.customer.email}` : ""}.
          </p>

          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5 mb-5 text-left">
            {error && (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">{error}</div>
            )}

            {!fulfilled && !error && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                <p className="text-sm text-black/50 text-center">Finalizing your eSIM and generating your QR code…</p>
              </div>
            )}

            {fulfilled && order?.esim && (
              <div className="border-t-0 pt-0">
                <p className="text-xs text-black/40 text-center mb-4">
                  Scan this QR in Settings → Mobile Data → Add eSIM
                </p>
                <img
                  src={order.esim.qrCode}
                  alt="eSIM QR code"
                  width={192} height={192}
                  className="w-48 h-48 mx-auto rounded-2xl border-2 border-black/10"
                />
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 bg-black/[0.03] border border-black/5 rounded-xl px-3 py-2">
                    <code className="text-xs font-mono text-black/60 break-all">{lpa}</code>
                  </div>
                  <button onClick={copyCode} aria-label="Copy activation code"
                    className="p-2.5 rounded-xl border border-black/10 hover:bg-black/5 transition-colors text-black/30">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-blue-800 mb-2">How to activate (2 min)</p>
            <ol className="space-y-1.5 text-sm text-blue-700/80">
              {[
                "Open Settings → Mobile Data → Add eSIM",
                'Tap "Use QR Code" and scan the code above',
                "Label it and set as primary data line",
                "Restart your phone — you're connected!",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold text-blue-500 flex-shrink-0">{i + 1}.</span>{step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/80 transition-all shadow-md shadow-black/10">
              Go to dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={downloadQr} disabled={!fulfilled}
              className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors disabled:opacity-40">
              <Download className="w-4 h-4" /> Save QR
            </button>
          </div>

          {order && (
            <p className="mt-4 text-xs text-black/30">
              Order ID: <code className="font-mono">{order.orderId}</code>
              {order.customer?.email ? <> · Sent to {order.customer.email}</> : null}
            </p>
          )}
          <p className="mt-2 text-xs text-black/30 flex items-center justify-center gap-1">
            <Mail className="w-3 h-3" /> A copy is always emailed to you.
          </p>
        </div>
      </div>
    </div>
  );
}

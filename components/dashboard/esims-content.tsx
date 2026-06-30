"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, QrCode, Copy, Check, ChevronDown, ChevronUp, MoreHorizontal, RefreshCw, Zap, AlertCircle, Loader2, Download } from "lucide-react";

type Esim = {
  id: string; carrier: string; plan: string; signal: string;
  iccid: string; activationCode: string; qrCode: string;
  status: "active" | "expired" | "pending";
  dataUsed: number; dataTotal: number | null;
  activatedAt: string; expiresAt: string;
};

const CARRIER_COLOR: Record<string, string> = {
  "T-Mobile": "from-pink-500 to-red-500",
  Verizon: "from-red-600 to-red-800",
  "AT&T": "from-blue-500 to-cyan-500",
};
const colorFor = (carrier: string) => CARRIER_COLOR[carrier] ?? "from-purple-500 to-violet-600";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-black/30 hover:text-black/60">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function EsimCard({ esim }: { esim: Esim }) {
  const [expanded, setExpanded] = useState(false);
  const color = colorFor(esim.carrier);
  const pct = esim.dataTotal ? (esim.dataUsed / esim.dataTotal) * 100 : 36;
  const isExpired = esim.status === "expired";
  const isLow = esim.dataTotal && pct > 80 && !isExpired;
  const downloadQr = () => {
    if (!esim.qrCode) return;
    const a = document.createElement("a");
    a.href = esim.qrCode; a.download = `simkuu-esim-${esim.iccid}.png`; a.click();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
        isExpired ? "border-black/5 opacity-60" : "border-black/[0.06] hover:shadow-md"
      }`}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
              <Wifi className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-base text-black">{esim.carrier}</div>
              <div className="text-sm text-black/40">{esim.plan} · {esim.signal}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isExpired
                ? "bg-black/5 text-black/30 border-black/5"
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}>
              {isExpired ? "Expired" : (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </span>
              )}
            </span>
            <button className="p-1.5 rounded-lg hover:bg-black/5 transition-colors">
              <MoreHorizontal className="w-4 h-4 text-black/30" />
            </button>
          </div>
        </div>

        {/* Data usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-black/40">Data used</span>
            <span className="font-semibold text-black">
              {esim.dataUsed} GB {esim.dataTotal ? `/ ${esim.dataTotal} GB` : "/ Unlimited"}
            </span>
          </div>
          <div className="h-2 bg-black/5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${color}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          {isLow && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Only {(esim.dataTotal! - esim.dataUsed).toFixed(1)} GB remaining
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="mt-4 flex items-center gap-4 text-xs text-black/30">
          <span>Activated {esim.activatedAt}</span>
          <span>·</span>
          <span className={pct > 90 && !isExpired ? "text-red-500 font-medium" : ""}>
            {isExpired ? `Expired ${esim.expiresAt}` : `Expires ${esim.expiresAt}`}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            {expanded ? "Hide" : "Show"} QR Code
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {isExpired ? (
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors">
              <RefreshCw className="w-4 h-4" /> Renew
            </button>
          ) : (
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 text-black text-sm font-medium hover:bg-black/10 transition-colors">
              <Zap className="w-4 h-4" /> Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Expanded QR + details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-black/5 p-5">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* QR Code */}
                <div className="flex flex-col items-center gap-3">
                  {esim.qrCode ? (
                    <img src={esim.qrCode} alt="eSIM QR code" width={128} height={128}
                      className="w-32 h-32 bg-white border border-black/10 rounded-xl p-1" />
                  ) : (
                    <div className="w-32 h-32 rounded-xl border border-black/10 flex items-center justify-center text-black/20 text-xs">No QR</div>
                  )}
                  <button onClick={downloadQr} className="flex items-center gap-1.5 text-xs text-black/50 hover:text-black">
                    <Download className="w-3.5 h-3.5" /> Save QR
                  </button>
                  <p className="text-xs text-black/40 text-center max-w-[140px]">
                    Scan in Settings → Mobile Data → Add eSIM
                  </p>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  {[
                    { label: "ICCID", value: esim.iccid },
                    { label: "Activation Code", value: esim.activationCode },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-xs text-black/30 mb-0.5">{label}</div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-black font-mono bg-black/[0.03] px-2 py-1 rounded-lg border border-black/5 flex-1 truncate">
                          {value}
                        </code>
                        <CopyButton text={value} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function EsimsContent() {
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const [esims, setEsims] = useState<Esim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/esims", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Esim[]) => setEsims(Array.isArray(data) ? data : []))
      .catch(() => setEsims([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = esims.filter((e) => filter === "all" || e.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-7 h-7 text-black/20 animate-spin" />
      </div>
    );
  }

  if (esims.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">📭</div>
        <div className="font-display text-xl font-bold text-black mb-2">No eSIMs yet</div>
        <p className="text-black/40 mb-6">Once you buy a plan, your eSIM and QR code appear here.</p>
        <a href="/plans" className="inline-flex px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80">Browse plans</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-black/40 text-sm">{esims.filter(e => e.status === "active").length} active · {esims.filter(e => e.status === "expired").length} expired</p>
        </div>
        <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
          {(["all", "active", "expired"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === f ? "bg-white shadow-sm text-black" : "text-black/40 hover:text-black/60"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((esim) => <EsimCard key={esim.id} esim={esim} />)}
      </div>
    </div>
  );
}

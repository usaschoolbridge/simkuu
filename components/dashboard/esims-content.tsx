"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, QrCode, Copy, Check, ChevronDown, ChevronUp, MoreHorizontal, RefreshCw, Zap, AlertCircle } from "lucide-react";

const ESIMS = [
  {
    id: "esim-001", carrier: "T-Mobile", plan: "Unlimited", signal: "5G",
    iccid: "8901260123456789012", eid: "89049032004008882600000123456789",
    dataUsed: 18.4, dataTotal: null, status: "active",
    activatedAt: "Jun 20, 2026", expiresAt: "Jul 20, 2026",
    color: "from-pink-500 to-red-500",
    apn: "fast.t-mobile.com",
    smDpAddress: "consumer.iot-safe.com",
    activationCode: "LPA:1$consumer.iot-safe.com$ABCD-1234-EFGH-5678",
  },
  {
    id: "esim-002", carrier: "Verizon", plan: "50GB", signal: "5G",
    iccid: "8901260987654321098", eid: "89049032004008882600000987654321",
    dataUsed: 22.1, dataTotal: 50, status: "active",
    activatedAt: "Jun 10, 2026", expiresAt: "Jul 10, 2026",
    color: "from-red-600 to-red-800",
    apn: "vzwinternet",
    smDpAddress: "smdp.vzw.com",
    activationCode: "LPA:1$smdp.vzw.com$WXYZ-9012-IJKL-3456",
  },
  {
    id: "esim-003", carrier: "Mint Mobile", plan: "5GB", signal: "4G LTE",
    iccid: "8901261122334455667", eid: "89049032004008882600001122334455",
    dataUsed: 5, dataTotal: 5, status: "expired",
    activatedAt: "May 1, 2026", expiresAt: "Jun 1, 2026",
    color: "from-purple-500 to-purple-700",
    apn: "wholesale",
    smDpAddress: "smdp.mint.com",
    activationCode: "LPA:1$smdp.mint.com$MNOP-5678-QRST-9012",
  },
];

function QrCodeBox({ code }: { code: string }) {
  // Render a fake QR-like grid
  return (
    <div className="w-32 h-32 bg-white border border-black/10 rounded-xl p-2 grid grid-cols-8 gap-0.5">
      {Array.from({ length: 64 }, (_, i) => {
        const pattern = (Math.sin(i * 2.3 + 7) * Math.cos(i * 1.7 + 3) > 0.1) ||
          [0,1,2,3,4,5,6,7,8,15,16,23,24,31,32,33,34,35,36,37,38,39,48,55,56,57,58,59,60,61,62,63].includes(i);
        return (
          <div key={i} className={`rounded-[1px] ${pattern ? "bg-black" : "bg-transparent"}`} />
        );
      })}
    </div>
  );
}

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

function EsimCard({ esim }: { esim: typeof ESIMS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const pct = esim.dataTotal ? (esim.dataUsed / esim.dataTotal) * 100 : 36;
  const isExpired = esim.status === "expired";
  const isLow = esim.dataTotal && pct > 80 && !isExpired;

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
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${esim.color} flex items-center justify-center shadow-md`}>
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
              className={`h-full rounded-full bg-gradient-to-r ${esim.color}`}
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
                  <QrCodeBox code={esim.activationCode} />
                  <p className="text-xs text-black/40 text-center max-w-[140px]">
                    Scan in Settings → Mobile Data → Add eSIM
                  </p>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  {[
                    { label: "ICCID", value: esim.iccid },
                    { label: "SM-DP+ Address", value: esim.smDpAddress },
                    { label: "Activation Code", value: esim.activationCode.slice(0, 28) + "…" },
                    { label: "APN", value: esim.apn },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-xs text-black/30 mb-0.5">{label}</div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-black font-mono bg-black/[0.03] px-2 py-1 rounded-lg border border-black/5 flex-1 truncate">
                          {value}
                        </code>
                        <CopyButton text={label === "Activation Code" ? esim.activationCode : value} />
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
  const filtered = ESIMS.filter((e) => filter === "all" || e.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-black/40 text-sm">{ESIMS.filter(e => e.status === "active").length} active · {ESIMS.filter(e => e.status === "expired").length} expired</p>
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

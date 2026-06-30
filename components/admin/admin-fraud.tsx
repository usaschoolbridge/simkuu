"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, CheckCircle, Shield, CreditCard, Loader2, RefreshCw } from "lucide-react";

interface FraudFlag {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  amount: string;
  reason: string;
  riskScore: number;
  time: string;
  status: string;
}

interface FraudStats {
  pendingReview: number;
  blockedToday: number;
  totalOrdersApproved: number;
  fraudPrevented: string;
}

const RISK_COLOR = (score: number) =>
  score >= 75 ? "text-red-600 bg-red-50 border-red-200" :
  score >= 50 ? "text-amber-600 bg-amber-50 border-amber-200" :
  "text-emerald-600 bg-emerald-50 border-emerald-200";

const DETECTION_RULES = [
  { name: "Disposable email block", description: "Block orders from known throwaway email providers (40+ domains)", enabled: true },
  { name: "Test email detection", description: "Flag addresses matching test/temp/fake/spam patterns", enabled: true },
  { name: "Velocity check", description: "Flag if same user places 3+ orders in a single day", enabled: true },
  { name: "High-value order review", description: "Manual review flag for orders ≥ $100", enabled: true },
  { name: "Refund pattern detection", description: "Flag users with refunded orders in the last 30 days", enabled: true },
  { name: "Cancellation pattern", description: "Flag users with 2+ cancelled orders in 30 days", enabled: true },
];

export function AdminFraudContent() {
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFraud = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/fraud", { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        setFlags(data.flags ?? []);
        setStats(data.stats ?? null);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadFraud(); }, [loadFraud]);

  function dismissFlag(id: string) {
    setFlags(fs => fs.map(f => f.id === id ? { ...f, status: "dismissed" } : f));
  }
  function approveFlag(id: string) {
    setFlags(fs => fs.map(f => f.id === id ? { ...f, status: "reviewed" } : f));
  }

  const pending = flags.filter(f => f.status === "pending").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-black/30">
        <Loader2 className="w-6 h-6 animate-spin" /> Analyzing orders for fraud signals…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-4 gap-4 flex-1">
          {[
            { icon: AlertTriangle, label: "Pending review", value: String(pending), color: "text-red-600", bg: "bg-red-50" },
            { icon: Shield, label: "Refunds (30d)", value: String(stats?.blockedToday ?? 0), color: "text-amber-600", bg: "bg-amber-50" },
            { icon: CheckCircle, label: "Orders approved", value: String(stats?.totalOrdersApproved ?? 0), color: "text-emerald-600", bg: "bg-emerald-50" },
            { icon: CreditCard, label: "Refunded amount", value: stats?.fraudPrevented ?? "$0.00", color: "text-blue-600", bg: "bg-blue-50" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-sm flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <div className="font-display font-black text-xl text-black">{s.value}</div>
                <div className="text-xs text-black/40">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <button onClick={loadFraud} className="ml-3 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 text-xs font-medium text-black/50 hover:bg-black/5 flex-shrink-0">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Flagged orders */}
        <div className="xl:col-span-3 space-y-3">
          <h3 className="font-display font-bold text-base text-black flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" /> Flagged accounts (last 30 days)
            {pending > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">{pending}</span>}
          </h3>

          {flags.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/[0.06] p-8 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-black/50">No suspicious activity detected</p>
              <p className="text-xs text-black/30 mt-1">All recent orders passed fraud checks.</p>
            </div>
          ) : flags.map((flag, i) => (
            <motion.div key={flag.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              className={`bg-white rounded-2xl border shadow-sm p-4 ${flag.status === "pending" ? "border-red-100" : "border-black/[0.06]"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-black">{flag.orderId}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${RISK_COLOR(flag.riskScore)}`}>
                      Risk: {flag.riskScore}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-black">{flag.customer}</div>
                  <div className="text-xs text-black/40">{flag.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-black">{flag.amount}</div>
                  <div className="text-xs text-black/30">{flag.time}</div>
                </div>
              </div>

              <div className="bg-red-50/50 border border-red-100 rounded-xl px-3 py-2 mb-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-red-700">{flag.reason}</span>
                </div>
              </div>

              {flag.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => approveFlag(flag.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Reviewed
                  </button>
                  <button onClick={() => dismissFlag(flag.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-black/10 text-xs font-medium text-black/50 hover:bg-black/5 transition-colors">
                    Dismiss
                  </button>
                </div>
              ) : (
                <div className={`text-xs font-medium px-3 py-2 rounded-xl ${flag.status === "reviewed" ? "bg-emerald-50 text-emerald-600" : "bg-black/5 text-black/30"}`}>
                  {flag.status === "reviewed" ? "✓ Marked as reviewed" : "Dismissed"}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Rules */}
        <div className="xl:col-span-2">
          <h3 className="font-display font-bold text-base text-black mb-3">Active detection rules</h3>
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
            {DETECTION_RULES.map((rule, i) => (
              <div key={rule.name} className={`p-4 ${i < DETECTION_RULES.length - 1 ? "border-b border-black/5" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-black mb-0.5">{rule.name}</div>
                    <div className="text-xs text-black/40">{rule.description}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${rule.enabled ? "bg-emerald-500" : "bg-black/10"}`} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-black/30 mt-2 text-center">Rules run on every page load against the last 30 days of orders.</p>
        </div>
      </div>
    </div>
  );
}

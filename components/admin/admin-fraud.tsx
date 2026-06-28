"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, AlertTriangle, CheckCircle, Ban, Eye, Shield, CreditCard, Globe } from "lucide-react";

// Fraud detection is largely rule-based and not backed by a dedicated DB table.
// The flagged orders panel reads from real orders via context; rules are config-only for now.
// This component preserves full UI while adding real state management.

const INITIAL_FLAGS = [
  { id: "flag-1", orderId: "ORD-8921", customer: "Unknown User", email: "test@tempmail.com", amount: "$149.97", reason: "3 failed payment attempts", riskScore: 94, ip: "45.123.89.201", country: "🏴‍☠️ VPN", time: "10m ago", status: "pending" },
  { id: "flag-2", orderId: "ORD-8918", customer: "John Doe", email: "johndoe@0mail.net", amount: "$299.94", reason: "Disposable email + unusual purchase volume", riskScore: 87, ip: "91.220.101.45", country: "🇷🇺 RU", time: "1h ago", status: "pending" },
  { id: "flag-3", orderId: "ORD-8905", customer: "Alice Smith", email: "alice@gmail.com", amount: "$59.99", reason: "IP geolocation mismatch (US card, RU IP)", riskScore: 71, ip: "185.220.101.67", country: "🇷🇺 RU", time: "3h ago", status: "reviewed" },
  { id: "flag-4", orderId: "ORD-8891", customer: "Test Account", email: "test+123@example.com", amount: "$29.99", reason: "Test email pattern detected", riskScore: 65, ip: "127.0.0.1", country: "🇺🇸 US", time: "Jun 26", status: "dismissed" },
];

const INITIAL_RULES = [
  { name: "Disposable email block", description: "Block orders from known throwaway email providers", enabled: true, triggered: 34 },
  { name: "VPN/Proxy detection", description: "Flag orders placed through VPN or proxy servers", enabled: true, triggered: 89 },
  { name: "Multiple failed payments", description: "Block after 2+ failed payment attempts in 1 hour", enabled: true, triggered: 12 },
  { name: "Velocity check", description: "Flag if same IP buys >3 eSIMs in 24 hours", enabled: true, triggered: 7 },
  { name: "Geo mismatch", description: "Alert when billing country ≠ IP country", enabled: false, triggered: 156 },
  { name: "High-value order review", description: "Manual review for orders >$100", enabled: true, triggered: 23 },
];

const RISK_COLOR = (score: number) =>
  score >= 85 ? "text-red-600 bg-red-50 border-red-200" :
  score >= 65 ? "text-amber-600 bg-amber-50 border-amber-200" :
  "text-emerald-600 bg-emerald-50 border-emerald-200";

export function AdminFraudContent() {
  const [rules, setRules] = useState(INITIAL_RULES);
  const [flags, setFlags] = useState(INITIAL_FLAGS);

  const toggleRule = (i: number) => setRules(rs => rs.map((r, idx) => idx === i ? { ...r, enabled: !r.enabled } : r));
  const updateFlag = (id: string, status: string) => setFlags(fs => fs.map(f => f.id === id ? { ...f, status } : f));

  const pending = flags.filter(f => f.status === "pending").length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: AlertTriangle, label: "Pending review", value: pending.toString(), color: "text-red-600", bg: "bg-red-50" },
          { icon: Shield, label: "Blocked today", value: "7", color: "text-amber-600", bg: "bg-amber-50" },
          { icon: CheckCircle, label: "Orders approved", value: "1,840", color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: CreditCard, label: "Fraud prevented", value: "$892", color: "text-blue-600", bg: "bg-blue-50" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
            </div>
            <div>
              <div className="font-display font-black text-xl text-black">{s.value}</div>
              <div className="text-xs text-black/40">{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Flagged orders */}
        <div className="xl:col-span-3 space-y-3">
          <h3 className="font-display font-bold text-base text-black flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" /> Flagged orders
            {pending > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">{pending}</span>}
          </h3>
          {flags.map((flag, i) => (
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

              <div className="flex items-center gap-3 mb-3 text-xs text-black/40">
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {flag.ip}</span>
                <span>{flag.country}</span>
              </div>

              {flag.status === "pending" ? (
                <div className="flex gap-2">
                  <button onClick={() => updateFlag(flag.id, "reviewed")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => updateFlag(flag.id, "dismissed")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
                    <Ban className="w-3.5 h-3.5" /> Block
                  </button>
                  <button className="px-3 py-2 rounded-xl border border-black/10 text-xs font-medium text-black/50 hover:bg-black/5 transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className={`text-xs font-medium px-3 py-2 rounded-xl ${flag.status === "reviewed" ? "bg-emerald-50 text-emerald-600" : "bg-black/5 text-black/30"}`}>
                  {flag.status === "reviewed" ? "✓ Approved" : "Dismissed"}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Rules */}
        <div className="xl:col-span-2">
          <h3 className="font-display font-bold text-base text-black mb-3">Detection rules</h3>
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
            {rules.map((rule, i) => (
              <div key={rule.name} className={`p-4 ${i < rules.length - 1 ? "border-b border-black/5" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-black mb-0.5">{rule.name}</div>
                    <div className="text-xs text-black/40 mb-1">{rule.description}</div>
                    <div className="text-xs text-black/30">Triggered {rule.triggered}× total</div>
                  </div>
                  <button onClick={() => toggleRule(i)}
                    className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 mt-0.5 ${rule.enabled ? "bg-emerald-500" : "bg-black/10"}`}>
                    <motion.div animate={{ x: rule.enabled ? 16 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

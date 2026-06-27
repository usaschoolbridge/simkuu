"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Copy, Check, Trash2, Tag, Percent, DollarSign, Calendar, Users, X, Save } from "lucide-react";

const COUPONS = [
  { id: "coup-1", code: "WELCOME20", type: "percent", value: 20, uses: 142, maxUses: 500, expires: "Jul 31, 2026", status: "active", minOrder: null },
  { id: "coup-2", code: "SUMMER10", type: "percent", value: 10, uses: 89, maxUses: 200, expires: "Aug 31, 2026", status: "active", minOrder: "$20" },
  { id: "coup-3", code: "SAVE5", type: "fixed", value: 5, uses: 203, maxUses: null, expires: "Dec 31, 2026", status: "active", minOrder: "$15" },
  { id: "coup-4", code: "BULK30", type: "percent", value: 30, uses: 34, maxUses: 100, expires: "Jul 15, 2026", status: "active", minOrder: "$50" },
  { id: "coup-5", code: "FLASH15", type: "percent", value: 15, uses: 500, maxUses: 500, expires: "Jun 30, 2026", status: "expired", minOrder: null },
  { id: "coup-6", code: "VIP50OFF", type: "fixed", value: 50, uses: 12, maxUses: 50, expires: "Dec 31, 2026", status: "active", minOrder: "$100" },
];

function CreateModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<"percent" | "fixed">("percent");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-black">Create coupon</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 text-black/40"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">Coupon code</label>
            <input placeholder="e.g. SUMMER20" className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-mono uppercase" />
            <p className="text-xs text-black/30 mt-1">Customers enter this at checkout</p>
          </div>
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">Discount type</label>
            <div className="flex gap-2">
              {(["percent", "fixed"] as const).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${type === t ? "bg-black text-white border-black" : "border-black/10 text-black/60 hover:border-black/30"}`}>
                  {t === "percent" ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                  {t === "percent" ? "Percentage" : "Fixed amount"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Value</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 text-sm">{type === "percent" ? "%" : "$"}</span>
                <input type="number" placeholder="20" className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Max uses</label>
              <input type="number" placeholder="Unlimited" className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">Expiry date</label>
            <input type="date" className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors">Cancel</button>
          <button onClick={onClose} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors">
            <Save className="w-4 h-4" /> Create coupon
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AdminCouponsContent() {
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Tag, label: "Active coupons", value: COUPONS.filter(c => c.status === "active").length.toString(), color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Users, label: "Total uses", value: COUPONS.reduce((s, c) => s + c.uses, 0).toString(), color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: Percent, label: "Avg discount", value: "18%", color: "text-purple-600", bg: "bg-purple-50" },
          { icon: DollarSign, label: "Discount given", value: "$892", color: "text-amber-600", bg: "bg-amber-50" },
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

      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors shadow-md shadow-black/10">
          <Plus className="w-4 h-4" /> Create coupon
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {COUPONS.map((coupon, i) => {
          const usagePct = coupon.maxUses ? (coupon.uses / coupon.maxUses) * 100 : null;
          const isExpired = coupon.status === "expired";
          return (
            <motion.div key={coupon.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-white rounded-2xl border shadow-sm p-5 ${isExpired ? "border-black/5 opacity-60" : "border-black/[0.06] hover:shadow-md"} transition-shadow`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${coupon.type === "percent" ? "bg-blue-50" : "bg-emerald-50"}`}>
                    {coupon.type === "percent" ? <Percent className="w-4 h-4 text-blue-600" /> : <DollarSign className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <div>
                    <div className="font-display font-black text-lg text-black">
                      {coupon.type === "percent" ? `${coupon.value}% OFF` : `$${coupon.value} OFF`}
                    </div>
                    {coupon.minOrder && <div className="text-xs text-black/30">Min order {coupon.minOrder}</div>}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${isExpired ? "bg-black/5 text-black/30 border-black/5" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                  {isExpired ? "Expired" : "Active"}
                </span>
              </div>

              {/* Code */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 flex items-center px-3 py-2 bg-black/[0.03] rounded-xl border border-black/5">
                  <code className="font-mono text-sm font-bold text-black tracking-widest">{coupon.code}</code>
                </div>
                <button onClick={() => copyCode(coupon.id, coupon.code)}
                  className="p-2 rounded-xl hover:bg-black/5 transition-colors text-black/30 hover:text-black/60">
                  {copiedId === coupon.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Usage */}
              {usagePct !== null && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-black/40">Usage</span>
                    <span className="font-medium text-black">{coupon.uses} / {coupon.maxUses}</span>
                  </div>
                  <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                    <motion.div className={`h-full rounded-full ${usagePct >= 90 ? "bg-red-400" : "bg-blue-500"}`}
                      initial={{ width: 0 }} animate={{ width: `${usagePct}%` }} transition={{ delay: 0.3, duration: 0.6 }} />
                  </div>
                </div>
              )}
              {usagePct === null && (
                <div className="text-xs text-black/40 mb-3">{coupon.uses} uses · Unlimited</div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-black/30">
                  <Calendar className="w-3 h-3" /> {isExpired ? "Expired" : "Expires"} {coupon.expires}
                </div>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-black/20 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  );
}

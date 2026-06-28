"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Copy, Check, Trash2, Tag, Percent, DollarSign, Calendar, Users, X, Save, Loader2 } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string | number;
  usedCount: number;
  maxUses: number | null;
  expiresAt: string | null;
  isActive: boolean;
  minOrderAmount: string | number | null;
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [code, setCode] = useState("");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!code || !value) { setError("Code and value are required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, discountType: type, value, maxUses: maxUses || null, expiresAt: expiresAt || null }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed to create"); return; }
      onCreated();
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-black">Create coupon</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 text-black/40"><X className="w-4 h-4" /></button>
        </div>
        {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">Coupon code</label>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER20"
              className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-mono uppercase" />
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
                <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="20"
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Max uses</label>
              <input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="Unlimited"
                className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">Expiry date</label>
            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Create coupon
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AdminCouponsContent() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function fetchCoupons() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) setCoupons(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCoupons(); }, []);

  async function deleteCoupon(id: string) {
    if (!confirm("Delete this coupon?")) return;
    try {
      await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      setCoupons(cs => cs.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isExpired = (c: Coupon) => !c.isActive || (c.expiresAt ? new Date(c.expiresAt) < new Date() : false);
  const formatExpiry = (iso: string | null) => iso ? new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "Never";

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Tag, label: "Active coupons", value: coupons.filter(c => !isExpired(c)).length.toString(), color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Users, label: "Total uses", value: coupons.reduce((s, c) => s + c.usedCount, 0).toString(), color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: Percent, label: "Total coupons", value: coupons.length.toString(), color: "text-purple-600", bg: "bg-purple-50" },
          { icon: DollarSign, label: "Expired/inactive", value: coupons.filter(c => isExpired(c)).length.toString(), color: "text-amber-600", bg: "bg-amber-50" },
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

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-black/30">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading coupons…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map((coupon, i) => {
            const expired = isExpired(coupon);
            const usagePct = coupon.maxUses ? (coupon.usedCount / coupon.maxUses) * 100 : null;
            return (
              <motion.div key={coupon.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-2xl border shadow-sm p-5 ${expired ? "border-black/5 opacity-60" : "border-black/[0.06] hover:shadow-md"} transition-shadow`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${coupon.discountType === "PERCENTAGE" ? "bg-blue-50" : "bg-emerald-50"}`}>
                      {coupon.discountType === "PERCENTAGE" ? <Percent className="w-4 h-4 text-blue-600" /> : <DollarSign className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div>
                      <div className="font-display font-black text-lg text-black">
                        {coupon.discountType === "PERCENTAGE" ? `${Number(coupon.discountValue)}% OFF` : `$${Number(coupon.discountValue)} OFF`}
                      </div>
                      {coupon.minOrderAmount && <div className="text-xs text-black/30">Min order ${Number(coupon.minOrderAmount)}</div>}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${expired ? "bg-black/5 text-black/30 border-black/5" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                    {expired ? "Expired" : "Active"}
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
                {usagePct !== null ? (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-black/40">Usage</span>
                      <span className="font-medium text-black">{coupon.usedCount} / {coupon.maxUses}</span>
                    </div>
                    <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full ${usagePct >= 90 ? "bg-red-400" : "bg-blue-500"}`}
                        initial={{ width: 0 }} animate={{ width: `${usagePct}%` }} transition={{ delay: 0.3, duration: 0.6 }} />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-black/40 mb-3">{coupon.usedCount} uses · Unlimited</div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-black/30">
                    <Calendar className="w-3 h-3" /> {expired ? "Expired" : "Expires"} {formatExpiry(coupon.expiresAt)}
                  </div>
                  <button onClick={() => deleteCoupon(coupon.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-black/20 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={fetchCoupons} />}
      </AnimatePresence>
    </div>
  );
}

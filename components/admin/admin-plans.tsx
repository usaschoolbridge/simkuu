"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff, Wifi, Save, X, Loader2 } from "lucide-react";

type Plan = {
  id: string; name: string; carrierId: string;
  carrier: { name: string };
  data: string; price: number; originalPrice: number | null;
  fiveG: boolean; hotspot: boolean; badge: string | null;
  isActive: boolean; sortOrder: number;
  _count: { orders: number };
};

const CARRIER_COLORS: Record<string, string> = {
  "T-Mobile": "bg-pink-50 text-pink-600 border-pink-100",
  "Verizon": "bg-red-50 text-red-600 border-red-100",
  "AT&T": "bg-blue-50 text-blue-600 border-blue-100",
  "Mint Mobile": "bg-purple-50 text-purple-600 border-purple-100",
};

const CARRIERS = [
  { id: "TMOBILE", name: "T-Mobile" },
  { id: "VERIZON", name: "Verizon" },
  { id: "ATT", name: "AT&T" },
  { id: "MVNO", name: "Mint Mobile" },
];

function EditModal({ plan, onClose, onSaved }: { plan: Plan | null; onClose: () => void; onSaved: () => void }) {
  const isNew = !plan;
  const [name, setName] = useState(plan?.name ?? "");
  const [price, setPrice] = useState(plan?.price?.toString() ?? "");
  const [originalPrice, setOriginalPrice] = useState(plan?.originalPrice?.toString() ?? "");
  const [data, setData] = useState(plan?.data ?? "");
  const [carrierId, setCarrierId] = useState(plan?.carrierId ?? "TMOBILE");
  const [badge, setBadge] = useState(plan?.badge ?? "");
  const [fiveG, setFiveG] = useState(plan?.fiveG ?? true);
  const [hotspot, setHotspot] = useState(plan?.hotspot ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!name || !price || !data) { setError("Name, price and data are required"); return; }
    setSaving(true); setError("");
    try {
      const url = isNew ? "/api/admin/plans" : `/api/admin/plans/${plan!.id}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, originalPrice: originalPrice || null, data, carrierId, badge: badge || null, fiveG, hotspot }),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSaved();
      onClose();
    } catch {
      setError("Failed to save plan. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg text-black">{isNew ? "Add new plan" : "Edit plan"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 text-black/40"><X className="w-4 h-4" /></button>
        </div>
        {error && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">Plan name *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. T-Mobile 15GB"
              className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">Carrier *</label>
            <select value={carrierId} onChange={e => setCarrierId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 bg-white">
              {CARRIERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Price (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 text-sm">$</span>
                <input value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01"
                  placeholder="19.99"
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Original Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 text-sm">$</span>
                <input value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} type="number" step="0.01"
                  placeholder="29.99 (optional)"
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Data *</label>
              <input value={data} onChange={e => setData(e.target.value)} placeholder="15 GB or Unlimited"
                className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Badge label</label>
              <input value={badge} onChange={e => setBadge(e.target.value)} placeholder="Popular (optional)"
                className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={fiveG} onChange={e => setFiveG(e.target.checked)} className="rounded" />
              5G Enabled
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={hotspot} onChange={e => setHotspot(e.target.checked)} className="rounded" />
              Hotspot
            </label>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5">Cancel</button>
          <button onClick={save} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AdminPlansContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrierFilter, setCarrierFilter] = useState("all");
  const [editingPlan, setEditingPlan] = useState<Plan | null | "new">(null);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      setPlans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const toggleStatus = async (plan: Plan) => {
    await fetch(`/api/admin/plans/${plan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !plan.isActive }),
    });
    fetchPlans();
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
    fetchPlans();
  };

  const carriers = ["all", ...Array.from(new Set(plans.map(p => p.carrier?.name).filter(Boolean)))];
  const filtered = plans.filter(p => carrierFilter === "all" || p.carrier?.name === carrierFilter);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-black/30" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-black/5 p-1 rounded-xl flex-wrap">
          {carriers.map(c => (
            <button key={c} onClick={() => setCarrierFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${carrierFilter === c ? "bg-white shadow-sm text-black" : "text-black/40"}`}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={() => setEditingPlan("new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors shadow-md shadow-black/10">
          <Plus className="w-4 h-4" /> Add plan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-black/5 text-[10px] font-bold text-black/25 uppercase tracking-widest">
          <div className="col-span-3">Plan name</div>
          <div className="col-span-2">Carrier</div>
          <div className="col-span-1">Data</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-1">Orders</div>
          <div className="col-span-1">Badge</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-black/30 text-sm">No plans found</div>
        )}

        {filtered.map((plan, i) => (
          <motion.div key={plan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className={`grid grid-cols-12 gap-3 items-center px-5 py-3.5 ${i < filtered.length - 1 ? "border-b border-black/[0.04]" : ""} hover:bg-black/[0.01]`}>
            <div className="col-span-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center flex-shrink-0">
                <Wifi className="w-3.5 h-3.5 text-black/30" />
              </div>
              <span className="text-sm font-medium text-black truncate">{plan.name}</span>
            </div>
            <div className="col-span-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CARRIER_COLORS[plan.carrier?.name] ?? "bg-black/5 text-black/50 border-black/10"}`}>
                {plan.carrier?.name}
              </span>
            </div>
            <div className="col-span-1 text-sm font-semibold text-black">{plan.data}</div>
            <div className="col-span-2">
              <div className="text-sm font-bold text-black">${Number(plan.price).toFixed(2)}</div>
              {plan.originalPrice && <div className="text-xs text-black/30 line-through">${Number(plan.originalPrice).toFixed(2)}</div>}
            </div>
            <div className="col-span-1 text-sm font-medium text-black">{plan._count?.orders ?? 0}</div>
            <div className="col-span-1">
              {plan.badge ? <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">{plan.badge}</span> : <span className="text-xs text-black/20">—</span>}
            </div>
            <div className="col-span-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${plan.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-black/5 text-black/30 border-black/5"}`}>
                {plan.isActive ? "Active" : "Draft"}
              </span>
            </div>
            <div className="col-span-1 flex justify-end gap-1">
              <button onClick={() => setEditingPlan(plan)} className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/60"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => toggleStatus(plan)} className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/60">
                {plan.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => deletePlan(plan.id)} className="p-1 rounded-lg hover:bg-red-50 text-black/25 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editingPlan !== null && (
          <EditModal
            plan={editingPlan === "new" ? null : editingPlan}
            onClose={() => setEditingPlan(null)}
            onSaved={fetchPlans}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

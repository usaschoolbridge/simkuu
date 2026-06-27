"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, EyeOff, Wifi, Package, ChevronDown, Save, X } from "lucide-react";

const PLANS = [
  { id: "plan-1", name: "T-Mobile 5GB", carrier: "T-Mobile", data: "5 GB", price: 9.99, originalPrice: null, signal: "4G/5G", status: "active", orders: 122, featured: false },
  { id: "plan-2", name: "T-Mobile 15GB", carrier: "T-Mobile", data: "15 GB", price: 19.99, originalPrice: null, signal: "5G", status: "active", orders: 341, featured: false },
  { id: "plan-3", name: "T-Mobile Unlimited", carrier: "T-Mobile", data: "Unlimited", price: 29.99, originalPrice: 39.99, signal: "5G", status: "active", orders: 782, featured: true },
  { id: "plan-4", name: "Verizon 25GB", carrier: "Verizon", data: "25 GB", price: 24.99, originalPrice: null, signal: "5G", status: "active", orders: 201, featured: false },
  { id: "plan-5", name: "Verizon 50GB", carrier: "Verizon", data: "50 GB", price: 39.99, originalPrice: null, signal: "5G", status: "active", orders: 521, featured: true },
  { id: "plan-6", name: "Verizon 100GB", carrier: "Verizon", data: "100 GB", price: 59.99, originalPrice: 79.99, signal: "5G UW", status: "active", orders: 178, featured: false },
  { id: "plan-7", name: "AT&T 10GB", carrier: "AT&T", data: "10 GB", price: 14.99, originalPrice: null, signal: "4G/5G", status: "active", orders: 89, featured: false },
  { id: "plan-8", name: "AT&T 30GB", carrier: "AT&T", data: "30 GB", price: 24.99, originalPrice: null, signal: "5G", status: "active", orders: 312, featured: false },
  { id: "plan-9", name: "Mint 10GB", carrier: "Mint Mobile", data: "10 GB", price: 14.99, originalPrice: null, signal: "5G", status: "active", orders: 122, featured: false },
  { id: "plan-10", name: "AT&T Unlimited", carrier: "AT&T", data: "Unlimited", price: 34.99, originalPrice: null, signal: "5G+", status: "draft", orders: 0, featured: false },
];

const CARRIER_COLORS: Record<string, string> = {
  "T-Mobile": "bg-pink-50 text-pink-600 border-pink-100",
  "Verizon": "bg-red-50 text-red-600 border-red-100",
  "AT&T": "bg-blue-50 text-blue-600 border-blue-100",
  "Mint Mobile": "bg-purple-50 text-purple-600 border-purple-100",
};

function EditModal({ plan, onClose }: { plan: typeof PLANS[0]; onClose: () => void }) {
  const [price, setPrice] = useState(plan.price.toString());
  const [name, setName] = useState(plan.name);
  const [featured, setFeatured] = useState(plan.featured);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-black">Edit plan</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 text-black/40"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">Plan name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Price (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 text-sm">$</span>
                <input value={price} onChange={e => setPrice(e.target.value)} type="number"
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Data</label>
              <input defaultValue={plan.data}
                className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-black/5">
            <div>
              <div className="text-sm font-medium text-black">Featured plan</div>
              <div className="text-xs text-black/40">Show highlighted badge on plan cards</div>
            </div>
            <button onClick={() => setFeatured(v => !v)}
              className={`relative w-10 h-6 rounded-full transition-colors ${featured ? "bg-blue-500" : "bg-black/10"}`}>
              <motion.div animate={{ x: featured ? 16 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-black/60 hover:bg-black/5 transition-colors">Cancel</button>
          <button onClick={onClose} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors">
            <Save className="w-4 h-4" /> Save changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AdminPlansContent() {
  const [carrierFilter, setCarrierFilter] = useState("all");
  const [editingPlan, setEditingPlan] = useState<typeof PLANS[0] | null>(null);
  const [plans, setPlans] = useState(PLANS);

  const carriers = ["all", ...Array.from(new Set(PLANS.map(p => p.carrier)))];
  const filtered = plans.filter(p => carrierFilter === "all" || p.carrier === carrierFilter);

  const toggleStatus = (id: string) => setPlans(ps => ps.map(p => p.id === id ? { ...p, status: p.status === "active" ? "draft" : "active" } : p));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
          {carriers.map(c => (
            <button key={c} onClick={() => setCarrierFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${carrierFilter === c ? "bg-white shadow-sm text-black" : "text-black/40"}`}>
              {c}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors shadow-md shadow-black/10">
          <Plus className="w-4 h-4" /> Add plan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-black/5 text-[10px] font-bold text-black/25 uppercase tracking-widest">
          <div className="col-span-3">Plan name</div>
          <div className="col-span-2">Carrier</div>
          <div className="col-span-1">Data</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1">Signal</div>
          <div className="col-span-1">Orders</div>
          <div className="col-span-1">Featured</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {filtered.map((plan, i) => (
          <motion.div key={plan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className={`grid grid-cols-12 gap-3 items-center px-5 py-3.5 ${i < filtered.length - 1 ? "border-b border-black/[0.04]" : ""} hover:bg-black/[0.01] transition-colors`}>
            <div className="col-span-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center flex-shrink-0">
                <Wifi className="w-3.5 h-3.5 text-black/30" />
              </div>
              <span className="text-sm font-medium text-black">{plan.name}</span>
            </div>
            <div className="col-span-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CARRIER_COLORS[plan.carrier] ?? "bg-black/5 text-black/50 border-black/10"}`}>
                {plan.carrier}
              </span>
            </div>
            <div className="col-span-1 text-sm font-semibold text-black">{plan.data}</div>
            <div className="col-span-1">
              <div className="text-sm font-bold text-black">${plan.price}</div>
              {plan.originalPrice && <div className="text-xs text-black/30 line-through">${plan.originalPrice}</div>}
            </div>
            <div className="col-span-1 text-xs text-black/50">{plan.signal}</div>
            <div className="col-span-1 text-sm font-medium text-black">{plan.orders}</div>
            <div className="col-span-1">
              {plan.featured ? <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">⭐ Yes</span> : <span className="text-xs text-black/20">—</span>}
            </div>
            <div className="col-span-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${plan.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-black/5 text-black/30 border-black/5"}`}>
                {plan.status === "active" ? "Active" : "Draft"}
              </span>
            </div>
            <div className="col-span-1 flex justify-end gap-1">
              <button onClick={() => setEditingPlan(plan)} className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/60 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => toggleStatus(plan.id)} className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/60 transition-colors">
                {plan.status === "active" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button className="p-1 rounded-lg hover:bg-red-50 text-black/25 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editingPlan && <EditModal plan={editingPlan} onClose={() => setEditingPlan(null)} />}
      </AnimatePresence>
    </div>
  );
}

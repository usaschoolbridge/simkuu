"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, CheckCircle, Clock, XCircle, RefreshCw, Eye, Mail, MoreHorizontal, Download, ChevronDown } from "lucide-react";

const ORDERS = [
  { id: "ORD-8941", customer: "Emma Wilson", email: "emma@example.com", plan: "T-Mobile Unlimited", carrier: "T-Mobile", amount: "$29.99", status: "active", payment: "Stripe", date: "Jun 27, 2026", country: "🇺🇸" },
  { id: "ORD-8940", customer: "James Lee", email: "james@example.com", plan: "Verizon 100GB", carrier: "Verizon", amount: "$59.99", status: "pending", payment: "PayPal", date: "Jun 27, 2026", country: "🇨🇦" },
  { id: "ORD-8939", customer: "Sofia Garcia", email: "sofia@example.com", plan: "AT&T 30GB", carrier: "AT&T", amount: "$24.99", status: "active", payment: "Stripe", date: "Jun 27, 2026", country: "🇲🇽" },
  { id: "ORD-8938", customer: "Noah Chen", email: "noah@example.com", plan: "Mint 10GB", carrier: "Mint", amount: "$14.99", status: "active", payment: "Crypto", date: "Jun 26, 2026", country: "🇺🇸" },
  { id: "ORD-8937", customer: "Olivia Brown", email: "olivia@example.com", plan: "T-Mobile 5GB", carrier: "T-Mobile", amount: "$9.99", status: "refunded", payment: "Stripe", date: "Jun 26, 2026", country: "🇬🇧" },
  { id: "ORD-8936", customer: "Liam Park", email: "liam@example.com", plan: "Verizon 50GB", carrier: "Verizon", amount: "$39.99", status: "active", payment: "Stripe", date: "Jun 26, 2026", country: "🇰🇷" },
  { id: "ORD-8935", customer: "Ava Martinez", email: "ava@example.com", plan: "T-Mobile Unlimited", carrier: "T-Mobile", amount: "$29.99", status: "active", payment: "PayPal", date: "Jun 25, 2026", country: "🇪🇸" },
  { id: "ORD-8934", customer: "Ethan Johnson", email: "ethan@example.com", plan: "AT&T Unlimited", carrier: "AT&T", amount: "$34.99", status: "expired", payment: "Stripe", date: "Jun 25, 2026", country: "🇺🇸" },
];

const STATUS_CFG = {
  active: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: CheckCircle },
  pending: { color: "text-amber-600", bg: "bg-amber-50 border-amber-100", icon: Clock },
  refunded: { color: "text-purple-600", bg: "bg-purple-50 border-purple-100", icon: RefreshCw },
  expired: { color: "text-black/30", bg: "bg-black/5 border-black/5", icon: XCircle },
};

export function AdminOrdersContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = ORDERS.filter((o) => {
    const matchSearch = [o.id, o.customer, o.email, o.plan].some(v => v.toLowerCase().includes(search.toLowerCase()));
    return matchSearch && (statusFilter === "all" || o.status === statusFilter);
  });

  const toggleSelect = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map(o => o.id));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders, customers, emails…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
            {["all", "active", "pending", "refunded", "expired"].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === f ? "bg-white shadow-sm text-black" : "text-black/40"}`}>
                {f}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 text-sm text-black/50 hover:bg-black/5 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
          <span className="text-sm font-medium text-blue-700">{selected.length} selected</span>
          <div className="flex gap-2 ml-auto">
            {["Mark active", "Refund", "Send email", "Export"].map(a => (
              <button key={a} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors">{a}</button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-black/5 text-[10px] font-bold text-black/25 uppercase tracking-widest">
          <div className="col-span-1 flex items-center">
            <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll}
              className="w-4 h-4 rounded border-black/20 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" />
          </div>
          <div className="col-span-2">Order</div>
          <div className="col-span-2">Customer</div>
          <div className="col-span-2">Plan</div>
          <div className="col-span-1">Amount</div>
          <div className="col-span-1">Payment</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {filtered.map((order, i) => {
          const cfg = STATUS_CFG[order.status as keyof typeof STATUS_CFG];
          const Icon = cfg.icon;
          const isSelected = selected.includes(order.id);
          return (
            <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className={`grid grid-cols-12 gap-3 items-center px-5 py-3.5 ${i < filtered.length - 1 ? "border-b border-black/[0.04]" : ""} hover:bg-black/[0.01] transition-colors ${isSelected ? "bg-blue-50/30" : ""}`}>
              <div className="col-span-1">
                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(order.id)}
                  className="w-4 h-4 rounded border-black/20 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" />
              </div>
              <div className="col-span-2">
                <div className="font-mono text-xs font-semibold text-black">{order.id}</div>
                <div className="text-[10px] text-black/30">{order.country}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm font-medium text-black truncate">{order.customer}</div>
                <div className="text-xs text-black/30 truncate">{order.email}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-black/70 truncate">{order.plan}</div>
                <div className="text-xs text-black/30">{order.carrier}</div>
              </div>
              <div className="col-span-1 text-sm font-bold text-black">{order.amount}</div>
              <div className="col-span-1 text-xs text-black/50">{order.payment}</div>
              <div className="col-span-1">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                  <Icon className="w-3 h-3" />{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <div className="col-span-1 text-xs text-black/40">{order.date.split(", ")[0]}</div>
              <div className="col-span-1 flex justify-end gap-1">
                <button className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/60 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                <button className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/60 transition-colors"><Mail className="w-3.5 h-3.5" /></button>
                <button className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/60 transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-black/30">
        <span>Showing {filtered.length} of {ORDERS.length} orders</span>
        <div className="flex gap-1">
          {[1, 2, 3].map(p => (
            <button key={p} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === 1 ? "bg-black text-white" : "hover:bg-black/5 text-black/40"}`}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

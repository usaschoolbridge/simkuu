"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, DollarSign, ShoppingBag, Ban, Eye, Mail, MoreHorizontal, TrendingUp } from "lucide-react";

const CUSTOMERS = [
  { id: "USR-001", name: "Emma Wilson", email: "emma@example.com", country: "🇺🇸 US", joined: "Jan 15, 2026", orders: 8, spent: "$219.92", status: "active", plan: "Pro", lastOrder: "2h ago" },
  { id: "USR-002", name: "James Lee", email: "james@example.com", country: "🇨🇦 CA", joined: "Feb 3, 2026", orders: 5, spent: "$179.95", status: "active", plan: "Starter", lastOrder: "8m ago" },
  { id: "USR-003", name: "Sofia Garcia", email: "sofia@example.com", country: "🇲🇽 MX", joined: "Mar 21, 2026", orders: 3, spent: "$74.97", status: "active", plan: "Starter", lastOrder: "15m ago" },
  { id: "USR-004", name: "Noah Chen", email: "noah@example.com", country: "🇺🇸 US", joined: "Apr 1, 2026", orders: 12, spent: "$449.88", status: "active", plan: "Business", lastOrder: "22m ago" },
  { id: "USR-005", name: "Olivia Brown", email: "olivia@example.com", country: "🇬🇧 GB", joined: "Apr 17, 2026", orders: 2, spent: "$39.98", status: "suspended", plan: "Starter", lastOrder: "3d ago" },
  { id: "USR-006", name: "Liam Park", email: "liam@example.com", country: "🇰🇷 KR", joined: "May 5, 2026", orders: 6, spent: "$209.94", status: "active", plan: "Pro", lastOrder: "1h ago" },
  { id: "USR-007", name: "Ava Martinez", email: "ava@example.com", country: "🇪🇸 ES", joined: "May 20, 2026", orders: 4, spent: "$119.96", status: "active", plan: "Starter", lastOrder: "2d ago" },
  { id: "USR-008", name: "Ethan Johnson", email: "ethan@example.com", country: "🇺🇸 US", joined: "Jun 1, 2026", orders: 1, spent: "$34.99", status: "inactive", plan: "Starter", lastOrder: "Jun 25" },
];

const PLAN_COLORS: Record<string, string> = {
  Starter: "text-black/50 bg-black/5 border-black/10",
  Pro: "text-blue-600 bg-blue-50 border-blue-100",
  Business: "text-purple-600 bg-purple-50 border-purple-100",
};

const STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-600 bg-emerald-50 border-emerald-100",
  inactive: "text-black/30 bg-black/5 border-black/5",
  suspended: "text-red-600 bg-red-50 border-red-100",
};

export function AdminCustomersContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = CUSTOMERS.filter(c => {
    const matchSearch = [c.name, c.email, c.id].some(v => v.toLowerCase().includes(search.toLowerCase()));
    return matchSearch && (statusFilter === "all" || c.status === statusFilter);
  });

  const totalRevenue = CUSTOMERS.reduce((s, c) => s + parseFloat(c.spent.slice(1)), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total customers", value: CUSTOMERS.length.toString(), color: "text-blue-600", bg: "bg-blue-50" },
          { icon: TrendingUp, label: "Active", value: CUSTOMERS.filter(c => c.status === "active").length.toString(), color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: DollarSign, label: "Total revenue", value: `$${totalRevenue.toFixed(2)}`, color: "text-purple-600", bg: "bg-purple-50" },
          { icon: ShoppingBag, label: "Avg. orders/customer", value: (CUSTOMERS.reduce((s, c) => s + c.orders, 0) / CUSTOMERS.length).toFixed(1), color: "text-amber-600", bg: "bg-amber-50" },
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

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or ID…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
        </div>
        <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
          {["all", "active", "inactive", "suspended"].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === f ? "bg-white shadow-sm text-black" : "text-black/40"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-black/5 text-[10px] font-bold text-black/25 uppercase tracking-widest">
          <div className="col-span-3">Customer</div>
          <div className="col-span-1">Country</div>
          <div className="col-span-1">Plan</div>
          <div className="col-span-1">Orders</div>
          <div className="col-span-1">Spent</div>
          <div className="col-span-2">Joined</div>
          <div className="col-span-1">Last order</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className={`grid grid-cols-12 gap-3 items-center px-5 py-3.5 ${i < filtered.length - 1 ? "border-b border-black/[0.04]" : ""} hover:bg-black/[0.01] transition-colors`}>
            <div className="col-span-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {c.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-black truncate">{c.name}</div>
                <div className="text-xs text-black/30 truncate">{c.email}</div>
              </div>
            </div>
            <div className="col-span-1 text-sm text-black/50">{c.country}</div>
            <div className="col-span-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${PLAN_COLORS[c.plan]}`}>{c.plan}</span>
            </div>
            <div className="col-span-1 text-sm font-medium text-black">{c.orders}</div>
            <div className="col-span-1 text-sm font-bold text-black">{c.spent}</div>
            <div className="col-span-2 text-xs text-black/40">{c.joined}</div>
            <div className="col-span-1 text-xs text-black/40">{c.lastOrder}</div>
            <div className="col-span-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[c.status]}`}>{c.status}</span>
            </div>
            <div className="col-span-1 flex justify-end gap-1">
              <button className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/60 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
              <button className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/60 transition-colors"><Mail className="w-3.5 h-3.5" /></button>
              <button className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-red-500 transition-colors"><Ban className="w-3.5 h-3.5" /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

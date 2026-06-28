"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Users, DollarSign, ShoppingBag, Ban, Eye, Mail, TrendingUp, Loader2 } from "lucide-react";

interface Customer {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  walletBalance: string | number;
  _count: { orders: number };
  orders: { amount: string | number }[];
}

const STATUS_COLORS: Record<string, string> = {
  USER: "text-emerald-600 bg-emerald-50 border-emerald-100",
  ADMIN: "text-blue-600 bg-blue-50 border-blue-100",
  SUPER_ADMIN: "text-purple-600 bg-purple-50 border-purple-100",
};

export function AdminCustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function fetchCustomers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/customers?${params}`);
      if (res.ok) setCustomers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCustomers(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = statusFilter === "all"
    ? customers
    : customers.filter(c => {
        if (statusFilter === "active") return c._count.orders > 0;
        if (statusFilter === "inactive") return c._count.orders === 0;
        return true;
      });

  const totalRevenue = customers.reduce((s, c) => s + c.orders.reduce((a, o) => a + Number(o.amount), 0), 0);
  const totalOrders = customers.reduce((s, c) => s + c._count.orders, 0);

  const getInitials = (name: string | null, email: string) =>
    name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : email.slice(0, 2).toUpperCase();

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total customers", value: customers.length.toString(), color: "text-blue-600", bg: "bg-blue-50" },
          { icon: TrendingUp, label: "With orders", value: customers.filter(c => c._count.orders > 0).length.toString(), color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: DollarSign, label: "Total revenue", value: `$${totalRevenue.toFixed(2)}`, color: "text-purple-600", bg: "bg-purple-50" },
          { icon: ShoppingBag, label: "Avg. orders/customer", value: customers.length ? (totalOrders / customers.length).toFixed(1) : "0", color: "text-amber-600", bg: "bg-amber-50" },
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
          {["all", "active", "inactive"].map(f => (
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
          <div className="col-span-4">Customer</div>
          <div className="col-span-1">Role</div>
          <div className="col-span-1">Orders</div>
          <div className="col-span-2">Spent</div>
          <div className="col-span-2">Joined</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-black/30">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading customers…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-black/30 text-sm">No customers found</div>
        ) : filtered.map((c, i) => {
          const spent = c.orders.reduce((a, o) => a + Number(o.amount), 0);
          return (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className={`grid grid-cols-12 gap-3 items-center px-5 py-3.5 ${i < filtered.length - 1 ? "border-b border-black/[0.04]" : ""} hover:bg-black/[0.01] transition-colors`}>
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {getInitials(c.name, c.email)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-black truncate">{c.name ?? "—"}</div>
                  <div className="text-xs text-black/30 truncate">{c.email}</div>
                </div>
              </div>
              <div className="col-span-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[c.role] ?? STATUS_COLORS.USER}`}>
                  {c.role === "SUPER_ADMIN" ? "Super" : c.role === "ADMIN" ? "Admin" : "User"}
                </span>
              </div>
              <div className="col-span-1 text-sm font-medium text-black">{c._count.orders}</div>
              <div className="col-span-2 text-sm font-bold text-black">${spent.toFixed(2)}</div>
              <div className="col-span-2 text-xs text-black/40">{formatDate(c.createdAt)}</div>
              <div className="col-span-2 flex justify-end gap-1">
                <button className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/60 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                <button className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-black/60 transition-colors"><Mail className="w-3.5 h-3.5" /></button>
                <button className="p-1 rounded-lg hover:bg-black/5 text-black/25 hover:text-red-500 transition-colors"><Ban className="w-3.5 h-3.5" /></button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

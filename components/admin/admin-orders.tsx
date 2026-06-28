"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, Clock, XCircle, RefreshCw, Eye, Mail, MoreHorizontal, Download, Loader2 } from "lucide-react";

interface Order {
  id: string;
  status: string;
  amount: string | number;
  paymentProvider: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  plan: { id: string; name: string; carrier: { name: string } };
}

const STATUS_CFG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  ACTIVE: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: CheckCircle },
  PENDING: { color: "text-amber-600", bg: "bg-amber-50 border-amber-100", icon: Clock },
  PROCESSING: { color: "text-blue-600", bg: "bg-blue-50 border-blue-100", icon: Clock },
  REFUNDED: { color: "text-purple-600", bg: "bg-purple-50 border-purple-100", icon: RefreshCw },
  EXPIRED: { color: "text-black/30", bg: "bg-black/5 border-black/5", icon: XCircle },
  CANCELLED: { color: "text-black/30", bg: "bg-black/5 border-black/5", icon: XCircle },
};

const STATUS_LABELS = ["all", "active", "pending", "refunded", "expired"];

export function AdminOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.ok) setOrders(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchOrders(), 350);
    return () => clearTimeout(t);
  }, [search]);

  const toggleSelect = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === orders.length ? [] : orders.map(o => o.id));

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
  const formatAmount = (amount: string | number) => `$${Number(amount).toFixed(2)}`;
  const formatProvider = (p: string) => p.replace("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

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
            {STATUS_LABELS.map(f => (
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
            <input type="checkbox" checked={selected.length === orders.length && orders.length > 0} onChange={toggleAll}
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

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-black/30">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-black/30 text-sm">No orders found</div>
        ) : orders.map((order, i) => {
          const cfg = STATUS_CFG[order.status] ?? STATUS_CFG.PENDING;
          const Icon = cfg.icon;
          const isSelected = selected.includes(order.id);
          const shortId = `ORD-${order.id.slice(-4).toUpperCase()}`;
          return (
            <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className={`grid grid-cols-12 gap-3 items-center px-5 py-3.5 ${i < orders.length - 1 ? "border-b border-black/[0.04]" : ""} hover:bg-black/[0.01] transition-colors ${isSelected ? "bg-blue-50/30" : ""}`}>
              <div className="col-span-1">
                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(order.id)}
                  className="w-4 h-4 rounded border-black/20 text-blue-600 focus:ring-blue-500 focus:ring-offset-0" />
              </div>
              <div className="col-span-2">
                <div className="font-mono text-xs font-semibold text-black">{shortId}</div>
                <div className="text-[10px] text-black/30 font-mono">{order.id.slice(0, 8)}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm font-medium text-black truncate">{order.user.name ?? "Unknown"}</div>
                <div className="text-xs text-black/30 truncate">{order.user.email}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-black/70 truncate">{order.plan.name}</div>
                <div className="text-xs text-black/30">{order.plan.carrier.name}</div>
              </div>
              <div className="col-span-1 text-sm font-bold text-black">{formatAmount(order.amount)}</div>
              <div className="col-span-1 text-xs text-black/50">{formatProvider(order.paymentProvider)}</div>
              <div className="col-span-1">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                  <Icon className="w-3 h-3" />{order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="col-span-1 text-xs text-black/40">{formatDate(order.createdAt).split(",")[0]}</div>
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
        <span>Showing {orders.length} orders</span>
      </div>
    </div>
  );
}

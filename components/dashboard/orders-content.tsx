"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, CheckCircle, Clock, XCircle, RefreshCw, Download, Eye } from "lucide-react";

const ORDERS = [
  { id: "ORD-8821", plan: "T-Mobile Unlimited", carrier: "T-Mobile", date: "Jun 20, 2026", amount: "$29.99", status: "active", payment: "Visa •••• 4242" },
  { id: "ORD-8743", plan: "Verizon 50GB", carrier: "Verizon", date: "Jun 10, 2026", amount: "$39.99", status: "active", payment: "PayPal" },
  { id: "ORD-8601", plan: "AT&T 30GB", carrier: "AT&T", date: "May 28, 2026", amount: "$24.99", status: "expired", payment: "Visa •••• 4242" },
  { id: "ORD-8490", plan: "T-Mobile 10GB", carrier: "T-Mobile", date: "May 15, 2026", amount: "$14.99", status: "completed", payment: "Crypto (BTC)" },
  { id: "ORD-8341", plan: "Verizon 100GB", carrier: "Verizon", date: "May 1, 2026", amount: "$59.99", status: "completed", payment: "Visa •••• 4242" },
  { id: "ORD-8102", plan: "Mint Mobile 10GB", carrier: "Mint", date: "Apr 15, 2026", amount: "$19.99", status: "completed", payment: "PayPal" },
  { id: "ORD-7988", plan: "T-Mobile 5GB", carrier: "T-Mobile", date: "Apr 1, 2026", amount: "$9.99", status: "completed", payment: "USDT" },
  { id: "ORD-7801", plan: "AT&T Unlimited", carrier: "AT&T", date: "Mar 20, 2026", amount: "$34.99", status: "completed", payment: "Visa •••• 4242" },
];

const STATUS_CONFIG = {
  active: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", label: "Active" },
  completed: { icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50 border-blue-100", label: "Completed" },
  expired: { icon: XCircle, color: "text-black/30", bg: "bg-black/5 border-black/5", label: "Expired" },
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-100", label: "Pending" },
  refunded: { icon: RefreshCw, color: "text-purple-600", bg: "bg-purple-50 border-purple-100", label: "Refunded" },
};

export function OrdersContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = ORDERS.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.plan.toLowerCase().includes(search.toLowerCase()) ||
      o.carrier.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
        <div className="flex gap-1 bg-black/5 p-1 rounded-xl">
          {(["all", "active", "completed", "expired"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                statusFilter === f ? "bg-white shadow-sm text-black" : "text-black/40 hover:text-black/60"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-black/5 text-xs font-semibold text-black/30 uppercase tracking-wide">
          <div className="col-span-2">Order</div>
          <div className="col-span-3">Plan</div>
          <div className="col-span-2 hidden md:block">Date</div>
          <div className="col-span-2 hidden md:block">Payment</div>
          <div className="col-span-1">Amount</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-black/30 text-sm">No orders found.</div>
        ) : (
          filtered.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`grid grid-cols-12 gap-4 items-center px-5 py-4 ${
                  i < filtered.length - 1 ? "border-b border-black/5" : ""
                } hover:bg-black/[0.01] transition-colors`}
              >
                <div className="col-span-2">
                  <span className="font-mono text-sm font-medium text-black">{order.id}</span>
                </div>
                <div className="col-span-3">
                  <div className="text-sm font-medium text-black">{order.plan}</div>
                  <div className="text-xs text-black/30">{order.carrier}</div>
                </div>
                <div className="col-span-2 hidden md:block text-sm text-black/50">{order.date}</div>
                <div className="col-span-2 hidden md:block text-sm text-black/50">{order.payment}</div>
                <div className="col-span-1 text-sm font-semibold text-black">{order.amount}</div>
                <div className="col-span-1">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                    <Icon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-black/30 hover:text-black/60">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-black/30 hover:text-black/60">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <p className="text-xs text-black/30 text-center">Showing {filtered.length} of {ORDERS.length} orders</p>
    </div>
  );
}

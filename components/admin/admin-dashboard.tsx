"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Users, Wifi, TrendingUp, TrendingDown, ArrowRight, AlertTriangle, CheckCircle, Clock, XCircle, Loader2, Bitcoin, Package } from "lucide-react";
import Link from "next/link";

interface DashboardOrder {
  id: string;
  status: string;
  amount: string | number;
  createdAt: string;
  user: { name: string | null; email: string };
  plan: { name: string; carrier: { name: string } };
}

interface LowStockAlert { planId: string; planName: string; available: number; }

interface DashboardData {
  stats: {
    todayRevenue: number; todayOrders: number;
    totalRevenue: number; revenueChange: number;
    totalOrders: number; ordersChange: number;
    activeCustomers: number; customersChange: number;
    activeEsims: number;
    pendingOrders: number; confirmedOrders: number; expiredOrders: number;
    cryptoOrders: number; availableInventory: number;
  };
  recentOrders: DashboardOrder[];
  openTickets: number;
  lowStockAlerts: LowStockAlert[];
}

const STATUS_CFG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  ACTIVE: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: CheckCircle },
  PENDING: { color: "text-amber-600", bg: "bg-amber-50 border-amber-100", icon: Clock },
  PROCESSING: { color: "text-blue-600", bg: "bg-blue-50 border-blue-100", icon: Clock },
  REFUNDED: { color: "text-purple-600", bg: "bg-purple-50 border-purple-100", icon: XCircle },
  EXPIRED: { color: "text-black/30", bg: "bg-black/5 border-black/5", icon: XCircle },
  CANCELLED: { color: "text-black/30", bg: "bg-black/5 border-black/5", icon: XCircle },
};

function pct(n: number) {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-black/30">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading dashboard…
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-32 text-black/30 text-sm">Failed to load dashboard</div>;
  }

  const { stats, recentOrders, openTickets, lowStockAlerts } = data;

  const STATS = [
    { label: "Revenue (this month)", value: `$${stats.totalRevenue.toLocaleString()}`, change: pct(stats.revenueChange), trend: stats.revenueChange >= 0 ? "up" : "down", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Orders (this month)", value: stats.totalOrders.toLocaleString(), change: pct(stats.ordersChange), trend: stats.ordersChange >= 0 ? "up" : "down", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total customers", value: stats.activeCustomers.toLocaleString(), change: pct(stats.customersChange), trend: stats.customersChange >= 0 ? "up" : "down", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Active eSIMs", value: stats.activeEsims.toLocaleString(), change: "live", trend: "up", icon: Wifi, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-5">
      {/* Today's highlight */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-r from-black to-gray-800 rounded-2xl text-white">
        <div>
          <p className="text-xs text-white/50 mb-1">Today&apos;s revenue</p>
          <p className="text-2xl font-black">${stats.todayRevenue.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-white/50 mb-1">Today&apos;s orders</p>
          <p className="text-2xl font-black">{stats.todayOrders}</p>
        </div>
      </motion.div>

      {/* Alerts */}
      {openTickets > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm bg-blue-50 border-blue-100 text-blue-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{openTickets} open support ticket{openTickets !== 1 ? "s" : ""} need attention</span>
          <Link href="/admin/support" className="text-xs font-medium underline">View</Link>
        </motion.div>
      )}
      {lowStockAlerts?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 px-4 py-3 rounded-xl border text-sm bg-amber-50 border-amber-200 text-amber-800">
          <Package className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Low inventory: </span>
            {lowStockAlerts.map(a => `${a.planName} (${a.available} left)`).join(", ")}
          </div>
        </motion.div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${s.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                {s.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change}
              </div>
            </div>
            <div className="font-display text-2xl font-black text-black mb-0.5">{s.value}</div>
            <div className="text-xs text-black/40">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Payment status breakdown */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Pending",   value: stats.pendingOrders,   color: "text-amber-600",   bg: "bg-amber-50", icon: Clock },
          { label: "Confirmed", value: stats.confirmedOrders, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle },
          { label: "Expired",   value: stats.expiredOrders,   color: "text-black/30",    bg: "bg-black/5", icon: XCircle },
          { label: "Crypto",    value: stats.cryptoOrders,    color: "text-amber-500",   bg: "bg-amber-50", icon: Bitcoin },
          { label: "Inventory", value: stats.availableInventory, color: "text-blue-600", bg: "bg-blue-50", icon: Package },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-black/[0.06] p-3 shadow-sm flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <div className="font-bold text-base text-black">{s.value}</div>
              <div className="text-[10px] text-black/40">{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Recent orders */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <h3 className="font-display font-bold text-base text-black">Recent orders</h3>
          <Link href="/admin/orders" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-12 gap-4 px-5 py-2 text-[10px] font-bold text-black/20 uppercase tracking-widest border-b border-black/5">
          <div className="col-span-2">Order ID</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-3">Plan</div>
          <div className="col-span-1">Amount</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Time</div>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 text-black/30 text-sm">No orders yet</div>
        ) : recentOrders.map((o, i) => {
          const cfg = STATUS_CFG[o.status] ?? STATUS_CFG.PENDING;
          const Icon = cfg.icon;
          return (
            <motion.div key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.03 }}
              className={`grid grid-cols-12 gap-4 items-center px-5 py-3.5 ${i < recentOrders.length - 1 ? "border-b border-black/[0.04]" : ""} hover:bg-black/[0.01] transition-colors cursor-pointer`}>
              <div className="col-span-2 font-mono text-xs font-semibold text-black">{o.id.slice(0, 8)}</div>
              <div className="col-span-3 text-sm text-black/70 font-medium truncate">{o.user.name ?? o.user.email}</div>
              <div className="col-span-3 text-sm text-black/50 truncate">{o.plan.name}</div>
              <div className="col-span-1 text-sm font-bold text-black">${Number(o.amount).toFixed(2)}</div>
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                  <Icon className="w-3 h-3" />{o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                </span>
              </div>
              <div className="col-span-1 text-xs text-black/25 text-right">{timeAgo(o.createdAt)}</div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

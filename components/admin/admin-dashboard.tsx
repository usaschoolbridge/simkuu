"use client";

import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Users, Wifi, TrendingUp, TrendingDown, ArrowRight, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";

const STATS = [
  { label: "Total Revenue", value: "$48,291", change: "+18.4%", trend: "up", sub: "vs last month", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Total Orders", value: "1,847", change: "+12.1%", trend: "up", sub: "vs last month", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Active Customers", value: "938", change: "+8.7%", trend: "up", sub: "vs last month", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Active eSIMs", value: "2,104", change: "-2.3%", trend: "down", sub: "vs last month", icon: Wifi, color: "text-amber-600", bg: "bg-amber-50" },
];

// Sparkline bars — fake revenue data for last 14 days
const REVENUE_BARS = [820, 1040, 960, 1280, 1100, 1460, 1380, 1600, 1240, 1720, 1580, 1850, 1690, 1249];

const RECENT_ORDERS = [
  { id: "ORD-8941", customer: "Emma Wilson", plan: "T-Mobile Unlimited", amount: "$29.99", status: "active", time: "2m ago" },
  { id: "ORD-8940", customer: "James Lee", plan: "Verizon 100GB", amount: "$59.99", status: "pending", time: "8m ago" },
  { id: "ORD-8939", customer: "Sofia Garcia", plan: "AT&T 30GB", amount: "$24.99", status: "active", time: "15m ago" },
  { id: "ORD-8938", customer: "Noah Chen", plan: "Mint 10GB", amount: "$14.99", status: "active", time: "22m ago" },
  { id: "ORD-8937", customer: "Olivia Brown", plan: "T-Mobile 5GB", amount: "$9.99", status: "refunded", time: "41m ago" },
  { id: "ORD-8936", customer: "Liam Park", plan: "Verizon 50GB", amount: "$39.99", status: "active", time: "1h ago" },
];

const STATUS_CFG = {
  active: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: CheckCircle },
  pending: { color: "text-amber-600", bg: "bg-amber-50 border-amber-100", icon: Clock },
  refunded: { color: "text-purple-600", bg: "bg-purple-50 border-purple-100", icon: XCircle },
  expired: { color: "text-black/30", bg: "bg-black/5 border-black/5", icon: XCircle },
};

const ALERTS = [
  { type: "fraud", message: "Suspicious activity on ORD-8921 — 3 failed payment attempts", time: "10m ago", level: "high" },
  { type: "low", message: "T-Mobile eSIM stock running low (12 remaining)", time: "1h ago", level: "medium" },
  { type: "support", message: "3 open support tickets unassigned for >2 hours", time: "2h ago", level: "low" },
];

const CARRIER_BREAKDOWN = [
  { carrier: "T-Mobile", orders: 782, revenue: "$21,840", pct: 45, color: "bg-pink-500" },
  { carrier: "Verizon", orders: 521, revenue: "$18,244", pct: 30, color: "bg-red-600" },
  { carrier: "AT&T", orders: 312, revenue: "$6,552", pct: 18, color: "bg-blue-500" },
  { carrier: "MVNO", orders: 122, revenue: "$1,655", pct: 7, color: "bg-purple-500" },
];

export function AdminDashboard() {
  const maxBar = Math.max(...REVENUE_BARS);

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {ALERTS.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
          {ALERTS.map((alert, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm ${
              alert.level === "high" ? "bg-red-50 border-red-100 text-red-700" :
              alert.level === "medium" ? "bg-amber-50 border-amber-100 text-amber-700" :
              "bg-blue-50 border-blue-100 text-blue-700"
            }`}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{alert.message}</span>
              <span className="text-xs opacity-60 flex-shrink-0">{alert.time}</span>
            </div>
          ))}
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Revenue chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="xl:col-span-2 bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-base text-black">Revenue (last 14 days)</h3>
              <p className="text-xs text-black/30 mt-0.5">Daily revenue in USD</p>
            </div>
            <div className="text-right">
              <div className="font-display font-black text-xl text-black">$1,249</div>
              <div className="text-xs text-emerald-600">Today</div>
            </div>
          </div>
          <div className="flex items-end gap-1 h-32">
            {REVENUE_BARS.map((v, i) => {
              const pct = (v / maxBar) * 100;
              const isToday = i === REVENUE_BARS.length - 1;
              return (
                <motion.div key={i} className="flex-1 flex flex-col justify-end" title={`$${v}`}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ delay: 0.3 + i * 0.03, duration: 0.4, ease: "easeOut" }}
                    className={`rounded-t-md ${isToday ? "bg-blue-500" : "bg-black/8 hover:bg-black/15"} transition-colors cursor-pointer`}
                  />
                </motion.div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-black/20 mt-2">
            <span>14d ago</span><span>7d ago</span><span>Today</span>
          </div>
        </motion.div>

        {/* Carrier breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
          <h3 className="font-display font-bold text-base text-black mb-5">Carrier breakdown</h3>
          <div className="space-y-4">
            {CARRIER_BREAKDOWN.map((c, i) => (
              <div key={c.carrier}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-black">{c.carrier}</span>
                  <span className="text-sm font-bold text-black">{c.revenue}</span>
                </div>
                <div className="h-2 bg-black/5 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${c.color}`}
                    initial={{ width: 0 }} animate={{ width: `${c.pct}%` }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: "easeOut" }} />
                </div>
                <div className="text-xs text-black/30 mt-1">{c.orders} orders · {c.pct}%</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

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

        {RECENT_ORDERS.map((o, i) => {
          const cfg = STATUS_CFG[o.status as keyof typeof STATUS_CFG];
          const Icon = cfg.icon;
          return (
            <motion.div key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.03 }}
              className={`grid grid-cols-12 gap-4 items-center px-5 py-3.5 ${i < RECENT_ORDERS.length - 1 ? "border-b border-black/[0.04]" : ""} hover:bg-black/[0.01] transition-colors cursor-pointer`}>
              <div className="col-span-2 font-mono text-xs font-semibold text-black">{o.id}</div>
              <div className="col-span-3 text-sm text-black/70 font-medium truncate">{o.customer}</div>
              <div className="col-span-3 text-sm text-black/50 truncate">{o.plan}</div>
              <div className="col-span-1 text-sm font-bold text-black">{o.amount}</div>
              <div className="col-span-2">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                  <Icon className="w-3 h-3" />{o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                </span>
              </div>
              <div className="col-span-1 text-xs text-black/25 text-right">{o.time}</div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

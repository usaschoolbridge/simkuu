"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Wifi, ShoppingBag, DollarSign, Users, ArrowRight, CheckCircle, Clock, XCircle, Zap } from "lucide-react";
import { StatCard } from "./stat-card";

const STATS = [
  { label: "Active eSIMs", value: "3", change: "+1 this month", trend: "up" as const, icon: Wifi, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
  { label: "Total Orders", value: "12", change: "+3 this month", trend: "up" as const, icon: ShoppingBag, iconColor: "text-purple-600", iconBg: "bg-purple-50" },
  { label: "Total Spent", value: "$247.80", change: "+$89.97", trend: "up" as const, icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
  { label: "Referral Earnings", value: "$34.00", change: "+$12.00", trend: "up" as const, icon: Users, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
];

const RECENT_ORDERS = [
  { id: "ORD-8821", plan: "T-Mobile Unlimited", carrier: "T-Mobile", date: "Jun 20, 2026", amount: "$29.99", status: "active" },
  { id: "ORD-8743", plan: "Verizon 50GB", carrier: "Verizon", date: "Jun 10, 2026", amount: "$39.99", status: "active" },
  { id: "ORD-8601", plan: "AT&T 30GB", carrier: "AT&T", date: "May 28, 2026", amount: "$24.99", status: "expired" },
  { id: "ORD-8490", plan: "T-Mobile 10GB", carrier: "T-Mobile", date: "May 15, 2026", amount: "$14.99", status: "completed" },
];

const ACTIVE_ESIMS = [
  { id: "esim-1", carrier: "T-Mobile", plan: "Unlimited", dataUsed: 18.4, dataTotal: null, signal: "5G", status: "active", color: "from-pink-500 to-red-500" },
  { id: "esim-2", carrier: "Verizon", plan: "50GB", dataUsed: 22.1, dataTotal: 50, signal: "5G", status: "active", color: "from-red-600 to-red-800" },
  { id: "esim-3", carrier: "T-Mobile MVNO", plan: "5GB", dataUsed: 3.8, dataTotal: 5, signal: "4G", status: "active", color: "from-blue-500 to-cyan-500" },
];

const STATUS_CONFIG = {
  active: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", label: "Active" },
  completed: { icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-50", label: "Completed" },
  expired: { icon: XCircle, color: "text-black/30", bg: "bg-black/5", label: "Expired" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", label: "Pending" },
};

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="font-display text-2xl font-black text-black mb-1">Good morning, Alex 👋</h2>
        <p className="text-black/40 text-sm">Here&apos;s what&apos;s happening with your eSIMs today.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.05} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active eSIMs */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-black">Active eSIMs</h3>
            <Link href="/dashboard/esims" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {ACTIVE_ESIMS.map((esim, i) => {
              const pct = esim.dataTotal ? (esim.dataUsed / esim.dataTotal) * 100 : 32;
              return (
                <motion.div
                  key={esim.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${esim.color} flex items-center justify-center`}>
                        <Wifi className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-black">{esim.carrier}</div>
                        <div className="text-xs text-black/40">{esim.plan} · {esim.signal}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-black/40">Data used</span>
                      <span className="font-medium text-black">
                        {esim.dataUsed} GB {esim.dataTotal ? `/ ${esim.dataTotal} GB` : "/ Unlimited"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${esim.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ delay: 0.3 + i * 0.06, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    {esim.dataTotal && pct > 80 && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Running low — consider upgrading
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-black">Recent Orders</h3>
            <Link href="/dashboard/orders" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
              All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
            {RECENT_ORDERS.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className={`p-4 flex items-center gap-3 ${i < RECENT_ORDERS.length - 1 ? "border-b border-black/5" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black truncate">{order.plan}</div>
                    <div className="text-xs text-black/30">{order.date}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-black">{order.amount}</div>
                    <div className={`text-xs ${cfg.color}`}>{cfg.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="mt-4 space-y-2">
            <Link href="/plans"
              className="flex items-center justify-between p-4 bg-black text-white rounded-2xl hover:bg-black/80 transition-colors group">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5" />
                <div>
                  <div className="text-sm font-semibold">Buy new eSIM</div>
                  <div className="text-xs text-white/50">Starting at $9.99/month</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

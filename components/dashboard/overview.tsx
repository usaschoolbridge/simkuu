"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wifi, ShoppingBag, DollarSign, Users, ArrowRight, CheckCircle, Clock, XCircle, Zap, Loader2, Copy, Check } from "lucide-react";
import { StatCard } from "./stat-card";

interface OverviewData {
  customerId: string;
  customerNo: number;
  name: string | null;
  email: string;
  memberSince: string;
  stats: { activeEsims: number; totalOrders: number; totalSpent: string; walletBalance: string };
  recentOrders: { id: string; displayId: string; invoiceNo: string | null; plan: string; carrier: string; date: string; amount: string; status: string }[];
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  active: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", label: "Active" },
  completed: { icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-50", label: "Completed" },
  expired: { icon: XCircle, color: "text-black/30", bg: "bg-black/5", label: "Expired" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-50", label: "Pending" },
  cancelled: { icon: XCircle, color: "text-black/30", bg: "bg-black/5", label: "Cancelled" },
  refunded: { icon: XCircle, color: "text-purple-500", bg: "bg-purple-50", label: "Refunded" },
  processing: { icon: Clock, color: "text-blue-500", bg: "bg-blue-50", label: "Processing" },
};

export function DashboardOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/overview")
      .then(r => r.ok ? r.json() : null)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function copyId() {
    if (!data) return;
    navigator.clipboard.writeText(data.customerId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-black/30">
        <Loader2 className="w-6 h-6 animate-spin" /> Loading dashboard…
      </div>
    );
  }

  // Build stat cards from real data
  const STATS = data ? [
    { label: "Active eSIMs", value: String(data.stats.activeEsims), change: "live", trend: "up" as const, icon: Wifi, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
    { label: "Total Orders", value: String(data.stats.totalOrders), change: "all time", trend: "up" as const, icon: ShoppingBag, iconColor: "text-purple-600", iconBg: "bg-purple-50" },
    { label: "Total Spent", value: data.stats.totalSpent, change: "all time", trend: "up" as const, icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
    { label: "Wallet Balance", value: data.stats.walletBalance, change: "available", trend: "up" as const, icon: Users, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
  ] : [];

  const firstName = data?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      {/* Welcome + Customer ID */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-display text-2xl font-black text-black mb-1">Welcome back, {firstName} 👋</h2>
            <p className="text-black/40 text-sm">Member since {data?.memberSince ?? "—"}</p>
          </div>
          {data?.customerId && (
            <button onClick={copyId}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 border border-black/10 hover:bg-black/10 transition-colors group">
              <div>
                <div className="text-[10px] text-black/30 uppercase tracking-wider">Customer ID</div>
                <div className="font-mono text-sm font-bold text-black">{data.customerId}</div>
              </div>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-black/20 group-hover:text-black/50 transition-colors" />}
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.05} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Placeholder eSIM section */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-black">Active eSIMs</h3>
            <Link href="/dashboard/esims" className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {data?.stats.activeEsims === 0 ? (
            <div className="bg-white rounded-2xl border border-black/[0.06] p-8 text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center mx-auto mb-3">
                <Wifi className="w-6 h-6 text-black/20" />
              </div>
              <p className="text-sm font-medium text-black mb-1">No active eSIMs yet</p>
              <p className="text-xs text-black/40 mb-4">Purchase a plan to get started instantly.</p>
              <Link href="/plans" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors">
                Browse Plans <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <Link href="/dashboard/esims" className="block bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-black">{data?.stats.activeEsims} active eSIM{(data?.stats.activeEsims ?? 0) !== 1 ? "s" : ""}</div>
                  <div className="text-xs text-black/40">Click to view details, QR codes, and data usage</div>
                </div>
                <ArrowRight className="w-4 h-4 text-black/20 ml-auto" />
              </div>
            </Link>
          )}
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
            {!data?.recentOrders.length ? (
              <div className="text-center py-8 text-black/30 text-sm">No orders yet</div>
            ) : data.recentOrders.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + i * 0.05 }}
                  className={`p-4 flex items-center gap-3 ${i < data.recentOrders.length - 1 ? "border-b border-black/5" : ""}`}>
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black truncate">{order.plan}</div>
                    <div className="text-xs text-black/30 font-mono">{order.displayId}</div>
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
                  <div className="text-sm font-semibold">Get a new plan</div>
                  <div className="text-xs text-white/50">Instant eSIM delivery</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

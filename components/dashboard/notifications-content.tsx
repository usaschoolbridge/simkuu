"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Wifi, ShoppingBag, Gift, AlertCircle, CheckCircle, Info, X, Loader2, RefreshCw } from "lucide-react";

interface Notif {
  id: string; title: string; body: string; type: string;
  href: string | null; isRead: boolean; timeAgo: string;
}

const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; Icon: React.ElementType }> = {
  wallet:   { color: "text-blue-600",    bg: "bg-blue-50",   border: "border-blue-100",   Icon: Info },
  referral: { color: "text-purple-600",  bg: "bg-purple-50", border: "border-purple-100", Icon: Gift },
  order:    { color: "text-emerald-600", bg: "bg-emerald-50",border: "border-emerald-100",Icon: ShoppingBag },
  esim:     { color: "text-emerald-600", bg: "bg-emerald-50",border: "border-emerald-100",Icon: Wifi },
  alert:    { color: "text-amber-600",   bg: "bg-amber-50",  border: "border-amber-100",  Icon: AlertCircle },
  success:  { color: "text-emerald-600", bg: "bg-emerald-50",border: "border-emerald-100",Icon: CheckCircle },
  default:  { color: "text-blue-600",    bg: "bg-blue-50",   border: "border-blue-100",   Icon: Bell },
};

function getCfg(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.default;
}

export function NotificationsContent() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const r = await fetch("/api/dashboard/notifications");
    if (r.ok) setNotifs(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const unread = notifs.filter((n) => !n.isRead).length;

  async function markRead(id: string) {
    setNotifs((ns) => ns.map((n) => n.id === id ? { ...n, isRead: true } : n));
    await fetch("/api/dashboard/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function markAllRead() {
    setNotifs((ns) => ns.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/dashboard/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_all_read" }),
    });
  }

  function dismiss(id: string) {
    setNotifs((ns) => ns.filter((n) => n.id !== id));
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-2 text-black/30">
      <Loader2 className="w-6 h-6 animate-spin" /> Loading notifications…
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">{unread} unread</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {unread > 0 && (
            <button onClick={markAllRead} className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
              Mark all as read
            </button>
          )}
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-black/5 text-black/30 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {notifs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Bell className="w-10 h-10 text-black/10" />
          <p className="text-sm text-black/30">No notifications yet.</p>
          <p className="text-xs text-black/20">You'll be notified about orders, payments, and referrals here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifs.map((n, i) => {
              const cfg = getCfg(n.type);
              const Icon = cfg.Icon;
              return (
                <motion.div key={n.id} layout
                  initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => markRead(n.id)}
                  className={`group relative flex gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    n.isRead ? "bg-white border-black/5 hover:bg-black/[0.01]" : "bg-blue-50/30 border-blue-100 hover:bg-blue-50/50"
                  }`}
                >
                  {!n.isRead && <div className="absolute top-4 right-10 w-2 h-2 rounded-full bg-blue-500" />}
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className={`text-sm font-semibold mb-0.5 ${n.isRead ? "text-black/70" : "text-black"}`}>{n.title}</div>
                    <div className="text-sm text-black/50 leading-relaxed">{n.body}</div>
                    <div className="text-xs text-black/30 mt-2">{n.timeAgo}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/5 transition-colors text-black/20 hover:text-black/50 opacity-0 group-hover:opacity-100">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

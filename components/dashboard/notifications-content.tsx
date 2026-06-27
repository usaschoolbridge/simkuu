"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Wifi, ShoppingBag, Gift, AlertCircle, CheckCircle, Info, X } from "lucide-react";

const INITIAL_NOTIFICATIONS = [
  { id: "n1", type: "warning", icon: AlertCircle, title: "Data running low", body: "Your Verizon 50GB plan has 27.9 GB remaining (44%). Consider upgrading soon.", time: "2 hours ago", read: false },
  { id: "n2", type: "success", icon: CheckCircle, title: "eSIM activated", body: "Your T-Mobile Unlimited eSIM was activated successfully. You're now live on 5G!", time: "3 days ago", read: false },
  { id: "n3", type: "info", icon: Gift, title: "Referral bonus earned", body: "You earned $12.00 for referring John D. The credit has been added to your wallet.", time: "5 days ago", read: false },
  { id: "n4", type: "info", icon: ShoppingBag, title: "Order confirmed", body: "Order ORD-8821 for T-Mobile Unlimited has been confirmed. Your QR code is ready.", time: "Jun 20, 2026", read: true },
  { id: "n5", type: "info", icon: Info, title: "New plan available", body: "T-Mobile just launched a new 30GB plan at $19.99/month. Check it out!", time: "Jun 18, 2026", read: true },
  { id: "n6", type: "success", icon: CheckCircle, title: "Payment successful", body: "Your payment of $39.99 for Verizon 50GB was processed successfully via PayPal.", time: "Jun 10, 2026", read: true },
];

const TYPE_CONFIG = {
  warning: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  success: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  info: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  error: { color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
};

export function NotificationsContent() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications((ns) => ns.filter((n) => n.id !== id));
  const markRead = (id: string) => setNotifications((ns) => ns.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">{unread} unread</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {notifications.map((n, i) => {
            const cfg = TYPE_CONFIG[n.type as keyof typeof TYPE_CONFIG];
            const Icon = n.icon;
            return (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => markRead(n.id)}
                className={`relative flex gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  n.read
                    ? "bg-white border-black/5 hover:bg-black/[0.01]"
                    : "bg-blue-50/30 border-blue-100 hover:bg-blue-50/50"
                }`}
              >
                {!n.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
                )}
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <div className={`text-sm font-semibold mb-0.5 ${n.read ? "text-black/70" : "text-black"}`}>{n.title}</div>
                  <div className="text-sm text-black/50 leading-relaxed">{n.body}</div>
                  <div className="text-xs text-black/30 mt-2">{n.time}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  className="absolute top-3 right-3 p-1 rounded-lg hover:bg-black/5 transition-colors text-black/20 hover:text-black/50 opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 text-black/10 mx-auto mb-3" />
            <p className="text-black/30 text-sm">No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}

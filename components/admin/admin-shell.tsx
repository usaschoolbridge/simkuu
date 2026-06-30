"use client";

import { useState } from "react";
import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, ShoppingBag, Users, Package, Tag, LifeBuoy,
  BarChart2, ShieldAlert, Menu, X, ChevronRight, Bell, Settings,
  Wifi, LogOut, Zap, Globe, ChevronDown, Boxes
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: string; badgeColor?: string };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Core",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag, badge: "12" },
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Plans & Pricing", href: "/admin/plans", icon: Package },
      { label: "eSIM Inventory", href: "/admin/inventory", icon: Boxes },
      { label: "Coupons", href: "/admin/coupons", icon: Tag },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Support", href: "/admin/support", icon: LifeBuoy, badge: "3" },
      { label: "Fraud Detection", href: "/admin/fraud", icon: ShieldAlert, badge: "2", badgeColor: "bg-red-500" },
    ],
  },
];

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full bg-[#0a0a0a] text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Wifi className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-black text-sm text-white">Simkuu</span>
            <span className="block text-[10px] text-white/30 -mt-0.5">Admin Console</span>
          </div>
        </Link>
        {mobile && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5">
            <X className="w-4 h-4 text-white/40" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label}>
            <p className="px-3 text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5">{label}</p>
            <div className="space-y-0.5">
              {items.map(({ label: itemLabel, href, icon: Icon, badge, badgeColor }) => {
                const active = pathname === href;
                return (
                  <Link key={href} href={href} onClick={onClose}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/80"
                    }`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-blue-400" : "text-white/20 group-hover:text-white/50"}`} />
                    <span className="flex-1">{itemLabel}</span>
                    {badge && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${badgeColor ?? "bg-blue-500"} text-white`}>
                        {badge}
                      </span>
                    )}
                    {active && <ChevronRight className="w-3 h-3 text-white/30" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Live stats ticker */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-white/50 font-medium">Live today</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Revenue", value: "$1,249" },
            { label: "Orders", value: "42" },
            { label: "New users", value: "17" },
            { label: "Active", value: "938" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-sm font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-white/30">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin user */}
      <div className="border-t border-white/5 px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-black">SA</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white">Super Admin</div>
            <div className="text-[10px] text-white/30">admin@simkuu.com</div>
          </div>
          <button
            onClick={async () => {
              await fetch("/api/admin/auth", { method: "DELETE" });
              window.location.href = "/admin-login";
            }}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5 text-white/30 hover:text-white/60 transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function AdminTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const currentPage = NAV_GROUPS.flatMap(g => g.items).find(n => n.href === pathname)?.label ?? "Admin";

  return (
    <header className="h-14 border-b border-black/5 bg-white/90 backdrop-blur-sm flex items-center justify-between px-5 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-xl hover:bg-black/5 transition-colors">
          <Menu className="w-5 h-5 text-black/40" />
        </button>
        <div className="flex items-center gap-1.5 text-sm">
          <Link href="/admin" className="text-black/30 hover:text-black transition-colors">Admin</Link>
          {pathname !== "/admin" && <><ChevronRight className="w-3.5 h-3.5 text-black/20" /><span className="text-black font-medium">{currentPage}</span></>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/" target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 text-xs font-medium text-black/50 hover:bg-black/5 transition-colors">
          <Globe className="w-3.5 h-3.5" /> View site
        </Link>
        <button className="relative p-2 rounded-xl hover:bg-black/5 transition-colors">
          <Bell className="w-4 h-4 text-black/40" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-black">SA</div>
      </div>
    </header>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-56 xl:w-60 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden">
              <Sidebar mobile onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 xl:p-6 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

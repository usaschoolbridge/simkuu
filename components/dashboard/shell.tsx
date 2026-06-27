"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Wifi, ShoppingBag, FileText, User, Wallet,
  Gift, Bell, LifeBuoy, Settings, LogOut, Menu, X, ChevronRight,
  Zap, Shield
} from "lucide-react";

const NAV = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My eSIMs", href: "/dashboard/esims", icon: Wifi },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { label: "Referrals", href: "/dashboard/referrals", icon: Gift },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, badge: 3 },
  { label: "Support", href: "/dashboard/support", icon: LifeBuoy },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

// Mock user
const MOCK_USER = { name: "Alex Johnson", email: "alex@example.com", plan: "Pro", avatar: "AJ" };

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={`flex flex-col h-full bg-white ${mobile ? "w-full" : "w-64"}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-black/5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Wifi className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-black text-base text-black">Simkuu</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/5 transition-colors">
            <X className="w-5 h-5 text-black/40" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                active
                  ? "bg-black text-white shadow-md shadow-black/10"
                  : "text-black/50 hover:bg-black/5 hover:text-black"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-black/30 group-hover:text-black/60"}`} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  active ? "bg-white/20 text-white" : "bg-blue-500 text-white"
                }`}>
                  {badge}
                </span>
              )}
              {active && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Plan upgrade banner */}
      <div className="mx-3 mb-3 p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-bold text-blue-700">Upgrade to Business</span>
        </div>
        <p className="text-xs text-blue-600/70 mb-2.5">Get bulk pricing and API access for your team.</p>
        <Link href="/pricing" onClick={onClose}
          className="block text-center py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
          View plans
        </Link>
      </div>

      {/* User */}
      <div className="border-t border-black/5 px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {MOCK_USER.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-black truncate">{MOCK_USER.name}</div>
            <div className="text-xs text-black/30 truncate">{MOCK_USER.email}</div>
          </div>
          <button className="p-1 rounded-lg hover:bg-black/10 transition-colors text-black/30 hover:text-black/60">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const currentPage = NAV.find((n) => n.href === pathname)?.label ?? "Dashboard";

  return (
    <header className="h-16 border-b border-black/5 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-black/5 transition-colors"
        >
          <Menu className="w-5 h-5 text-black/50" />
        </button>
        <div>
          <h1 className="font-display font-bold text-lg text-black">{currentPage}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/dashboard/notifications" className="relative p-2 rounded-xl hover:bg-black/5 transition-colors">
          <Bell className="w-5 h-5 text-black/40" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
        </Link>
        <Link href="/dashboard/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {MOCK_USER.avatar}
        </Link>
      </div>
    </header>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50/50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 border-r border-black/5 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden shadow-2xl"
            >
              <Sidebar mobile onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

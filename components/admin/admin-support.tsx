"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Clock, CheckCircle, AlertCircle, User, Send, ChevronRight } from "lucide-react";

const TICKETS = [
  { id: "TKT-1048", subject: "eSIM not activating on iPhone 16 Pro", customer: "Emma Wilson", email: "emma@example.com", status: "open", priority: "high", created: "2h ago", lastMessage: "I tried restarting but still no connection." },
  { id: "TKT-1047", subject: "Request refund for ORD-8937", customer: "Olivia Brown", email: "olivia@example.com", status: "open", priority: "medium", created: "5h ago", lastMessage: "I accidentally purchased the wrong plan." },
  { id: "TKT-1046", subject: "Data speed seems slower than expected", customer: "James Lee", email: "james@example.com", status: "open", priority: "low", created: "8h ago", lastMessage: "Getting only 4G speeds even in 5G coverage areas." },
  { id: "TKT-1045", subject: "Can I transfer eSIM to new device?", customer: "Noah Chen", email: "noah@example.com", status: "resolved", priority: "low", created: "Jun 26", lastMessage: "Thank you for the quick response!" },
  { id: "TKT-1044", subject: "Invoice not received for ORD-8890", customer: "Ava Martinez", email: "ava@example.com", status: "resolved", priority: "low", created: "Jun 25", lastMessage: "Got it, thanks!" },
];

const PRIORITY_CFG = {
  high: { color: "text-red-600", bg: "bg-red-50 border-red-100" },
  medium: { color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  low: { color: "text-black/40", bg: "bg-black/5 border-black/5" },
};

const STATUS_CFG = {
  open: { color: "text-blue-600", bg: "bg-blue-50 border-blue-100", icon: Clock },
  resolved: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: CheckCircle },
};

export function AdminSupportContent() {
  const [selected, setSelected] = useState(TICKETS[0]);
  const [reply, setReply] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = TICKETS.filter(t => filter === "all" || t.status === filter);

  return (
    <div className="flex gap-5 h-[calc(100vh-10rem)]">
      {/* Ticket list */}
      <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col">
        <div className="flex gap-1 bg-black/5 p-1 rounded-xl mb-4">
          {["all", "open", "resolved"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filter === f ? "bg-white shadow-sm text-black" : "text-black/40"}`}>
              {f} {f === "open" ? `(${TICKETS.filter(t => t.status === "open").length})` : ""}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto">
          {filtered.map((ticket, i) => {
            const StatusIcon = STATUS_CFG[ticket.status as keyof typeof STATUS_CFG].icon;
            const isActive = selected.id === ticket.id;
            return (
              <motion.button key={ticket.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(ticket)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${isActive ? "bg-black text-white border-black shadow-md" : "bg-white border-black/[0.06] hover:shadow-md"}`}>
                <div className="flex items-start justify-between mb-1.5">
                  <span className={`font-mono text-xs ${isActive ? "text-white/50" : "text-black/30"}`}>{ticket.id}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${PRIORITY_CFG[ticket.priority as keyof typeof PRIORITY_CFG].bg} ${PRIORITY_CFG[ticket.priority as keyof typeof PRIORITY_CFG].color}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <div className={`text-sm font-semibold mb-1 line-clamp-1 ${isActive ? "text-white" : "text-black"}`}>{ticket.subject}</div>
                <div className={`text-xs mb-2 line-clamp-1 ${isActive ? "text-white/50" : "text-black/40"}`}>{ticket.lastMessage}</div>
                <div className={`flex items-center justify-between text-xs ${isActive ? "text-white/40" : "text-black/30"}`}>
                  <span>{ticket.customer}</span>
                  <span>{ticket.created}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Ticket detail */}
      <div className="flex-1 bg-white rounded-2xl border border-black/[0.06] shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
          <div>
            <div className="font-display font-bold text-base text-black">{selected.subject}</div>
            <div className="text-xs text-black/40 mt-0.5">{selected.id} · {selected.customer} · {selected.email}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${PRIORITY_CFG[selected.priority as keyof typeof PRIORITY_CFG].bg} ${PRIORITY_CFG[selected.priority as keyof typeof PRIORITY_CFG].color}`}>
              {selected.priority} priority
            </span>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors">
              <CheckCircle className="w-3.5 h-3.5" /> Mark resolved
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Customer message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {selected.customer.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-sm font-semibold text-black">{selected.customer}</span>
                <span className="text-xs text-black/30">{selected.created}</span>
              </div>
              <div className="bg-black/[0.03] rounded-2xl rounded-tl-none px-4 py-3 text-sm text-black/70 leading-relaxed">
                {selected.lastMessage}
              </div>
            </div>
          </div>

          {/* Admin reply placeholder */}
          <div className="flex gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">SA</div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 justify-end mb-1.5">
                <span className="text-xs text-black/30">Just now</span>
                <span className="text-sm font-semibold text-black">Super Admin</span>
              </div>
              <div className="bg-black rounded-2xl rounded-tr-none px-4 py-3 text-sm text-white/80 leading-relaxed">
                Hi {selected.customer.split(" ")[0]}, thank you for reaching out. I&apos;m looking into this for you right now.
              </div>
            </div>
          </div>
        </div>

        {/* Reply input */}
        <div className="border-t border-black/5 p-4">
          <div className="flex gap-3">
            <textarea value={reply} onChange={e => setReply(e.target.value)} rows={2}
              placeholder={`Reply to ${selected.customer}…`}
              className="flex-1 px-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
            <button disabled={!reply.trim()}
              className="self-end flex items-center gap-2 px-4 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-black/10">
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            {["eSIM activated successfully", "Please restart your device", "Refund processed"].map(t => (
              <button key={t} onClick={() => setReply(t)}
                className="text-xs px-2 py-1 rounded-lg bg-black/5 hover:bg-black/10 text-black/50 transition-colors">{t}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

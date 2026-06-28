"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, Send, Loader2 } from "lucide-react";

interface TicketMessage {
  id: string;
  content: string;
  isAgent: boolean;
  createdAt: string;
  author: { name: string | null; role: string };
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  messages: TicketMessage[];
  _count: { messages: number };
}

const PRIORITY_CFG: Record<string, { color: string; bg: string }> = {
  HIGH: { color: "text-red-600", bg: "bg-red-50 border-red-100" },
  URGENT: { color: "text-red-700", bg: "bg-red-100 border-red-200" },
  MEDIUM: { color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  LOW: { color: "text-black/40", bg: "bg-black/5 border-black/5" },
};

const STATUS_CFG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  OPEN: { color: "text-blue-600", bg: "bg-blue-50 border-blue-100", icon: Clock },
  IN_PROGRESS: { color: "text-amber-600", bg: "bg-amber-50 border-amber-100", icon: Clock },
  RESOLVED: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: CheckCircle },
  CLOSED: { color: "text-black/30", bg: "bg-black/5 border-black/5", icon: CheckCircle },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function AdminSupportContent() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [detail, setDetail] = useState<Ticket | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");

  async function fetchTickets() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      const res = await fetch(`/api/admin/support?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        if (!selected && data.length > 0) selectTicket(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function selectTicket(ticket: Ticket) {
    setSelected(ticket);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/support/${ticket.id}`);
      if (res.ok) setDetail(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await fetch(`/api/admin/support/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      setReply("");
      // Refresh detail
      const res = await fetch(`/api/admin/support/${selected.id}`);
      if (res.ok) setDetail(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  async function markResolved() {
    if (!selected) return;
    try {
      await fetch(`/api/admin/support/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      fetchTickets();
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => { fetchTickets(); }, [filter]);

  const displayTicket = detail ?? selected;
  const openCount = tickets.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

  return (
    <div className="flex gap-5 h-[calc(100vh-10rem)]">
      {/* Ticket list */}
      <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col">
        <div className="flex gap-1 bg-black/5 p-1 rounded-xl mb-4">
          {["all", "open", "resolved"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${filter === f ? "bg-white shadow-sm text-black" : "text-black/40"}`}>
              {f} {f === "open" ? `(${openCount})` : ""}
            </button>
          ))}
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-black/30">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 text-black/30 text-sm">No tickets</div>
          ) : tickets.map((ticket, i) => {
            const StatusIcon = (STATUS_CFG[ticket.status] ?? STATUS_CFG.OPEN).icon;
            const isActive = selected?.id === ticket.id;
            const priCfg = PRIORITY_CFG[ticket.priority] ?? PRIORITY_CFG.LOW;
            const lastMsg = ticket.messages[0];
            return (
              <motion.button key={ticket.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => selectTicket(ticket)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${isActive ? "bg-black text-white border-black shadow-md" : "bg-white border-black/[0.06] hover:shadow-md"}`}>
                <div className="flex items-start justify-between mb-1.5">
                  <span className={`font-mono text-xs ${isActive ? "text-white/50" : "text-black/30"}`}>{ticket.id.slice(0, 8)}</span>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${priCfg.bg} ${priCfg.color}`}>
                    {ticket.priority.toLowerCase()}
                  </span>
                </div>
                <div className={`text-sm font-semibold mb-1 line-clamp-1 ${isActive ? "text-white" : "text-black"}`}>{ticket.subject}</div>
                <div className={`text-xs mb-2 line-clamp-1 ${isActive ? "text-white/50" : "text-black/40"}`}>
                  {lastMsg?.content ?? "No messages yet"}
                </div>
                <div className={`flex items-center justify-between text-xs ${isActive ? "text-white/40" : "text-black/30"}`}>
                  <span>{ticket.user.name ?? ticket.user.email}</span>
                  <span>{timeAgo(ticket.createdAt)}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Ticket detail */}
      <div className="flex-1 bg-white rounded-2xl border border-black/[0.06] shadow-sm flex flex-col overflow-hidden">
        {!displayTicket ? (
          <div className="flex-1 flex items-center justify-center text-black/30 text-sm">Select a ticket</div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
              <div>
                <div className="font-display font-bold text-base text-black">{displayTicket.subject}</div>
                <div className="text-xs text-black/40 mt-0.5">
                  {displayTicket.id.slice(0, 8)} · {displayTicket.user.name ?? displayTicket.user.email} · {displayTicket.user.email}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${(PRIORITY_CFG[displayTicket.priority] ?? PRIORITY_CFG.LOW).bg} ${(PRIORITY_CFG[displayTicket.priority] ?? PRIORITY_CFG.LOW).color}`}>
                  {displayTicket.priority.toLowerCase()} priority
                </span>
                {displayTicket.status !== "RESOLVED" && (
                  <button onClick={markResolved}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors">
                    <CheckCircle className="w-3.5 h-3.5" /> Mark resolved
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-8 gap-2 text-black/30">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading messages…
                </div>
              ) : (detail?.messages ?? []).length === 0 ? (
                <div className="text-center py-8 text-black/30 text-sm">No messages yet</div>
              ) : (detail?.messages ?? []).map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.isAgent ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${msg.isAgent ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-gradient-to-br from-blue-400 to-purple-500"}`}>
                    {msg.author.name ? msg.author.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
                  </div>
                  <div className={`flex-1 ${msg.isAgent ? "items-end" : ""}`}>
                    <div className={`flex items-baseline gap-2 mb-1.5 ${msg.isAgent ? "justify-end" : ""}`}>
                      {!msg.isAgent && <span className="text-sm font-semibold text-black">{msg.author.name ?? "Customer"}</span>}
                      <span className="text-xs text-black/30">{timeAgo(msg.createdAt)}</span>
                      {msg.isAgent && <span className="text-sm font-semibold text-black">{msg.author.name ?? "Admin"}</span>}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.isAgent ? "bg-black text-white/80 rounded-tr-none" : "bg-black/[0.03] text-black/70 rounded-tl-none"}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply input */}
            <div className="border-t border-black/5 p-4">
              <div className="flex gap-3">
                <textarea value={reply} onChange={e => setReply(e.target.value)} rows={2}
                  placeholder={`Reply to ${displayTicket.user.name ?? displayTicket.user.email}…`}
                  className="flex-1 px-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
                <button onClick={sendReply} disabled={!reply.trim() || sending}
                  className="self-end flex items-center gap-2 px-4 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-black/10">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                {["eSIM activated successfully", "Please restart your device", "Refund processed"].map(t => (
                  <button key={t} onClick={() => setReply(t)}
                    className="text-xs px-2 py-1 rounded-lg bg-black/5 hover:bg-black/10 text-black/50 transition-colors">{t}</button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

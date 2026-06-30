"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LifeBuoy, MessageCircle, ChevronDown, ChevronUp, Send, Loader2,
  CheckCircle, ExternalLink, Clock, AlertCircle, ArrowLeft, RefreshCw, User, Shield,
} from "lucide-react";

const FAQS = [
  { q: "How do I activate my eSIM?", a: "Go to Settings → Mobile Data → Add eSIM on your device. Scan the QR code from your dashboard or enter the activation code manually. The process takes under 2 minutes." },
  { q: "My eSIM isn't connecting — what should I do?", a: "Restart your device after activation. Ensure your device is 5G/LTE compatible. Check that eSIM is set as the active data line in Settings → Mobile Data." },
  { q: "Can I use my eSIM on multiple devices?", a: "Each eSIM is tied to a single device. To use on a different device, you'll need to purchase a new eSIM plan. Transfers between devices are not supported." },
  { q: "How long does it take to receive my eSIM?", a: "Your eSIM QR code is delivered instantly to your dashboard and email after purchase — no waiting required." },
  { q: "What is your refund policy?", a: "We offer a full refund within 24 hours of purchase if the eSIM has not been activated. Once activated, refunds are not available." },
];

interface Ticket {
  id: string; subject: string; status: string; priority: string;
  category: string | null; updatedAt: string;
  messages: { content: string }[];
  _count: { messages: number };
}

interface FullTicket {
  id: string; subject: string; status: string; priority: string; category: string | null;
  createdAt: string; updatedAt: string;
  messages: { id: string; content: string; isAgent: boolean; authorName: string; timeAgo: string; createdAt: string }[];
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  OPEN:        { color: "text-amber-600",   bg: "bg-amber-50 border-amber-100",   label: "Open" },
  IN_PROGRESS: { color: "text-blue-600",    bg: "bg-blue-50 border-blue-100",     label: "In Progress" },
  RESOLVED:    { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100",label: "Resolved" },
  CLOSED:      { color: "text-black/40",    bg: "bg-black/5 border-black/5",      label: "Closed" },
};

const ticketSchema = z.object({
  subject: z.string().min(5, "Please provide a subject"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(20, "Please describe your issue in at least 20 characters"),
  orderId: z.string().optional(),
});
type TicketValues = z.infer<typeof ticketSchema>;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export function SupportContent() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<FullTicket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyError, setReplyError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async () => {
    const r = await fetch("/api/dashboard/support");
    if (r.ok) setTickets(await r.json());
    setLoadingTickets(false);
  }, []);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  // Poll for new replies while ticket is open
  useEffect(() => {
    if (!selectedTicket) return;
    const t = setInterval(async () => {
      const r = await fetch(`/api/dashboard/support/${selectedTicket.id}`);
      if (r.ok) {
        const d: FullTicket = await r.json();
        if (d.messages.length !== selectedTicket.messages.length) setSelectedTicket(d);
      }
    }, 15000);
    return () => clearInterval(t);
  }, [selectedTicket]);

  async function openTicket(id: string) {
    setLoadingTicket(true);
    const r = await fetch(`/api/dashboard/support/${id}`);
    if (r.ok) setSelectedTicket(await r.json());
    setLoadingTicket(false);
  }

  async function sendReply() {
    if (!selectedTicket || !reply.trim()) return;
    setSendingReply(true); setReplyError("");
    try {
      const r = await fetch(`/api/dashboard/support/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Failed to send");
      setSelectedTicket((prev) => prev ? { ...prev, messages: [...prev.messages, d] } : prev);
      setReply("");
    } catch (e: unknown) {
      setReplyError(e instanceof Error ? e.message : "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  }

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TicketValues>({
    resolver: zodResolver(ticketSchema),
  });

  const onSubmit = async (data: TicketValues) => {
    const res = await fetch("/api/dashboard/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: data.subject, category: data.category,
        message: data.orderId ? `${data.message}\n\nRelated order: ${data.orderId}` : data.message,
      }),
    });
    if (res.ok) {
      const newTicket = await res.json();
      setTickets((prev) => [newTicket, ...prev]);
      setTicketSubmitted(true); reset();
    }
  };

  // ---- Ticket detail view ----
  if (selectedTicket) {
    const statusCfg = STATUS_CONFIG[selectedTicket.status] ?? STATUS_CONFIG.OPEN;
    return (
      <div className="space-y-4 max-w-3xl">
        <button onClick={() => setSelectedTicket(null)}
          className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to tickets
        </button>

        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
          {/* Ticket header */}
          <div className="px-5 py-4 border-b border-black/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-base text-black">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                  {selectedTicket.category && (
                    <span className="text-xs text-black/30">{selectedTicket.category}</span>
                  )}
                  <span className="text-xs text-black/30">Opened {timeAgo(selectedTicket.createdAt)}</span>
                </div>
              </div>
              <button onClick={() => openTicket(selectedTicket.id)} className="p-1.5 rounded-lg hover:bg-black/5 text-black/30">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="p-5 space-y-4 max-h-[480px] overflow-y-auto">
            {selectedTicket.messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.isAgent ? "flex-row" : "flex-row-reverse"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.isAgent ? "bg-blue-100" : "bg-black/5"
                }`}>
                  {msg.isAgent ? <Shield className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-black/40" />}
                </div>
                <div className={`max-w-[80%] ${msg.isAgent ? "" : "items-end"} flex flex-col gap-1`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.isAgent
                      ? "bg-blue-50 text-blue-900 rounded-tl-sm"
                      : "bg-black text-white rounded-tr-sm"
                  }`}>
                    {msg.content}
                  </div>
                  <span className="text-xs text-black/30 px-1">{msg.authorName} · {msg.timeAgo}</span>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Reply box */}
          {selectedTicket.status !== "CLOSED" && (
            <div className="p-4 border-t border-black/5">
              {replyError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs mb-3">
                  <AlertCircle className="w-3.5 h-3.5" />{replyError}
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendReply(); }}
                  placeholder="Type your reply… (Ctrl+Enter to send)"
                  rows={3}
                  className="flex-1 px-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
                <button onClick={sendReply} disabled={sendingReply || !reply.trim()}
                  className="flex-shrink-0 self-end px-4 py-3 rounded-xl bg-black text-white hover:bg-black/80 transition-colors disabled:opacity-40">
                  {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- Main support view ----
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Quick help */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { Icon: MessageCircle, label: "Live Chat", desc: "Avg. response: 2 min", action: "Open ticket", color: "text-blue-600", bg: "bg-blue-50" },
          { Icon: LifeBuoy, label: "Help Center", desc: "Common questions", action: "Browse docs", color: "text-purple-600", bg: "bg-purple-50", href: "/kb" },
          { Icon: Send, label: "Email Support", desc: "support@simkuu.com", action: "Send email", color: "text-emerald-600", bg: "bg-emerald-50", href: "mailto:support@simkuu.com" },
        ].map((item) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
              <item.Icon className={`w-4.5 h-4.5 ${item.color}`} />
            </div>
            <div className="font-semibold text-sm text-black mb-1">{item.label}</div>
            <div className="text-xs text-black/40 mb-3">{item.desc}</div>
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs font-semibold text-black/60 hover:text-black transition-colors">
                {item.action} <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <button onClick={() => setTicketSubmitted(false)}
                className="text-xs font-semibold text-black/60 hover:text-black transition-colors">{item.action}</button>
            )}
          </motion.div>
        ))}
      </div>

      {/* My Tickets */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-black">My tickets</h3>
          <button onClick={loadTickets} className="p-1.5 rounded-lg hover:bg-black/5 text-black/30 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loadingTickets ? (
          <div className="flex items-center justify-center gap-2 py-10 text-black/30 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading tickets…
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <LifeBuoy className="w-8 h-8 text-black/10" />
            <p className="text-sm text-black/30">No tickets yet.</p>
            <p className="text-xs text-black/20">Open a ticket below if you need help.</p>
          </div>
        ) : (
          tickets.map((t, i) => {
            const cfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.OPEN;
            return (
              <button key={t.id} onClick={() => openTicket(t.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-black/[0.02] transition-colors ${i < tickets.length - 1 ? "border-b border-black/5" : ""}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  {t.status === "RESOLVED" ? <CheckCircle className={`w-4 h-4 ${cfg.color}`} /> : t.status === "IN_PROGRESS" ? <Clock className={`w-4 h-4 ${cfg.color}`} /> : <MessageCircle className={`w-4 h-4 ${cfg.color}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black truncate">{t.subject}</div>
                  <div className="text-xs text-black/30 mt-0.5">
                    {t._count.messages} message{t._count.messages !== 1 ? "s" : ""} · Updated {timeAgo(t.updatedAt)}
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>
              </button>
            );
          })
        )}
      </motion.div>

      {/* New ticket form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
        <h3 className="font-display font-bold text-base text-black mb-4">Open new ticket</h3>

        <AnimatePresence mode="wait">
          {ticketSubmitted ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="font-semibold text-black mb-1">Ticket submitted!</p>
                <p className="text-sm text-black/40">We'll respond within 2 hours. Check your tickets above.</p>
              </div>
              <button onClick={() => setTicketSubmitted(false)}
                className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
                Open another ticket
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-black/50 block mb-1.5">Category</label>
                <select {...register("category")}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white appearance-none">
                  <option value="">Select category…</option>
                  <option value="Activation">Activation issue</option>
                  <option value="Connectivity">Connectivity problem</option>
                  <option value="Billing">Billing / payment</option>
                  <option value="Refund">Refund request</option>
                  <option value="Account">Account issue</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-black/50 block mb-1.5">Subject</label>
                <input {...register("subject")} placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-black/50 block mb-1.5">Order ID (optional)</label>
                <input {...register("orderId")} placeholder="e.g. ORD-2026-000001"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>

              <div>
                <label className="text-xs font-medium text-black/50 block mb-1.5">Describe your issue</label>
                <textarea {...register("message")} rows={4} placeholder="Please provide as much detail as possible…"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors shadow-md disabled:opacity-50">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit ticket</>}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* FAQ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <h3 className="font-display font-bold text-base text-black">Frequently asked questions</h3>
        </div>
        {FAQS.map((faq, i) => (
          <div key={i} className={`border-b border-black/5 last:border-0`}>
            <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-black/[0.01] transition-colors">
              <span className="text-sm font-medium text-black pr-4">{faq.q}</span>
              {expandedFaq === i ? <ChevronUp className="w-4 h-4 text-black/30 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-black/30 flex-shrink-0" />}
            </button>
            <AnimatePresence>
              {expandedFaq === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }} className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm text-black/50 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

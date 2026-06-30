"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LifeBuoy, MessageCircle, ChevronDown, ChevronUp, Send, Loader2, CheckCircle, ExternalLink, Clock, AlertCircle } from "lucide-react";

const FAQS = [
  { q: "How do I activate my eSIM?", a: "Go to Settings → Mobile Data → Add eSIM on your device. Scan the QR code from your dashboard or enter the activation code manually. The process takes under 2 minutes." },
  { q: "My eSIM isn't connecting — what should I do?", a: "Restart your device after activation. Ensure your device is 5G/LTE compatible. Check that eSIM is set as the active data line in Settings → Mobile Data." },
  { q: "Can I use my eSIM on multiple devices?", a: "Each eSIM is tied to a single device. To use on a different device, you'll need to purchase a new eSIM plan. Transfers between devices are not supported." },
  { q: "How long does it take to receive my eSIM?", a: "Your eSIM QR code is delivered instantly to your dashboard and email after purchase — no waiting required." },
  { q: "What is your refund policy?", a: "We offer a full refund within 24 hours of purchase if the eSIM has not been activated. Once activated, refunds are not available." },
];

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string | null;
  updatedAt: string;
  messages: { content: string }[];
  _count: { messages: number };
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  OPEN: { color: "text-amber-600", bg: "bg-amber-50 border-amber-100", label: "Open" },
  IN_PROGRESS: { color: "text-blue-600", bg: "bg-blue-50 border-blue-100", label: "In Progress" },
  RESOLVED: { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", label: "Resolved" },
  CLOSED: { color: "text-black/40", bg: "bg-black/5 border-black/5", label: "Closed" },
};

const ticketSchema = z.object({
  subject: z.string().min(5, "Please provide a subject"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(20, "Please describe your issue in at least 20 characters"),
  orderId: z.string().optional(),
});
type TicketValues = z.infer<typeof ticketSchema>;

export function SupportContent() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/support")
      .then(r => r.ok ? r.json() : [])
      .then(setTickets)
      .catch(() => setTickets([]))
      .finally(() => setLoadingTickets(false));
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TicketValues>({
    resolver: zodResolver(ticketSchema),
  });

  const onSubmit = async (data: TicketValues) => {
    const res = await fetch("/api/dashboard/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: data.subject,
        category: data.category,
        message: data.orderId
          ? `${data.message}\n\nRelated order: ${data.orderId}`
          : data.message,
      }),
    });
    if (res.ok) {
      const newTicket = await res.json();
      setTickets(prev => [newTicket, ...prev]);
      setTicketSubmitted(true);
      reset();
    }
  };

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Quick help */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: MessageCircle, label: "Live Chat", desc: "Avg. response: 2 min", action: "Start chat", color: "text-blue-600", bg: "bg-blue-50" },
          { icon: LifeBuoy, label: "Help Center", desc: "100+ articles", action: "Browse docs", color: "text-purple-600", bg: "bg-purple-50" },
          { icon: Send, label: "Email Support", desc: "support@simkuu.com", action: "Send email", color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((item, i) => (
          <motion.button key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-sm text-left hover:shadow-md transition-all group">
            <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
              <item.icon className={`w-4.5 h-4.5 ${item.color}`} />
            </div>
            <div className="text-sm font-semibold text-black mb-0.5">{item.label}</div>
            <div className="text-xs text-black/40 mb-2">{item.desc}</div>
            <div className={`text-xs font-medium ${item.color} flex items-center gap-1 group-hover:gap-1.5 transition-all`}>
              {item.action} <ExternalLink className="w-3 h-3" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Real tickets */}
      {!loadingTickets && tickets.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-black/5">
            <h3 className="font-display font-bold text-base text-black">Your tickets ({tickets.length})</h3>
          </div>
          {tickets.map((ticket, i) => {
            const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.OPEN;
            return (
              <div key={ticket.id} className={`flex items-center gap-4 px-5 py-4 ${i < tickets.length - 1 ? "border-b border-black/5" : ""} hover:bg-black/[0.01] cursor-pointer transition-colors`}>
                <div className="w-9 h-9 rounded-xl bg-black/5 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-black/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black">{ticket.subject}</div>
                  <div className="text-xs text-black/30">
                    {ticket.id.slice(0, 8)} · {ticket.category ?? "General"} · Updated {timeAgo(ticket.updatedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(ticket.priority === "HIGH" || ticket.priority === "URGENT") && (
                    <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">High</span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New ticket form */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-5">
        <h3 className="font-display font-bold text-base text-black mb-5">Open a new ticket</h3>

        {ticketSubmitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <h4 className="font-semibold text-black mb-1">Ticket submitted!</h4>
            <p className="text-sm text-black/50">We&apos;ll respond within 2 hours. Check your email for updates.</p>
            <button onClick={() => setTicketSubmitted(false)} className="mt-4 text-xs text-blue-600 font-medium hover:underline">
              Open another ticket
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-black/50 mb-1.5 block">Category</label>
                <select {...register("category")} className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white transition-all">
                  <option value="">Select…</option>
                  <option>eSIM Activation</option>
                  <option>Connectivity Issue</option>
                  <option>Billing &amp; Payments</option>
                  <option>Order Status</option>
                  <option>Refund Request</option>
                  <option>Other</option>
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-black/50 mb-1.5 block">Related order (optional)</label>
                <input {...register("orderId")} placeholder="e.g. ORD-8821"
                  className="w-full px-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Subject</label>
              <input {...register("subject")} placeholder="Brief description of your issue"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${errors.subject ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-black/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} />
              {errors.subject && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.subject.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Message</label>
              <textarea {...register("message")} rows={5} placeholder="Describe your issue in detail…"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none ${errors.message ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-black/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} />
              {errors.message && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.message.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-black/30">
                <Clock className="w-3 h-3" /> Typical response: under 2 hours
              </div>
              <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors disabled:opacity-60 shadow-md shadow-black/10">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit ticket</>}
              </motion.button>
            </div>
          </form>
        )}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <h3 className="font-display font-bold text-base text-black">Quick answers</h3>
        </div>
        {FAQS.map((faq, i) => (
          <div key={i} className={`${i < FAQS.length - 1 ? "border-b border-black/5" : ""}`}>
            <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-black/[0.01] transition-colors">
              <span className="text-sm font-medium text-black pr-4">{faq.q}</span>
              {expandedFaq === i ? <ChevronUp className="w-4 h-4 text-black/30 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-black/30 flex-shrink-0" />}
            </button>
            <AnimatePresence>
              {expandedFaq === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-5 pb-4 text-sm text-black/50 leading-relaxed">{faq.a}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

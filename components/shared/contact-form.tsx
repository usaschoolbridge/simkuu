"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contactSchema, type ContactInput } from "@/lib/validators";
import { cn } from "@/lib/utils";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSent(true);
    }
  };

  const inputClass = (hasError?: boolean) => cn(
    "w-full px-4 py-3 rounded-xl border text-sm text-black placeholder-black/30 bg-white transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400",
    hasError ? "border-red-300 bg-red-50/30" : "border-black/10 hover:border-black/20"
  );

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-display text-xl font-bold text-black mb-2">Message sent!</h3>
          <p className="text-black/50">We&apos;ll reply within 4 hours. Check your inbox.</p>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1.5">Name</label>
              <input {...register("name")} placeholder="Your name" className={inputClass(!!errors.name)} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1.5">Email</label>
              <input {...register("email")} type="email" placeholder="you@example.com" className={inputClass(!!errors.email)} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1.5">Subject</label>
            <input {...register("subject")} placeholder="How can we help?" className={inputClass(!!errors.subject)} />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-black/40 uppercase tracking-wider mb-1.5">Message</label>
            <textarea {...register("message")} rows={5} placeholder="Tell us more..."
              className={cn(inputClass(!!errors.message), "resize-none")} />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
          </div>

          <Button variant="gradient" size="lg" type="submit" loading={isSubmitting} className="w-full">
            <Send className="w-4 h-4" /> Send Message
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

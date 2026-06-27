"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async () => {
    setServerError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setSuccess(true);
    } catch {
      setServerError("Failed to send reset email. Please try again.");
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="font-display text-2xl font-black text-black mb-2">Check your email</h2>
        <p className="text-black/50 text-sm mb-1">
          We sent a password reset link to
        </p>
        <p className="font-semibold text-sm text-black mb-6">{getValues("email")}</p>
        <p className="text-xs text-black/30 mb-6">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button onClick={() => setSuccess(false)} className="text-blue-600 font-medium hover:underline">try again</button>.
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-black/40 hover:text-black transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
        </Link>
        <h1 className="font-display text-3xl font-black text-black tracking-tight mb-2">Forgot password?</h1>
        <p className="text-black/50 text-sm">No worries — enter your email and we&apos;ll send a reset link.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-black/70 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all
                ${errors.email
                  ? "border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-black/10 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
            />
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {serverError && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{serverError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/80 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-black/10"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Sending…" : "Send reset link"}
        </motion.button>
      </form>
    </div>
  );
}

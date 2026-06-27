"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Loader2, AlertCircle, CheckCircle, Check } from "lucide-react";

const schema = z.object({
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "One uppercase letter")
    .regex(/[0-9]/, "One number"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type Values = z.infer<typeof schema>;

const PASSWORD_RULES = [
  { test: (v: string) => v.length >= 8, label: "8+ characters" },
  { test: (v: string) => /[A-Z]/.test(v), label: "Uppercase letter" },
  { test: (v: string) => /[0-9]/.test(v), label: "Number" },
];

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  const passwordValue = watch("password", "");

  const onSubmit = async () => {
    setServerError(null);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setSuccess(true);
    } catch {
      setServerError("This reset link has expired. Please request a new one.");
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="font-display text-2xl font-black text-black mb-2">Password updated!</h2>
        <p className="text-black/50 text-sm mb-6">Your password has been changed successfully.</p>
        <Link href="/login"
          className="w-full block py-3.5 rounded-xl bg-black text-white font-semibold text-sm text-center hover:bg-black/80 transition-all shadow-md shadow-black/10">
          Sign in with new password
        </Link>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-black tracking-tight mb-2">Set new password</h1>
        <p className="text-black/50 text-sm">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-black/70 mb-1.5">New password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm outline-none transition-all
                ${errors.password
                  ? "border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-black/10 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
            />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordValue.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(passwordValue);
                return (
                  <span key={rule.label} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all ${
                    passed ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-black/5 text-black/30 border border-black/5"
                  }`}>
                    {passed && <Check className="w-3 h-3" />}
                    {rule.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-black/70 mb-1.5">Confirm new password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your new password"
              autoComplete="new-password"
              className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm outline-none transition-all
                ${errors.confirmPassword
                  ? "border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-black/10 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
            />
            <button type="button" onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <AnimatePresence>
            {errors.confirmPassword && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.confirmPassword.message}
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
          {isSubmitting ? "Updating…" : "Update password"}
        </motion.button>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { SocialButtons } from "./social-buttons";
import { AuthDivider } from "./divider";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  // Surface OAuth errors redirected back from /api/auth/oauth/* callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (!err) return;
    const messages: Record<string, string> = {
      google_not_configured: "Google sign-in isn't set up yet. Please use email or another option.",
      github_not_configured: "GitHub sign-in isn't set up yet. Please use email or another option.",
      microsoft_not_configured: "Microsoft sign-in isn't set up yet. Please use email or another option.",
      apple_not_configured: "Apple sign-in isn't set up yet. Please use email or another option.",
      oauth_state_mismatch: "Sign-in session expired. Please try again.",
      oauth_no_code: "Sign-in was cancelled. Please try again.",
      oauth_no_email: "We couldn't read an email from that account. Please use email sign-up.",
      oauth_token_failed: "Could not complete sign-in with the provider. Please try again.",
      oauth_error: "Something went wrong during sign-in. Please try again.",
      db_unavailable: "Service temporarily unavailable. Please try again shortly.",
    };
    setServerError(messages[err] ?? "Sign-in failed. Please try again.");
  }, []);

  const onSubmit = async (data: LoginValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          rememberMe: !!data.remember,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(json.error || "Invalid email or password. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 600);
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="font-display font-bold text-xl text-black mb-2">Welcome back!</h3>
        <p className="text-black/50 text-sm">Redirecting you to your dashboard…</p>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-black tracking-tight mb-2">Welcome back</h1>
        <p className="text-black/50">Sign in to manage your eSIMs and orders.</p>
      </div>

      <SocialButtons mode="login" />
      <AuthDivider />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
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
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" /> {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-black/70">Password</label>
            <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm outline-none transition-all
                ${errors.password
                  ? "border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-black/10 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" /> {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            {...register("remember")}
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-black/20 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
          />
          <label htmlFor="remember" className="text-sm text-black/50 cursor-pointer">
            Remember me for 30 days
          </label>
        </div>

        {/* Server error */}
        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100"
            >
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{serverError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/80 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-black/10"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-black/50">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
          Create one free
        </Link>
      </p>
    </div>
  );
}

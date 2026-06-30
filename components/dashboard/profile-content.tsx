"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Mail, Phone, Lock, Shield, Check, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2,
} from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z.string().min(8, "At least 8 characters").regex(/[A-Z]/, "One uppercase letter").regex(/[0-9]/, "One number"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });
type PasswordValues = z.infer<typeof passwordSchema>;

interface ProfileData {
  id: string; name: string | null; email: string; phone: string;
  customerNo: string; memberSince: string; emailVerified: boolean;
  walletBalance: number; referralCode: string; twoFactorEnabled: boolean; hasPassword: boolean;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-black/5">
        <h3 className="font-display font-bold text-base text-black">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-black/50 block mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function ProfileContent() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/dashboard/profile");
    if (r.ok) setProfile(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const { register: regP, handleSubmit: handleP, formState: { errors: errP, isSubmitting: loadP }, reset: resetP } =
    useForm<ProfileValues>({ resolver: zodResolver(profileSchema) });

  const { register: regPw, handleSubmit: handlePw, formState: { errors: errPw, isSubmitting: loadPw }, reset: resetPw } =
    useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) resetP({ name: profile.name ?? "", phone: profile.phone ?? "" });
  }, [profile, resetP]);

  async function onProfileSave(data: ProfileValues) {
    setProfileMsg(null);
    const r = await fetch("/api/dashboard/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const d = await r.json();
    if (r.ok) {
      setProfile((p) => p ? { ...p, name: d.name ?? p.name, phone: d.phone ?? p.phone } : p);
      setProfileMsg({ type: "success", text: "Profile saved successfully." });
    } else {
      setProfileMsg({ type: "error", text: d.error ?? "Failed to save." });
    }
    setTimeout(() => setProfileMsg(null), 4000);
  }

  async function onPasswordSave(data: PasswordValues) {
    setPassMsg(null);
    const r = await fetch("/api/dashboard/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "change_password", currentPassword: data.currentPassword, newPassword: data.newPassword }),
    });
    const d = await r.json();
    if (r.ok) {
      resetPw();
      setPassMsg({ type: "success", text: "Password changed successfully." });
    } else {
      setPassMsg({ type: "error", text: d.error ?? "Failed to change password." });
    }
    setTimeout(() => setPassMsg(null), 4000);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32 gap-2 text-black/30">
      <Loader2 className="w-6 h-6 animate-spin" /> Loading profile…
    </div>
  );

  const initials = (profile?.name ?? profile?.email ?? "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile information */}
      <Section title="Profile information">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-black">
            {initials}
          </div>
          <div>
            <div className="font-semibold text-black">{profile?.name ?? "—"}</div>
            <div className="text-sm text-black/40">{profile?.email}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-mono text-black/30">{profile?.customerNo}</span>
              {profile?.emailVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleP(onProfileSave)} className="space-y-4">
          <Field label="Full name" error={errP.name?.message}>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
              <input {...regP("name")} placeholder="Your full name"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </Field>

          <Field label="Email address">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
              <input value={profile?.email ?? ""} disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/[0.06] text-sm bg-black/[0.02] text-black/40 cursor-not-allowed" />
            </div>
          </Field>

          <Field label="Phone number" error={errP.phone?.message}>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
              <input {...regP("phone")} placeholder="+1 555-0100"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </Field>

          {profileMsg && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${
                profileMsg.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-600"
              }`}>
              {profileMsg.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {profileMsg.text}
            </motion.div>
          )}

          <button type="submit" disabled={loadP}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors disabled:opacity-50">
            {loadP ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Check className="w-4 h-4" /> Save changes</>}
          </button>
        </form>
      </Section>

      {/* Change password */}
      {profile?.hasPassword && (
        <Section title="Change password">
          <form onSubmit={handlePw(onPasswordSave)} className="space-y-4">
            <Field label="Current password" error={errPw.currentPassword?.message}>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                <input {...regPw("currentPassword")} type={showCurrent ? "text" : "password"} placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                <button type="button" onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <Field label="New password" error={errPw.newPassword?.message}>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                <input {...regPw("newPassword")} type={showNew ? "text" : "password"} placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                <button type="button" onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <Field label="Confirm new password" error={errPw.confirmPassword?.message}>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/25" />
                <input {...regPw("confirmPassword")} type="password" placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
            </Field>

            {passMsg && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${
                  passMsg.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-600"
                }`}>
                {passMsg.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {passMsg.text}
              </motion.div>
            )}

            <button type="submit" disabled={loadPw}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors disabled:opacity-50">
              {loadPw ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><Shield className="w-4 h-4" /> Update password</>}
            </button>
          </form>
        </Section>
      )}

      {/* Account info */}
      <Section title="Account details">
        <div className="space-y-3">
          {[
            { label: "Customer ID", value: profile?.customerNo ?? "—" },
            { label: "Member since", value: profile?.memberSince ?? "—" },
            { label: "Wallet balance", value: `$${(profile?.walletBalance ?? 0).toFixed(2)}` },
            { label: "Referral code", value: profile?.referralCode ?? "—" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
              <span className="text-sm text-black/40">{row.label}</span>
              <span className="text-sm font-medium text-black font-mono">{row.value}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

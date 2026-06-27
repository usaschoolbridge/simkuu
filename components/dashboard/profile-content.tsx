"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Lock, Bell, Shield, Trash2, Camera, Check, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword: z.string().min(8, "At least 8 characters").regex(/[A-Z]/, "One uppercase letter").regex(/[0-9]/, "One number"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });
type PasswordValues = z.infer<typeof passwordSchema>;

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

export function ProfileContent() {
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [notifications, setNotifications] = useState({
    emailOrders: true, emailReferrals: true, emailNews: false,
    smsOrders: false, smsExpiry: true,
  });

  const [twoFa, setTwoFa] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors, isSubmitting: profileLoading } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "Alex Johnson", email: "alex@example.com", phone: "+1 555-0100" },
  });

  const { register: regPassword, handleSubmit: handlePassword, formState: { errors: passErrors, isSubmitting: passLoading } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSave = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const onPasswordSave = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Avatar */}
      <Section title="Profile information">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-black">
              AJ
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/70 transition-colors">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <div className="font-display font-bold text-lg text-black">Alex Johnson</div>
            <div className="text-sm text-black/40">Member since April 2026</div>
          </div>
        </div>

        <form onSubmit={handleProfile(onProfileSave)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input {...regProfile("name")} className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${profileErrors.name ? "border-red-300" : "border-black/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input {...regProfile("email")} type="email" className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${profileErrors.email ? "border-red-300" : "border-black/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">Phone number (optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <input {...regProfile("phone")} type="tel" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
          </div>
          <div className="flex justify-end">
            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={profileLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors disabled:opacity-60 shadow-md shadow-black/10">
              {profileLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : profileSaved ? <><Check className="w-4 h-4 text-emerald-400" /> Saved!</> : "Save changes"}
            </motion.button>
          </div>
        </form>
      </Section>

      {/* Password */}
      <Section title="Change password">
        <form onSubmit={handlePassword(onPasswordSave)} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-black/50 mb-1.5 block">Current password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
              <input {...regPassword("currentPassword")} type={showCurrent ? "text" : "password"}
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all ${passErrors.currentPassword ? "border-red-300" : "border-black/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} />
              <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passErrors.currentPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{passErrors.currentPassword.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">New password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input {...regPassword("newPassword")} type={showNew ? "text" : "password"}
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all ${passErrors.newPassword ? "border-red-300" : "border-black/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-black/50 mb-1.5 block">Confirm new password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                <input {...regPassword("confirmPassword")} type="password"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm outline-none transition-all ${passErrors.confirmPassword ? "border-red-300" : "border-black/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} />
              </div>
              {passErrors.confirmPassword && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{passErrors.confirmPassword.message}</p>}
            </div>
          </div>
          <div className="flex justify-end">
            <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={passLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-black/80 transition-colors disabled:opacity-60 shadow-md shadow-black/10">
              {passLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : passwordSaved ? <><Check className="w-4 h-4 text-emerald-400" /> Updated!</> : "Update password"}
            </motion.button>
          </div>
        </form>
      </Section>

      {/* Notifications */}
      <Section title="Notification preferences">
        <div className="space-y-4">
          {[
            { key: "emailOrders", label: "Order confirmations", desc: "Email when an order is placed or status changes" },
            { key: "emailReferrals", label: "Referral activity", desc: "Email when a referral converts or you earn credit" },
            { key: "emailNews", label: "Product updates & news", desc: "Occasional emails about new features and plans" },
            { key: "smsOrders", label: "SMS order alerts", desc: "Text message when your eSIM is ready" },
            { key: "smsExpiry", label: "SMS expiry reminders", desc: "Text reminder 3 days before your plan expires" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-black">{label}</div>
                <div className="text-xs text-black/40">{desc}</div>
              </div>
              <button
                onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                className={`relative w-10 h-6 rounded-full transition-colors ${notifications[key as keyof typeof notifications] ? "bg-blue-500" : "bg-black/10"}`}
              >
                <motion.div
                  animate={{ x: notifications[key as keyof typeof notifications] ? 16 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Shield className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-black">Two-factor authentication</div>
                <div className="text-xs text-black/40">Add an extra layer of security to your account</div>
              </div>
            </div>
            <button
              onClick={() => setTwoFa((v) => !v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${twoFa ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-black text-white hover:bg-black/80"}`}
            >
              {twoFa ? "✓ Enabled" : "Enable 2FA"}
            </button>
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Danger zone">
        <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/30">
          <div>
            <div className="text-sm font-semibold text-red-600 mb-0.5">Delete account</div>
            <div className="text-xs text-red-400">Permanently delete your account and all data. This cannot be undone.</div>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </Section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.05 12.04c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.61-1.96-1.54-.16-3 .9-3.78.9-.77 0-1.97-.88-3.24-.85-1.67.02-3.21.97-4.07 2.46-1.73 3-.44 7.45 1.25 9.89.82 1.19 1.8 2.53 3.08 2.48 1.24-.05 1.71-.8 3.21-.8 1.49 0 1.92.8 3.23.77 1.33-.02 2.18-1.21 3-2.41.94-1.38 1.33-2.72 1.35-2.79-.03-.01-2.59-.99-2.62-3.93zM14.6 4.6c.68-.83 1.14-1.98 1.01-3.13-.98.04-2.17.65-2.88 1.48-.63.73-1.18 1.9-1.03 3.02 1.09.08 2.21-.55 2.9-1.37z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.4 11.4H2V2h9.4v9.4z" fill="#F25022" />
      <path d="M22 11.4h-9.4V2H22v9.4z" fill="#7FBA00" />
      <path d="M11.4 22H2v-9.4h9.4V22z" fill="#00A4EF" />
      <path d="M22 22h-9.4v-9.4H22V22z" fill="#FFB900" />
    </svg>
  );
}

type Provider = "google" | "github" | "microsoft" | "apple";

const PROVIDERS: { id: Provider; name: string; icon: React.ReactNode }[] = [
  { id: "google", name: "Google", icon: <GoogleIcon /> },
  { id: "microsoft", name: "Microsoft", icon: <MicrosoftIcon /> },
  { id: "apple", name: "Apple", icon: <AppleIcon /> },
  { id: "github", name: "GitHub", icon: <GithubIcon /> },
];

export function SocialButtons({ mode }: { mode: "login" | "register" }) {
  const [loading, setLoading] = useState<Provider | null>(null);

  // Navigate to the real OAuth start route. The server redirects to the
  // provider and, on success, back to /dashboard with a session cookie.
  // If a provider isn't configured server-side, it bounces back to
  // /login?error=<provider>_not_configured (shown by the login form).
  const handleSocial = (provider: Provider) => {
    setLoading(provider);
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  const label = mode === "login" ? "Continue" : "Sign up";

  return (
    <div className="space-y-3">
      {PROVIDERS.map(({ id, name, icon }) => (
        <motion.button
          key={id}
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSocial(id)}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-black/10 bg-white hover:bg-black/[0.02] transition-all text-sm font-medium text-black disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {loading === id ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
          {label} with {name}
        </motion.button>
      ))}
    </div>
  );
}

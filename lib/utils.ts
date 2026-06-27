import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Format number with suffix (1000 -> 1K)
export function formatCompact(num: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(num);
}

// Slugify
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Calculate discount percentage
export function discountPercent(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

// Get plan savings text
export function savingsLabel(interval: string): string {
  const map: Record<string, string> = {
    quarterly: "Save 15%",
    yearly: "Save 30%",
  };
  return map[interval] ?? "";
}

// Clamp
export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

// Wait
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generate referral code
export function generateCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// Truncate text
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

// Is valid email
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


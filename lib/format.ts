/**
 * Formatting utilities used throughout the app.
 * All pure functions — no side effects, no imports.
 */

// ── Currency ──────────────────────────────────────────────────────────────────

/**
 * Format cents to USD string.
 * @example formatPrice(2500) → "$25.00"
 */
export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Format a price in dollars (not cents).
 * @example formatDollars(25) → "$25.00"
 */
export function formatDollars(dollars: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(dollars);
}

// ── Data sizes ────────────────────────────────────────────────────────────────

/**
 * Format bytes to human-readable string.
 * @example formatBytes(1536) → "1.5 KB"
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format MB to display string.
 * @example formatDataUsage(2048, 51200) → "2 GB / 50 GB"
 */
export function formatDataUsage(usedMb: number, limitMb: number | null): string {
  if (limitMb === null) return `${formatMb(usedMb)} / Unlimited`;
  return `${formatMb(usedMb)} / ${formatMb(limitMb)}`;
}

function formatMb(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`;
  return `${mb} MB`;
}

// ── Dates ─────────────────────────────────────────────────────────────────────

/**
 * Format a date to "Jun 15, 2025"
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format a date to relative time: "2 hours ago", "in 3 days"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = Date.now();
  const target = new Date(date).getTime();
  const diffMs = target - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second");
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");
  return formatDate(date);
}

/**
 * Countdown to expiry: "23h 14m remaining" or "Expired"
 */
export function formatExpiry(expiresAt: Date | string): string {
  const now = Date.now();
  const exp = new Date(expiresAt).getTime();
  const diffMs = exp - now;

  if (diffMs <= 0) return "Expired";

  const days = Math.floor(diffMs / 86_400_000);
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

// ── Numbers ───────────────────────────────────────────────────────────────────

/**
 * Compact number format: 1200 → "1.2K", 1500000 → "1.5M"
 */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Format a percentage: 0.85 → "85%"
 */
export function formatPercent(ratio: number, decimals = 0): string {
  return `${(ratio * 100).toFixed(decimals)}%`;
}

// ── Strings ───────────────────────────────────────────────────────────────────

/**
 * Truncate a string with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "…";
}

/**
 * Capitalize the first letter of each word.
 */
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Mask a string for display: "sk_live_abc123" → "sk_live_***123"
 */
export function maskSecret(secret: string, showLast = 4): string {
  if (secret.length <= showLast) return "****";
  return "*".repeat(secret.length - showLast) + secret.slice(-showLast);
}

/**
 * Format an ICCID for display: "89014103211118510720" → "8901 4103 2111 1851 0720"
 */
export function formatIccid(iccid: string): string {
  return iccid.replace(/(.{4})/g, "$1 ").trim();
}

// ── Phone ─────────────────────────────────────────────────────────────────────

/**
 * Format a US phone number: "5551234567" → "(555) 123-4567"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

// ── Order IDs ────────────────────────────────────────────────────────────────

/**
 * Generate a human-readable order ID.
 * @example generateOrderId() → "ORD-2025-A7K3"
 */
export function generateOrderId(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const random = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `ORD-${year}-${random}`;
}

// ============================================================
// Simkuu — GLOBAL TYPE DEFINITIONS
// ============================================================

export type CarrierId = "tmobile" | "verizon" | "att" | "mvno";
export type PlanInterval = "monthly" | "quarterly" | "yearly";
export type PlanTier = "starter" | "standard" | "premium" | "unlimited";
export type OrderStatus = "pending" | "processing" | "active" | "expired" | "cancelled" | "refunded";
export type PaymentProvider = "stripe" | "paypal" | "crypto" | "apple_pay" | "google_pay";
export type CryptoCurrency = "BTC" | "ETH" | "USDT_ERC20" | "USDT_TRC20" | "USDC";
export type ActivationStatus = "pending" | "active" | "expired" | "suspended";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type UserRole = "user" | "admin" | "super_admin";

// ---- Plan ----
export interface Plan {
  id: string;
  name: string;
  carrier: CarrierId;
  tier: PlanTier;
  interval: PlanInterval;
  price: number;
  originalPrice?: number;
  data: string; // "Unlimited" | "5GB" etc
  calls: string;
  sms: string;
  hotspot: boolean;
  fiveG: boolean;
  voip: boolean;
  international: boolean;
  features: string[];
  badge?: string; // "Most Popular" | "Best Value"
  stripePriceId: string;
  isActive: boolean;
}

// ---- Carrier ----
export interface Carrier {
  id: CarrierId;
  name: string;
  slug: string;
  description: string;
  color: string;
  logo: string;
  coverage: string;
  network: string;
  features: string[];
}

// ---- eSIM ----
export interface ESim {
  id: string;
  userId: string;
  orderId: string;
  carrier: CarrierId;
  planId: string;
  iccid: string;
  qrCode: string; // base64 or URL
  activationCode: string;
  status: ActivationStatus;
  activatedAt?: Date;
  expiresAt?: Date;
  dataUsed?: number; // MB
  dataLimit?: number; // MB, null = unlimited
  createdAt: Date;
}

// ---- Order ----
export interface Order {
  id: string;
  userId: string;
  planId: string;
  esimId?: string;
  status: OrderStatus;
  amount: number;
  currency: string;
  paymentProvider: PaymentProvider;
  paymentId: string;
  invoiceUrl?: string;
  couponId?: string;
  discountAmount?: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ---- User ----
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  emailVerified?: Date;
  phone?: string;
  twoFactorEnabled: boolean;
  walletBalance: number;
  referralCode: string;
  referredBy?: string;
  createdAt: Date;
}

// ---- Coupon ----
export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  applicableCarriers?: CarrierId[];
  applicablePlans?: string[];
  minOrderAmount?: number;
  isActive: boolean;
}

// ---- Testimonial ----
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating: number;
  content: string;
  carrier?: CarrierId;
  verified: boolean;
  date: string;
}

// ---- Support Ticket ----
export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high" | "urgent";
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  isAgent: boolean;
  content: string;
  attachments?: string[];
  createdAt: Date;
}

// ---- API Response ----
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ---- UI Types ----
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  badge?: string;
  external?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface AnimationVariant {
  hidden: Record<string, unknown>;
  visible: Record<string, unknown>;
}

// ---- Checkout ----
export interface CheckoutSession {
  planId: string;
  carrierId: CarrierId;
  interval: PlanInterval;
  couponCode?: string;
  paymentProvider: PaymentProvider;
}

export interface PriceBreakdown {
  subtotal: number;
  discount: number;
  total: number;
  currency: string;
  couponApplied?: string;
}

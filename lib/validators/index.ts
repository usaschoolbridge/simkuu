import { z } from "zod";

// ---- Auth ----

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    token: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ---- Profile ----

export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

// ---- Checkout ----

export const checkoutSchema = z.object({
  planId: z.string().cuid(),
  couponCode: z.string().optional(),
  paymentProvider: z.enum(["stripe", "paypal", "crypto", "apple_pay", "google_pay"]),
});

// ---- Contact ----

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(5, "Subject is required"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

// ---- Support Ticket ----

export const ticketSchema = z.object({
  subject: z.string().min(5, "Subject is required"),
  message: z.string().min(20, "Please describe your issue"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

// ---- Newsletter ----

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// ---- Coupon ----

export const couponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, "Code must be uppercase letters and numbers only")
    .transform((v) => v.toUpperCase()),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type TicketInput = z.infer<typeof ticketSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type CouponInput = z.infer<typeof couponSchema>;

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  CreditCard, Loader2, Mail, User, Lock, Shield,
  ChevronRight, Smartphone, Bitcoin, Phone, Globe,
} from "lucide-react";
import { CryptoPayment } from "./crypto-payment";

type PaymentMethod = "card" | "paypal" | "apple_pay" | "google_pay" | "crypto";

const contactSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().max(30).optional().or(z.literal("")),
  country: z.string().max(60).optional().or(z.literal("")),
});
type ContactValues = z.infer<typeof contactSchema>;

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode; sub?: string }[] = [
  {
    id: "card",
    label: "Credit / Debit Card",
    icon: <CreditCard className="w-4.5 h-4.5" />,
    sub: "Visa, Mastercard, Amex",
  },
  {
    id: "paypal",
    label: "PayPal",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#003087" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
      </svg>
    ),
    sub: "Pay with your PayPal account",
  },
  {
    id: "apple_pay",
    label: "Apple Pay",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
      </svg>
    ),
    sub: "Touch ID or Face ID",
  },
  {
    id: "google_pay",
    label: "Google Pay",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 10.02V13.5h5.74a5.16 5.16 0 01-5.74 3.48 5.63 5.63 0 01-5.62-5.62 5.63 5.63 0 015.62-5.63c1.4 0 2.67.52 3.65 1.37L18.1 4.65A9.48 9.48 0 0012 2.25 9.75 9.75 0 002.25 12 9.75 9.75 0 0012 21.75a9.75 9.75 0 009.75-9.75c0-.64-.06-1.27-.18-1.88H12v-.1z" fill="#4285F4"/>
        <path d="M3.65 7.84L6.7 10.1A5.63 5.63 0 0112 6.73c1.4 0 2.67.52 3.65 1.37L18.1 4.65A9.48 9.48 0 0012 2.25 9.75 9.75 0 003.65 7.84z" fill="#EA4335"/>
        <path d="M12 21.75a9.48 9.48 0 006.37-2.47l-2.94-2.48A5.63 5.63 0 016.27 14.1l-3.08 2.38A9.75 9.75 0 0012 21.75z" fill="#34A853"/>
        <path d="M21.57 10.12H21V10H12v3.5h5.74a5.19 5.19 0 01-1.77 2.3l2.94 2.48c-.2.2 3.09-2.25 3.09-6.78 0-.64-.06-1.27-.43-1.38z" fill="#FBBC05"/>
      </svg>
    ),
    sub: "Fast & secure",
  },
  {
    id: "crypto",
    label: "Cryptocurrency",
    icon: <Bitcoin className="w-4.5 h-4.5 text-amber-500" />,
    sub: "BTC, ETH, USDT, USDC",
  },
];

interface CheckoutFormProps {
  plan: {
    id: string; name: string; price: number; originalPrice?: number;
    data: string; carrier: string; signal: string;
  };
  discount?: number;
}

export function CheckoutForm({ plan, discount = 0 }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [step, setStep] = useState<"contact" | "payment">("contact");
  const [contactData, setContactData] = useState<ContactValues | null>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
  });

  const [payError, setPayError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const onContactSubmit = (data: ContactValues) => {
    setContactData(data);
    setStep("payment");
  };

  /** Create the order, then redirect to the live payment provider. If the
   *  provider isn't configured the route returns a clear message which we show
   *  inline — we never fake a success. */
  const startPayment = async (
    provider: "STRIPE" | "PAYPAL" | "APPLE_PAY" | "GOOGLE_PAY",
    providerRoute: { url: string; key: "url" | "approvalUrl" },
  ) => {
    if (!contactData) return;
    setPaying(true);
    setPayError(null);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id, name: contactData.name, email: contactData.email,
          paymentProvider: provider,
          ...(contactData.phone ? { phone: contactData.phone } : {}),
          ...(contactData.country ? { country: contactData.country } : {}),
        }),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) { setPayError(orderJson.error ?? "Could not create your order."); setPaying(false); return; }
      const orderId: string = orderJson.orderId;

      const res = await fetch(providerRoute.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => ({}));
      const redirect = data[providerRoute.key];
      if (res.ok && redirect) {
        window.location.href = redirect;
        return;
      }
      setPayError(data.error ?? "Payment could not be started. Please try again.");
      setPaying(false);
    } catch {
      setPayError("Payment could not be started. Please try again.");
      setPaying(false);
    }
  };

  const handleCardPay = () => startPayment("STRIPE", { url: "/api/checkout/stripe", key: "url" });
  const handlePayPal = () => startPayment("PAYPAL", { url: "/api/checkout/paypal", key: "approvalUrl" });
  const handleAppleGooglePay = () => startPayment("APPLE_PAY", { url: "/api/checkout/stripe", key: "url" });

  const total = plan.price - discount;

  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`flex items-center gap-1.5 font-medium ${step === "contact" ? "text-black" : "text-black/30"}`}>
          <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${step === "contact" ? "bg-black text-white" : "bg-black/10 text-black/40"}`}>1</div>
          Contact
        </div>
        <ChevronRight className="w-4 h-4 text-black/20" />
        <div className={`flex items-center gap-1.5 font-medium ${step === "payment" ? "text-black" : "text-black/30"}`}>
          <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${step === "payment" ? "bg-black text-white" : "bg-black/10 text-black/40"}`}>2</div>
          Payment
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "contact" ? (
          <motion.div key="contact" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
            <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
              <h3 className="font-display font-bold text-base text-black mb-4">Your details</h3>
              <form onSubmit={handleSubmit(onContactSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-black/50 mb-1.5 block">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                    <input {...register("name")} placeholder="John Smith" autoComplete="name"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${errors.name ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-black/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-black/50 mb-1.5 block">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                    <input {...register("email")} type="email" placeholder="you@example.com" autoComplete="email"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${errors.email ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100" : "border-black/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`} />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                  <p className="mt-1.5 text-xs text-black/30">Your eSIM QR code will be sent here instantly after payment.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-black/50 mb-1.5 block">Phone <span className="text-black/25">(optional)</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                      <input {...register("phone")} type="tel" placeholder="+1 555 000 0000" autoComplete="tel"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-black/50 mb-1.5 block">Country <span className="text-black/25">(optional)</span></label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                      <input {...register("country")} placeholder="United States" autoComplete="country-name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                    </div>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.98 }} type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black text-white font-semibold text-sm hover:bg-black/80 transition-all shadow-md shadow-black/10">
                  Continue to payment <ChevronRight className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div key="payment" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            {/* Contact summary */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/[0.02] rounded-xl border border-black/5 mb-4">
              <div className="text-sm text-black/60">
                <span className="font-medium text-black">{contactData?.name}</span> · {contactData?.email}
              </div>
              <button onClick={() => setStep("contact")} className="text-xs text-blue-600 font-medium hover:underline">Edit</button>
            </div>

            {/* Payment method selector */}
            <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm mb-4">
              <h3 className="font-display font-bold text-base text-black mb-4">Payment method</h3>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                      paymentMethod === m.id ? "border-blue-500 bg-blue-50/30" : "border-black/[0.06] hover:border-black/15"
                    }`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${paymentMethod === m.id ? "bg-blue-100" : "bg-black/5"}`}>
                      {m.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-black">{m.label}</div>
                      {m.sub && <div className="text-xs text-black/40">{m.sub}</div>}
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${paymentMethod === m.id ? "border-blue-500 bg-blue-500" : "border-black/20"}`}>
                      {paymentMethod === m.id && <div className="w-full h-full rounded-full bg-white scale-[0.4]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment action */}
            <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
              <AnimatePresence mode="wait">
                {paymentMethod === "crypto" ? (
                  <motion.div key="crypto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <CryptoPayment
                      planId={plan.id}
                      planName={plan.name}
                      usdAmount={total / 100}
                      customerEmail={contactData?.email ?? ""}
                      customerName={contactData?.name ?? ""}
                      customerPhone={contactData?.phone ?? ""}
                      customerCountry={contactData?.country ?? ""}
                      onSuccess={(orderId) => router.push(`/checkout/success?orderId=${encodeURIComponent(orderId)}`)}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="other" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Card form mockup */}
                    {paymentMethod === "card" && (
                      <div className="space-y-3 mb-4">
                        <div>
                          <label className="text-xs font-medium text-black/50 mb-1.5 block">Card number</label>
                          <div className="relative">
                            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                            <input placeholder="1234 5678 9012 3456" className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-black/50 mb-1.5 block">Expiry</label>
                            <input placeholder="MM / YY" className="w-full px-3 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-black/50 mb-1.5 block">CVC</label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
                              <input placeholder="123" maxLength={4} className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <motion.button whileTap={{ scale: 0.98 }} disabled={paying}
                      onClick={paymentMethod === "card" ? handleCardPay : paymentMethod === "paypal" ? handlePayPal : handleAppleGooglePay}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-black text-white font-bold text-base hover:bg-black/80 transition-all shadow-lg shadow-black/15 disabled:opacity-60">
                      {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <>
                        {paymentMethod === "card" && <><Shield className="w-4 h-4" /> Pay ${(total / 100).toFixed(2)} securely</>}
                        {paymentMethod === "paypal" && <>Pay with PayPal · ${(total / 100).toFixed(2)}</>}
                        {paymentMethod === "apple_pay" && <><Smartphone className="w-4 h-4" /> Pay with Apple Pay</>}
                        {paymentMethod === "google_pay" && <>Pay with Google Pay · ${(total / 100).toFixed(2)}</>}
                      </>}
                    </motion.button>

                    {payError && <p className="text-center text-xs text-red-500 mt-2">{payError}</p>}

                    <p className="text-center text-xs text-black/30 mt-3 flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3" /> 256-bit SSL encryption · PCI DSS compliant
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Stripe client singleton
 *
 * Install: npm install stripe @stripe/stripe-js @stripe/react-stripe-js
 *
 * Add to .env.local:
 *   STRIPE_SECRET_KEY=sk_live_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
 */

// Dynamic import so build doesn't fail without the package
let _stripe: unknown = null;

export async function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!_stripe) {
    // const Stripe = (await import("stripe")).default;
    // _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18" });
  }
  return _stripe;
}

export const STRIPE_PLANS: Record<string, { priceId: string; name: string; amount: number }> = {
  // Map plan slugs to Stripe Price IDs (create in Stripe Dashboard)
  "tmobile-5gb":        { priceId: "price_tmobile_5gb",        name: "T-Mobile 5GB",       amount: 999  },
  "tmobile-15gb":       { priceId: "price_tmobile_15gb",       name: "T-Mobile 15GB",      amount: 1999 },
  "tmobile-unlimited":  { priceId: "price_tmobile_unlimited",  name: "T-Mobile Unlimited", amount: 2999 },
  "verizon-25gb":       { priceId: "price_verizon_25gb",       name: "Verizon 25GB",       amount: 2499 },
  "verizon-50gb":       { priceId: "price_verizon_50gb",       name: "Verizon 50GB",       amount: 3999 },
  "verizon-100gb":      { priceId: "price_verizon_100gb",      name: "Verizon 100GB",      amount: 5999 },
  "att-10gb":           { priceId: "price_att_10gb",           name: "AT&T 10GB",          amount: 1499 },
  "att-30gb":           { priceId: "price_att_30gb",           name: "AT&T 30GB",          amount: 2499 },
  "att-unlimited":      { priceId: "price_att_unlimited",      name: "AT&T Unlimited",     amount: 3499 },
  "mint-10gb":          { priceId: "price_mint_10gb",          name: "Mint 10GB",          amount: 1499 },
};

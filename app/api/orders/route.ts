export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, checkoutLimiter } from "@/lib/rate-limit";

/**
 * POST /api/orders
 * Creates a PENDING order for a guest (or logged-in) buyer and returns its id.
 * The id is then handed to the payment provider as metadata.orderId so the
 * webhook can fulfill it. Minimal guest fields: name + email (phone optional).
 */

const bodySchema = z.object({
  planId: z.string().min(1),
  name: z.string().min(2, "Name required").max(120),
  email: z.string().email("Valid email required"),
  phone: z.string().max(30).optional().or(z.literal("")),
  paymentProvider: z
    .enum(["STRIPE", "PAYPAL", "CRYPTO", "RAZORPAY", "APPLE_PAY", "GOOGLE_PAY"])
    .default("STRIPE"),
  compat: z.string().optional(),
});

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const limit = await rateLimit(req, checkoutLimiter);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
  }

  let data: z.infer<typeof bodySchema>;
  try {
    data = bodySchema.parse(await req.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message ?? "Invalid input" : "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    const plan = await db.plan.findUnique({ where: { id: data.planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not available" }, { status: 404 });
    }

    const email = data.email.toLowerCase().trim();
    const user = await db.user.upsert({
      where: { email },
      update: { name: data.name, ...(data.phone ? { phone: data.phone } : {}) },
      create: { email, name: data.name, ...(data.phone ? { phone: data.phone } : {}) },
    });

    const order = await db.order.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: "PENDING",
        amount: plan.price,
        currency: "USD",
        paymentProvider: data.paymentProvider,
        metadata: data.compat ? { compat: data.compat } : undefined,
      },
    });

    return NextResponse.json({ orderId: order.id, amount: Number(plan.price), currency: "USD" });
  } catch (err) {
    console.error("[orders] create failed", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

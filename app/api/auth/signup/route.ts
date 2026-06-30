export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken, createSessionCookie } from "@/lib/session";
import { sendWelcomeEmail } from "@/lib/email";
import { cookies } from "next/headers";

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not configured. Set DATABASE_URL." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const { fullName, email, password, referralCode: bodyRefCode } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Read referral code from cookie or body
    const cookieStore = await cookies();
    const refCode = bodyRefCode || cookieStore.get("simkuu_referral")?.value;

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Validate referral code (prevent self-referral checked by email)
    let referredById: string | undefined;
    if (refCode) {
      const referrer = await db.user.findUnique({
        where: { referralCode: refCode },
        select: { id: true, email: true },
      });
      if (referrer && referrer.email !== normalizedEmail) {
        referredById = referrer.id;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        name: fullName,
        email: normalizedEmail,
        hashedPassword,
        ...(referredById ? { referredById } : {}),
      },
    });

    // Send welcome email (best-effort — never block signup)
    sendWelcomeEmail(user.email, user.name ?? fullName).catch(e =>
      console.error("[signup] welcome email failed:", e)
    );

    const token = signToken({
      userId: user.id,
      email: user.email,
      fullName: user.name ?? fullName,
    });
    const cookie = createSessionCookie(token);

    const res = NextResponse.json(
      {
        success: true,
        user: { id: user.id, email: user.email, fullName: user.name ?? fullName },
      },
      { status: 201 }
    );
    res.cookies.set(cookie);
    // Clear referral cookie
    res.cookies.set("simkuu_referral", "", { maxAge: 0, path: "/" });
    return res;
  } catch (e) {
    console.error("[signup]", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

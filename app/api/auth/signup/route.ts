export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmailVerification } from "@/lib/email";
import { cookies } from "next/headers";
import { rateLimit, authLimiter } from "@/lib/rate-limit";

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

/** Cryptographically secure 6-digit OTP */
function generateOTP(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function POST(req: NextRequest) {
  // ── Rate limit ────────────────────────────────────────────────────────────
  const limit = await rateLimit(req, authLimiter);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429 }
    );
  }

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
      // If user exists but is not verified, allow re-sending OTP
      if (!existing.emailVerified) {
        await db.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });
        const otp = generateOTP();
        await db.verificationToken.create({
          data: {
            identifier: normalizedEmail,
            token: otp,
            expires: new Date(Date.now() + 10 * 60 * 1000),
          },
        });
        await sendEmailVerification(normalizedEmail, otp);
        return NextResponse.json(
          { requiresVerification: true, email: normalizedEmail },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Validate referral code
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

    // Create user WITHOUT setting emailVerified
    await db.user.create({
      data: {
        name: fullName,
        email: normalizedEmail,
        hashedPassword,
        emailVerified: null,
        ...(referredById ? { referredById } : {}),
      },
    });

    // Generate OTP and store in VerificationToken
    const otp = generateOTP();
    await db.verificationToken.deleteMany({ where: { identifier: normalizedEmail } });
    await db.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token: otp,
        expires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const emailResult = await sendEmailVerification(normalizedEmail, otp);
    if (!emailResult.success) {
      console.error("[signup] Failed to send verification email:", emailResult.error);
    }

    const res = NextResponse.json(
      { requiresVerification: true, email: normalizedEmail },
      { status: 201 }
    );
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

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmailVerification } from "@/lib/email";
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

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

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
      // If user exists but is not verified, allow re-sending OTP
      if (!existing.emailVerified) {
        // Delete old tokens and send a new OTP
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
    const user = await db.user.create({
      data: {
        name: fullName,
        email: normalizedEmail,
        hashedPassword,
        emailVerified: null, // Must verify email before logging in
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
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send verification email — if this fails, still return success so user knows to check email
    const emailResult = await sendEmailVerification(normalizedEmail, otp);
    if (!emailResult.success) {
      console.error("[signup] Failed to send verification email:", emailResult.error);
    }

    // Do NOT set session cookie — user must verify email first
    const res = NextResponse.json(
      { requiresVerification: true, email: normalizedEmail },
      { status: 201 }
    );
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

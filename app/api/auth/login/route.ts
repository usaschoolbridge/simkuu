export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken, createSessionCookie } from "@/lib/session";
import { rateLimit, authLimiter } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  // ── Rate limit: 5 attempts per minute per IP ─────────────────────────────
  const limit = await rateLimit(req, authLimiter);
  if (!limit.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please wait a minute and try again." },
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
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }
    const { email, password, rememberMe } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const user = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.hashedPassword) {
      // Constant-time response to prevent timing attacks / email enumeration
      await bcrypt.compare(password, "$2a$12$dummy.hash.to.prevent.timing.attack.padding");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.hashedPassword);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Block unverified users
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: "Please verify your email address before logging in.",
          requiresVerification: true,
          email: normalizedEmail,
        },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      fullName: user.name ?? "",
    });
    const cookie = createSessionCookie(token, rememberMe);

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, fullName: user.name ?? "" },
    });
    res.cookies.set(cookie);
    return res;
  } catch (e) {
    console.error("[login]", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

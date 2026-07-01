export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken, createSessionCookie } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
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

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { signToken, createSessionCookie } from "@/lib/session";
import { sendWelcomeEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "Enter the 6-digit code"),
});

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { email, otp } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  try {
    // Find the verification token
    const record = await db.verificationToken.findFirst({
      where: { identifier: normalizedEmail, token: otp },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }

    if (record.expires < new Date()) {
      await db.verificationToken.delete({ where: { identifier_token: { identifier: normalizedEmail, token: otp } } });
      return NextResponse.json({ error: "This code has expired. Please request a new one." }, { status: 400 });
    }

    // Find the user
    const user = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    // Mark email as verified and delete token in parallel
    await Promise.all([
      db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      db.verificationToken.deleteMany({ where: { identifier: normalizedEmail } }),
    ]);

    // Send welcome email (best-effort)
    sendWelcomeEmail(user.email, user.name ?? "there").catch((e) =>
      console.error("[verify-email] welcome email failed:", e)
    );

    // Create session — user is now verified and logged in
    const token = signToken({
      userId: user.id,
      email: user.email,
      fullName: user.name ?? "",
    });
    const cookie = createSessionCookie(token, false);

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, fullName: user.name ?? "" },
    });
    res.cookies.set(cookie);
    return res;
  } catch (e) {
    console.error("[verify-email]", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmailVerification } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const normalizedEmail = parsed.data.email.toLowerCase();

  try {
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, emailVerified: true, name: true },
    });

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    // Rate limit: check if a token was created recently (expires > 9.5 min from now = created < 30s ago)
    const existing = await db.verificationToken.findFirst({
      where: { identifier: normalizedEmail },
    });

    if (existing) {
      const createdApprox = new Date(existing.expires.getTime() - 10 * 60 * 1000);
      const secondsSinceCreated = (Date.now() - createdApprox.getTime()) / 1000;
      if (secondsSinceCreated < 60) {
        return NextResponse.json(
          { error: "Please wait 60 seconds before requesting a new code." },
          { status: 429 }
        );
      }
    }

    // Delete old tokens and create a new OTP
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

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[resend-verification]", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().max(30).optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/, "One uppercase letter").regex(/[0-9]/, "One number"),
});

export async function GET() {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true, name: true, email: true, phone: true, image: true,
        customerNo: true, createdAt: true, emailVerified: true, walletBalance: true,
        referralCode: true, twoFactorEnabled: true, hashedPassword: true,
      },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      image: user.image,
      customerNo: `SIM${String(user.customerNo).padStart(6, "0")}`,
      memberSince: new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      emailVerified: !!user.emailVerified,
      walletBalance: Number(user.walletBalance),
      referralCode: user.referralCode,
      twoFactorEnabled: user.twoFactorEnabled,
      hasPassword: !!user.hashedPassword,
    });
  } catch (err) {
    console.error("[dashboard/profile GET]", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!db) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    if (body.action === "change_password") {
      const parsed = passwordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
      }

      const user = await db.user.findUnique({ where: { id: session.userId }, select: { hashedPassword: true } });
      if (!user?.hashedPassword) {
        return NextResponse.json({ error: "No password set on this account (OAuth login)" }, { status: 400 });
      }

      const valid = await bcrypt.compare(parsed.data.currentPassword, user.hashedPassword);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }

      const hashed = await bcrypt.hash(parsed.data.newPassword, 12);
      await db.user.update({ where: { id: session.userId }, data: { hashedPassword: hashed } });
      return NextResponse.json({ ok: true });
    }

    // Profile update
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: session.userId },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.phone !== undefined ? { phone: parsed.data.phone || null } : {}),
      },
      select: { name: true, phone: true },
    });

    return NextResponse.json({ ok: true, name: updated.name, phone: updated.phone });
  } catch (err) {
    console.error("[dashboard/profile PATCH]", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

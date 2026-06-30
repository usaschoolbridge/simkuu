export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  let body: Partial<ContactPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, subject, message, category } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Name is required (minimum 2 characters)." }, { status: 422 });
  }
  if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
    return NextResponse.json({ error: "A valid email address is required." }, { status: 422 });
  }
  if (!subject || typeof subject !== "string" || subject.trim().length < 3) {
    return NextResponse.json({ error: "Subject is required (minimum 3 characters)." }, { status: 422 });
  }
  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return NextResponse.json({ error: "Message is required (minimum 10 characters)." }, { status: 422 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (db) {
    try {
      const user = await db.user.upsert({
        where: { email: cleanEmail },
        update: {},
        create: { email: cleanEmail, name: cleanName },
      });

      await db.supportTicket.create({
        data: {
          userId: user.id,
          subject: subject.trim(),
          category: category?.trim() ?? "General",
          priority: "MEDIUM",
          status: "OPEN",
          messages: {
            create: {
              authorId: user.id,
              isAgent: false,
              content: message.trim(),
            },
          },
        },
      });
    } catch (e) {
      console.error("[Contact] Failed to create ticket:", e);
    }
  } else {
    console.log("[Contact Form — no DB]", { cleanName, cleanEmail, subject, message });
  }

  return NextResponse.json(
    { success: true, message: "Thank you for reaching out! Our team will respond within 24 hours." },
    { status: 200 }
  );
}

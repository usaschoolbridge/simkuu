import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
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

  const { name, email, subject, message } = body;

  // Validate required fields
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

  // Sanitized values
  const payload: ContactPayload = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
  };

  // Log submission (Resend email integration can be added here later)
  console.log("[Contact Form Submission]", {
    timestamp: new Date().toISOString(),
    ...payload,
  });

  // TODO: Replace with Resend email integration
  // import { Resend } from "resend";
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: "noreply@simkuu.com",
  //   to: "support@simkuu.com",
  //   subject: `[Contact] ${payload.subject}`,
  //   text: `From: ${payload.name} <${payload.email}>\n\n${payload.message}`,
  // });

  return NextResponse.json(
    {
      success: true,
      message: "Thank you for reaching out! Our team will respond within 24 hours.",
    },
    { status: 200 }
  );
}

export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    // TODO: integrate with email provider (Resend, Mailchimp, etc.)
    console.log("[newsletter] New subscriber:", parsed.data.email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ADMIN_PASSWORD = process.env.ADMIN_SECRET_KEY ?? "simkuu-admin-2024";
const COOKIE_NAME = "simkuu_admin_session";
const COOKIE_VALUE = "authenticated";

// POST /api/admin/auth — login
export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return res;
}

// DELETE /api/admin/auth — logout
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}

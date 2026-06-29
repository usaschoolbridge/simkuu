export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getProviderConfig, OAUTH_STATE_COOKIE } from "@/lib/auth/oauth";

// GET /api/auth/oauth/:provider — start the OAuth flow (redirect to provider)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const config = getProviderConfig(provider);

  const origin = req.nextUrl.origin;

  if (!config) {
    // Provider not configured — bounce back to the auth page with a clear flag
    const url = new URL("/login", origin);
    url.searchParams.set("error", `${provider}_not_configured`);
    return NextResponse.redirect(url);
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${origin}/api/auth/oauth/${provider}/callback`;

  const authUrl = new URL(config.authorizeUrl);
  authUrl.searchParams.set("client_id", config.clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", config.scope);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("response_type", "code");
  if (provider === "google") {
    authUrl.searchParams.set("access_type", "online");
    authUrl.searchParams.set("prompt", "select_account");
  }
  if (config.useFormPost) {
    // Apple requires form_post when the "name"/"email" scopes are requested.
    authUrl.searchParams.set("response_mode", "form_post");
  }

  const res = NextResponse.redirect(authUrl);
  res.cookies.set({
    name: OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    // Apple posts the callback cross-site (form_post), which strips a "lax"
    // cookie — it must be "none" (and therefore secure) to survive that POST.
    secure: config.useFormPost ? true : process.env.NODE_ENV === "production",
    sameSite: config.useFormPost ? "none" : "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}

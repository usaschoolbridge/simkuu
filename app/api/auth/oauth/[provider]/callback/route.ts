export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { getProviderConfig, OAUTH_STATE_COOKIE, ProviderConfig } from "@/lib/auth/oauth";
import { signToken, createSessionCookie } from "@/lib/session";

interface NormalizedProfile {
  email: string;
  name: string;
  image: string | null;
}

function fail(origin: string, reason: string) {
  const url = new URL("/login", origin);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

// Google / GitHub / Microsoft come back as a GET redirect.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const sp = req.nextUrl.searchParams;
  return handleCallback(req, provider, {
    code: sp.get("code"),
    state: sp.get("state"),
    appleUser: null,
  });
}

// Apple posts the callback as application/x-www-form-urlencoded.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const form = await req.formData();
  return handleCallback(req, provider, {
    code: (form.get("code") as string) ?? null,
    state: (form.get("state") as string) ?? null,
    // Apple sends the user's name only on the very first authorization.
    appleUser: (form.get("user") as string) ?? null,
  });
}

async function handleCallback(
  req: NextRequest,
  provider: string,
  input: { code: string | null; state: string | null; appleUser: string | null }
) {
  const origin = req.nextUrl.origin;
  const config = getProviderConfig(provider);

  if (!config) return fail(origin, `${provider}_not_configured`);
  if (!db) return fail(origin, "db_unavailable");

  const { code, state, appleUser } = input;
  const savedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code) return fail(origin, "oauth_no_code");
  if (!state || !savedState || state !== savedState) {
    return fail(origin, "oauth_state_mismatch");
  }

  const redirectUri = `${origin}/api/auth/oauth/${provider}/callback`;

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      id_token?: string;
      error?: string;
    };
    if (!tokenRes.ok) {
      console.error("[oauth] token exchange failed", provider, tokenData);
      return fail(origin, "oauth_token_failed");
    }

    // 2. Resolve the profile
    let profile: NormalizedProfile | null;
    if (config.profileFromIdToken) {
      profile = profileFromIdToken(tokenData.id_token, appleUser);
    } else {
      if (!tokenData.access_token) return fail(origin, "oauth_token_failed");
      profile = await fetchProfile(provider, config, tokenData.access_token);
    }
    if (!profile?.email) return fail(origin, "oauth_no_email");

    const normalizedEmail = profile.email.toLowerCase();

    // 3. Find or create the user
    let user = await db.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          name: profile.name || normalizedEmail.split("@")[0],
          image: profile.image,
          emailVerified: new Date(),
        },
      });
    } else if (!user.image && profile.image) {
      user = await db.user.update({
        where: { id: user.id },
        data: { image: profile.image },
      });
    }

    // 4. Issue our session cookie and redirect
    const token = signToken({
      userId: user.id,
      email: user.email,
      fullName: user.name ?? profile.name,
    });
    const cookie = createSessionCookie(token, true);

    const res = NextResponse.redirect(new URL("/dashboard", origin));
    res.cookies.set(cookie);
    res.cookies.set({ name: OAUTH_STATE_COOKIE, value: "", maxAge: 0, path: "/" });
    return res;
  } catch (e) {
    console.error("[oauth] callback error", provider, e);
    return fail(origin, "oauth_error");
  }
}

function profileFromIdToken(
  idToken: string | undefined,
  appleUser: string | null
): NormalizedProfile | null {
  if (!idToken) return null;
  const decoded = jwt.decode(idToken) as { email?: string } | null;
  if (!decoded?.email) return null;

  // Apple only sends the name on first login, via a separate JSON "user" field.
  let name = "";
  if (appleUser) {
    try {
      const parsed = JSON.parse(appleUser) as {
        name?: { firstName?: string; lastName?: string };
      };
      name = [parsed.name?.firstName, parsed.name?.lastName].filter(Boolean).join(" ");
    } catch {
      /* ignore malformed user payload */
    }
  }

  return { email: decoded.email, name, image: null };
}

async function fetchProfile(
  provider: string,
  config: ProviderConfig,
  accessToken: string
): Promise<NormalizedProfile | null> {
  if (provider === "google") {
    const res = await fetch(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { email?: string; name?: string; picture?: string };
    if (!data.email) return null;
    return { email: data.email, name: data.name ?? "", image: data.picture ?? null };
  }

  if (provider === "microsoft") {
    const res = await fetch(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      mail?: string | null;
      userPrincipalName?: string;
      displayName?: string;
    };
    const email = data.mail ?? data.userPrincipalName ?? null;
    if (!email) return null;
    return { email, name: data.displayName ?? "", image: null };
  }

  if (provider === "github") {
    const res = await fetch(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "simkuu",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      email?: string | null;
      name?: string;
      login?: string;
      avatar_url?: string;
    };

    let email = data.email ?? null;
    // GitHub often hides the primary email — fetch it explicitly
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "simkuu",
        },
      });
      if (emailRes.ok) {
        const emails = (await emailRes.json()) as Array<{
          email: string;
          primary: boolean;
          verified: boolean;
        }>;
        email = emails.find((e) => e.primary && e.verified)?.email ?? emails[0]?.email ?? null;
      }
    }
    if (!email) return null;
    return { email, name: data.name ?? data.login ?? "", image: data.avatar_url ?? null };
  }

  return null;
}

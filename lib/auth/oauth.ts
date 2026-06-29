/**
 * OAuth provider configuration for Google, GitHub, Microsoft (Hotmail/Outlook)
 * and Apple sign-in.
 *
 * Reads client credentials from environment variables. A provider is only
 * "configured" (and its button only functional) when its required env vars
 * are present.
 *
 * Apple is special:
 *   - the client secret is a short-lived ES256 JWT we sign ourselves
 *   - the callback uses response_mode=form_post (an HTTP POST, not GET)
 *   - the profile email lives in the returned id_token, not a userinfo endpoint
 */

import jwt from "jsonwebtoken";

export type OAuthProvider = "google" | "github" | "microsoft" | "apple";

export interface ProviderConfig {
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string; // empty for apple (uses id_token instead)
  scope: string;
  clientId: string;
  clientSecret: string;
  /** Apple posts the callback as form data instead of a GET query string. */
  useFormPost?: boolean;
  /** Apple returns the profile inside the id_token, no userinfo call. */
  profileFromIdToken?: boolean;
}

function appleClientSecret(): string | null {
  const teamId = process.env.APPLE_TEAM_ID ?? "";
  const keyId = process.env.APPLE_KEY_ID ?? "";
  const clientId = process.env.APPLE_CLIENT_ID ?? ""; // Services ID
  // Private key (.p8 contents). Newlines may be escaped in env vars.
  const privateKey = (process.env.APPLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  if (!teamId || !keyId || !clientId || !privateKey) return null;

  return jwt.sign({}, privateKey, {
    algorithm: "ES256",
    keyid: keyId,
    issuer: teamId,
    audience: "https://appleid.apple.com",
    subject: clientId,
    expiresIn: "5m",
  });
}

export function getProviderConfig(provider: string): ProviderConfig | null {
  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
    if (!clientId || !clientSecret) return null;
    return {
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
      scope: "openid email profile",
      clientId,
      clientSecret,
    };
  }

  if (provider === "github") {
    const clientId = process.env.GITHUB_CLIENT_ID ?? "";
    const clientSecret = process.env.GITHUB_CLIENT_SECRET ?? "";
    if (!clientId || !clientSecret) return null;
    return {
      authorizeUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      userInfoUrl: "https://api.github.com/user",
      scope: "read:user user:email",
      clientId,
      clientSecret,
    };
  }

  if (provider === "microsoft") {
    const clientId = process.env.MICROSOFT_CLIENT_ID ?? "";
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET ?? "";
    if (!clientId || !clientSecret) return null;
    // "common" allows both personal (Hotmail/Outlook) and work/school accounts.
    const tenant = process.env.MICROSOFT_TENANT ?? "common";
    return {
      authorizeUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
      tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      userInfoUrl: "https://graph.microsoft.com/v1.0/me",
      scope: "openid email profile User.Read",
      clientId,
      clientSecret,
    };
  }

  if (provider === "apple") {
    const clientId = process.env.APPLE_CLIENT_ID ?? "";
    const clientSecret = appleClientSecret();
    if (!clientId || !clientSecret) return null;
    return {
      authorizeUrl: "https://appleid.apple.com/auth/authorize",
      tokenUrl: "https://appleid.apple.com/auth/token",
      userInfoUrl: "",
      scope: "name email",
      clientId,
      clientSecret,
      useFormPost: true,
      profileFromIdToken: true,
    };
  }

  return null;
}

export function isProviderConfigured(provider: string): boolean {
  return getProviderConfig(provider) !== null;
}

export const OAUTH_STATE_COOKIE = "simkuu_oauth_state";

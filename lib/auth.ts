/**
 * NextAuth v5 configuration
 *
 * To enable OAuth, add to .env.local:
 *   AUTH_SECRET=<generate with: openssl rand -base64 32>
 *   AUTH_GOOGLE_ID=<from Google Cloud Console>
 *   AUTH_GOOGLE_SECRET=<from Google Cloud Console>
 *   AUTH_GITHUB_ID=<from GitHub Developer Settings>
 *   AUTH_GITHUB_SECRET=<from GitHub Developer Settings>
 *
 * Install: npm install next-auth@beta @auth/prisma-adapter
 */

import type { NextAuthConfig } from "next-auth";

// Placeholder config — replace with real NextAuth import once next-auth@beta is installed
export const authConfig: NextAuthConfig = {
  providers: [
    // GoogleProvider({ clientId: process.env.AUTH_GOOGLE_ID!, clientSecret: process.env.AUTH_GOOGLE_SECRET! }),
    // GitHubProvider({ clientId: process.env.AUTH_GITHUB_ID!, clientSecret: process.env.AUTH_GITHUB_SECRET! }),
    // Credentials({ ... })
  ],
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/verify-email",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/admin");
      if (isProtected && !isLoggedIn) return false;
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
};

// Export placeholder - real export would be:
// export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const handlers = { GET: () => new Response(), POST: () => new Response() };
export const auth = async () => null;
export const signIn = async () => {};
export const signOut = async () => {};

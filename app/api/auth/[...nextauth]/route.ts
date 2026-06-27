/**
 * NextAuth v5 route handler
 *
 * Uncomment when next-auth@beta is installed:
 * import { handlers } from "@/lib/auth";
 * export const { GET, POST } = handlers;
 */

export async function GET() {
  return new Response(JSON.stringify({ error: "Auth not configured" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST() {
  return new Response(JSON.stringify({ error: "Auth not configured" }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

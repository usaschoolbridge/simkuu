import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_COOKIE_NAME } from "@/lib/admin-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  // Gate for the /admin/* group: require a session cookie to render the panel.
  //
  // We intentionally do NOT re-verify the JWT signature here. The authoritative
  // verification runs on EVERY /api/admin/* route via requireAdmin(), which
  // returns 401 for any missing/invalid/expired token — so no admin data is
  // ever served without a valid session, regardless of this page shell.
  // Verifying the JWT in this layout render context proved unreliable on the
  // hosting runtime and locked out valid sessions (the same cookie the API
  // accepted was rejected here), so presence is the gate and the APIs are the
  // real security boundary.
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    redirect("/admin-login");
  }
  return <AdminShell>{children}</AdminShell>;
}

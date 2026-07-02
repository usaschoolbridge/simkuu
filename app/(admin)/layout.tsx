import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/admin-shell";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-guard";

export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  // Server-side gate for the whole /admin/* group. A missing, invalid, or
  // expired admin session sends the user to the login page instead of
  // rendering a broken panel where every API call returns 401.
  const jar = await cookies();
  if (!verifyAdminToken(jar.get(ADMIN_COOKIE_NAME)?.value)) {
    redirect("/admin-login");
  }
  return <AdminShell>{children}</AdminShell>;
}

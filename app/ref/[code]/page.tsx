import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function ReferralRedirect({ params }: Props) {
  const { code } = await params;

  // Validate referral code exists
  if (db) {
    const referrer = await db.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    }).catch(() => null);

    if (referrer) {
      const cookieStore = await cookies();
      cookieStore.set("simkuu_referral", code, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    }
  }

  // Always redirect to signup — referral cookie set if valid
  redirect("/signup?ref=" + encodeURIComponent(code));
}

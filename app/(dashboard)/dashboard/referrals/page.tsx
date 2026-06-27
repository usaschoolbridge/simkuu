import type { Metadata } from "next";
import { ReferralsContent } from "@/components/dashboard/referrals-content";

export const metadata: Metadata = { title: "Referrals — Simkuu" };

export default function ReferralsPage() {
  return <ReferralsContent />;
}

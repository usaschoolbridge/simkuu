import type { Metadata } from "next";
import { ProfileContent } from "@/components/dashboard/profile-content";

export const metadata: Metadata = { title: "Profile — Simkuu" };

export default function ProfilePage() {
  return <ProfileContent />;
}

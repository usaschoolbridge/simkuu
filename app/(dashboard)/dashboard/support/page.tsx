import type { Metadata } from "next";
import { SupportContent } from "@/components/dashboard/support-content";

export const metadata: Metadata = { title: "Support — Simkuu" };

export default function SupportPage() {
  return <SupportContent />;
}

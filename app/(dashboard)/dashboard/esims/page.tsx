import type { Metadata } from "next";
import { EsimsContent } from "@/components/dashboard/esims-content";

export const metadata: Metadata = { title: "My eSIMs — Simkuu" };

export default function EsimsPage() {
  return <EsimsContent />;
}

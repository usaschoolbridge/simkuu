import type { Metadata } from "next";
import { InvoicesContent } from "@/components/dashboard/invoices-content";

export const metadata: Metadata = { title: "Invoices — Simkuu" };

export default function InvoicesPage() {
  return <InvoicesContent />;
}

import type { Metadata } from "next";
import { WalletContent } from "@/components/dashboard/wallet-content";

export const metadata: Metadata = { title: "Wallet — Simkuu" };

export default function WalletPage() {
  return <WalletContent />;
}

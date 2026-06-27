import type { Metadata } from "next";
import { OrdersContent } from "@/components/dashboard/orders-content";

export const metadata: Metadata = { title: "Orders — Simkuu" };

export default function OrdersPage() {
  return <OrdersContent />;
}

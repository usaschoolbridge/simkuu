import type { Metadata } from "next";
import { NotificationsContent } from "@/components/dashboard/notifications-content";

export const metadata: Metadata = { title: "Notifications — Simkuu" };

export default function NotificationsPage() {
  return <NotificationsContent />;
}

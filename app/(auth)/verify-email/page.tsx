import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";

export const metadata: Metadata = {
  title: "Verify Email — Simkuu",
  description: "Verify your Simkuu email address.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

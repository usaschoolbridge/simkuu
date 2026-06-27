import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password — Simkuu",
  description: "Set a new password for your Simkuu account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}

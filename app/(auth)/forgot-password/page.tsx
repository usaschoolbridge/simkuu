import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password — Simkuu",
  description: "Reset your Simkuu account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

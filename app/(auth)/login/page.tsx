import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In — Simkuu",
  description: "Sign in to your Simkuu account to manage your eSIMs and orders.",
};

export default function LoginPage() {
  return <LoginForm />;
}

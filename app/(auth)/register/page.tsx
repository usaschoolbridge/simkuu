import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account — Simkuu",
  description: "Create your free Simkuu account and get instant access to USA eSIM plans.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}

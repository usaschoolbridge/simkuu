import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create Account — Simkuu",
  description:
    "Sign up for Simkuu and get instant access to premium USA eSIMs from T-Mobile, Verizon, AT&T and more.",
  openGraph: {
    title: "Create Account | Simkuu",
    description:
      "Sign up for Simkuu — premium USA eSIMs. No contracts. Instant activation.",
    url: "https://simkuu.com/signup",
  },
  alternates: { canonical: "https://simkuu.com/signup" },
};

export default function SignupPage() {
  return <RegisterForm />;
}

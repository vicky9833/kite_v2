// src/app/signin/page.tsx
import type { Metadata } from "next";
import { LogIn, Rocket, ShieldCheck } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Sign In — KITE",
  description: "Access your KITE account to manage applications, schemes, and connections.",
};

const ITEMS = [
  { id: "register", icon: Rocket, title: "New here? Register", description: "Create your KITE profile to unlock scheme matching and your dashboard.", href: "/register", hrefLabel: "Register your startup" },
  { id: "investor", icon: LogIn, title: "Investors", description: "Onboard your firm to access thesis-matched startups and your pipeline.", href: "/investors/onboard", hrefLabel: "Onboard your firm" },
  { id: "security", icon: ShieldCheck, title: "Secure access", description: "Authenticated accounts open in Phase 2. Today, registration and the dashboards run in a session-only preview.", href: "/support", hrefLabel: "Learn more" },
];

export default function SignInPage() {
  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Sign in to KITE"
        subtitle="Authenticated sign-in opens in Phase 2. For now, register your startup or onboard your firm to explore the personalized preview."
        actions={[
          { label: "Register Your Startup", href: "/register" },
          { label: "Onboard as Investor", href: "/investors/onboard", variant: "outline" },
        ]}
      />
      <ContentSection id="signin" heading="Get into the ecosystem">
        <InfoGrid items={ITEMS} />
      </ContentSection>
    </>
  );
}

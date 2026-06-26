// src/app/startups/page.tsx
import type { Metadata } from "next";
import { Calculator, Rocket, Search, Users } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "For Startups — KITE",
  description: "Resources, schemes, and programs to help Karnataka startups launch and scale.",
};

const ITEMS = [
  { id: "register", icon: Rocket, title: "Register your startup", description: "Create your KITE profile and unlock scheme matching in minutes.", href: "/register", hrefLabel: "Start registration" },
  { id: "eligibility", icon: Calculator, title: "Check eligibility", description: "Use the Policy Calculator to see which of the 22 schemes you qualify for.", href: "/calculator", hrefLabel: "Open calculator" },
  { id: "schemes", icon: Search, title: "Browse schemes", description: "Explore fiscal incentives and grant-in-aid programs with benefits and criteria.", href: "/schemes", hrefLabel: "All schemes" },
  { id: "incubators", icon: Users, title: "Find an incubator", description: "164+ incubators and accelerators across Karnataka, filterable by stage and sector.", href: "/incubators", hrefLabel: "Find incubators" },
  { id: "mentors", icon: Users, title: "Find a mentor", description: "Domain experts, founder mentors, investor mentors, and government liaisons.", href: "/mentors", hrefLabel: "Find mentors" },
  { id: "dashboard", icon: Rocket, title: "Your dashboard", description: "Track eligible schemes, recommendations, and ecosystem events in one place.", href: "/dashboard/startup", hrefLabel: "Open dashboard" },
];

export default function StartupsPage() {
  return (
    <>
      <PageHero
        eyebrow="For Startups"
        title="Launch and scale in Karnataka"
        subtitle="Everything a founder needs — registration, eligibility, schemes, incubators, mentors, and a personalized dashboard."
        actions={[
          { label: "Register Your Startup", href: "/register" },
          { label: "Check Eligibility", href: "/calculator", variant: "outline" },
        ]}
      />
      <ContentSection id="startup-resources" heading="Where to start">
        <InfoGrid items={ITEMS} />
      </ContentSection>
    </>
  );
}

// src/app/jobs/page.tsx
import type { Metadata } from "next";
import { Briefcase, Code2, LineChart, Megaphone, Rocket, Users } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Startup Jobs — KITE",
  description: "Careers across Karnataka's startup ecosystem.",
};

const ROLES = [
  { id: "eng", icon: Code2, title: "Engineering", description: "Software, hardware, AI/ML, and platform roles across Karnataka startups." },
  { id: "product", icon: Rocket, title: "Product & Design", description: "Product management, UX, and design roles at growth-stage ventures." },
  { id: "growth", icon: LineChart, title: "Growth & Sales", description: "Go-to-market, sales, and growth roles across sectors." },
  { id: "ops", icon: Users, title: "Operations & People", description: "Operations, finance, and people roles at scaling teams." },
  { id: "marketing", icon: Megaphone, title: "Marketing", description: "Brand, content, and performance marketing positions." },
  { id: "internships", icon: Briefcase, title: "Internships", description: "Campus and early-career opportunities across the ecosystem." },
];

export default function JobsPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Work at a Karnataka startup"
        subtitle="The ecosystem-wide jobs board is being prepared. In the meantime, explore the kinds of roles Karnataka startups hire for, and connect through the ecosystem."
        actions={[
          { label: "For Startups", href: "/startups" },
          { label: "Find a Mentor", href: "/mentors", variant: "outline" },
        ]}
      />
      <ContentSection
        id="roles"
        heading="Roles across the ecosystem"
        lead="A live, searchable jobs board opens in Phase 2. These categories reflect typical hiring across Karnataka startups."
      >
        <InfoGrid items={ROLES} />
      </ContentSection>
    </>
  );
}

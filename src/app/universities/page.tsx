// src/app/universities/page.tsx
import type { Metadata } from "next";
import { Beaker, BookOpen, Building2, Network } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "For Universities — KITE",
  description: "Partner programs connecting Karnataka's universities with the startup ecosystem.",
};

const ITEMS = [
  { id: "tbi", icon: Building2, title: "Campus incubators (TBIs)", description: "50+ Technology Business Incubators connect campuses to the startup ecosystem.", href: "/incubators", hrefLabel: "Find incubators" },
  { id: "nain", icon: BookOpen, title: "NAIN 2.0", description: "Support student innovation teams and campus entrepreneurship cells.", href: "/programs/nain", hrefLabel: "About NAIN" },
  { id: "research", icon: Beaker, title: "R&D and CoEs", description: "Link university research to the 16 Centres of Excellence and R&D grants.", href: "/coe", hrefLabel: "Centres of Excellence" },
  { id: "network", icon: Network, title: "Ecosystem linkages", description: "Connect faculty and students with mentors, investors, and clusters.", href: "/mentors", hrefLabel: "Find mentors" },
];

export default function UniversitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="For Universities"
        title="Universities in the innovation ecosystem"
        subtitle="Karnataka's universities anchor incubation, research, and talent. Partner through TBIs, NAIN, R&D, and the Centres of Excellence."
        actions={[
          { label: "Find Incubators", href: "/incubators" },
          { label: "Centres of Excellence", href: "/coe", variant: "outline" },
        ]}
      />
      <ContentSection id="university-programs" heading="Ways to partner">
        <InfoGrid items={ITEMS} columns={2} />
      </ContentSection>
    </>
  );
}

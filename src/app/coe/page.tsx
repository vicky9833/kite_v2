// src/app/coe/page.tsx
import type { Metadata } from "next";
import { Cpu, Dna, Globe2, Radar, Rocket, ShieldCheck } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Centres of Excellence — KITE",
  description: "Karnataka's 16 sector-focused Centres of Excellence driving deep-tech innovation.",
};

const COES = [
  { id: "ai", icon: Cpu, title: "AI & Data Science CoE", description: "Applied AI research, model development, and talent for Karnataka's AI ecosystem." },
  { id: "cyber", icon: ShieldCheck, title: "Cybersecurity CoE (Mysuru)", description: "Products, services, and skilling anchored in the Mysuru cybersecurity cluster." },
  { id: "esdm", icon: Radar, title: "ESDM & Semiconductors CoE", description: "Chip design, embedded systems, and the Tumakuru semiconductor corridor." },
  { id: "biotech", icon: Dna, title: "Biotechnology CoE", description: "Life sciences, med-tech, and Bangalore Bio infrastructure for 300+ companies." },
  { id: "space", icon: Rocket, title: "SpaceTech CoE", description: "Satellites, launch services, and ISRO ecosystem leverage for spacetech startups." },
  { id: "gia", icon: Globe2, title: "Global Innovation CoE", description: "International collaboration across the 32-country Global Innovation Alliance." },
];

export default function CoePage() {
  return (
    <>
      <PageHero
        eyebrow="Deep Tech"
        title="16 Centres of Excellence"
        subtitle="Karnataka's sector-focused Centres of Excellence anchor deep-tech research, infrastructure, and talent across AI, cybersecurity, ESDM, biotech, spacetech, and more."
        actions={[
          { label: "Explore Clusters", href: "/clusters" },
          { label: "Ecosystem Intelligence", href: "/intelligence", variant: "outline" },
        ]}
      />
      <ContentSection
        id="coe"
        heading="Sector Centres of Excellence"
        lead="A representative view of Karnataka's CoE network. Each centre pairs research depth with incubation, skilling, and industry linkages."
      >
        <InfoGrid items={COES} />
      </ContentSection>
    </>
  );
}

// src/app/corporates/page.tsx
import type { Metadata } from "next";
import { Building2, Handshake, Rocket, Target } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "For Corporates — KITE",
  description: "Engage with Karnataka startups through innovation partnerships and open challenges.",
};

const ITEMS = [
  { id: "gcc", icon: Building2, title: "GCC ecosystem", description: "Karnataka hosts 730+ Global Capability Centres — 40% of India's GCCs.", href: "/policies/gcc-2024-29", hrefLabel: "GCC policy" },
  { id: "challenges", icon: Target, title: "Open challenges", description: "Run problem statements through Grand Challenge Karnataka and source startup solutions.", href: "/schemes/gck", hrefLabel: "Grand Challenge" },
  { id: "csr", icon: Handshake, title: "CSR partnerships", description: "Deploy CSR capital into the ecosystem through KDEM partnership pathways.", href: "/csr", hrefLabel: "CSR & NGO Hub" },
  { id: "startups", icon: Rocket, title: "Engage startups", description: "Pilot, procure, and co-innovate with Karnataka's startup base.", href: "/startups", hrefLabel: "For Startups" },
];

export default function CorporatesPage() {
  return (
    <>
      <PageHero
        eyebrow="For Corporates"
        title="Partner with Karnataka's startups"
        subtitle="Engage through GCCs, open innovation challenges, CSR partnerships, and direct startup collaboration."
        actions={[
          { label: "Grand Challenge Karnataka", href: "/schemes/gck" },
          { label: "CSR & NGO Hub", href: "/csr", variant: "outline" },
        ]}
      />
      <ContentSection id="corporate-engagement" heading="Ways to engage">
        <InfoGrid items={ITEMS} columns={2} />
      </ContentSection>
    </>
  );
}

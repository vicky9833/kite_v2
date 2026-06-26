// src/app/developers/page.tsx
import type { Metadata } from "next";
import { Database, KeyRound, Plug, Webhook } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Developers — KITE",
  description: "APIs, integrations, and developer resources for the KITE platform.",
};

const ITEMS = [
  { id: "schemes-api", icon: Database, title: "Schemes & Policy API", description: "Programmatic access to the 22 schemes, eligibility rules, and policy metadata (planned)." },
  { id: "directory-api", icon: Plug, title: "Ecosystem Directory API", description: "Incubators, mentors, clusters, and GIA partner data for integrations (planned)." },
  { id: "webhooks", icon: Webhook, title: "Webhooks", description: "Event notifications for applications and ecosystem updates (planned)." },
  { id: "auth", icon: KeyRound, title: "Authentication", description: "API keys and OAuth for trusted partner integrations (planned)." },
];

export default function DevelopersPage() {
  return (
    <>
      <PageHero
        eyebrow="Developers"
        title="Build on KITE"
        subtitle="The KITE developer platform — APIs, integrations, and webhooks — is on the roadmap. The capabilities below outline what partners will be able to build."
        actions={[
          { label: "Contact KITS", href: "/contact" },
          { label: "Ecosystem Intelligence", href: "/intelligence", variant: "outline" },
        ]}
      />
      <ContentSection
        id="apis"
        heading="Planned developer capabilities"
        lead="Developer APIs open in a later phase. This is a preview of the planned surface."
      >
        <InfoGrid items={ITEMS} columns={2} />
      </ContentSection>
    </>
  );
}

// src/app/tenders/page.tsx
import type { Metadata } from "next";
import { ClipboardList, FileText, Scale } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Tenders — KITE",
  description: "Active tenders and procurement notifications across the ecosystem.",
};

const ITEMS = [
  { id: "active", icon: ClipboardList, title: "Active tenders", description: "Tenders and RFPs are published through the official Karnataka e-procurement portal.", href: "https://eitbt.karnataka.gov.in/startup", hrefLabel: "Official portal", external: true },
  { id: "preference", icon: Scale, title: "Startup preference", description: "Eligible startups receive procurement relaxations on experience and turnover.", href: "/procurement", hrefLabel: "Procurement access" },
  { id: "notify", icon: FileText, title: "Stay informed", description: "Notifications for new tenders will surface here in Phase 2.", href: "/support", hrefLabel: "Contact KITS" },
];

export default function TendersPage() {
  return (
    <>
      <PageHero
        eyebrow="Procurement"
        title="Tenders & RFPs"
        subtitle="Active tenders and procurement notifications across the Karnataka innovation ecosystem. Formal tenders are issued through the official e-procurement channels."
        actions={[
          { label: "Procurement Access", href: "/procurement" },
          { label: "Official Portal", href: "https://eitbt.karnataka.gov.in/startup", variant: "outline", external: true },
        ]}
      />
      <ContentSection id="tenders" heading="Where to find tenders">
        <InfoGrid items={ITEMS} />
      </ContentSection>
    </>
  );
}

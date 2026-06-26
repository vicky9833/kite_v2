// src/app/intelligence/reports/page.tsx
import type { Metadata } from "next";
import { BarChart3, FileText, Layers } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Intelligence Reports — KITE",
  description: "In-depth research and analytical reports on Karnataka's innovation ecosystem.",
};

const REPORTS = [
  { id: "sector", icon: Layers, title: "Sector Deep Dives", description: "Analytical reports across AI, ESDM, biotech, fintech, and agritech.", href: "/reports", hrefLabel: "See report catalogue" },
  { id: "funding", icon: BarChart3, title: "Funding & VC Trends", description: "Quarterly funding analysis across stages, sectors, and clusters.", href: "/dashboard/admin", hrefLabel: "Open dashboard" },
  { id: "annual", icon: FileText, title: "Annual Innovation Report", description: "The state-of-the-ecosystem annual review.", href: "/reports", hrefLabel: "Get notified" },
];

export default function IntelligenceReportsPage() {
  return (
    <>
      <PageHero
        eyebrow="Ecosystem Intelligence"
        title="Intelligence Reports"
        subtitle="In-depth research and analytical reports on Karnataka's innovation ecosystem. Published reports and notify-me options live in the Reports & Publications catalogue."
        actions={[
          { label: "Reports & Publications", href: "/reports" },
          { label: "Back to Intelligence", href: "/intelligence", variant: "outline" },
        ]}
      />
      <ContentSection id="reports" heading="Available research">
        <InfoGrid items={REPORTS} />
      </ContentSection>
    </>
  );
}

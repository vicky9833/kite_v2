// src/app/intelligence/page.tsx
import type { Metadata } from "next";
import { BarChart3, LineChart, Map, PieChart } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";
import { ecosystemStats } from "@/data/ecosystem-stats";

export const metadata: Metadata = {
  title: "Ecosystem Intelligence — KITE",
  description: "Data-led intelligence on Karnataka's startup and innovation ecosystem.",
};

const HEADLINE_IDS = ["dpiit-startups", "vc-raised", "soonicorns", "gccs", "gia-countries", "coes"];

const PANELS = [
  { id: "funding", icon: LineChart, title: "Funding Trends", description: "Quarterly VC and grant flows across sectors and clusters.", href: "/dashboard/admin", hrefLabel: "Open admin dashboard" },
  { id: "sectors", icon: PieChart, title: "Sector Analysis", description: "Startup distribution and growth across the 20-sector taxonomy.", href: "/dashboard/admin", hrefLabel: "View sector view" },
  { id: "regions", icon: Map, title: "Regional Distribution", description: "Beyond Bengaluru cluster activity and disbursement.", href: "/clusters", hrefLabel: "Explore clusters" },
  { id: "reports", icon: BarChart3, title: "Intelligence Reports", description: "In-depth research and analytical reports.", href: "/intelligence/reports", hrefLabel: "Browse reports" },
];

export default function IntelligencePage() {
  const headline = ecosystemStats.filter((s) => HEADLINE_IDS.includes(s.id));

  return (
    <>
      <PageHero
        eyebrow="Ecosystem Intelligence"
        title="Karnataka's innovation, in data"
        subtitle="A data-led view of the ecosystem — funding, startups, sectors, and regions — drawn from verified figures and the live dashboards."
        actions={[
          { label: "Government Admin Dashboard", href: "/dashboard/admin" },
          { label: "Reports", href: "/intelligence/reports", variant: "outline" },
        ]}
      />

      <ContentSection id="headline" heading="Headline indicators">
        <dl className="grid grid-cols-2 gap-6 lg:grid-cols-3">
          {headline.map((stat) => (
            <div key={stat.id} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <dt className="text-caption text-muted">{stat.label}</dt>
              <dd className="mt-2 font-heading text-h1 text-dark">{stat.displayValue}</dd>
              <dd className="mt-1 text-caption text-muted">{stat.source}</dd>
            </div>
          ))}
        </dl>
      </ContentSection>

      <ContentSection id="panels" heading="Intelligence panels" surface>
        <InfoGrid items={PANELS} columns={2} />
      </ContentSection>
    </>
  );
}

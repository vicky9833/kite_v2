// src/app/investors/pipeline/page.tsx
import type { Metadata } from "next";
import { Filter, KanbanSquare, Layers, Sparkles } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "Investor Deal Pipeline — KITE",
  description: "Curated, investment-ready startups from across the Karnataka ecosystem.",
};

const ITEMS = [
  { id: "matches", icon: Sparkles, title: "Thesis matches", description: "Startups matched to your sectors, stages, and ticket size on Investor Connect.", href: "/investors", hrefLabel: "Investor Connect" },
  { id: "kanban", icon: KanbanSquare, title: "Live deal pipeline", description: "Track deals across the six-stage kanban in your investor dashboard.", href: "/dashboard/investor/pipeline", hrefLabel: "Open deal pipeline" },
  { id: "filter", icon: Filter, title: "Filter by sector & stage", description: "Narrow the pipeline by sector, stage, and geography to your thesis.", href: "/investors", hrefLabel: "Browse opportunities" },
  { id: "co-invest", icon: Layers, title: "Co-investment", description: "Syndicate alongside KITVEN, clusters, and GIA partners.", href: "/investors/co-invest", hrefLabel: "Co-invest" },
];

export default function InvestorPipelinePage() {
  return (
    <>
      <PageHero
        eyebrow="For Investors"
        title="Deal pipeline"
        subtitle="Curated, investment-ready startups from across Karnataka. Onboard your firm to see thesis-matched opportunities and track them through your pipeline."
        actions={[
          { label: "Onboard Your Firm", href: "/investors/onboard" },
          { label: "Open Deal Pipeline", href: "/dashboard/investor/pipeline", variant: "outline" },
        ]}
      />
      <ContentSection id="pipeline" heading="How the pipeline works">
        <InfoGrid items={ITEMS} columns={2} />
      </ContentSection>
    </>
  );
}

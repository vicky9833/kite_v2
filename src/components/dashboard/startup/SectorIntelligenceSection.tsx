"use client";

// src/components/dashboard/startup/SectorIntelligenceSection.tsx
//
// "Your Sector at a Glance" (Req 6). A lazy, chart-heavy section for the startup
// dashboard. It resolves the founder's primary sector to its display name, calls
// the deterministic `getSectorDashboardData` ONCE, and renders three chart
// wrappers imported EXCLUSIVELY from the dynamic chart barrel (`@/components/charts`)
// — never from `recharts` directly (Req 23.9, 23.10).
//
// The page composition (task 9.1) wraps this section in `LazySection`; the
// charts themselves are also code-split via the barrel's `next/dynamic`
// wrappers, so the Recharts chunk stays out of the route's initial bundle.

import {
  ChartBarHorizontalSchemes,
  ChartBarSectorStartups,
  ChartLineFunding,
} from "@/components/charts";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { sectors } from "@/data/sectors";
import { getSectorDashboardData } from "@/lib/synthetic-dashboard-data";
import type { RegistrationProfile } from "@/types";

export interface SectorIntelligenceSectionProps {
  /** The founder's session profile; its `primarySector` drives the data. */
  profile: RegistrationProfile;
}

/** Resolve a sector id to its human-readable name, falling back to the id. */
function resolveSectorName(sectorId: string): string {
  return sectors.find((s) => s.id === sectorId)?.name ?? sectorId;
}

/**
 * A single titled chart card. Keeps each chart on a flat white surface with a
 * hairline border and modest shadow (no gradients/blobs/glow).
 */
function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-dark">{title}</h3>
      {children}
    </div>
  );
}

/**
 * SectorIntelligenceSection — three deterministic, illustrative charts giving the
 * founder a read on their primary sector: monthly funding (line), DPIIT startups
 * across the six Beyond Bengaluru clusters + Bengaluru (bar), and the top-5
 * schemes by disbursement (horizontal bar).
 */
export function SectorIntelligenceSection({
  profile,
}: SectorIntelligenceSectionProps) {
  const sectorName = resolveSectorName(profile.primarySector);
  const data = getSectorDashboardData(profile.primarySector);

  return (
    <section aria-labelledby="sector-intelligence-heading" className="flex flex-col gap-8">
      <SectionHeading
        id="sector-intelligence-heading"
        title="Your Sector at a Glance"
        description={sectorName}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard title="Monthly Funding">
          <ChartLineFunding data={data.monthlyFunding} sectorName={sectorName} />
        </ChartCard>

        <ChartCard title="DPIIT Startups by Cluster">
          <ChartBarSectorStartups
            data={data.clusterStartups}
            sectorName={sectorName}
          />
        </ChartCard>

        <ChartCard title="Top Schemes by Disbursement">
          <ChartBarHorizontalSchemes
            data={data.topSchemes}
            sectorName={sectorName}
          />
        </ChartCard>
      </div>

      <p className="text-caption text-muted">
        Illustrative data for preview purposes only.
      </p>
    </section>
  );
}

export default SectorIntelligenceSection;

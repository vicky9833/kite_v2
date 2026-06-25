"use client";

// src/components/dashboard/admin/RegionalDistributionSection.tsx
//
// "Regional Distribution" (Req 15). A lazy section pairing two charts that read
// across the seven regional bars (6 Beyond Bengaluru clusters + Bengaluru):
// startup counts (`ChartBarRegionStartups`) and disbursement split into fiscal
// vs grant (`ChartBarStackedDisbursement`). Side-by-side on desktop, stacked on
// mobile. The page composition (task 15.1) wraps this in `LazySection`; both
// charts are code-split via the dynamic chart barrel (`@/components/charts`) and
// are NEVER imported from `recharts` directly (Req 23.9).

import {
  ChartBarRegionStartups,
  ChartBarStackedDisbursement,
} from "@/components/charts";
import { SectionHeading } from "@/components/shared/SectionHeading";
import {
  getRegionalDisbursement,
  getRegionalStartupCounts,
} from "@/lib/synthetic-admin-data";

/**
 * A single titled chart card on a flat white surface with a hairline border and
 * modest shadow (no gradients/blobs/glow).
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
 * RegionalDistributionSection — two illustrative charts: startup counts by
 * cluster (bar) and disbursement by cluster split into fiscal vs grant
 * (stacked bar).
 */
export function RegionalDistributionSection() {
  const startupCounts = getRegionalStartupCounts();
  const disbursement = getRegionalDisbursement();

  return (
    <section
      aria-labelledby="regional-distribution-heading"
      className="flex flex-col gap-8"
    >
      <SectionHeading
        id="regional-distribution-heading"
        title="Regional Distribution"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Startups by Cluster">
          <ChartBarRegionStartups data={startupCounts} />
        </ChartCard>

        <ChartCard title="Disbursement by Cluster">
          <ChartBarStackedDisbursement data={disbursement} />
        </ChartCard>
      </div>

      <p className="text-caption text-muted">
        Illustrative data for preview purposes only.
      </p>
    </section>
  );
}

export default RegionalDistributionSection;

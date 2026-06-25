"use client";

// src/components/dashboard/admin/FundingTimelineSection.tsx
//
// "Ecosystem Funding Over Time" (Req 13). A lazy, full-width area chart of the
// eight fiscal quarters of total ecosystem funding. The page composition
// (task 15.1) wraps this section in `LazySection`; the chart itself is
// code-split via the dynamic chart barrel (`@/components/charts`) and is NEVER
// imported from `recharts` directly (Req 23.9).
//
// The accent fill + primary stroke and the hover tooltip are handled inside the
// `ChartAreaFundingTimeline` wrapper.

import { ChartAreaFundingTimeline } from "@/components/charts";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getFundingTimeline } from "@/lib/synthetic-admin-data";

/**
 * FundingTimelineSection — a single full-width area chart of quarterly
 * ecosystem funding (8 quarters), on a flat white card with a hairline border
 * and modest shadow (no gradients/blobs/glow).
 */
export function FundingTimelineSection() {
  const data = getFundingTimeline();

  return (
    <section
      aria-labelledby="funding-timeline-heading"
      className="flex flex-col gap-8"
    >
      <SectionHeading
        id="funding-timeline-heading"
        title="Ecosystem Funding Over Time"
      />

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <ChartAreaFundingTimeline data={data} />
      </div>

      <p className="text-caption text-muted">
        Illustrative data for preview purposes only.
      </p>
    </section>
  );
}

export default FundingTimelineSection;

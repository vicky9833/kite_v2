"use client";

// src/components/dashboard/admin/SectorAnalysisSection.tsx
//
// "Sector Performance" (Req 16). A lazy section pairing a treemap of all 20
// canonical sectors (sized by startup count, shaded by funding intensity) with
// a horizontal bar chart of the top 10 sectors by year-on-year growth. The page
// composition (task 15.1) wraps this in `LazySection`; both charts are
// code-split via the dynamic chart barrel (`@/components/charts`) and are NEVER
// imported from `recharts` directly (Req 23.9).

import {
  ChartBarHorizontalSectorGrowth,
  ChartTreemapSectors,
} from "@/components/charts";
import { SectionHeading } from "@/components/shared/SectionHeading";
import {
  getSectorGrowth,
  getSectorTreemap,
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
 * SectorAnalysisSection — two illustrative charts: a treemap of the 20 canonical
 * sectors and a horizontal bar chart of the top 10 sectors by growth.
 */
export function SectorAnalysisSection() {
  const treemap = getSectorTreemap();
  const growth = getSectorGrowth();

  return (
    <section
      aria-labelledby="sector-analysis-heading"
      className="flex flex-col gap-8"
    >
      <SectionHeading
        id="sector-analysis-heading"
        title="Sector Performance"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Sectors by Startup Count">
          <ChartTreemapSectors data={treemap} />
        </ChartCard>

        <ChartCard title="Top Sectors by Growth">
          <ChartBarHorizontalSectorGrowth data={growth} />
        </ChartCard>
      </div>

      <p className="text-caption text-muted">
        Illustrative data for preview purposes only.
      </p>
    </section>
  );
}

export default SectorAnalysisSection;

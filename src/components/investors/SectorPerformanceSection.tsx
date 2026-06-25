// src/components/investors/SectorPerformanceSection.tsx
//
// Investor Connect — "Sector Performance" (Req 13).
//
// Two charts, both imported from the dynamic chart BARREL
// (`@/components/charts`) so Recharts never enters the route's First Load JS
// (Req 13.2, 36.1) — recharts is NEVER imported directly here:
//   - `ChartBarHorizontalFunding` fed `getSectorFundingTop10()` (top-10 sectors
//     by funding, ₹ Cr).
//   - `ChartLineFunding` fed a `FundingPoint[]` adapted from the top series of
//     `getSectorCountGrowth()` (24-month startup-count growth). The
//     `SectorCountSeries` carries five 24-point series; the top sector's series
//     is mapped into the `{ month, rupeesCrore }` shape the line chart expects.
// Side-by-side on desktop (`lg:grid-cols-2`), stacked on mobile.
//
// Full-bleed self-contained section, matching the sibling Investor Connect
// sections (own background + `py-16 md:py-24` + inner `max-w-7xl` container).

import type { FundingPoint } from "@/types";
import { ChartBarHorizontalFunding, ChartLineFunding } from "@/components/charts";
import {
  getSectorCountGrowth,
  getSectorFundingTop10,
} from "@/lib/synthetic-investor-data";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";

export function SectorPerformanceSection() {
  const fundingData = getSectorFundingTop10();

  // Adapt the top sector's 24-month count series into the FundingPoint[] shape
  // ChartLineFunding consumes (month label + numeric value).
  const growth = getSectorCountGrowth();
  const topSeries = growth.series[0];
  const lineData: FundingPoint[] = topSeries
    ? topSeries.counts.map((count, i) => ({
        month: growth.months[i] ?? "",
        rupeesCrore: count,
      }))
    : [];
  const lineSectorName = topSeries?.name ?? "Top sector";

  return (
    <section
      aria-labelledby="sector-performance-heading"
      className="bg-background py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <SectionHeading
            id="sector-performance-heading"
            eyebrow="Sector signals"
            title="Sector Performance"
            description="Where capital is concentrating and which sectors are adding the most new ventures."
          />
          <IllustrativeBadge variant="inline" />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-bold text-dark">
              Top Sectors by Funding
            </h3>
            <ChartBarHorizontalFunding data={fundingData} />
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-bold text-dark">
              Startup Growth — {lineSectorName}
            </h3>
            <ChartLineFunding data={lineData} sectorName={lineSectorName} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SectorPerformanceSection;

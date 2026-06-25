"use client";

// src/components/dashboard/admin/FounderDemographicsSection.tsx
//
// "Founder Demographics" (Req 17). A lazy section of three pie charts built from
// the single deterministic `getDemographics()` bundle: women-led share, funding
// stage, and founder age. Row on desktop (`md:grid-cols-3`), stacked on mobile.
// The page composition (task 15.1) wraps this in `LazySection`; every chart is
// code-split via the dynamic chart barrel (`@/components/charts`) and is NEVER
// imported from `recharts` directly (Req 23.9).
//
// Attribution (Req 17): the 25% women-led split is a VERIFIED figure and is
// surfaced as such; the stage and age distributions are synthetic and are
// surfaced with an illustrative label.

import { ChartPieGeneric } from "@/components/charts";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getDemographics } from "@/lib/synthetic-admin-data";

/**
 * A single titled chart card on a flat white surface with a hairline border and
 * modest shadow (no gradients/blobs/glow). An optional footnote distinguishes
 * verified figures from illustrative ones.
 */
function ChartCard({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="font-heading text-lg font-semibold text-dark">{title}</h3>
      {children}
      <p className="text-caption text-muted">{note}</p>
    </div>
  );
}

/**
 * FounderDemographicsSection — three pie charts: women-led share (verified),
 * funding stage (illustrative), and founder age (illustrative).
 */
export function FounderDemographicsSection() {
  const demographics = getDemographics();

  return (
    <section
      aria-labelledby="founder-demographics-heading"
      className="flex flex-col gap-8"
    >
      <SectionHeading
        id="founder-demographics-heading"
        title="Founder Demographics"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <ChartCard title="Women-led Startups" note="Based on verified ecosystem data.">
          <ChartPieGeneric
            data={demographics.womenLed}
            title="Women-led startups"
            ariaLabel="Pie chart of women-led startup share"
            srSummary="Women-led startups: Women-led 25, Other 75. Based on verified ecosystem data."
          />
        </ChartCard>

        <ChartCard title="Stage Distribution" note="Illustrative data for preview purposes only.">
          <ChartPieGeneric
            data={demographics.stage}
            title="Stage distribution"
            ariaLabel="Pie chart of startups by funding stage"
          />
        </ChartCard>

        <ChartCard title="Founder Age" note="Illustrative data for preview purposes only.">
          <ChartPieGeneric
            data={demographics.age}
            title="Founder age"
            ariaLabel="Pie chart of founders by age band"
          />
        </ChartCard>
      </div>
    </section>
  );
}

export default FounderDemographicsSection;

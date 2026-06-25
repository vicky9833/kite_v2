"use client";

// src/components/dashboard/investor/KarnatakaSignalsSection.tsx
//
// Investor Dashboard — "Karnataka Signals" (Req 23).
//
// Three illustrative panels driven by the investor's thesis:
//   1. Focus-sectors funding line — `ChartLineFunding` (via the dynamic chart
//      BARREL) fed `getEcosystemSignals(...).focusSectorsFunding` (12 points).
//   2. Stage distribution bar — `ChartBarSectorStartups` (via the barrel) fed
//      the `stageDistribution` adapted into its `{ cluster, count }` shape
//      (the investment stage is mapped onto the `cluster` axis field).
//   3. KITVEN co-investments table — `getKitvenCoInvestments(investorId)` (3–4
//      rows).
//
// Charts are imported ONLY from `@/components/charts` — never recharts directly
// (Req 36.1). Reads session state via `useInvestor`.

import { useMemo } from "react";

import { useInvestor } from "@/context/InvestorContext";
import { ChartBarSectorStartups, ChartLineFunding } from "@/components/charts";
import { getEcosystemSignals, getKitvenCoInvestments } from "@/lib/investor-dashboard-data";
import { sectors } from "@/data/sectors";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import type { ClusterCountDatum, InvestmentStage } from "@/types";

/** Map a sector id to its display name (falls back to the raw id). */
function sectorName(sectorId: string): string {
  return sectors.find((s) => s.id === sectorId)?.name ?? sectorId;
}

/** Format a lakhs figure as a compact ₹ label. */
function formatLakhs(lakhs: number): string {
  if (lakhs >= 100) {
    const crore = lakhs / 100;
    return `₹${Number.isInteger(crore) ? crore : crore.toFixed(2)} Cr`;
  }
  return `₹${lakhs} L`;
}

export function KarnatakaSignalsSection() {
  const { investorProfile } = useInvestor();

  const focusSectors = useMemo<string[]>(
    () => investorProfile?.focusSectors ?? [],
    [investorProfile],
  );
  const focusStages = useMemo<InvestmentStage[]>(
    () => investorProfile?.focusStages ?? [],
    [investorProfile],
  );
  const investorId = investorProfile?.investorId ?? "preview";

  const signals = useMemo(
    () => getEcosystemSignals(focusSectors, focusStages),
    [focusSectors, focusStages],
  );

  // Adapt stageDistribution ({ stage, count }) into the chart's { cluster, count }
  // shape by mapping the investment stage onto the cluster axis field.
  const stageBarData = useMemo<ClusterCountDatum[]>(
    () =>
      signals.stageDistribution.map((d) => ({
        cluster: d.stage,
        count: d.count,
      })),
    [signals],
  );

  const kitven = useMemo(
    () => getKitvenCoInvestments(investorId),
    [investorId],
  );

  const fundingLabel =
    focusSectors.length > 0
      ? focusSectors.map(sectorName).join(", ")
      : "your focus sectors";

  return (
    <section
      aria-labelledby="karnataka-signals-heading"
      className="bg-background py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <SectionHeading
            id="karnataka-signals-heading"
            eyebrow="Ecosystem"
            title="Karnataka Signals"
            description="Funding momentum and stage activity across your thesis, plus KITVEN co-investments."
          />
          <IllustrativeBadge variant="inline" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Panel 1 — focus-sectors funding line */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-bold text-dark">
              Focus-Sector Funding
            </h3>
            <ChartLineFunding
              data={signals.focusSectorsFunding}
              sectorName={fundingLabel}
            />
          </div>

          {/* Panel 2 — stage distribution bar */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-bold text-dark">
              Stage Distribution
            </h3>
            <ChartBarSectorStartups
              data={stageBarData}
              sectorName="your focus stages"
            />
          </div>

          {/* Panel 3 — KITVEN co-investments table */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-heading text-lg font-bold text-dark">
              KITVEN Co-Investments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <caption className="sr-only">
                  KITVEN co-investments alongside your thesis, with company,
                  sector, stage, and amount. Illustrative data.
                </caption>
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Company
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Sector
                    </th>
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Stage
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {kitven.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-2 pr-3 font-medium text-dark">
                        {row.companyName}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {sectorName(row.sector)}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">{row.stage}</td>
                      <td className="py-2 text-right font-semibold text-dark">
                        {formatLakhs(row.amountLakhs)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default KarnatakaSignalsSection;

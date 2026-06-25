"use client";

import { useInvestor } from "@/context/InvestorContext";
import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import {
  selectActiveCompanyCount,
  selectActiveDealCount,
  selectExitsThisYear,
  selectKarnatakaAllocation,
  selectPipelineValue,
  selectPortfolioValue,
} from "@/lib/investor-dashboard-selectors";
import { cn, formatNumber, formatStatValue } from "@/lib/utils";

/**
 * InvestorKpiGrid — the six headline KPI cards beneath the header (Req 19).
 *
 * Responsive grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (Req 19.1). Every
 * KPI is a PURE derivation from `investor-dashboard-selectors.ts`, computed once
 * from the session `investorProfile`:
 *
 *  1. Portfolio Value — synthetic aggregate of portfolio companies, in lakhs
 *     (Req 19.2).
 *  2. Active Deals — count of deals not in `Closed`/`Passed` (Req 19.3).
 *  3. Pipeline Value — Σ `askLakhs` over active deals, in lakhs (Req 19.4).
 *  4. Portfolio Companies — count of `Active` companies (Req 19.5).
 *  5. Exits This Year — synthetic seeded count (Req 19.6).
 *  6. Karnataka Allocation — % of portfolio in Karnataka, in `[0, 100]`
 *     (Req 19.7).
 *
 * The whole grid is synthetic/illustrative, so an inline `IllustrativeBadge`
 * labels the section (Req 19, 40.4). Cards mirror the shared `StatCard` visual
 * language (rounded-xl, hairline border, subtle shadow, Plus Jakarta Sans
 * headline figure) but use a local `MetricCard` so each can host a caption.
 *
 * Rendered inside `InvestorGate`, so a profile is guaranteed in practice; the
 * null-guard keeps the component safe in isolation and under strict types.
 */
export function InvestorKpiGrid() {
  const { investorProfile } = useInvestor();

  if (!investorProfile) {
    return null;
  }

  // Rupee values are denominated in lakhs (Req 19.2, 19.4).
  const portfolioValue = formatStatValue(selectPortfolioValue(investorProfile), {
    prefix: "₹",
    suffix: " L",
  });
  const pipelineValue = formatStatValue(selectPipelineValue(investorProfile), {
    prefix: "₹",
    suffix: " L",
  });
  const activeDeals = formatNumber(selectActiveDealCount(investorProfile));
  const portfolioCompanies = formatNumber(
    selectActiveCompanyCount(investorProfile),
  );
  const exitsThisYear = formatNumber(selectExitsThisYear(investorProfile));
  const karnatakaAllocation = `${formatNumber(
    selectKarnatakaAllocation(investorProfile),
  )}%`;

  const cards: ReadonlyArray<{ label: string; value: string; caption: string }> = [
    {
      label: "Portfolio Value",
      value: portfolioValue,
      caption: "Estimated current value",
    },
    {
      label: "Active Deals",
      value: activeDeals,
      caption: "In pipeline (not closed)",
    },
    {
      label: "Pipeline Value",
      value: pipelineValue,
      caption: "Total ask across active deals",
    },
    {
      label: "Portfolio Companies",
      value: portfolioCompanies,
      caption: "Currently active holdings",
    },
    {
      label: "Exits This Year",
      value: exitsThisYear,
      caption: "Realized exits",
    },
    {
      label: "Karnataka Allocation",
      value: karnatakaAllocation,
      caption: "Share of portfolio in-state",
    },
  ];

  return (
    <section aria-label="Portfolio metrics" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-dark">
          Portfolio metrics
        </h2>
        <IllustrativeBadge variant="inline" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            caption={card.caption}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * A single KPI card. Mirrors `StatCard`'s restrained editorial styling — a plain
 * card with a hairline border, subtle shadow, and a Plus Jakarta Sans headline
 * figure — while hosting a label and a muted caption.
 */
function MetricCard({
  label,
  value,
  caption,
  className,
}: {
  label: string;
  value: string;
  caption: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm",
        "transition-colors hover:border-primary/30",
        className,
      )}
    >
      <p className="font-heading text-h1 font-bold text-dark">{value}</p>
      <p className="mt-2 text-body text-muted">{label}</p>
      <p className="mt-4 text-caption text-muted/80">{caption}</p>
    </div>
  );
}

export default InvestorKpiGrid;

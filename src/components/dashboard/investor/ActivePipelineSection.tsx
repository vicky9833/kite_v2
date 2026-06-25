"use client";

// src/components/dashboard/investor/ActivePipelineSection.tsx
//
// Investor Dashboard — "Active Pipeline" (Req 22).
//
// Summarises the investor's tracked deals by grouping `dealsTracked` across the
// six canonical `DealStage` values and rendering a small horizontal bar per
// stage (count). A "Go to Pipeline" link routes to the full kanban board at
// `/dashboard/investor/pipeline`.
//
// Reads session state via `useInvestor`. No charts / recharts — the bars are
// plain CSS widths so this stays out of the chart bundle.

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { useInvestor } from "@/context/InvestorContext";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";
import { DEAL_STAGE_ORDER, type DealStage } from "@/types";

export function ActivePipelineSection() {
  const { investorProfile } = useInvestor();
  const deals = investorProfile?.dealsTracked ?? [];

  // Count deals per canonical stage (every stage shown, including zero counts).
  const counts: Record<DealStage, number> = DEAL_STAGE_ORDER.reduce(
    (acc, stage) => {
      acc[stage] = deals.filter((d) => d.currentStage === stage).length;
      return acc;
    },
    {} as Record<DealStage, number>,
  );

  const maxCount = Math.max(1, ...DEAL_STAGE_ORDER.map((stage) => counts[stage]));
  const totalTracked = deals.length;

  return (
    <section
      aria-labelledby="active-pipeline-heading"
      className="bg-surface py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            id="active-pipeline-heading"
            eyebrow="Deal flow"
            title="Active Pipeline"
            description="How your tracked deals are distributed across the six pipeline stages."
          />
          <Link
            href="/dashboard/investor/pipeline"
            className={cn(
              "inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary",
              "transition-colors hover:text-accent",
              "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            )}
          >
            Go to Pipeline
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted">
            {totalTracked === 0
              ? "No deals tracked yet — add deals from the pipeline board."
              : `Tracking ${totalTracked} ${totalTracked === 1 ? "deal" : "deals"} across six stages.`}
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {DEAL_STAGE_ORDER.map((stage) => {
              const count = counts[stage];
              const widthPct = Math.round((count / maxCount) * 100);
              return (
                <li key={stage} className="flex items-center gap-4">
                  <span className="w-28 shrink-0 text-sm font-medium text-dark">
                    {stage}
                  </span>
                  <div
                    className="relative h-3 flex-1 overflow-hidden rounded-full bg-surface"
                    role="img"
                    aria-label={`${stage}: ${count} ${count === 1 ? "deal" : "deals"}`}
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${count === 0 ? 0 : Math.max(widthPct, 4)}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm font-semibold text-dark">
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default ActivePipelineSection;

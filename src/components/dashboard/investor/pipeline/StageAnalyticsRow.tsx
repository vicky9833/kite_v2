"use client";

// src/components/dashboard/investor/pipeline/StageAnalyticsRow.tsx
//
// Deal Pipeline — "Stage Analytics" thin row (Req 30.1, 30.2, 30.5).
//
// A compact, single-row analytics strip derived from the PURE
// `computeStageAnalytics(deals)` helper. It surfaces three illustrative
// readouts:
//   1. Average days a deal spends in each of the six stages
//      (`perStage[].avgDaysInStage`).
//   2. Conversion rate between each pair of consecutive stages
//      (`conversion[].rate`, rendered as a percentage).
//   3. A weekly velocity indicator ("deals moved this week",
//      `velocityThisWeek`).
//
// All figures are synthetic + deterministic (hash-seeded inside
// `computeStageAnalytics`), so the row is labelled illustrative. No charts /
// recharts — the metrics are plain text + CSS, which is why the PAGE
// dynamic-imports this component to keep it out of First Load JS (Req 30.5).

import { Activity, Gauge, TrendingUp } from "lucide-react";

import { computeStageAnalytics } from "@/lib/deal-pipeline";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { TrackedDeal } from "@/types";

export interface StageAnalyticsRowProps {
  /** The deals currently displayed on the board (already filtered upstream). */
  deals: TrackedDeal[];
}

/** Format a conversion ratio in [0,1] as a whole-number percentage string. */
function toPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function StageAnalyticsRow({ deals }: StageAnalyticsRowProps) {
  const { perStage, conversion, velocityThisWeek } = computeStageAnalytics(deals);

  return (
    <section
      aria-labelledby="stage-analytics-heading"
      className="bg-surface py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="stage-analytics-heading"
          eyebrow="Pipeline analytics"
          title="Stage Analytics"
          description="Average time-in-stage, stage-to-stage conversion, and weekly deal velocity across your pipeline."
        />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 1 — Average days in each stage */}
          <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-dark">
                Avg. days in stage
              </h3>
            </div>
            <ul className="flex flex-col gap-2">
              {perStage.map(({ stage, avgDaysInStage }) => (
                <li
                  key={stage}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted">{stage}</span>
                  <span className="font-semibold text-dark">
                    {avgDaysInStage} {avgDaysInStage === 1 ? "day" : "days"}
                  </span>
                </li>
              ))}
            </ul>
          </article>

          {/* 2 — Conversion between consecutive stages */}
          <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-dark">
                Stage conversion
              </h3>
            </div>
            <ul className="flex flex-col gap-2">
              {conversion.map(({ fromStage, toStage, rate }) => (
                <li
                  key={`${fromStage}->${toStage}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted">
                    {fromStage} → {toStage}
                  </span>
                  <span className="font-semibold text-dark">{toPercent(rate)}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* 3 — Weekly velocity indicator */}
          <article className="flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="font-heading text-lg font-semibold text-dark">
                Velocity
              </h3>
            </div>
            <div className="flex flex-1 flex-col justify-center">
              <span className="font-heading text-display font-bold text-accent">
                {velocityThisWeek}
              </span>
              <span className="text-sm text-muted">
                {velocityThisWeek === 1 ? "deal moved" : "deals moved"} this week
              </span>
            </div>
          </article>
        </div>

        <p className="mt-6 text-caption text-muted">
          Illustrative data for preview purposes only.
        </p>
      </div>
    </section>
  );
}

export default StageAnalyticsRow;

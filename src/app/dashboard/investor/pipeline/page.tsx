"use client";

// src/app/dashboard/investor/pipeline/page.tsx
//
// `/dashboard/investor/pipeline` — the investor's Deal Pipeline kanban board
// (Req 26.1, 26.2, 28, 30.5, 37.1, 37.2, 39.1).
//
// The whole surface is wrapped in `InvestorGate` (redirectFrom
// `dashboard/investor/pipeline`), which redirects sessions that have not
// completed onboarding to `/investors/onboard?redirectFrom=...` and only renders
// its children in the Onboarded_State (Req 17, 26.2). Because `InvestorContext`
// is in-memory only, a hard refresh resets the session and a directly-loaded
// gated route always redirects (Req 40.3).
//
// Composition + lazy loading (Req 37.1, 37.2, 39.1):
//   - Eager, above-the-fold: the header strip (+ inline Add-Deal form), the
//     filter bar, and the kanban board fed the filtered deals. None of these
//     carry charts, so nothing pulls Recharts into First Load JS.
//   - `StageAnalyticsRow` and `RecentActivityList` are the highest bundle risk
//     on this route, so they are `next/dynamic`-imported ({ ssr: false }) FROM
//     THE START and mounted inside `LazySection`. That keeps their code — and
//     the `computeStageAnalytics` work behind the analytics row — out of the
//     route's First Load JS, loading only as each section nears the viewport
//     (Req 30.5, 37.2).
//   - `PipelineExportButton` is tiny (a pure `dealsToCsv` + Blob download), so
//     it stays eager at the bottom.
//
// Filtering is held here as `DealFilters` state lifted from `PipelineFilterBar`
// and applied through the PURE `filterDeals` helper, so the board, analytics,
// activity, and export all operate on the same filtered view (Req 27.2).

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { LazySection } from "@/components/shared/LazySection";
import { InvestorGate } from "@/components/dashboard/investor/InvestorGate";
import { PipelineHeaderStrip } from "@/components/dashboard/investor/pipeline/PipelineHeaderStrip";
import { PipelineFilterBar } from "@/components/dashboard/investor/pipeline/PipelineFilterBar";
import { KanbanBoard } from "@/components/dashboard/investor/pipeline/KanbanBoard";
import { PipelineExportButton } from "@/components/dashboard/investor/pipeline/PipelineExportButton";
import { useInvestor } from "@/context/InvestorContext";
import { filterDeals, type DealFilters } from "@/lib/deal-pipeline";

// The analytics row and recent-activity list are dynamic FROM THE START — the
// Deal Pipeline is the highest bundle-risk route, so these two sections (and the
// `computeStageAnalytics` work behind the row) must stay out of First Load JS
// (Req 30.5, 37.2). Each `loading` fallback reserves the section height to avoid
// CLS, matching the surrounding `LazySection`'s `minHeight`.
const StageAnalyticsRow = dynamic(
  () =>
    import("@/components/dashboard/investor/pipeline/StageAnalyticsRow").then(
      (m) => m.StageAnalyticsRow,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[420px]" /> },
);

const RecentActivityList = dynamic(
  () =>
    import("@/components/dashboard/investor/pipeline/RecentActivityList").then(
      (m) => m.RecentActivityList,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[360px]" /> },
);

/**
 * The gated pipeline body. Only mounts inside `InvestorGate`'s Onboarded_State,
 * so `investorProfile` is present; the null-guard keeps it total under strict
 * types and safe in isolation.
 */
function DealPipelineContent() {
  const { investorProfile } = useInvestor();
  const [filters, setFilters] = useState<DealFilters>({});

  // Single filtered view shared by the board, analytics, activity, and export.
  const filteredDeals = useMemo(
    () => filterDeals(investorProfile?.dealsTracked ?? [], filters),
    [investorProfile, filters],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Eager, above-the-fold block — chart-free. */}
      <PipelineHeaderStrip />

      <div className="flex flex-col gap-8 pb-12">
        <PipelineFilterBar onChange={setFilters} />

        <KanbanBoard deals={filteredDeals} />
      </div>

      {/* Highest bundle-risk sections — dynamic from the start, deferred via
          LazySection so their code stays out of First Load JS (Req 30.5, 37.2). */}
      <LazySection minHeight={420}>
        <StageAnalyticsRow deals={filteredDeals} />
      </LazySection>

      <LazySection minHeight={360}>
        <RecentActivityList deals={filteredDeals} />
      </LazySection>

      {/* Tiny pure Blob export — stays eager at the bottom. */}
      <div className="py-12">
        <PipelineExportButton deals={filteredDeals} />
      </div>
    </div>
  );
}

/**
 * Route entry. A thin client wrapper that gates the pipeline behind
 * `InvestorGate` (Req 17, 26.2).
 */
export default function DealPipelinePage() {
  return (
    <InvestorGate redirectFrom="dashboard/investor/pipeline">
      <DealPipelineContent />
    </InvestorGate>
  );
}

"use client";

// src/app/dashboard/admin/page.tsx
//
// `/dashboard/admin` — the Government Admin Dashboard preview (Req 11–22).
//
// This is a PUBLIC preview surface: there is no registration or authentication
// gate (Req 11.1, 22.1). The page composes synthetic, clearly-illustrative
// aggregate data for demonstration only.
//
// Composition + lazy loading (Req 22.1–22.5, 29.1–29.3):
//   - Eager, above-the-fold: the header strip (py-8), the Phase-2 notice
//     banner, and the six-card KPI grid.
//   - Every section below the KPI grid renders inside `LazySection`, so its
//     work — and the code-split Recharts chunk behind the chart sections —
//     stays out of the route's First Load JS and loads only as each section
//     nears the viewport (Req 22.4, 22.5, 27).
//
// Bundle discipline (Req 22.5, 27): the chart-bearing / below-the-fold sections
// are code-split out of First Load JS via `next/dynamic({ ssr: false })`,
// exactly like the startup page. Each `loading` fallback reserves the section's
// height (matching the surrounding `LazySection` `minHeight`) to avoid CLS.
// `ssr: false` is safe: the page is an interactive Client Component, and the
// interactive bits (sort state, Blob export) are already client islands.
//
// Layout: a single `max-w-7xl` container with horizontal gutters; content
// sections use `py-16 md:py-24` while the header strip keeps its own `py-8`
// (Req 29.1–29.3).

import dynamic from "next/dynamic";

import { LazySection } from "@/components/shared/LazySection";
import { AdminHeaderStrip } from "@/components/dashboard/admin/AdminHeaderStrip";
import { AdminNoticeBanner } from "@/components/dashboard/admin/AdminNoticeBanner";
import { AdminKpiGrid } from "@/components/dashboard/admin/AdminKpiGrid";

// Below-the-fold sections are code-split out of the route's First Load JS via
// `next/dynamic({ ssr: false })` (Req 22.5, 27.1, 27.3, 27.4). Their transitive
// deps — the dynamic chart barrel behind the chart sections, the sortable
// scheme table, the Blob export island — load only when each section nears the
// viewport (it still renders inside `LazySection`). Each `loading` fallback
// reserves the section's height to avoid CLS, matching the `minHeight` reserved
// by the surrounding `LazySection`.
const FundingTimelineSection = dynamic(
  () =>
    import("@/components/dashboard/admin/FundingTimelineSection").then(
      (m) => m.FundingTimelineSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[480px]" /> },
);

const RegionalDistributionSection = dynamic(
  () =>
    import("@/components/dashboard/admin/RegionalDistributionSection").then(
      (m) => m.RegionalDistributionSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[520px]" /> },
);

const SectorAnalysisSection = dynamic(
  () =>
    import("@/components/dashboard/admin/SectorAnalysisSection").then(
      (m) => m.SectorAnalysisSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[520px]" /> },
);

const FounderDemographicsSection = dynamic(
  () =>
    import("@/components/dashboard/admin/FounderDemographicsSection").then(
      (m) => m.FounderDemographicsSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[480px]" /> },
);

const SchemePerformanceSection = dynamic(
  () =>
    import("@/components/dashboard/admin/SchemePerformanceSection").then(
      (m) => m.SchemePerformanceSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[640px]" /> },
);

const AdminFlagshipProgramsSection = dynamic(
  () =>
    import("@/components/dashboard/admin/AdminFlagshipProgramsSection").then(
      (m) => m.AdminFlagshipProgramsSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[520px]" /> },
);

const InternationalPartnershipsSection = dynamic(
  () =>
    import("@/components/dashboard/admin/InternationalPartnershipsSection").then(
      (m) => m.InternationalPartnershipsSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[360px]" /> },
);

const ActivityFeedSection = dynamic(
  () =>
    import("@/components/dashboard/admin/ActivityFeedSection").then(
      (m) => m.ActivityFeedSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[600px]" /> },
);

const ExportReportsSection = dynamic(
  () =>
    import("@/components/dashboard/admin/ExportReportsSection").then(
      (m) => m.ExportReportsSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[360px]" /> },
);

/** Shared vertical rhythm for content sections (Req 29.3). */
const SECTION_PADDING = "py-16 md:py-24";

/**
 * Route entry. A public preview that composes the synthetic admin surface: the
 * header strip, Phase-2 notice, and KPI grid render eagerly; everything below
 * the KPI grid defers via `LazySection` + `next/dynamic` (Req 22).
 */
export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Eager, above-the-fold identity + framing — header keeps its own py-8. */}
      <AdminHeaderStrip />

      <div className="pb-8">
        <AdminNoticeBanner />
      </div>

      {/* Eager KPI grid. */}
      <div className={SECTION_PADDING}>
        <AdminKpiGrid />
      </div>

      {/* Below-the-fold sections — deferred via LazySection (Req 22.4). The
          chart-bearing sections import their charts only from the dynamic
          barrel, so Recharts never enters First Load JS (Req 22.5, 23.10). */}
      <LazySection className={SECTION_PADDING} minHeight={480}>
        <FundingTimelineSection />
      </LazySection>

      <LazySection className={SECTION_PADDING} minHeight={520}>
        <RegionalDistributionSection />
      </LazySection>

      <LazySection className={SECTION_PADDING} minHeight={520}>
        <SectorAnalysisSection />
      </LazySection>

      <LazySection className={SECTION_PADDING} minHeight={480}>
        <FounderDemographicsSection />
      </LazySection>

      <LazySection className={SECTION_PADDING} minHeight={640}>
        <SchemePerformanceSection />
      </LazySection>

      <LazySection className={SECTION_PADDING} minHeight={520}>
        <AdminFlagshipProgramsSection />
      </LazySection>

      <LazySection className={SECTION_PADDING} minHeight={360}>
        <InternationalPartnershipsSection />
      </LazySection>

      <LazySection className={SECTION_PADDING} minHeight={600}>
        <ActivityFeedSection />
      </LazySection>

      <LazySection className={SECTION_PADDING} minHeight={360}>
        <ExportReportsSection />
      </LazySection>
    </div>
  );
}

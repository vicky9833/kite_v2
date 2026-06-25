"use client";

// src/app/dashboard/investor/page.tsx
//
// `/dashboard/investor` — the investor's personalized dashboard (Req 17, 37, 39).
//
// The whole surface is wrapped in `InvestorGate`, which redirects sessions that
// have not completed onboarding to `/investors/onboard?redirectFrom=dashboard/investor`
// and only renders its children in the Onboarded_State (Req 17.1–17.4). Because
// `InvestorContext` is in-memory only, a hard refresh resets the session and a
// directly-loaded gated route always redirects (Req 40.3).
//
// Composition + lazy loading (Req 37.1, 37.3, 39.1):
//   - Eager, above-the-fold: the preview banner, identity header strip, the
//     six-KPI grid, and the engine-driven "Startups Matching Your Thesis"
//     section. These carry no charts, so nothing pulls Recharts into First Load
//     JS. They live in a single `max-w-7xl` container with horizontal gutters.
//   - Below-the-fold sections (portfolio, active pipeline, Karnataka signals,
//     schemes-for-portfolio, events, resources) render via `next/dynamic`
//     ({ ssr: false }) inside `LazySection`, so their work — and the code-split
//     Recharts chunk behind `KarnatakaSignalsSection` — stays out of the route's
//     First Load JS and loads only as each section nears the viewport (Req 37.3,
//     36.1). Each of these sections is full-bleed and self-contained (it brings
//     its own `mx-auto max-w-7xl` container + section background), so they sit
//     directly under the gate rather than inside the eager gutter container.
//
// `ssr: false` is safe: the page is an interactive Client Component anyway, and
// each `loading` fallback reserves the section's height to avoid CLS, matching
// the `minHeight` reserved by the surrounding `LazySection`.

import dynamic from "next/dynamic";

import { LazySection } from "@/components/shared/LazySection";
import { InvestorGate } from "@/components/dashboard/investor/InvestorGate";
import { InvestorHeaderStrip } from "@/components/dashboard/investor/InvestorHeaderStrip";
import { InvestorKpiGrid } from "@/components/dashboard/investor/InvestorKpiGrid";
import { InvestorPreviewBanner } from "@/components/dashboard/investor/InvestorPreviewBanner";
import { MatchedStartupsSection } from "@/components/dashboard/investor/MatchedStartupsSection";
import { useInvestor } from "@/context/InvestorContext";

// Below-the-fold sections are code-split out of the route's First Load JS via
// `next/dynamic({ ssr: false })`. The chart-bearing `KarnatakaSignalsSection`
// only imports charts through the dynamic barrel, so Recharts never enters
// First Load JS (Req 36.1). Each `loading` fallback reserves the section height
// to avoid CLS, matching the surrounding `LazySection`'s `minHeight`.
const PortfolioSection = dynamic(
  () =>
    import("@/components/dashboard/investor/PortfolioSection").then(
      (m) => m.PortfolioSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[420px]" /> },
);

const ActivePipelineSection = dynamic(
  () =>
    import("@/components/dashboard/investor/ActivePipelineSection").then(
      (m) => m.ActivePipelineSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[360px]" /> },
);

const KarnatakaSignalsSection = dynamic(
  () =>
    import("@/components/dashboard/investor/KarnatakaSignalsSection").then(
      (m) => m.KarnatakaSignalsSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[480px]" /> },
);

const SchemesForPortfolioSection = dynamic(
  () =>
    import("@/components/dashboard/investor/SchemesForPortfolioSection").then(
      (m) => m.SchemesForPortfolioSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[480px]" /> },
);

const InvestorEventsSection = dynamic(
  () =>
    import("@/components/dashboard/investor/InvestorEventsSection").then(
      (m) => m.InvestorEventsSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[420px]" /> },
);

const InvestorResourcesSection = dynamic(
  () =>
    import("@/components/dashboard/investor/InvestorResourcesSection").then(
      (m) => m.InvestorResourcesSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[360px]" /> },
);

/** Shared vertical rhythm for the eager sections within the gutter container. */
const SECTION_PADDING = "py-12 md:py-16";

/**
 * The gated dashboard body. Only mounts inside `InvestorGate`'s Onboarded_State,
 * so `investorProfile` is present; the null-guard keeps it total under strict
 * types and safe in isolation.
 */
function InvestorDashboardContent() {
  const { investorProfile } = useInvestor();

  if (!investorProfile) {
    return null;
  }

  return (
    <>
      {/* Eager, above-the-fold block — chart-free, in a max-w-7xl gutter. */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-8">
          <InvestorPreviewBanner />
        </div>

        <InvestorHeaderStrip />

        <div className={SECTION_PADDING}>
          <InvestorKpiGrid />
        </div>

        <div className={SECTION_PADDING}>
          <MatchedStartupsSection />
        </div>
      </div>

      {/* Below-the-fold, self-contained full-bleed sections — deferred via
          LazySection. The charts inside KarnatakaSignalsSection come from the
          dynamic barrel, so Recharts never enters First Load JS (Req 36.1). */}
      <LazySection minHeight={420}>
        <PortfolioSection />
      </LazySection>

      <LazySection minHeight={360}>
        <ActivePipelineSection />
      </LazySection>

      <LazySection minHeight={480}>
        <KarnatakaSignalsSection />
      </LazySection>

      <LazySection minHeight={480}>
        <SchemesForPortfolioSection />
      </LazySection>

      <LazySection minHeight={420}>
        <InvestorEventsSection />
      </LazySection>

      <LazySection minHeight={360}>
        <InvestorResourcesSection />
      </LazySection>
    </>
  );
}

/**
 * Route entry. A thin client wrapper that gates the personalized content behind
 * `InvestorGate` (Req 17.1–17.4).
 */
export default function InvestorDashboardPage() {
  return (
    <InvestorGate redirectFrom="dashboard/investor">
      <InvestorDashboardContent />
    </InvestorGate>
  );
}

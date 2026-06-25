"use client";

// src/app/dashboard/startup/page.tsx
//
// `/dashboard/startup` — the founder's personalized dashboard (Req 10, 29).
//
// The whole surface is wrapped in `StartupGate`, which redirects unregistered
// sessions to `/register?redirectFrom=dashboard/startup` and only renders its
// children in the Registered_State (Req 1.1–1.4). Because the gate guarantees a
// session profile before any child renders, the inner content component reads
// the profile from `RegistrationContext` and passes it to the sections that
// require it.
//
// Composition + lazy loading (Req 10.1–10.4, 29.1–29.3):
//   - Eager, above-the-fold: header strip (py-8), hero metrics, eligible
//     schemes, applications empty state.
//   - Below-the-fold sections (sector intelligence, recommended next steps,
//     events, resources) render inside `LazySection`, so their work — and the
//     code-split Recharts chunk behind `SectorIntelligenceSection` — stays out
//     of the route's First Load JS and loads only as each section nears the
//     viewport (Req 10.4, 23.10).
//
// Layout: a single `max-w-7xl` container with horizontal gutters; content
// sections use `py-16 md:py-24` while the header strip keeps its own `py-8`
// (Req 29.1–29.3).

import dynamic from "next/dynamic";

import { LazySection } from "@/components/shared/LazySection";
import { ApplicationsEmptyState } from "@/components/dashboard/startup/ApplicationsEmptyState";
import { EligibleSchemesSection } from "@/components/dashboard/startup/EligibleSchemesSection";
import { StartupGate } from "@/components/dashboard/startup/StartupGate";
import { StartupHeaderStrip } from "@/components/dashboard/startup/StartupHeaderStrip";
import { StartupHeroMetrics } from "@/components/dashboard/startup/StartupHeroMetrics";
import { useRegistration } from "@/context/RegistrationContext";

// Below-the-fold sections are code-split out of the route's First Load JS via
// `next/dynamic({ ssr: false })` (Req 27.1, 27.3, 27.4). Their transitive deps
// — the Radix tooltip behind the sector charts, EventCard, etc. — load only
// when each section nears the viewport (it still renders inside `LazySection`).
// `ssr: false` is safe: the page is an interactive Client Component anyway.
// Each `loading` fallback reserves the section's height to avoid CLS, matching
// the `minHeight` reserved by the surrounding `LazySection`.
const SectorIntelligenceSection = dynamic(
  () =>
    import("@/components/dashboard/startup/SectorIntelligenceSection").then(
      (m) => m.SectorIntelligenceSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[560px]" /> },
);

const RecommendedNextSteps = dynamic(
  () =>
    import("@/components/dashboard/startup/RecommendedNextSteps").then(
      (m) => m.RecommendedNextSteps,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[360px]" /> },
);

const DashboardEventsSection = dynamic(
  () =>
    import("@/components/dashboard/startup/DashboardEventsSection").then(
      (m) => m.DashboardEventsSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[480px]" /> },
);

const DashboardResourcesSection = dynamic(
  () =>
    import("@/components/dashboard/startup/DashboardResourcesSection").then(
      (m) => m.DashboardResourcesSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[360px]" /> },
);

/** Shared vertical rhythm for content sections (Req 29.3). */
const SECTION_PADDING = "py-16 md:py-24";

/**
 * The gated dashboard body. Only mounts inside `StartupGate`'s Registered_State,
 * so `registrationProfile` is present; the null-guard keeps it total under
 * strict types and safe in isolation.
 */
function StartupDashboardContent() {
  const { registrationProfile } = useRegistration();

  if (!registrationProfile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Identity / status header — keeps its own py-8 (Req 29.3). */}
      <StartupHeaderStrip />

      {/* Eager, above-the-fold metrics. */}
      <div className={SECTION_PADDING}>
        <StartupHeroMetrics />
      </div>

      <div className={SECTION_PADDING}>
        <EligibleSchemesSection />
      </div>

      <div className={SECTION_PADDING}>
        <ApplicationsEmptyState />
      </div>

      {/* Below-the-fold sections — deferred via LazySection (Req 10.4). The
          charts inside SectorIntelligenceSection are imported from the dynamic
          barrel, so Recharts never enters First Load JS (Req 23.10). */}
      <LazySection className={SECTION_PADDING} minHeight={560}>
        <SectorIntelligenceSection profile={registrationProfile} />
      </LazySection>

      <LazySection className={SECTION_PADDING} minHeight={360}>
        <RecommendedNextSteps profile={registrationProfile} />
      </LazySection>

      <LazySection className={SECTION_PADDING} minHeight={480}>
        <DashboardEventsSection profile={registrationProfile} />
      </LazySection>

      <LazySection className={SECTION_PADDING} minHeight={360}>
        <DashboardResourcesSection />
      </LazySection>
    </div>
  );
}

/**
 * Route entry. The page is a thin client wrapper that gates the personalized
 * content behind `StartupGate` (Req 1.1–1.4, 10.1).
 */
export default function StartupDashboardPage() {
  return (
    <StartupGate>
      <StartupDashboardContent />
    </StartupGate>
  );
}

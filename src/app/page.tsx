// Home Page (`/`). The single `<main>` landmark is provided by RootLayout
// (`app/layout.tsx`, task 2.9), so this page renders its content directly
// without an additional `<main>` to keep exactly one MAIN landmark (Req 21.1).
//
// The ten home sections are composed in this exact order (Req 8):
//   1. HeroSection            2. LiveMetricsSection     3. QuickActionsSection
//   4. FlagshipProgramsSection 5. ClustersSection       6. AllSchemesSection
//   7. SectorExplorerSection  8. EventsPreviewSection   9. GIACountriesSection
//  10. SocialProofSection
//
// Performance (Req 22): above-the-fold sections (Hero, LiveMetrics, QuickActions)
// render EAGERLY for fast first paint. The remaining below-the-fold sections are
// wrapped in `<LazySection>` so they defer-render once they near the viewport,
// each reserving a `minHeight` skeleton to avoid layout shift (no CLS — Req 22.5).
//
// This stays a Server Component (no "use client"); LazySection is a Client
// Component used purely as a wrapper around the (server/client) section children.
import { HeroSection } from "@/components/home/HeroSection";
import { EcosystemNewsCarousel } from "@/components/home/EcosystemNewsCarousel";
import { LiveMetricsSection } from "@/components/home/LiveMetricsSection";
import { QuickActionsSection } from "@/components/home/QuickActionsSection";
import { FlagshipProgramsSection } from "@/components/home/FlagshipProgramsSection";
import { ClustersSection } from "@/components/home/ClustersSection";
import { AllSchemesSection } from "@/components/home/AllSchemesSection";
import { SchemesPersonalizationBanner } from "@/components/home/SchemesPersonalizationBanner";
import { SectorExplorerSection } from "@/components/home/SectorExplorerSection";
import { EventsPreviewSection } from "@/components/home/EventsPreviewSection";
import { GIACountriesSection } from "@/components/home/GIACountriesSection";
import { SocialProofSection } from "@/components/home/SocialProofSection";
import { LazySection } from "@/components/shared/LazySection";

export default function Home() {
  return (
    <>
      {/* Above-the-fold — rendered eagerly for fast first paint. */}
      <HeroSection />
      {/* Ecosystem news carousel — part of the hero composition, above the
          verified live-metrics strip (v1.0.1 polish patch). */}
      <EcosystemNewsCarousel />
      <LiveMetricsSection />
      <QuickActionsSection />

      {/* Below-the-fold — deferred with reserved-height skeletons (no CLS). */}
      <LazySection minHeight={560}>
        <FlagshipProgramsSection />
      </LazySection>
      <LazySection minHeight={560}>
        <ClustersSection />
      </LazySection>
      {/* Home personalization island (Req 24): renders the "You qualify for X
          of 22 schemes" banner ABOVE the schemes preview while registered, and
          renders nothing while unregistered — keeping the foundation home page
          byte-for-byte unchanged for the default (unregistered) state. */}
      <SchemesPersonalizationBanner />
      <LazySection minHeight={640}>
        <AllSchemesSection />
      </LazySection>
      <LazySection minHeight={520}>
        <SectorExplorerSection />
      </LazySection>
      <LazySection minHeight={560}>
        <EventsPreviewSection />
      </LazySection>
      <LazySection minHeight={560}>
        <GIACountriesSection />
      </LazySection>
      <LazySection minHeight={480}>
        <SocialProofSection />
      </LazySection>
    </>
  );
}

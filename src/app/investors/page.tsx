"use client";

// src/app/investors/page.tsx
//
// Investor Connect (`/investors`) — the public investor landing surface
// (Req 7, 37). Replaces the foundation route stub.
//
// Composition + lazy loading (mirrors `dashboard/startup/page.tsx`):
//   - EAGER, above-the-fold: hero strip (its own `py-12`), Why Karnataka, and
//     Featured Opportunities. These carry no charts, so the route's First Load
//     JS stays lean (Req 37.1, 37.4).
//   - BELOW-THE-FOLD: Live Deal Flow, KITVEN co-invest, Beyond Bengaluru,
//     Sector Performance, GIA investors, and the onboarding CTA are imported
//     via `next/dynamic({ ssr: false })` and rendered inside `LazySection`, so
//     their code — including the Recharts chunk behind the sector charts (which
//     load only through the dynamic chart barrel) — stays out of the route's
//     First Load JS and resolves only as each section nears the viewport
//     (Req 37.1, 37.3, 39.1, 39.2).
//
// Each Investor Connect section is full-bleed and self-contained (its own
// background, `py-16 md:py-24` rhythm, and inner `max-w-7xl px-4 sm:px-6
// lg:px-8` container), so the page renders the nine sections in order without
// an extra wrapper. `ssr: false` is safe: this is an interactive Client
// Component. Each `loading` fallback reserves height to avoid CLS.

import dynamic from "next/dynamic";

import { LazySection } from "@/components/shared/LazySection";
import { InvestorHeroStrip } from "@/components/investors/InvestorHeroStrip";
import { WhyKarnatakaSection } from "@/components/investors/WhyKarnatakaSection";
import { FeaturedOpportunitiesSection } from "@/components/investors/FeaturedOpportunitiesSection";

const LiveDealFlowSection = dynamic(
  () =>
    import("@/components/investors/LiveDealFlowSection").then(
      (m) => m.LiveDealFlowSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[520px]" /> },
);

const KitvenCoInvestSection = dynamic(
  () =>
    import("@/components/investors/KitvenCoInvestSection").then(
      (m) => m.KitvenCoInvestSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[440px]" /> },
);

const BeyondBengaluruSection = dynamic(
  () =>
    import("@/components/investors/BeyondBengaluruSection").then(
      (m) => m.BeyondBengaluruSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[760px]" /> },
);

const SectorPerformanceSection = dynamic(
  () =>
    import("@/components/investors/SectorPerformanceSection").then(
      (m) => m.SectorPerformanceSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[620px]" /> },
);

const GiaInvestorsSection = dynamic(
  () =>
    import("@/components/investors/GiaInvestorsSection").then(
      (m) => m.GiaInvestorsSection,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[520px]" /> },
);

const InvestorOnboardingCta = dynamic(
  () =>
    import("@/components/investors/InvestorOnboardingCta").then(
      (m) => m.InvestorOnboardingCta,
    ),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[280px]" /> },
);

export default function InvestorsPage() {
  return (
    <>
      {/* EAGER, above-the-fold (chart-free). */}
      <InvestorHeroStrip />
      <WhyKarnatakaSection />
      <FeaturedOpportunitiesSection />

      {/* BELOW-THE-FOLD — dynamic + lazy. */}
      <LazySection minHeight={520}>
        <LiveDealFlowSection />
      </LazySection>

      <LazySection minHeight={440}>
        <KitvenCoInvestSection />
      </LazySection>

      <LazySection minHeight={760}>
        <BeyondBengaluruSection />
      </LazySection>

      <LazySection minHeight={620}>
        <SectorPerformanceSection />
      </LazySection>

      <LazySection minHeight={520}>
        <GiaInvestorsSection />
      </LazySection>

      <LazySection minHeight={280}>
        <InvestorOnboardingCta />
      </LazySection>
    </>
  );
}

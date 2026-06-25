/* eslint-disable react/display-name -- inline chart-barrel mock stubs need no display name */
/**
 * Investor Connect component test (task 7.5) — Requirements 7, 8, 9, 10, 11, 12,
 * 13, 14, 15.
 *
 * Asserts that the nine Investor Connect sections render their fixed copy, the
 * VERIFIED canonical stats, the synthetic "Illustrative" markers, the in-page
 * `#deals` anchor + its `aria-live` announcement, the KITVEN co-investment
 * terms, the six Beyond-Bengaluru cluster cards, the two Sector-Performance
 * charts, the six GIA country cards + "Learn More" → `/gia`, and the closing
 * onboarding CTA → `/investors/onboard`.
 *
 * The real `/investors` page lazy-loads its below-the-fold sections via
 * `next/dynamic`, so — mirroring the dashboard component tests — each section is
 * imported and rendered DIRECTLY from its own file rather than through the page,
 * sidestepping the dynamic-import boundary entirely.
 *
 * jsdom / Next notes (mirrors dashboards.e2e.test.tsx):
 *  - `next/link` → plain anchor and `next/navigation` (`useRouter` push spy +
 *    `useSearchParams`) so the section CTAs render without an App Router provider.
 *  - `@/components/charts` (the dynamic barrel) → lightweight labelled stubs, so
 *    the Sector-Performance charts render observably without booting Recharts.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so the section CTAs render without an
// App Router context provider.
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string | { pathname?: string };
    children: React.ReactNode;
  }) => (
    <a href={typeof href === "string" ? href : (href?.pathname ?? "#")} {...props}>
      {children}
    </a>
  ),
}));

// Stub the App Router so any section reaching for it renders.
vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/investors",
}));

// Chart mock — the dynamic barrel re-exports the Recharts-backed wrappers, which
// are heavy/unstable in jsdom. Replace each with a labelled marker node so the
// Sector-Performance charts render observably without booting Recharts.
vi.mock("@/components/charts", () => {
  const stub = (label: string) => () =>
    React.createElement("div", { "data-chart-stub": label }, label);
  return {
    __esModule: true,
    ChartBarHorizontalFunding: stub("bar-horizontal-funding"),
    ChartLineFunding: stub("line-funding"),
    ChartFrame: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("div", null, children),
    ChartSkeleton: () => React.createElement("div", { "data-chart-skeleton": "" }),
  };
});

// Imported AFTER the mocks so each section picks up the stubs.
import { InvestorHeroStrip } from "@/components/investors/InvestorHeroStrip";
import { WhyKarnatakaSection } from "@/components/investors/WhyKarnatakaSection";
import { FeaturedOpportunitiesSection } from "@/components/investors/FeaturedOpportunitiesSection";
import { LiveDealFlowSection } from "@/components/investors/LiveDealFlowSection";
import { KitvenCoInvestSection } from "@/components/investors/KitvenCoInvestSection";
import { BeyondBengaluruSection } from "@/components/investors/BeyondBengaluruSection";
import { SectorPerformanceSection } from "@/components/investors/SectorPerformanceSection";
import { GiaInvestorsSection } from "@/components/investors/GiaInvestorsSection";
import { InvestorOnboardingCta } from "@/components/investors/InvestorOnboardingCta";

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("Investor Connect sections (task 7.5)", () => {
  it("hero renders the headline, subhead, and VERIFIED canonical stats (Req 7)", () => {
    render(<InvestorHeroStrip />);

    // Headline (Req 7.1).
    expect(
      screen.getByRole("heading", { level: 1, name: "Investor Connect" }),
    ).toBeInTheDocument();

    // One-line subhead.
    expect(
      screen.getByText(/Discover the Karnataka startup ecosystem/i),
    ).toBeInTheDocument();

    // Four canonical / verified stats — no illustrative label (Req 7.2, 7.5).
    expect(screen.getByText("183")).toBeInTheDocument();
    expect(screen.getByText("$79B")).toBeInTheDocument();
    expect(screen.getByText("21,000")).toBeInTheDocument();
    expect(screen.getByText("46%")).toBeInTheDocument();

    // Two CTAs target the onboarding route and the in-page #deals anchor.
    expect(
      screen.getByRole("link", { name: /Get Investor Access/i }),
    ).toHaveAttribute("href", "/investors/onboard");
    expect(
      screen.getByRole("link", { name: /View Live Deal Flow/i }),
    ).toHaveAttribute("href", "#deals");

    // The hero never marks its verified figures illustrative.
    expect(screen.queryByText(/Illustrative/i)).toBeNull();
  });

  it("Why Karnataka renders three VERIFIED cards (Req 8)", () => {
    render(<WhyKarnatakaSection />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Why Karnataka" }),
    ).toBeInTheDocument();

    // 2.5M / 350K workforce, 46% VC share, 183 soonicorns — all verified.
    expect(screen.getByText("2.5M tech professionals")).toBeInTheDocument();
    expect(screen.getByText(/350,000 engineers/i)).toBeInTheDocument();
    expect(screen.getByText("46% of India's VC")).toBeInTheDocument();
    expect(screen.getByText("183 soonicorns")).toBeInTheDocument();

    // Verified cards carry no illustrative label.
    expect(screen.queryByText(/Illustrative/i)).toBeNull();
  });

  it("Featured Opportunities renders six cards, each with an Illustrative marker (Req 9)", () => {
    render(<FeaturedOpportunitiesSection />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Featured Opportunities" }),
    ).toBeInTheDocument();

    // Six synthetic cards, each carrying its own corner "Illustrative" chip.
    expect(screen.getAllByText("Illustrative")).toHaveLength(6);

    // Every card offers a "Connect" CTA → onboarding.
    const connectLinks = screen.getAllByRole("link", { name: /Connect with/i });
    expect(connectLinks).toHaveLength(6);
    for (const link of connectLinks) {
      expect(link).toHaveAttribute("href", "/investors/onboard");
    }
  });

  it("Live Deal Flow exposes the #deals anchor and an aria-live region (Req 10)", () => {
    const { container } = render(<LiveDealFlowSection />);

    // The section is the in-page #deals anchor target (Req 10.1).
    const section = container.querySelector("#deals");
    expect(section).not.toBeNull();
    expect(section?.tagName).toBe("SECTION");

    // A single polite live region announces a static summary (Req 10.7).
    const liveRegion = screen.getByText(/recent illustrative deals/i);
    expect(liveRegion).toHaveAttribute("aria-live", "polite");

    // The synthetic ticker is labelled illustrative.
    expect(screen.getAllByText("Illustrative").length).toBeGreaterThan(0);
  });

  it("Co-invest with KITVEN renders the VERIFIED terms (Req 11)", () => {
    render(<KitvenCoInvestSection />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Co-invest with KITVEN" }),
    ).toBeInTheDocument();

    // Verified, canonical terms — ₹100 crore corpus, 2–10%, max 30% stake.
    expect(screen.getByText("₹100 crore")).toBeInTheDocument();
    expect(screen.getByText("2–10%")).toBeInTheDocument();
    expect(screen.getByText("Max 30%")).toBeInTheDocument();

    // Verified terms carry no illustrative label.
    expect(screen.queryByText(/Illustrative/i)).toBeNull();
  });

  it("Beyond Bengaluru renders six regional cluster cards (Req 12)", () => {
    render(<BeyondBengaluruSection />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Beyond Bengaluru" }),
    ).toBeInTheDocument();

    // Six clusters, each with a "View Deal Flow" CTA → /clusters/{id}.
    const dealFlowLinks = screen.getAllByRole("link", {
      name: /View deal flow/i,
    });
    expect(dealFlowLinks).toHaveLength(6);
    for (const link of dealFlowLinks) {
      expect(link.getAttribute("href")).toMatch(/^\/clusters\//);
    }

    // Synthetic framing counts are labelled illustrative.
    expect(screen.getAllByText("Illustrative").length).toBeGreaterThan(0);
  });

  it("Sector Performance renders two charts (Req 13)", () => {
    const { container } = render(<SectorPerformanceSection />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Sector Performance" }),
    ).toBeInTheDocument();

    // Both charts (sourced ONLY via the dynamic barrel) render.
    expect(
      container.querySelector('[data-chart-stub="bar-horizontal-funding"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-chart-stub="line-funding"]'),
    ).not.toBeNull();
  });

  it("International Investors renders six country cards + Learn More → /gia (Req 14)", () => {
    render(<GiaInvestorsSection />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "International Investors Welcome",
      }),
    ).toBeInTheDocument();

    // Six featured GIA corridors, one h3 per card.
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);

    // The single CTA links out to the GIA hub.
    expect(screen.getByRole("link", { name: /Learn More/i })).toHaveAttribute(
      "href",
      "/gia",
    );
  });

  it("Get Investor Access CTA links to the onboarding route (Req 15)", () => {
    render(<InvestorOnboardingCta />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Get Investor Access" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Begin Onboarding/i }),
    ).toHaveAttribute("href", "/investors/onboard");

    // Phase-2 verification secondary line.
    expect(
      screen.getByText(/free verification process for accredited/i),
    ).toBeInTheDocument();
  });
});

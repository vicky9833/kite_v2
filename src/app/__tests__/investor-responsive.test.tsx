/* eslint-disable react/display-name -- inline chart-barrel mock stubs need no display name */
/**
 * Investor suite responsive audit (task 18.4) — Requirements 8.5, 9.4, 10.3,
 * 13.4 (and the responsive contracts woven through 19, 20, 23, 27, 28).
 *
 * jsdom does NOT perform real layout, so — exactly like the dashboards'
 * `dashboards-responsive.test.tsx`, the slice's `slice-responsive.test.tsx`, and
 * the foundation's `responsive.test.tsx` — these tests cannot measure pixel
 * overflow or computed widths. Instead they assert the mobile-first responsive
 * CONTRACTS that ARE observable in jsdom via className inspection: the Tailwind
 * class patterns that drive the Viewport_Mobile (320px) → Viewport_Tablet →
 * Viewport_Desktop (≥1024px) behaviour. We reuse the same helper style as the
 * sibling tests (`allClassedElements` + `hasElementWithAll`).
 *
 * Surfaces covered and the contracts (all class strings were read from the
 * components themselves, never invented):
 *
 *   Investor Connect
 *     1. Why Karnataka — 3-col desktop grid (`grid-cols-1 md:grid-cols-3`).
 *     2. Featured Opportunities — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
 *     3. Sector Performance — side-by-side at lg (`grid-cols-1 lg:grid-cols-2`).
 *     4. Live Deal Flow — desktop marquee hidden on mobile (`hidden md:block`)
 *        and a mobile vertical list hidden at md+ (`md:hidden`).
 *
 *   Investor Dashboard
 *     5. KPI grid — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
 *     6. Matched startups — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
 *     7. Karnataka signals — `grid-cols-1 md:grid-cols-3`.
 *
 *   Deal Pipeline
 *     8. Kanban board — a single horizontal-scroll row (`overflow-x-auto`) whose
 *        columns are `min-w-[16rem]`.
 *     9. Filter bar — responsive grid
 *        (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
 *
 * Rendering notes:
 *  - The four Investor Connect sections read no session state, so they render
 *    without a provider. `SectorPerformanceSection` and `KarnatakaSignalsSection`
 *    pull charts through the barrel, so the barrel is mocked to lightweight
 *    stubs (the responsive contracts live on the SECTION grid shells, not inside
 *    the charts, and the real wrappers pull in Recharts).
 *  - The three dashboard sections read `InvestorContext`, so they render inside a
 *    fresh `InvestorProvider` seeded into the Onboarded_State via the same
 *    `updateInvestorProfile` + `completeOnboarding` mutators the wizard uses
 *    (mirroring `InvestorDashboard.test.tsx`).
 *  - The two pipeline pieces take their data via props (`deals` / `onChange`),
 *    so they render without a provider.
 *  - `next/link` is mocked to a plain anchor and `next/navigation` is stubbed so
 *    the client surfaces render without an App Router provider.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

import { InvestorProvider, useInvestor } from "@/context/InvestorContext";
import type { InvestorProfile, TrackedDeal } from "@/types";

import { WhyKarnatakaSection } from "@/components/investors/WhyKarnatakaSection";
import { FeaturedOpportunitiesSection } from "@/components/investors/FeaturedOpportunitiesSection";
import { SectorPerformanceSection } from "@/components/investors/SectorPerformanceSection";
import { LiveDealFlowSection } from "@/components/investors/LiveDealFlowSection";
import { InvestorKpiGrid } from "@/components/dashboard/investor/InvestorKpiGrid";
import { MatchedStartupsSection } from "@/components/dashboard/investor/MatchedStartupsSection";
import { KarnatakaSignalsSection } from "@/components/dashboard/investor/KarnatakaSignalsSection";
import { KanbanBoard } from "@/components/dashboard/investor/pipeline/KanbanBoard";
import { PipelineFilterBar } from "@/components/dashboard/investor/pipeline/PipelineFilterBar";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor (no App Router context needed).
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

// Stub the App Router hooks the client surfaces reach for.
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
  usePathname: () => "/",
}));

// Mock the chart barrel to lightweight stubs. The real wrappers pull in Recharts,
// which is heavy and unstable in jsdom; the responsive contracts under test live
// on the SECTION shells (the grid wrappers), not inside the charts, so the charts
// only need to be SOME renderable node fed typed data.
vi.mock("@/components/charts", () => {
  const stub = (label: string) => () =>
    React.createElement("div", { "data-chart-stub": label }, label);
  return {
    __esModule: true,
    ChartBarHorizontalFunding: stub("bar-horizontal-funding"),
    ChartLineFunding: stub("line-funding"),
    ChartBarSectorStartups: stub("bar-sector-startups"),
    ChartFrame: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("div", null, children),
    ChartSkeleton: () => React.createElement("div", { "data-chart-skeleton": "" }),
  };
});

/* -------------------------------------------------------------------------- */
/* Helpers — robust class-substring inspection over the rendered DOM           */
/* (identical in spirit to dashboards-responsive.test.tsx)                     */
/* -------------------------------------------------------------------------- */

/** All elements in the tree that carry a string `class` attribute. */
function allClassedElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[class]")).filter(
    (el) => typeof el.className === "string",
  );
}

/**
 * True when SOME element's className contains EVERY token in `tokens`
 * (substring match) — i.e. the responsive signature appears on a single
 * element, as Tailwind requires for the modifiers to coexist.
 */
function hasElementWithAll(container: HTMLElement, tokens: string[]): boolean {
  return allClassedElements(container).some((el) =>
    tokens.every((t) => el.className.includes(t)),
  );
}

/* -------------------------------------------------------------------------- */
/* Onboarded-state seeding harness (mirrors InvestorDashboard.test.tsx)        */
/* -------------------------------------------------------------------------- */

/** A complete, realistic onboarded investor profile (all required fields). */
const SEED_PROFILE: InvestorProfile = {
  investorName: "Asha Rao",
  firmName: "Kite Capital Partners",
  investorEmail: "asha@kitecapital.example",
  investorPhone: "9876543210",
  role: "GP",
  firmType: "VC",
  assetsUnderManagement: 25000,
  foundedYear: 2018,
  focusSectors: ["deep-tech", "ai-ml"],
  focusStages: ["Seed", "Series A"],
  ticketSizeMinLakhs: 100,
  ticketSizeMaxLakhs: 1500,
  geographicFocus: ["Karnataka", "Karnataka Beyond Bengaluru"],
  portfolioCompanies: [
    {
      id: "pf-seed-1",
      companyName: "Tunga Labs",
      sector: "deep-tech",
      stage: "Seed",
      investedAmountLakhs: 300,
      investedDate: "2023-03-01",
      currentStatus: "Active",
      location: "Mysuru",
    },
  ],
  dealsTracked: [
    {
      id: "deal-seed-1",
      companyName: "Vega Systems",
      sector: "ai-ml",
      stage: "Seed",
      askLakhs: 400,
      currentStage: "Screening",
      orderInStage: 0,
    },
  ],
  isOnboarded: true,
  investorId: "INV-2024-ABCDEF",
  onboardedAt: "2024-01-15T00:00:00.000Z",
};

/** Seed the session context into the Onboarded_State once on mount. */
function SeedInvestor({ children }: { children: React.ReactNode }) {
  const { updateInvestorProfile, completeOnboarding, isOnboarded } =
    useInvestor();
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      updateInvestorProfile(SEED_PROFILE);
      completeOnboarding();
    }
  }, [updateInvestorProfile, completeOnboarding]);
  // Only render once onboarded so context-reading sections have a profile.
  return isOnboarded ? <>{children}</> : null;
}

function renderOnboarded(ui: React.ReactElement): ReturnType<typeof render> {
  return render(
    <InvestorProvider>
      <SeedInvestor>{ui}</SeedInvestor>
    </InvestorProvider>,
  );
}

/* -------------------------------------------------------------------------- */
/* Investor Connect                                                            */
/* -------------------------------------------------------------------------- */

describe("Investor Connect — Why Karnataka responsive grid (Req 8.5)", () => {
  it("stacks the three cards on mobile (grid-cols-1) and rows them at md:grid-cols-3", () => {
    const { container } = render(<WhyKarnatakaSection />);

    expect(hasElementWithAll(container, ["grid-cols-1", "md:grid-cols-3"])).toBe(
      true,
    );
  });
});

describe("Investor Connect — Featured Opportunities responsive grid (Req 9.4)", () => {
  it("steps grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3", () => {
    const { container } = render(<FeaturedOpportunitiesSection />);

    expect(
      hasElementWithAll(container, [
        "grid-cols-1",
        "sm:grid-cols-2",
        "lg:grid-cols-3",
      ]),
    ).toBe(true);
  });
});

describe("Investor Connect — Sector Performance responsive layout (Req 13.4)", () => {
  it("stacks the two charts on mobile (grid-cols-1) and pairs them at lg:grid-cols-2", () => {
    const { container } = render(<SectorPerformanceSection />);

    expect(hasElementWithAll(container, ["grid-cols-1", "lg:grid-cols-2"])).toBe(
      true,
    );
  });
});

describe("Investor Connect — Live Deal Flow ticker mobile/desktop split (Req 10.3)", () => {
  it("hides the desktop marquee on mobile (hidden md:block) and the mobile list at md+ (md:hidden)", () => {
    const { container } = render(<LiveDealFlowSection />);

    // Desktop marquee shell: present, hidden below md, shown at md+.
    expect(hasElementWithAll(container, ["hidden", "md:block"])).toBe(true);

    // Mobile vertical list: a flex column hidden at md+.
    expect(hasElementWithAll(container, ["flex-col", "md:hidden"])).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Investor Dashboard                                                          */
/* -------------------------------------------------------------------------- */

describe("Investor Dashboard — KPI responsive grid (Req 19)", () => {
  it("steps the KPI grid grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3", async () => {
    const { container } = renderOnboarded(<InvestorKpiGrid />);

    await waitFor(() => {
      expect(
        hasElementWithAll(container, [
          "grid-cols-1",
          "md:grid-cols-2",
          "lg:grid-cols-3",
        ]),
      ).toBe(true);
    });
  });
});

describe("Investor Dashboard — Matched startups responsive grid (Req 20)", () => {
  it("steps the match grid grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3", async () => {
    const { container } = renderOnboarded(<MatchedStartupsSection />);

    await waitFor(() => {
      expect(
        hasElementWithAll(container, [
          "grid-cols-1",
          "sm:grid-cols-2",
          "lg:grid-cols-3",
        ]),
      ).toBe(true);
    });
  });
});

describe("Investor Dashboard — Karnataka signals responsive grid (Req 23)", () => {
  it("stacks the three panels on mobile (grid-cols-1) and rows them at md:grid-cols-3", async () => {
    const { container } = renderOnboarded(<KarnatakaSignalsSection />);

    await waitFor(() => {
      expect(
        hasElementWithAll(container, ["grid-cols-1", "md:grid-cols-3"]),
      ).toBe(true);
    });
  });
});

/* -------------------------------------------------------------------------- */
/* Deal Pipeline                                                               */
/* -------------------------------------------------------------------------- */

describe("Deal Pipeline — kanban horizontal-scroll board (Req 28)", () => {
  it("lays the six columns out in a single horizontal-scroll row (overflow-x-auto) with min-w-[16rem] columns", () => {
    // Render with no deals: every stage column still renders its scroll-row
    // shell and `min-w-[16rem]` width, and we avoid mounting the
    // context-reading DealCard (the responsive contract lives on the board +
    // columns, not the cards).
    const DEALS: TrackedDeal[] = [];

    const { container } = render(<KanbanBoard deals={DEALS} />);

    // The board row is horizontally scrollable on small screens.
    expect(hasElementWithAll(container, ["flex", "overflow-x-auto"])).toBe(true);

    // Each column keeps a stable minimum width so the row scrolls rather than
    // squashing on mobile.
    expect(hasElementWithAll(container, ["min-w-[16rem]"])).toBe(true);
  });
});

describe("Deal Pipeline — filter bar responsive grid (Req 27)", () => {
  it("steps the filter grid grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3 → xl:grid-cols-4", () => {
    const { container } = render(<PipelineFilterBar onChange={vi.fn()} />);

    expect(
      hasElementWithAll(container, [
        "grid-cols-1",
        "sm:grid-cols-2",
        "lg:grid-cols-3",
        "xl:grid-cols-4",
      ]),
    ).toBe(true);
  });
});

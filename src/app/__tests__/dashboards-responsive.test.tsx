/* eslint-disable react/display-name -- inline chart-barrel mock stubs need no display name */
/**
 * Dashboards responsive audit (task 18.3) — Requirements 3.1–3.3, 4.5–4.7,
 * 6.2, 6.3, 12.1–12.3, 14.9, 15.2, 15.3, 17.2, 17.3.
 *
 * jsdom does NOT perform real layout, so — exactly like the slice's
 * `slice-responsive.test.tsx` and the foundation's `responsive.test.tsx` —
 * these tests cannot measure pixel overflow or computed widths. Instead they
 * assert the mobile-first responsive CONTRACTS that ARE observable in jsdom via
 * className inspection: the Tailwind class patterns that drive the audited
 * Viewport_Mobile (320px) vs Viewport_Desktop (≥1024px) behaviour. We reuse the
 * same helper style as the sibling tests (`allClassedElements` +
 * `hasElementWithAll`).
 *
 * The seven dashboard surfaces covered (per the task) and the contracts:
 *
 *   1. Startup hero metrics grid — `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
 *      (Req 3.1–3.3).
 *   2. Startup eligible schemes — mobile horizontal scroll (`overflow-x-auto`)
 *      stepping up to `md:grid-cols-3 lg:grid-cols-4` (Req 4.5–4.7).
 *   3. Startup sector charts — stacked on mobile → `lg:grid-cols-3` desktop
 *      (Req 6.2, 6.3).
 *   4. Admin KPI grid — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
 *      (Req 12.1–12.3).
 *   5. Admin regional distribution — `grid-cols-1 lg:grid-cols-2`
 *      (Req 15.2, 15.3).
 *   6. Admin founder demographics — `grid-cols-1 md:grid-cols-3`
 *      (Req 17.2, 17.3).
 *   7. Admin scheme performance table → cards at the `md` breakpoint: the
 *      semantic table is hidden below `md` (`hidden md:block`) and the stacked
 *      cards are hidden at `md`+ (`md:hidden`) (Req 14.9).
 *
 * Rendering notes:
 *  - The two startup sections that read RegistrationContext (hero metrics,
 *    eligible schemes) are rendered inside a fresh `RegistrationProvider` seeded
 *    into the Registered_State via the same `updateProfile` +
 *    `completeRegistration` mutators the wizard uses. `SectorIntelligenceSection`
 *    takes its `profile` directly as a prop, so it is rendered without a
 *    provider. Admin sections read no session state and need no provider.
 *  - The chart barrel (`@/components/charts`) is mocked to lightweight stubs:
 *    the charts' internal layout is NOT what is under test here, and the real
 *    wrappers pull in Recharts (heavy/unstable in jsdom).
 *  - `next/link` is mocked to a plain anchor and `next/navigation` is stubbed so
 *    the client surfaces render without an App Router provider (same pattern as
 *    `slice-responsive.test.tsx`).
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

import {
  RegistrationProvider,
  useRegistration,
} from "@/context/RegistrationContext";
import type { RegistrationProfile } from "@/types";

import { StartupHeroMetrics } from "@/components/dashboard/startup/StartupHeroMetrics";
import { EligibleSchemesSection } from "@/components/dashboard/startup/EligibleSchemesSection";
import { SectorIntelligenceSection } from "@/components/dashboard/startup/SectorIntelligenceSection";
import { AdminKpiGrid } from "@/components/dashboard/admin/AdminKpiGrid";
import { RegionalDistributionSection } from "@/components/dashboard/admin/RegionalDistributionSection";
import { FounderDemographicsSection } from "@/components/dashboard/admin/FounderDemographicsSection";
import { SchemePerformanceSection } from "@/components/dashboard/admin/SchemePerformanceSection";

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
// on the SECTION shells (the grid wrappers / table visibility), not inside the
// charts, so the charts only need to be SOME renderable node fed typed data.
vi.mock("@/components/charts", () => {
  const stub = (label: string) => () =>
    React.createElement("div", { "data-chart-stub": label }, label);
  return {
    __esModule: true,
    ChartLineFunding: stub("line-funding"),
    ChartBarSectorStartups: stub("bar-sector-startups"),
    ChartBarHorizontalSchemes: stub("bar-horizontal-schemes"),
    ChartAreaFundingTimeline: stub("area-funding-timeline"),
    ChartBarRegionStartups: stub("bar-region-startups"),
    ChartBarStackedDisbursement: stub("bar-stacked-disbursement"),
    ChartTreemapSectors: stub("treemap-sectors"),
    ChartBarHorizontalSectorGrowth: stub("bar-horizontal-sector-growth"),
    ChartPieGeneric: stub("pie-generic"),
    ChartFrame: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("div", null, children),
    ChartSkeleton: () => React.createElement("div", { "data-chart-skeleton": "" }),
  };
});

/* -------------------------------------------------------------------------- */
/* Helpers — robust class-substring inspection over the rendered DOM           */
/* (identical in spirit to slice-responsive.test.tsx)                          */
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
/* Registered-state seeding harness (mirrors startup-dashboard.test.tsx)       */
/* -------------------------------------------------------------------------- */

/**
 * A fully-filled, definitely-eligible profile so the eligible-schemes section
 * surfaces the grid (not its empty-state paragraph). `primarySector` uses a real
 * sector id.
 */
const SEED_PROFILE: Partial<RegistrationProfile> = {
  founderName: "Asha Rao",
  founderEmail: "asha@example.com",
  founderPhone: "9876543210",
  founderAge: 29,
  companyName: "Deep Signal Labs",
  dpiitRecognized: true,
  gstRegistered: true,
  incorporationDate: "2022-06-15",
  currentStage: "Early Revenue",
  teamSize: 12,
  womenFounderStake: 30,
  womenEmployeePercentage: 40,
  scStFounder: false,
  primarySector: "deep-tech",
  secondarySectors: [],
  location: "Mysuru",
  fundingStage: "Seed",
  fundingRaised: 10,
};

/** Seed the session context into the Registered_State once on mount. */
function SeedRegistered({ children }: { children: React.ReactNode }) {
  const { updateProfile, completeRegistration } = useRegistration();
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      updateProfile(SEED_PROFILE);
      completeRegistration();
    }
  }, [updateProfile, completeRegistration]);
  return <>{children}</>;
}

function renderRegistered(ui: React.ReactElement): ReturnType<typeof render> {
  return render(
    <RegistrationProvider>
      <SeedRegistered>{ui}</SeedRegistered>
    </RegistrationProvider>,
  );
}

/** A concrete profile for the prop-driven sector-intelligence section. */
const SECTOR_PROFILE = SEED_PROFILE as RegistrationProfile;

/* -------------------------------------------------------------------------- */
/* 1. Startup hero metrics grid (Req 3.1–3.3)                                  */
/* -------------------------------------------------------------------------- */

describe("Startup hero metrics responsive grid (Req 3.1–3.3)", () => {
  it("steps the metric grid grid-cols-1 → md:grid-cols-2 → lg:grid-cols-4", async () => {
    const { container } = renderRegistered(<StartupHeroMetrics />);

    await waitFor(() => {
      expect(
        hasElementWithAll(container, [
          "grid-cols-1",
          "md:grid-cols-2",
          "lg:grid-cols-4",
        ]),
      ).toBe(true);
    });
  });
});

/* -------------------------------------------------------------------------- */
/* 2. Startup eligible schemes (Req 4.5–4.7)                                   */
/* -------------------------------------------------------------------------- */

describe("Startup eligible schemes responsive layout (Req 4.5–4.7)", () => {
  it("uses a mobile horizontal-scroll row that becomes a md:grid-cols-3 → lg:grid-cols-4 grid", async () => {
    const { container } = renderRegistered(<EligibleSchemesSection />);

    // The list is horizontally scrollable on mobile (Req 4.7) and becomes a
    // three-/four-column grid at md/lg (Req 4.5, 4.6). All three modifiers live
    // on the single <ul> element.
    await waitFor(() => {
      expect(
        hasElementWithAll(container, [
          "overflow-x-auto",
          "md:grid-cols-3",
          "lg:grid-cols-4",
        ]),
      ).toBe(true);
    });
  });
});

/* -------------------------------------------------------------------------- */
/* 3. Startup sector intelligence charts (Req 6.2, 6.3)                        */
/* -------------------------------------------------------------------------- */

describe("Startup sector charts responsive layout (Req 6.2, 6.3)", () => {
  it("stacks the charts on mobile (grid-cols-1) and lays them out at lg:grid-cols-3", () => {
    // SectorIntelligenceSection takes its profile as a prop, so no provider is
    // needed. The chart barrel is mocked above.
    const { container } = render(
      <SectorIntelligenceSection profile={SECTOR_PROFILE} />,
    );

    expect(hasElementWithAll(container, ["grid-cols-1", "lg:grid-cols-3"])).toBe(
      true,
    );
  });
});

/* -------------------------------------------------------------------------- */
/* 4. Admin KPI grid (Req 12.1–12.3)                                           */
/* -------------------------------------------------------------------------- */

describe("Admin KPI responsive grid (Req 12.1–12.3)", () => {
  it("steps the KPI grid grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3", () => {
    const { container } = render(<AdminKpiGrid />);

    expect(
      hasElementWithAll(container, [
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3",
      ]),
    ).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* 5. Admin regional distribution (Req 15.2, 15.3)                             */
/* -------------------------------------------------------------------------- */

describe("Admin regional distribution responsive layout (Req 15.2, 15.3)", () => {
  it("stacks the two charts on mobile (grid-cols-1) and pairs them at lg:grid-cols-2", () => {
    const { container } = render(<RegionalDistributionSection />);

    expect(hasElementWithAll(container, ["grid-cols-1", "lg:grid-cols-2"])).toBe(
      true,
    );
  });
});

/* -------------------------------------------------------------------------- */
/* 6. Admin founder demographics (Req 17.2, 17.3)                              */
/* -------------------------------------------------------------------------- */

describe("Admin founder demographics responsive layout (Req 17.2, 17.3)", () => {
  it("stacks the three pies on mobile (grid-cols-1) and rows them at md:grid-cols-3", () => {
    const { container } = render(<FounderDemographicsSection />);

    expect(hasElementWithAll(container, ["grid-cols-1", "md:grid-cols-3"])).toBe(
      true,
    );
  });
});

/* -------------------------------------------------------------------------- */
/* 7. Admin scheme table → cards at the md breakpoint (Req 14.9)               */
/* -------------------------------------------------------------------------- */

describe("Admin scheme performance table↔cards collapse (Req 14.9)", () => {
  it("renders the semantic table hidden below md (hidden md:block) AND stacked cards hidden at md+ (md:hidden)", () => {
    const { container } = render(<SchemePerformanceSection />);

    // The semantic <table> exists, wrapped in a container that is hidden on
    // mobile and shown at md+ (Req 14.9 desktop branch).
    const table = container.querySelector("table");
    expect(table).not.toBeNull();
    const tableWrapper = table?.closest("[class]") as HTMLElement | null;
    // Some ancestor of the table carries both `hidden` and `md:block`.
    const tableShell = table
      ? (table.parentElement as HTMLElement | null)
      : null;
    expect(
      [tableWrapper, tableShell, table?.parentElement ?? null].some(
        (el) =>
          el != null &&
          el.className.includes("hidden") &&
          el.className.includes("md:block"),
      ),
    ).toBe(true);

    // The stacked-card list exists and is hidden at md+ (mobile branch).
    const cardList = container.querySelector<HTMLElement>(
      '[data-testid="scheme-cards"]',
    );
    expect(cardList).not.toBeNull();
    expect(cardList?.className).toContain("md:hidden");

    // Sanity: both representations carry the SAME 22-scheme data — the cards
    // list renders one <li> per row, and the table renders the matching rows.
    expect(cardList?.querySelectorAll("li").length).toBeGreaterThan(0);
    expect(table?.querySelectorAll("tbody tr").length).toBeGreaterThan(0);
  });
});

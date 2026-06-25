/* eslint-disable react/display-name -- inline chart-barrel mock stubs need no display name */
/**
 * Startup dashboard component test (task 9.2) — Requirements 2, 3, 4, 5, 8, 9, 10.
 *
 * Renders the composed `/dashboard/startup` page (`StartupDashboardPage`) inside
 * a real `RegistrationProvider` seeded into the Registered_State, and asserts the
 * personalized surface the design promises:
 *
 *   - Header strip (Req 2): "Welcome back, {founderName}", the kiteId caption,
 *     and the label/value detail row (company / primary sector / location / …).
 *   - Hero metrics (Req 3): four headline cards including "Of 22 schemes total",
 *     a Profile Completeness percentage, and the Ecosystem Rank metric.
 *   - Eligible schemes (Req 4): "Schemes You Qualify For" with at least one
 *     scheme card plus the "See All 22 Schemes" link.
 *   - Applications empty state (Req 5): "Your Applications" with the
 *     "Browse Eligible Schemes" primary CTA.
 *   - Events + resources (Req 8, 9): the "Events for You" and "Resources"
 *     headings, which live in `LazySection`s below the fold.
 *
 * jsdom / lazy notes:
 *  - `next/link` is mocked to a plain anchor and `next/navigation` is stubbed so
 *    the client surfaces render without an App Router provider (same pattern as
 *    `src/app/__tests__/slice-a11y.test.tsx`).
 *  - `LazySection` renders its children immediately when `IntersectionObserver`
 *    is absent (jsdom), so the below-the-fold sections (sector intelligence,
 *    recommended next steps, events, resources) mount during the test.
 *  - The lazy `SectorIntelligenceSection` feeds the heavy Recharts wrappers. We
 *    mock the chart barrel (`@/components/charts`) to lightweight stubs so this
 *    component test exercises the composition without booting Recharts in jsdom.
 *  - The session profile is seeded via `updateProfile` + `completeRegistration`
 *    (the same mutators the wizard uses), which flips the gate to its
 *    Registered_State.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import {
  RegistrationProvider,
  useRegistration,
} from "@/context/RegistrationContext";
import type { RegistrationProfile } from "@/types";

import StartupDashboardPage from "@/app/dashboard/startup/page";

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

// Stub the App Router hooks the gate + client surfaces reach for.
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
  usePathname: () => "/dashboard/startup",
}));

// Mock the chart barrel to lightweight stubs. The real wrappers pull in Recharts,
// which is heavy and unstable in jsdom; the composition under test only needs the
// charts to be SOME renderable node fed typed data. Each stub renders a labelled
// marker so the sector-intelligence section is observably present.
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
/* Fixtures + seeding harness                                                  */
/* -------------------------------------------------------------------------- */

const FOUNDER_NAME = "Asha Rao";

/**
 * A fully-filled, definitely-eligible profile (mirrors the slice fixtures) so the
 * eligible-schemes section surfaces at least one card and the hero benefit total
 * is non-zero. `primarySector` uses a real sector id.
 */
const SEED_PROFILE: Partial<RegistrationProfile> = {
  founderName: FOUNDER_NAME,
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

/**
 * Seeds the session context into the Registered_State once on mount: merges the
 * profile, then calls `completeRegistration` (which stamps kiteId/registeredAt
 * and flips `isRegistered`). This flips `StartupGate` to render its children.
 */
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

function renderDashboard() {
  return render(
    <RegistrationProvider>
      <SeedRegistered>
        <StartupDashboardPage />
      </SeedRegistered>
    </RegistrationProvider>,
  );
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("Startup dashboard composition (Req 2, 3, 4, 5, 8, 9, 10)", () => {
  it("renders the personalized header strip (Req 2)", async () => {
    renderDashboard();

    // Welcome heading with the founder name (Req 2.1).
    const heading = await screen.findByRole("heading", {
      name: new RegExp(`Welcome back, ${FOUNDER_NAME}`, "i"),
    });
    expect(heading).toBeInTheDocument();

    // kiteId caption in the canonical KITE-YYYY-XXXXXX shape (Req 2.2).
    expect(screen.getByText(/^KITE-\d{4}-[A-Z2-9]{6}$/)).toBeInTheDocument();

    // Label/value detail row resolves the primary sector name + other fields
    // (Req 2.6, 2.7). "Deep Tech" is the canonical name for the `deep-tech` id.
    expect(screen.getByText(/Company/i)).toBeInTheDocument();
    expect(screen.getByText("Deep Signal Labs")).toBeInTheDocument();
    expect(screen.getByText(/Primary sector/i)).toBeInTheDocument();
    expect(screen.getByText("Mysuru")).toBeInTheDocument();
  });

  it("renders the four hero metric cards (Req 3)", async () => {
    renderDashboard();

    await screen.findByRole("heading", {
      name: new RegExp(`Welcome back, ${FOUNDER_NAME}`, "i"),
    });

    // Eligible Schemes Count card caption (Req 3.6, 3.7).
    expect(screen.getByText(/Of 22 schemes total/i)).toBeInTheDocument();
    // Total Estimated Benefits caption (Req 3.4, 3.5).
    expect(screen.getByText(/Across \d+ eligible scheme/i)).toBeInTheDocument();
    // Profile Completeness label + a percentage value (Req 3.8).
    expect(screen.getByText(/Profile Completeness/i)).toBeInTheDocument();
    expect(screen.getByText(/^\d{1,3}%$/)).toBeInTheDocument();
    // Ecosystem Rank metric (Req 3.10).
    expect(screen.getByText(/Ecosystem Rank/i)).toBeInTheDocument();
  });

  it("renders the eligible schemes section with a See-All link (Req 4)", async () => {
    renderDashboard();

    await screen.findByRole("heading", {
      name: /Schemes You Qualify For/i,
    });

    // "See All 22 Schemes" routes to /schemes (Req 4.8).
    const seeAll = screen.getByRole("link", { name: /See All 22 Schemes/i });
    expect(seeAll).toHaveAttribute("href", "/schemes");

    // At least one "View Details" scheme link to /schemes/{id} (Req 4.4).
    const viewDetails = screen.getAllByRole("link", { name: /View details/i });
    expect(viewDetails.length).toBeGreaterThan(0);
    expect(viewDetails[0]?.getAttribute("href")).toMatch(/^\/schemes\//);
  });

  it("renders the applications empty state with its CTA (Req 5)", async () => {
    renderDashboard();

    await screen.findByRole("heading", { name: /Your Applications/i });
    expect(screen.getByText(/No applications yet/i)).toBeInTheDocument();

    const browse = screen.getByRole("link", { name: /Browse Eligible Schemes/i });
    expect(browse).toHaveAttribute("href", "/schemes");
  });

  it("renders the events and resources lazy sections (Req 8, 9, 10)", async () => {
    renderDashboard();

    // Both headings live inside LazySection; they render eagerly in jsdom
    // (no IntersectionObserver), confirming the lazy composition mounts (Req 10.4).
    expect(
      await screen.findByRole("heading", { name: /Events for You/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^Resources$/i }),
    ).toBeInTheDocument();

    // The lazy sector-intelligence section mounted its (stubbed) charts (Req 10.4).
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Your Sector at a Glance/i }),
      ).toBeInTheDocument();
    });
  });
});

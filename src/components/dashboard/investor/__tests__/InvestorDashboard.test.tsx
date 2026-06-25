// src/components/dashboard/investor/__tests__/InvestorDashboard.test.tsx
//
// Task 12.2 — Investor Dashboard component test (Req 17, 18, 19, 20, 21, 22,
// 23, 24, 25).
//
// Renders the real `/dashboard/investor` page wrapped in `InvestorProvider`
// seeded into the Onboarded_State (a small `SeedInvestor` harness commits a
// complete `InvestorProfile` via `updateInvestorProfile` then finalises with
// `completeOnboarding`, mirroring how the startup-dashboard tests seed the
// Registered_State). Once onboarded, `InvestorGate` renders the personalized
// dashboard, and we assert that every required surface is present:
//   - the fixed preview-banner copy (Req 17.4),
//   - the "Welcome back, {name}" header (Req 18.1),
//   - the six KPI cards (Req 19),
//   - the engine-driven "Startups Matching Your Thesis" section with match
//     cards and an aria-live match count (Req 20),
//   - the portfolio, active-pipeline, Karnataka-signals, schemes, events, and
//     resources sections (Req 21–25), which load via `next/dynamic` inside
//     `LazySection` (eager in jsdom, where IntersectionObserver is absent).
//
// Module mocks (mirroring the existing dashboard e2e/responsive tests):
//   - `next/link` → a plain anchor (no App Router provider needed),
//   - `next/navigation` → stubbed router/searchParams/pathname,
//   - `@/components/charts` (the dynamic barrel) → lightweight stubs, since the
//     real wrappers pull in Recharts (heavy/unstable in jsdom).

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

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
  usePathname: () => "/dashboard/investor",
}));

// The chart barrel pulls in Recharts (heavy/unstable in jsdom). Replace the
// wrappers the dashboard uses with labelled marker nodes. /* eslint-disable
// react/display-name */
vi.mock("@/components/charts", () => {
  /* eslint-disable react/display-name */
  const stub = (label: string) => () =>
    React.createElement("div", { "data-chart-stub": label }, label);
  return {
    __esModule: true,
    ChartLineFunding: stub("line-funding"),
    ChartBarSectorStartups: stub("bar-sector-startups"),
    ChartFrame: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("div", null, children),
    ChartSkeleton: () => React.createElement("div", { "data-chart-skeleton": "" }),
  };
  /* eslint-enable react/display-name */
});

// Imported AFTER the mocks so the surfaces pick up the stubs.
import { InvestorProvider, useInvestor } from "@/context/InvestorContext";
import InvestorDashboardPage from "@/app/dashboard/investor/page";
import type { InvestorProfile } from "@/types";

/* -------------------------------------------------------------------------- */
/* Fixture + seeding harness                                                   */
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
  const { updateInvestorProfile, completeOnboarding, isOnboarded } = useInvestor();
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      updateInvestorProfile(SEED_PROFILE);
      completeOnboarding();
    }
  }, [updateInvestorProfile, completeOnboarding]);
  // Only render the gated page once the session reports onboarded, so the gate
  // renders its children rather than the Redirecting_State.
  return isOnboarded ? <>{children}</> : null;
}

function renderDashboard() {
  return render(
    <InvestorProvider>
      <SeedInvestor>
        <InvestorDashboardPage />
      </SeedInvestor>
    </InvestorProvider>,
  );
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("Investor Dashboard page (Req 17–25)", () => {
  it("renders the fixed preview-banner copy (Req 17.4)", async () => {
    renderDashboard();
    expect(
      await screen.findByText(/Investor Dashboard Preview\./i),
    ).toBeInTheDocument();
    expect(screen.getByText(/opens in Phase 2/i)).toBeInTheDocument();
  });

  it("renders the personalized header with the investor name (Req 18.1)", async () => {
    renderDashboard();
    expect(
      await screen.findByRole("heading", { name: /Welcome back, Asha Rao/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Kite Capital Partners/)).toBeInTheDocument();
  });

  it("renders all six KPI cards (Req 19)", async () => {
    renderDashboard();
    await screen.findByText("Portfolio Value");
    for (const label of [
      "Portfolio Value",
      "Active Deals",
      "Pipeline Value",
      "Portfolio Companies",
      "Exits This Year",
      "Karnataka Allocation",
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("renders the engine-driven matched-startups section with cards and an aria-live count (Req 20)", async () => {
    renderDashboard();
    expect(
      await screen.findByRole("heading", {
        name: /Startups Matching Your Thesis/i,
      }),
    ).toBeInTheDocument();

    // The aria-live region announces the match count (Req 20.6).
    const count = screen.getByText(/Showing top \d+ of \d+ matches/i);
    expect(count).toBeInTheDocument();
    expect(count.getAttribute("aria-live")).toBe("polite");

    // Top matches are rendered as cards, each with a level-3 company heading.
    const cardHeadings = screen.getAllByRole("heading", { level: 3 });
    expect(cardHeadings.length).toBeGreaterThan(0);
  });

  it("renders the portfolio, pipeline, signals, schemes, events, and resources sections (Req 21–25)", async () => {
    renderDashboard();
    // These six sections load via next/dynamic inside LazySection.
    expect(
      await screen.findByRole("heading", { name: /Your Portfolio/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /Active Pipeline/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /Karnataka Signals/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", {
        name: /Government Schemes for Your Portfolio/i,
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /Investor Events/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /Investor Resources/i }),
    ).toBeInTheDocument();
  });
});

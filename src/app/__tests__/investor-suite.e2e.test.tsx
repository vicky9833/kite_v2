/**
 * Investor Suite end-to-end integration test (task 18.2).
 *
 * Exercises the investor journey across the real gated routes wired to a single
 * session `InvestorContext`, proving the onboarding gate, the personalized
 * dashboard, and the deal-pipeline kanban board all thread one profile
 * end-to-end and stay internally consistent:
 *
 *   1. START (Unregistered_State) — rendering `/dashboard/investor` directly,
 *      with no onboarded session, drives `InvestorGate` into its
 *      Redirecting_State: `router.push` is called with
 *      `/investors/onboard?redirectFrom=dashboard/investor` (Req 17.1, 17.2),
 *      the `aria-live="polite"` "Redirecting…" message renders (Req 17.3), and
 *      none of the personalized surfaces (header / KPI cards / matches) appear.
 *
 *   2. ONBOARD (Onboarded_State) — a small `SeedInvestor` harness commits a
 *      complete `InvestorProfile` via `updateInvestorProfile` then finalises
 *      with `completeOnboarding` (the deterministic path the dashboard tests
 *      use). Once onboarded, the gate renders the dashboard and we assert the
 *      "Welcome back, {name}" header (Req 18.1), the six KPI cards (Req 19), and
 *      the engine-driven "Startups Matching Your Thesis" section (Req 20).
 *
 *   3. PIPELINE — `/dashboard/investor/pipeline` under the same onboarded
 *      provider renders the kanban board with its six canonical stage columns
 *      (Req 28.1) and a header that counts the investor's ACTIVE deals
 *      (Req 26.1) consistent with the same fixture.
 *
 *   4. GATE PARITY — the pipeline route also redirects when not onboarded, with
 *      `redirectFrom=dashboard/investor/pipeline` (Req 17, 26.2).
 *
 * jsdom / Next notes (mirrors InvestorDashboard.test.tsx + registration e2e):
 *  - `next/link` → plain anchor; `next/navigation` `useRouter().push` → a module
 *    scope spy + `useSearchParams` stub, so the client islands render without an
 *    App Router provider; `sonner` `toast` → spy.
 *  - `@/components/charts` → lightweight stubs (Recharts is heavy/unstable in
 *    jsdom). Below-the-fold sections load via `next/dynamic`, so the dynamic
 *    sections use retrying `findBy*` queries with a generous budget.
 *  - jsdom polyfills come from the global `src/test/setup.ts`.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

/* -------------------------------------------------------------------------- */
/* Async budget (dynamic next/dynamic chunks)                                 */
/* -------------------------------------------------------------------------- */

const ASYNC_TIMEOUT = 8000;
const TEST_TIMEOUT = 30000;

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so CTAs render without an App Router
// context provider.
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

// Stub the App Router. `push` is a module-scope spy so the gate's redirect can
// be asserted; `useSearchParams` is stubbed because the onboarding island reads
// it (the gate never navigates in jsdom, so it never mounts, but the stub keeps
// the contract complete and parallels the other route tests).
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/dashboard/investor",
}));

// Spy on sonner so any toast (e.g. the Add-Deal form) never touches a real
// toaster.
const toastFn = vi.fn();
vi.mock("sonner", () => ({
  __esModule: true,
  toast: Object.assign((...args: unknown[]) => toastFn(...args), {
    success: (...args: unknown[]) => toastFn(...args),
    error: (...args: unknown[]) => toastFn(...args),
  }),
}));

// The chart barrel pulls in Recharts (heavy/unstable in jsdom). Replace the
// wrappers the surfaces use with labelled marker nodes.
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
import DealPipelinePage from "@/app/dashboard/investor/pipeline/page";
import { DEAL_STAGE_ORDER, type InvestorProfile } from "@/types";

/* -------------------------------------------------------------------------- */
/* Fixture + seeding harness                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A complete, realistic onboarded investor profile (all required fields) with a
 * few `dealsTracked` spread across stages, so the pipeline header's active-deal
 * count (active = stage neither Closed nor Passed) is non-trivial: three active
 * (Sourced / Screening / Diligence) and one Closed.
 */
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
      id: "deal-sourced-1",
      companyName: "Nova Robotics",
      sector: "deep-tech",
      stage: "Seed",
      askLakhs: 250,
      currentStage: "Sourced",
      orderInStage: 0,
    },
    {
      id: "deal-screening-1",
      companyName: "Vega Systems",
      sector: "ai-ml",
      stage: "Seed",
      askLakhs: 400,
      currentStage: "Screening",
      orderInStage: 0,
    },
    {
      id: "deal-diligence-1",
      companyName: "Orbit Health",
      sector: "deep-tech",
      stage: "Series A",
      askLakhs: 900,
      currentStage: "Diligence",
      orderInStage: 0,
    },
    {
      id: "deal-closed-1",
      companyName: "Helios Energy",
      sector: "ai-ml",
      stage: "Series A",
      askLakhs: 1200,
      currentStage: "Closed",
      orderInStage: 0,
    },
  ],
  isOnboarded: true,
  investorId: "INV-2024-ABCDEF",
  onboardedAt: "2024-01-15T00:00:00.000Z",
};

/** Active deals = stage neither Closed nor Passed (mirrors the header logic). */
const EXPECTED_ACTIVE_DEALS = SEED_PROFILE.dealsTracked.filter(
  (d) => d.currentStage !== "Closed" && d.currentStage !== "Passed",
).length;

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
  // Only render the gated route once the session reports onboarded, so the gate
  // renders its children rather than the Redirecting_State.
  return isOnboarded ? <>{children}</> : null;
}

/** Render a gated route WITHOUT seeding — exercises the Not_Onboarded gate. */
function renderUnonboarded(page: React.ReactNode) {
  return render(<InvestorProvider>{page}</InvestorProvider>);
}

/** Render a gated route under a freshly-onboarded session. */
function renderOnboarded(page: React.ReactNode) {
  return render(
    <InvestorProvider>
      <SeedInvestor>{page}</SeedInvestor>
    </InvestorProvider>,
  );
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("Investor suite journey (e2e) — gate → dashboard → pipeline", () => {
  beforeEach(() => {
    pushMock.mockClear();
    toastFn.mockClear();
  });

  it(
    "1) START: an unonboarded session is redirected off /dashboard/investor with no personalized flash (Req 17.1–17.3)",
    async () => {
      renderUnonboarded(<InvestorDashboardPage />);

      // The gate redirects to onboarding, preserving the return path.
      expect(pushMock).toHaveBeenCalledWith(
        "/investors/onboard?redirectFrom=dashboard/investor",
      );

      // The aria-live Redirecting_State message renders…
      const redirecting = screen.getByText(/Redirecting you to investor onboarding/i);
      expect(redirecting).toBeInTheDocument();
      expect(redirecting.getAttribute("aria-live")).toBe("polite");

      // …and none of the personalized surfaces flash before the redirect.
      expect(screen.queryByText(/Welcome back, Asha Rao/i)).toBeNull();
      expect(screen.queryByText("Portfolio Value")).toBeNull();
      expect(
        screen.queryByText(/Startups Matching Your Thesis/i),
      ).toBeNull();
    },
    TEST_TIMEOUT,
  );

  it(
    "2) ONBOARD: once onboarded, /dashboard/investor renders the personalized dashboard (Req 18.1, 19, 20)",
    async () => {
      renderOnboarded(<InvestorDashboardPage />);

      // Personalized header (Req 18.1).
      expect(
        await screen.findByRole(
          "heading",
          { name: /Welcome back, Asha Rao/i },
          { timeout: ASYNC_TIMEOUT },
        ),
      ).toBeInTheDocument();
      expect(screen.getByText(/Kite Capital Partners/)).toBeInTheDocument();

      // All six KPI cards (Req 19).
      await screen.findByText("Portfolio Value", undefined, {
        timeout: ASYNC_TIMEOUT,
      });
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

      // Engine-driven matched-startups section (Req 20).
      expect(
        await screen.findByRole(
          "heading",
          { name: /Startups Matching Your Thesis/i },
          { timeout: ASYNC_TIMEOUT },
        ),
      ).toBeInTheDocument();

      // No redirect happened in the onboarded state.
      expect(pushMock).not.toHaveBeenCalled();
    },
    TEST_TIMEOUT,
  );

  it(
    "3) PIPELINE: the onboarded pipeline route renders the six-stage kanban board and the active-deal count (Req 26.1, 28.1)",
    async () => {
      renderOnboarded(<DealPipelinePage />);

      // Header counts the active deals consistent with the fixture (Req 26.1).
      expect(
        await screen.findByRole(
          "heading",
          { name: /Your Deal Pipeline/i },
          { timeout: ASYNC_TIMEOUT },
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          new RegExp(
            `Managing ${EXPECTED_ACTIVE_DEALS} active deals across six stages`,
            "i",
          ),
        ),
      ).toBeInTheDocument();

      // The board renders all six canonical stage columns (Req 28.1). Each
      // column is a region whose accessible name starts with the stage name.
      expect(DEAL_STAGE_ORDER).toHaveLength(6);
      for (const stage of DEAL_STAGE_ORDER) {
        expect(
          screen.getByRole("region", {
            name: new RegExp(`^${stage} \\(`),
          }),
        ).toBeInTheDocument();
      }

      // No redirect in the onboarded state.
      expect(pushMock).not.toHaveBeenCalled();
    },
    TEST_TIMEOUT,
  );

  it(
    "4) GATE PARITY: an unonboarded session is redirected off the pipeline route too (Req 17, 26.2)",
    async () => {
      renderUnonboarded(<DealPipelinePage />);

      expect(pushMock).toHaveBeenCalledWith(
        "/investors/onboard?redirectFrom=dashboard/investor/pipeline",
      );

      const redirecting = screen.getByText(/Redirecting you to investor onboarding/i);
      expect(redirecting).toBeInTheDocument();
      expect(redirecting.getAttribute("aria-live")).toBe("polite");

      // No board flashes before the redirect.
      expect(screen.queryByText(/Your Deal Pipeline/i)).toBeNull();
    },
    TEST_TIMEOUT,
  );
});

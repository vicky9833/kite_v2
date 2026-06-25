/* eslint-disable react/display-name -- inline chart-barrel mock stubs need no display name */
/**
 * Dashboards end-to-end happy-path test (task 18.1) — Requirements 1, 11.1, 26.
 *
 * Exercises the cohesive dashboards journey across the real route surfaces wired
 * to a single session `RegistrationContext`, proving the gating round-trip, the
 * personalized startup dashboard, the home Register quick-action affordances,
 * and the public admin preview all thread together as the design promises:
 *
 *   1. START (unregistered) — rendering the real `/dashboard/startup` page while
 *      unregistered shows the `StartupGate` Redirecting_State (an
 *      `aria-live="polite"` notice, never the gated children) and pushes to
 *      `/register?redirectFrom=dashboard/startup` (Req 1.1–1.3, 28.4).
 *
 *   2. REGISTER → STARTUP DASHBOARD — committing a Registration_Profile to the
 *      live context via `updateProfile` + `completeRegistration` (the robust,
 *      deterministic driver path the design allows in place of clicking through
 *      the lazy six-step wizard, mirroring `registration-flow.e2e.test.tsx` and
 *      `gating.integration.test.tsx`) flips the gate to the Registered_State and
 *      renders the personalized dashboard: the "Welcome back, …" header
 *      (Req 2), the hero metric cards (Req 3), and the "Schemes You Qualify For"
 *      section (Req 4).
 *
 *   3. HOME INTEGRATION — the registered `RegisterQuickActionCard` surfaces both
 *      "See Your Schemes" (→ /schemes) and a primary "Go to Dashboard"
 *      (→ /dashboard/startup) within the one card slot (Req 26.1, 26.2).
 *
 *   4. ADMIN PUBLIC ACCESS — the real `/dashboard/admin` page renders WITHOUT any
 *      registration (no gate, no provider): the "Government Admin Dashboard"
 *      heading appears for an unregistered/empty context (Req 11.1).
 *
 * jsdom / Next notes (mirrors registration-flow.e2e.test.tsx, gating.integration
 * .test.tsx, and admin-dashboard.test.tsx):
 *  - `next/link` → plain anchor; `next/navigation` `useRouter` → push spy and
 *    `useSearchParams` → a `URLSearchParams`, so the islands render without an
 *    App Router provider.
 *  - `sonner` `toast` → spy, so any toast never touches a real toaster.
 *  - `@/components/charts` (the dynamic barrel) → lightweight stubs: the real
 *    wrappers pull in Recharts, which is heavy/unstable in jsdom, so the
 *    chart-bearing lazy sections render observably without booting Recharts.
 *  - `LazySection` renders its children immediately when `IntersectionObserver`
 *    is absent (jsdom), and the startup/admin pages code-split their below-the-
 *    fold sections via `next/dynamic({ ssr:false })`, so cross-render assertions
 *    use retrying `findBy*` / `waitFor` queries with a generous budget.
 *  - jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView / pointer
 *    capture) come from the global `src/test/setup.ts`.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

/* -------------------------------------------------------------------------- */
/* Async budgets (lazy next/dynamic section chunks)                            */
/* -------------------------------------------------------------------------- */

const ASYNC_TIMEOUT = 8000;
const WAIT_OPTS = { timeout: ASYNC_TIMEOUT } as const;
const TEST_TIMEOUT = 30000;

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so the dashboard / card CTAs render
// without an App Router context provider.
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

// Stub the App Router (`useRouter().push` spy) and `useSearchParams`.
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
  usePathname: () => "/dashboard/startup",
}));

// Spy on sonner so any toast never touches a real toaster.
const toastFn = vi.fn();
vi.mock("sonner", () => ({
  __esModule: true,
  toast: Object.assign((...args: unknown[]) => toastFn(...args), {
    success: (...args: unknown[]) => toastFn(...args),
    error: (...args: unknown[]) => toastFn(...args),
  }),
}));

// Chart mock — the dynamic barrel re-exports the Recharts-backed wrappers, which
// are heavy/unstable in jsdom. Replace each with a labelled marker node so the
// chart-bearing lazy sections render observably without booting Recharts.
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

// Imported AFTER the mocks so the surfaces pick up the stubs.
import {
  RegistrationProvider,
  useRegistration,
} from "@/context/RegistrationContext";
import StartupDashboardPage from "@/app/dashboard/startup/page";
import AdminDashboardPage from "@/app/dashboard/admin/page";
import { RegisterQuickActionCard } from "@/components/home/RegisterQuickActionCard";
import { quickActions } from "@/data/quick-actions";
import type { QuickAction, RegistrationProfile } from "@/types";

/* -------------------------------------------------------------------------- */
/* Fixtures + harness                                                          */
/* -------------------------------------------------------------------------- */

/**
 * A complete, realistic profile that lands schemes across multiple eligible
 * statuses, so the personalized startup dashboard renders qualifying schemes.
 * (Same shape as the proven e2e / gating fixtures.)
 */
const PROFILE: RegistrationProfile = {
  founderName: "Anjali Rao",
  founderEmail: "anjali@example.com",
  founderPhone: "9876543210",
  founderAge: 28,
  companyName: "Acme Innovations",
  dpiitRecognized: true,
  gstRegistered: true,
  incorporationDate: "2022-06-15",
  currentStage: "Early Revenue",
  teamSize: 12,
  womenFounderStake: 60,
  womenEmployeePercentage: 40,
  scStFounder: false,
  primarySector: "deep-tech",
  secondarySectors: ["ai-ml"],
  location: "Mysuru",
  fundingStage: "Seed",
  fundingRaised: 10,
  isRegistered: false,
  kiteId: "",
  registeredAt: "",
};

/** The canonical "Register Your Startup" home quick action. */
const REGISTER_ACTION: QuickAction =
  quickActions.find((a) => a.id === "register-startup") ?? quickActions[0]!;

/** Commits the fixture profile to the live context (deterministic register). */
function RegistrationDriver({ profile }: { profile: RegistrationProfile }) {
  const { updateProfile, completeRegistration } = useRegistration();
  return (
    <button
      type="button"
      onClick={() => {
        updateProfile(profile);
        completeRegistration();
      }}
    >
      Run registration
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("Dashboards happy path (e2e) — gating round-trip, startup, home, admin", () => {
  beforeEach(() => {
    pushMock.mockClear();
    toastFn.mockClear();
  });

  it(
    "redirects an unregistered startup visitor, then renders the personalized dashboard once registered (Req 1, 2, 3, 4)",
    async () => {
      render(
        <RegistrationProvider>
          <RegistrationDriver profile={PROFILE} />
          <StartupDashboardPage />
        </RegistrationProvider>,
      );

      /* -- 1. START unregistered: Redirecting_State + push (Req 1.1–1.3, 28.4) */
      // Gated content (the welcome header) is absent before registration.
      expect(screen.queryByText(/Welcome back,/i)).toBeNull();

      // The notice is announced through an aria-live="polite" region (Req 1.2, 28.4).
      const notice = screen.getByText(/Redirecting you to registration/i);
      expect(notice).toHaveAttribute("aria-live", "polite");

      // The gate pushes to /register with the redirectFrom marker (Req 1.1).
      expect(pushMock).toHaveBeenCalledWith(
        "/register?redirectFrom=dashboard/startup",
      );

      /* -- 2. Register → personalized startup dashboard (Req 2, 3, 4) -------- */
      fireEvent.click(screen.getByRole("button", { name: "Run registration" }));

      // Header welcome line with the founder name (Req 2.1).
      expect(
        await screen.findByText(
          `Welcome back, ${PROFILE.founderName}`,
          undefined,
          WAIT_OPTS,
        ),
      ).toBeInTheDocument();

      // Hero metric cards (Req 3.4, 3.6).
      expect(screen.getByText("Total Estimated Benefits")).toBeInTheDocument();
      expect(screen.getByText("Eligible Schemes")).toBeInTheDocument();

      // Eligible schemes section heading (Req 4.1).
      expect(
        screen.getByRole("heading", { name: /Schemes You Qualify For/i }),
      ).toBeInTheDocument();
    },
    TEST_TIMEOUT,
  );

  it("surfaces both 'See Your Schemes' and 'Go to Dashboard' on the registered home quick-action card (Req 26)", () => {
    render(
      <RegistrationProvider>
        <RegistrationDriver profile={PROFILE} />
        <RegisterQuickActionCard action={REGISTER_ACTION} />
      </RegistrationProvider>,
    );

    // Unregistered first: neither registered-state affordance is present.
    expect(screen.queryByRole("link", { name: /Go to Dashboard/i })).toBeNull();

    // Register, then both affordances render within the one card.
    fireEvent.click(screen.getByRole("button", { name: "Run registration" }));

    const dashboardLink = screen.getByRole("link", { name: /Go to Dashboard/i });
    expect(dashboardLink).toHaveAttribute("href", "/dashboard/startup");

    const schemesLink = screen.getByRole("link", { name: /See Your Schemes/i });
    expect(schemesLink).toHaveAttribute("href", "/schemes");
  });

  it(
    "renders the public admin dashboard with no registration and no gate (Req 11.1)",
    async () => {
      // No RegistrationProvider, no driver: an unregistered/empty context.
      render(<AdminDashboardPage />);

      // The header strip heading appears immediately — there is no gate.
      expect(
        await screen.findByRole(
          "heading",
          { name: /Government Admin Dashboard/i },
          WAIT_OPTS,
        ),
      ).toBeInTheDocument();

      // And no redirect was triggered (public access, no gate).
      expect(pushMock).not.toHaveBeenCalledWith(
        "/register?redirectFrom=dashboard/startup",
      );
    },
    TEST_TIMEOUT,
  );
});

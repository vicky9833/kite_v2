/* eslint-disable react/display-name -- inline chart-barrel mock stubs need no display name */
/**
 * Admin dashboard component test (task 15.2) — Requirements 11, 12, 13, 14, 17,
 * 18, 19, 20, 21, 22.
 *
 * Renders the composed public `/dashboard/admin` preview page
 * (`AdminDashboardPage`) and asserts the synthetic government-admin surface the
 * design promises:
 *
 *   - Header strip (Req 11): "Government Admin Dashboard" title, the muted
 *     "Preview" badge, the "Karnataka EITBT Department, KITS, KDEM" attribution,
 *     and the fixed "Last updated 14 hours ago" freshness label.
 *   - Notice banner (Req 11.5): the Phase-2 illustrative-data preview copy.
 *   - KPI grid (Req 12): the six fixed headline values (16,234; ₹312 crore; 22;
 *     1,847; ₹19 lakh; 183).
 *   - Below-the-fold sections inside LazySection (Req 13, 14, 17, 18, 19, 20,
 *     21, 22): their headings mount in jsdom because `IntersectionObserver` is
 *     absent, so `LazySection` renders its children immediately.
 *   - Export Blob (Req 21.3): "Download Report Sample" triggers a client-side
 *     Blob download via `URL.createObjectURL` (asserted with a spy).
 *
 * jsdom / lazy notes:
 *  - `next/link` is mocked to a plain anchor and `next/navigation` is stubbed so
 *    the client surfaces render without an App Router provider (same pattern as
 *    the startup-dashboard test).
 *  - `LazySection` renders its children immediately when `IntersectionObserver`
 *    is absent (jsdom), so every below-the-fold section mounts during the test.
 *  - Chart mock: the real chart wrappers (re-exported through the dynamic barrel
 *    `@/components/charts`) pull in Recharts, which is heavy and unstable in
 *    jsdom. We mock the barrel to lightweight stubs so this component test
 *    exercises the page composition without booting Recharts — the chart-bearing
 *    sections only need the charts to be SOME renderable node fed typed data.
 *  - The admin surface is public/synthetic and needs no `RegistrationProvider`;
 *    none of its transitive imports read the registration context.
 */

import * as React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import AdminDashboardPage from "@/app/dashboard/admin/page";

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

// Stub the App Router hooks any client surface might reach for.
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
  usePathname: () => "/dashboard/admin",
}));

// Chart mock — the dynamic barrel re-exports the Recharts-backed wrappers, which
// are heavy/unstable in jsdom. Replace each with a labelled marker node so the
// chart-bearing admin sections render observably without booting Recharts.
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
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Admin dashboard composition (Req 11, 12, 13, 14, 17, 18, 19, 20, 21, 22)", () => {
  it("renders the header strip, preview badge, attribution, and freshness label (Req 11)", async () => {
    render(<AdminDashboardPage />);

    // Title (Req 11.2).
    expect(
      await screen.findByRole("heading", { name: /Government Admin Dashboard/i }),
    ).toBeInTheDocument();
    // Muted "Preview" badge (Req 11.2).
    expect(screen.getByText(/^Preview$/i)).toBeInTheDocument();
    // Attribution row (Req 11.3).
    expect(
      screen.getByText(/Karnataka EITBT Department, KITS, KDEM/i),
    ).toBeInTheDocument();
    // Fixed synthetic freshness indicator (Req 11.4).
    expect(screen.getByText(/Last updated 14 hours ago/i)).toBeInTheDocument();
  });

  it("renders the Phase-2 notice banner copy (Req 11.5)", () => {
    render(<AdminDashboardPage />);

    expect(
      screen.getByText(
        /Real authentication and role-based access opens in Phase 2/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders the six fixed KPI cards (Req 12)", () => {
    render(<AdminDashboardPage />);

    expect(screen.getByText("16,234")).toBeInTheDocument();
    expect(screen.getByText("₹312 crore")).toBeInTheDocument();
    expect(screen.getByText("22")).toBeInTheDocument();
    expect(screen.getByText("1,847")).toBeInTheDocument();
    expect(screen.getByText("₹19 lakh")).toBeInTheDocument();
    expect(screen.getByText("183")).toBeInTheDocument();
  });

  it("renders the below-the-fold sections inside LazySection (Req 13, 14, 17, 18, 19, 20, 21, 22)", async () => {
    render(<AdminDashboardPage />);

    // LazySection renders children eagerly in jsdom (no IntersectionObserver),
    // and each section is code-split via next/dynamic, so we await the headings.
    expect(
      await screen.findByRole("heading", { name: /Ecosystem Funding Over Time/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /Scheme Performance/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /Founder Demographics/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /Flagship Programs/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /International Partnerships/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /Recent Ecosystem Activity/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /Export and Reports/i }),
    ).toBeInTheDocument();
  });

  it("triggers a client-side Blob download from the export sample button (Req 21.3)", async () => {
    // Spy on the Blob-download plumbing. jsdom doesn't implement the object-URL
    // APIs, so we install mock functions directly (spyOn needs an existing
    // property) and assert createObjectURL is called on click.
    const createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = revokeObjectURL as unknown as typeof URL.revokeObjectURL;
    // Prevent jsdom "Not implemented: navigation" noise from the anchor click.
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    render(<AdminDashboardPage />);

    const downloadButton = await screen.findByRole("button", {
      name: /Download Report Sample/i,
    });

    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalledTimes(1);
    });
    // The object URL is built from a Blob and the transient anchor is clicked.
    expect(createObjectURL.mock.calls[0]?.[0]).toBeInstanceOf(Blob);
    expect(anchorClick).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});

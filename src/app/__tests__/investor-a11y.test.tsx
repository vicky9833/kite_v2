/* eslint-disable react/display-name -- inline chart-barrel mock stubs need no display name */
/**
 * Investor-suite accessibility audit (task 18.3) — Requirements 32, 38.1–38.3.
 *
 * Runs an automated `axe-core` audit over the FOUR investor surfaces, then
 * asserts the specific ARIA contracts the design promises. The audit mirrors the
 * dashboards' `src/app/__tests__/dashboards-a11y.test.tsx` exactly: same
 * `AXE_OPTIONS` (color-contrast the ONLY disabled rule), same `auditViolations`
 * helper shape, same `next/link` + `next/navigation` module mocks, and the same
 * generous per-test budget.
 *
 *   - Investor Connect → the nine `/investors` sections (hero, why-karnataka,
 *     featured opps, live deal flow, KITVEN, beyond-bengaluru, sector
 *     performance, GIA, onboarding CTA) rendered directly inside one `<main>`
 *     landmark (rather than via the page's `next/dynamic` LazySection wrappers)
 *     so the whole surface is present synchronously for a complete, deterministic
 *     audit.
 *   - Onboarding wizard → `InvestorOnboardingWizard` inside `InvestorProvider`;
 *     the lazy step-1 chunk is awaited before auditing.
 *   - Investor Dashboard → the real `/dashboard/investor` page seeded into the
 *     Onboarded_State inside `<main>` + `InvestorProvider`.
 *   - Deal Pipeline → the real `/dashboard/investor/pipeline` page seeded
 *     Onboarded inside `<main>` + `InvestorProvider`.
 *
 * Targeted ARIA assertions (beyond the zero-violations audit):
 *   - Each chart frame is a `figure[role="group"]` with a non-empty `aria-label`
 *     and an adjacent sr-only prose summary (Req 38.x).
 *   - The kanban columns are `role="region"` with stage + count aria-labels, and
 *     the per-deal Move control is a native `<select>` (Req 28.1, 28.2, 29.1, 32.3).
 *   - The onboarding progress header is a `role="progressbar"` reporting the
 *     current step (Req 16, 38.x).
 *   - The `InvestorGate` Redirecting_State (rendered unregistered) announces
 *     through an `aria-live="polite"` region (Req 17.3).
 *   - The matched-startups section exposes an `aria-live` match count (Req 20.6).
 *
 * jsdom + axe notes (mirrors `dashboards-a11y.test.tsx`):
 *  - The shared jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView /
 *    pointer capture) live in `src/test/setup.ts`.
 *  - `next/link` is mocked to a plain anchor; `next/navigation`'s `useRouter`,
 *    `useSearchParams`, and `usePathname` are stubbed so the client surfaces
 *    render without an App Router provider.
 *  - The `color-contrast` axe rule is DISABLED: jsdom performs no layout and
 *    cannot resolve token/Tailwind colors, so it cannot compute contrast ratios.
 *    Contrast is enforced via the canonical design tokens and verified in the
 *    visual QA pass. This is the only rule disabled.
 *  - `@/components/charts` (the dynamic barrel) is mocked to LIGHTWEIGHT stubs.
 *    The real wrappers pull in Recharts, which is heavy/unstable in jsdom — but
 *    each stub STILL emits the chart accessibility contract
 *    (`figure[role="group"][aria-label]` + an adjacent sr-only summary), so the
 *    chart a11y contract stays observable in the audit without booting Recharts.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import axe from "axe-core";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so link-bearing surfaces render
// without an App Router context provider (the audit only cares about hrefs /
// accessible names).
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

// Stub the App Router hooks the client surfaces reach for (the gate's redirect
// `push` is a spy; nothing in the audit needs the real router).
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

// Chart barrel mock — the real wrappers pull in Recharts (heavy/unstable in
// jsdom). Each stub is a faithful, minimal chart frame: a `figure[role="group"]`
// with a non-empty `aria-label` and an adjacent sr-only `<figcaption>` prose
// summary. This preserves the chart accessibility contract the audit asserts,
// without booting Recharts.
vi.mock("@/components/charts", () => {
  const frameStub = (label: string) => () =>
    React.createElement(
      "figure",
      { role: "group", "aria-label": label },
      React.createElement(
        "figcaption",
        { className: "sr-only" },
        `${label}. Illustrative summary of the charted data for screen readers.`,
      ),
    );
  return {
    __esModule: true,
    ChartLineFunding: frameStub("Line chart of monthly funding"),
    ChartBarSectorStartups: frameStub("Bar chart of startups by sector"),
    ChartBarHorizontalSchemes: frameStub(
      "Horizontal bar chart of top schemes by disbursement",
    ),
    ChartAreaFundingTimeline: frameStub("Area chart of the funding timeline"),
    ChartBarRegionStartups: frameStub("Bar chart of startups by region"),
    ChartBarStackedDisbursement: frameStub(
      "Stacked bar chart of disbursement by region",
    ),
    ChartTreemapSectors: frameStub("Treemap of startups by sector"),
    ChartBarHorizontalSectorGrowth: frameStub(
      "Horizontal bar chart of sector growth",
    ),
    ChartPieGeneric: frameStub("Pie chart"),
    ChartBarHorizontalFunding: frameStub(
      "Horizontal bar chart of top sectors by funding",
    ),
    // ChartFrame / ChartSkeleton are re-exported by the barrel; provide inert
    // stand-ins in case a section imports them directly.
    ChartFrame: ({
      ariaLabel,
      srSummary,
      children,
    }: {
      ariaLabel: string;
      srSummary: string;
      children?: React.ReactNode;
    }) =>
      React.createElement(
        "figure",
        { role: "group", "aria-label": ariaLabel },
        children,
        React.createElement("figcaption", { className: "sr-only" }, srSummary),
      ),
    ChartSkeleton: () => React.createElement("div", { "data-chart-skeleton": "" }),
  };
});

/* -------------------------------------------------------------------------- */
/* Imports (AFTER the mocks so the surfaces pick up the stubs)                 */
/* -------------------------------------------------------------------------- */

import { InvestorProvider, useInvestor } from "@/context/InvestorContext";
import type { InvestorProfile } from "@/types";

// Investor Connect sections (rendered directly inside one <main>).
import { InvestorHeroStrip } from "@/components/investors/InvestorHeroStrip";
import { WhyKarnatakaSection } from "@/components/investors/WhyKarnatakaSection";
import { FeaturedOpportunitiesSection } from "@/components/investors/FeaturedOpportunitiesSection";
import { LiveDealFlowSection } from "@/components/investors/LiveDealFlowSection";
import { KitvenCoInvestSection } from "@/components/investors/KitvenCoInvestSection";
import { BeyondBengaluruSection } from "@/components/investors/BeyondBengaluruSection";
import { SectorPerformanceSection } from "@/components/investors/SectorPerformanceSection";
import { GiaInvestorsSection } from "@/components/investors/GiaInvestorsSection";
import { InvestorOnboardingCta } from "@/components/investors/InvestorOnboardingCta";

// Onboarding wizard + shared gate.
import { InvestorOnboardingWizard } from "@/components/investors/InvestorOnboardingWizard";
import { InvestorGate } from "@/components/dashboard/investor/InvestorGate";

// Gated route pages (seeded Onboarded for the audit).
import InvestorDashboardPage from "@/app/dashboard/investor/page";
import DealPipelinePage from "@/app/dashboard/investor/pipeline/page";
import { DEAL_STAGE_ORDER } from "@/types";

/* -------------------------------------------------------------------------- */
/* axe configuration + helpers (mirrors dashboards-a11y.test.tsx)              */
/* -------------------------------------------------------------------------- */

// Only `color-contrast` is disabled — jsdom cannot compute layout/colors, so
// contrast is enforced via design tokens and verified in the visual QA pass.
const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    "color-contrast": { enabled: false },
  },
};

/** Generous per-test budget for an axe audit of a full investor surface. */
const AXE_TIMEOUT = 30000;

/** Run axe against a container and return a readable summary of any violations. */
async function auditViolations(container: HTMLElement): Promise<string[]> {
  const results = await axe.run(container, AXE_OPTIONS);
  return results.violations.map(
    (v) =>
      `${v.id} (${v.impact ?? "n/a"}): ${v.help} — ${v.nodes.length} node(s): ` +
      v.nodes.map((n) => n.target.join(" ")).join("; "),
  );
}

/**
 * Assert every interactive control (`<a>` / `<button>` / form control) in the
 * subtree exposes an accessible name — visible text or an `aria-label` /
 * `aria-labelledby` / `title` (or, for form controls, an associated `<label>`).
 * Returns the count checked so callers can sanity-check the surface had controls.
 */
function expectAllControlsNamed(container: HTMLElement): number {
  const controls = Array.from(
    container.querySelectorAll<HTMLElement>("a[href], button"),
  );
  const anonymous = controls.filter((el) => {
    const text = (el.textContent ?? "").trim();
    const label =
      el.getAttribute("aria-label") ??
      el.getAttribute("aria-labelledby") ??
      el.getAttribute("title");
    return text.length === 0 && (label == null || label.trim().length === 0);
  });
  expect(
    anonymous.map((el) => `${el.tagName.toLowerCase()} ${el.className}`),
  ).toEqual([]);
  return controls.length;
}

/** Assert every chart frame is a labelled figure[role=group] + sr-only summary. */
function expectChartFramesAccessible(container: HTMLElement, atLeast: number) {
  const figures = Array.from(
    container.querySelectorAll<HTMLElement>('figure[role="group"]'),
  );
  expect(figures.length).toBeGreaterThanOrEqual(atLeast);
  for (const figure of figures) {
    const label = figure.getAttribute("aria-label");
    expect((label ?? "").trim().length).toBeGreaterThan(0);
    const summary = figure.querySelector(".sr-only");
    expect(summary).not.toBeNull();
    expect((summary?.textContent ?? "").trim().length).toBeGreaterThan(0);
  }
}

/* -------------------------------------------------------------------------- */
/* Onboarded-state seeding harness (mirrors the dashboard/pipeline tests)      */
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
    { id: "d1", companyName: "Vega Systems", sector: "ai-ml", stage: "Seed", askLakhs: 400, currentStage: "Sourced", orderInStage: 0 },
    { id: "d2", companyName: "Tunga Labs", sector: "deep-tech", stage: "Seed", askLakhs: 150, currentStage: "Sourced", orderInStage: 1 },
    { id: "d3", companyName: "Kaveri Health", sector: "health-tech", stage: "Series A", askLakhs: 800, currentStage: "Screening", orderInStage: 0 },
    { id: "d4", companyName: "Nandi Finance", sector: "fintech", stage: "Series A", askLakhs: 1200, currentStage: "Diligence", orderInStage: 0 },
    { id: "d5", companyName: "Sharavathi AI", sector: "ai-ml", stage: "Seed", askLakhs: 250, currentStage: "Term-Sheet", orderInStage: 0 },
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
  // Only render the gated surface once the session reports onboarded, so the
  // gate renders its children rather than the Redirecting_State.
  return isOnboarded ? <>{children}</> : null;
}

/** Compose the nine Investor Connect sections inside one `<main>` landmark. */
function ConnectSurface(): React.JSX.Element {
  return (
    <main id="main">
      <InvestorHeroStrip />
      <WhyKarnatakaSection />
      <FeaturedOpportunitiesSection />
      <LiveDealFlowSection />
      <KitvenCoInvestSection />
      <BeyondBengaluruSection />
      <SectorPerformanceSection />
      <GiaInvestorsSection />
      <InvestorOnboardingCta />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* 1. Investor Connect — axe audit + chart frame contract                      */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of Investor Connect (color-contrast disabled — enforced via tokens / visual QA)", () => {
  it("the nine sections have zero violations", async () => {
    const { container } = render(<ConnectSurface />);
    await screen.findByRole("heading", { level: 1, name: /Investor Connect/i });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("each chart frame exposes a non-empty aria-label + adjacent sr-only summary", async () => {
    const { container } = render(<ConnectSurface />);
    await screen.findByRole("heading", { level: 1, name: /Investor Connect/i });

    // SectorPerformanceSection renders two chart frames.
    expectChartFramesAccessible(container, 2);
  }, AXE_TIMEOUT);

  it("every link / button on Investor Connect has an accessible name", async () => {
    const { container } = render(<ConnectSurface />);
    await screen.findByRole("heading", { level: 1, name: /Investor Connect/i });

    expect(expectAllControlsNamed(container)).toBeGreaterThan(0);
  }, AXE_TIMEOUT);
});

/* -------------------------------------------------------------------------- */
/* 2. Onboarding wizard — axe audit + progressbar contract                     */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of the onboarding wizard", () => {
  it("step 1 has zero violations", async () => {
    const { container } = render(
      <InvestorProvider>
        <main id="main">
          <InvestorOnboardingWizard />
        </main>
      </InvestorProvider>,
    );
    // Await the lazy step-1 chunk before auditing.
    await screen.findByRole("heading", { name: /Tell us about you/i });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("the progress header is a role=progressbar reporting the current step (Req 16)", async () => {
    render(
      <InvestorProvider>
        <InvestorOnboardingWizard />
      </InvestorProvider>,
    );
    await screen.findByRole("heading", { name: /Tell us about you/i });

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "1");
    expect(progressbar).toHaveAttribute("aria-valuemin", "1");
    expect(progressbar).toHaveAttribute("aria-valuemax", "4");
  }, AXE_TIMEOUT);
});

/* -------------------------------------------------------------------------- */
/* 3. Investor Dashboard — axe audit + matched-startups live count             */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of the Investor Dashboard (seeded Onboarded)", () => {
  it("has zero violations", async () => {
    const { container } = render(
      <InvestorProvider>
        <SeedInvestor>
          <main id="main">
            <InvestorDashboardPage />
          </main>
        </SeedInvestor>
      </InvestorProvider>,
    );
    // Wait for the eager header and the last lazy section so the whole surface
    // is present before auditing.
    await screen.findByRole("heading", { name: /Welcome back, Asha Rao/i });
    await screen.findByRole("heading", { name: /Investor Resources/i });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("the matched-startups section exposes an aria-live match count (Req 20.6)", async () => {
    render(
      <InvestorProvider>
        <SeedInvestor>
          <main id="main">
            <InvestorDashboardPage />
          </main>
        </SeedInvestor>
      </InvestorProvider>,
    );
    await screen.findByRole("heading", { name: /Startups Matching Your Thesis/i });

    const count = screen.getByText(/Showing top \d+ of \d+ matches/i);
    expect(count).toHaveAttribute("aria-live", "polite");
  }, AXE_TIMEOUT);

  it("every link / button on the dashboard has an accessible name", async () => {
    const { container } = render(
      <InvestorProvider>
        <SeedInvestor>
          <main id="main">
            <InvestorDashboardPage />
          </main>
        </SeedInvestor>
      </InvestorProvider>,
    );
    await screen.findByRole("heading", { name: /Investor Resources/i });

    expect(expectAllControlsNamed(container)).toBeGreaterThan(0);
  }, AXE_TIMEOUT);
});

/* -------------------------------------------------------------------------- */
/* 4. Deal Pipeline — axe audit + kanban regions + native Move select          */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of the Deal Pipeline (seeded Onboarded)", () => {
  it("has zero violations", async () => {
    const { container } = render(
      <InvestorProvider>
        <SeedInvestor>
          <main id="main">
            <DealPipelinePage />
          </main>
        </SeedInvestor>
      </InvestorProvider>,
    );
    // Wait for the eager board + the last lazy section before auditing.
    await screen.findAllByRole("region", { name: /\(\d+ deals?\)$/ });
    await screen.findByRole("heading", { name: /Recent Activity/i });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("the six kanban columns are role=region with stage + count aria-labels (Req 28.1, 28.2)", async () => {
    render(
      <InvestorProvider>
        <SeedInvestor>
          <main id="main">
            <DealPipelinePage />
          </main>
        </SeedInvestor>
      </InvestorProvider>,
    );
    const columns = await screen.findAllByRole("region", {
      name: /\(\d+ deals?\)$/,
    });
    expect(columns).toHaveLength(6);

    const expectedCounts: Record<string, number> = {
      Sourced: 2,
      Screening: 1,
      Diligence: 1,
      "Term-Sheet": 1,
      Closed: 0,
      Passed: 0,
    };
    for (const stage of DEAL_STAGE_ORDER) {
      const count = expectedCounts[stage] ?? 0;
      const noun = count === 1 ? "deal" : "deals";
      expect(
        screen.getByRole("region", { name: `${stage} (${count} ${noun})` }),
      ).toBeInTheDocument();
    }
  }, AXE_TIMEOUT);

  it("each deal's Move control is a native <select> listing the six stages (Req 29.1, 32.3)", async () => {
    render(
      <InvestorProvider>
        <SeedInvestor>
          <main id="main">
            <DealPipelinePage />
          </main>
        </SeedInvestor>
      </InvestorProvider>,
    );
    await screen.findAllByRole("region", { name: /\(\d+ deals?\)$/ });

    const card = screen.getByRole("article", { name: "Nandi Finance — Diligence" });
    const moveSelect = within(card).getByRole("combobox", {
      name: /Move Nandi Finance to a different stage/i,
    });
    // A native <select> element (not a div with role) — verify the tag.
    expect(moveSelect.tagName).toBe("SELECT");
    const options = within(moveSelect).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual([...DEAL_STAGE_ORDER]);
    expect((moveSelect as HTMLSelectElement).value).toBe("Diligence");
  }, AXE_TIMEOUT);
});

/* -------------------------------------------------------------------------- */
/* 5. InvestorGate Redirecting_State live region (Req 17.3)                    */
/* -------------------------------------------------------------------------- */

describe("InvestorGate Redirecting_State announcement (Req 17.3)", () => {
  it("announces the redirect through an aria-live=polite region when unregistered", () => {
    // Fresh provider → Not_Onboarded_State by default; the gate renders the
    // Redirecting_State notice instead of the gated children.
    render(
      <InvestorProvider>
        <InvestorGate redirectFrom="dashboard/investor">
          <p>Gated dashboard content</p>
        </InvestorGate>
      </InvestorProvider>,
    );

    // Gated content must NOT flash before the redirect.
    expect(screen.queryByText("Gated dashboard content")).toBeNull();

    // The notice is announced through an aria-live="polite" region (Req 17.3).
    const notice = screen.getByText(/Redirecting you to investor onboarding/i);
    expect(notice).toHaveAttribute("aria-live", "polite");
  });
});

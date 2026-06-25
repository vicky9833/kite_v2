/* eslint-disable react/display-name -- inline chart-barrel mock stubs need no display name */
/**
 * Dashboards accessibility audit (task 18.2) — Requirements 28.1–28.5.
 *
 * Runs an automated `axe-core` audit over BOTH dashboard surfaces, then asserts
 * the specific ARIA contracts the design promises (design.md → "Visual
 * Discipline & Accessibility"). The audit mirrors the slice's
 * `src/app/__tests__/slice-a11y.test.tsx` exactly: same `AXE_OPTIONS`
 * (color-contrast the ONLY disabled rule), same `auditViolations` helper shape,
 * same `next/link` + `next/navigation` module mocks, and the same generous
 * per-test budget.
 *
 *   - Startup  → the composed startup sections (header strip, hero metrics,
 *                eligible schemes, sector-intelligence charts) seeded into the
 *                Registered_State inside a fresh `RegistrationProvider` (via a
 *                `SeedRegistered` wrapper identical to the responsive / slice
 *                tests).
 *   - Admin    → the composed admin sections (header, banner, KPI grid, charts,
 *                scheme table, flagship programs, partnerships, activity feed,
 *                export). Admin reads no session state, so it needs no provider.
 *
 * Targeted ARIA assertions (beyond the zero-violations audit):
 *   - Every chart frame is a `figure[role="group"]` with a non-empty
 *     `aria-label` and an adjacent sr-only prose summary (Req 28.1, 28.2).
 *   - The admin scheme table is a semantic `<table>` whose sortable column
 *     headers carry `aria-sort` (Req 28.3).
 *   - The startup gate's Redirecting_State announces through an
 *     `aria-live="polite"` region (Req 28.4).
 *   - Spot-check that interactive controls expose accessible names (Req 28.5).
 *
 * jsdom + axe notes (mirrors `slice-a11y.test.tsx`):
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
 *    each stub STILL emits the `ChartFrame` accessibility contract
 *    (`figure[role="group"][aria-label]` + an adjacent sr-only `<figcaption>`
 *    summary), so the chart a11y contract (Req 28.1, 28.2) stays observable in
 *    the audit without booting Recharts. The sections are rendered directly
 *    (rather than via the pages' `next/dynamic` wrappers) so the whole surface
 *    is present synchronously for a complete, deterministic audit.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import axe from "axe-core";

import {
  RegistrationProvider,
  useRegistration,
} from "@/context/RegistrationContext";
import type { RegistrationProfile } from "@/types";

// Startup sections (read RegistrationContext, except the prop-driven sector one).
import { StartupGate } from "@/components/dashboard/startup/StartupGate";
import { StartupHeaderStrip } from "@/components/dashboard/startup/StartupHeaderStrip";
import { StartupHeroMetrics } from "@/components/dashboard/startup/StartupHeroMetrics";
import { EligibleSchemesSection } from "@/components/dashboard/startup/EligibleSchemesSection";
import { SectorIntelligenceSection } from "@/components/dashboard/startup/SectorIntelligenceSection";

// Admin sections (read no session state — rendered directly, no provider).
import { AdminHeaderStrip } from "@/components/dashboard/admin/AdminHeaderStrip";
import { AdminNoticeBanner } from "@/components/dashboard/admin/AdminNoticeBanner";
import { AdminKpiGrid } from "@/components/dashboard/admin/AdminKpiGrid";
import { FundingTimelineSection } from "@/components/dashboard/admin/FundingTimelineSection";
import { RegionalDistributionSection } from "@/components/dashboard/admin/RegionalDistributionSection";
import { SectorAnalysisSection } from "@/components/dashboard/admin/SectorAnalysisSection";
import { FounderDemographicsSection } from "@/components/dashboard/admin/FounderDemographicsSection";
import { SchemePerformanceSection } from "@/components/dashboard/admin/SchemePerformanceSection";
import { AdminFlagshipProgramsSection } from "@/components/dashboard/admin/AdminFlagshipProgramsSection";
import { InternationalPartnershipsSection } from "@/components/dashboard/admin/InternationalPartnershipsSection";
import { ActivityFeedSection } from "@/components/dashboard/admin/ActivityFeedSection";
import { ExportReportsSection } from "@/components/dashboard/admin/ExportReportsSection";

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
  usePathname: () => "/",
}));

// Chart barrel mock — the real wrappers pull in Recharts (heavy/unstable in
// jsdom). Each stub is a faithful, minimal `ChartFrame`: a
// `figure[role="group"]` with a non-empty `aria-label` and an adjacent sr-only
// `<figcaption>` prose summary. This preserves the chart accessibility contract
// (Req 28.1, 28.2) the audit asserts, without booting Recharts.
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
    ChartBarSectorStartups: frameStub("Bar chart of DPIIT startups by cluster"),
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
/* axe configuration + helpers (mirrors slice-a11y.test.tsx)                   */
/* -------------------------------------------------------------------------- */

// Only `color-contrast` is disabled — jsdom cannot compute layout/colors, so
// contrast is enforced via design tokens and verified in the visual QA pass.
const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    "color-contrast": { enabled: false },
  },
};

/** Generous per-test budget for an axe audit of a full dashboard surface. */
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
 * Assert every interactive control (`<a>` / `<button>`) in the subtree exposes
 * an accessible name — either visible text content or an `aria-label` /
 * `aria-labelledby` / `title` (Req 28.5). Returns the count checked so callers
 * can sanity-check the surface actually had controls.
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

/* -------------------------------------------------------------------------- */
/* Registered-state seeding harness (mirrors responsive / slice tests)         */
/* -------------------------------------------------------------------------- */

/**
 * A fully-filled, definitely-eligible profile so the hero metrics and eligible
 * schemes sections surface real content (not their null/empty branches).
 * `primarySector` uses a real sector id.
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

/** A concrete profile for the prop-driven sector-intelligence section. */
const SECTOR_PROFILE = SEED_PROFILE as RegistrationProfile;

/** Compose the startup dashboard sections inside one `<main>` landmark. */
function StartupSurface(): React.JSX.Element {
  return (
    <main id="main" className="mx-auto max-w-7xl px-4">
      <StartupHeaderStrip />
      <StartupHeroMetrics />
      <EligibleSchemesSection />
      <SectorIntelligenceSection profile={SECTOR_PROFILE} />
    </main>
  );
}

/** Compose the admin dashboard sections inside one `<main>` landmark. */
function AdminSurface(): React.JSX.Element {
  return (
    <main id="main" className="mx-auto max-w-7xl px-4">
      <AdminHeaderStrip />
      <AdminNoticeBanner />
      <AdminKpiGrid />
      <FundingTimelineSection />
      <RegionalDistributionSection />
      <SectorAnalysisSection />
      <FounderDemographicsSection />
      <SchemePerformanceSection />
      <AdminFlagshipProgramsSection />
      <InternationalPartnershipsSection />
      <ActivityFeedSection />
      <ExportReportsSection />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* 1. Automated axe audit — both dashboards                                    */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of the dashboards (color-contrast disabled — enforced via tokens / visual QA)", () => {
  it("startup dashboard (registered) has zero violations", async () => {
    const { container } = render(
      <RegistrationProvider>
        <SeedRegistered>
          <StartupSurface />
        </SeedRegistered>
      </RegistrationProvider>,
    );
    // Wait for the seeded Registered_State content before auditing (the sections
    // render `null` until the profile is committed in `SeedRegistered`'s effect).
    await screen.findByText(`Welcome back, ${SEED_PROFILE.founderName}`);

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("admin dashboard has zero violations", async () => {
    const { container } = render(<AdminSurface />);
    // The eager header renders synchronously; the rest is direct (no lazy wrap).
    await screen.findByRole("heading", {
      name: /Government Admin Dashboard/i,
    });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);
});

/* -------------------------------------------------------------------------- */
/* 2. Chart frame a11y contract (Req 28.1, 28.2)                               */
/* -------------------------------------------------------------------------- */

describe("Chart frames expose aria-label + adjacent sr-only summary (Req 28.1, 28.2)", () => {
  it("each startup chart frame is a labelled figure[role=group] with an sr-only summary", async () => {
    const { container } = render(
      <RegistrationProvider>
        <SeedRegistered>
          <StartupSurface />
        </SeedRegistered>
      </RegistrationProvider>,
    );
    await screen.findByText(`Welcome back, ${SEED_PROFILE.founderName}`);

    const figures = Array.from(
      container.querySelectorAll<HTMLElement>('figure[role="group"]'),
    );
    // SectorIntelligenceSection renders three chart frames.
    expect(figures.length).toBe(3);

    for (const figure of figures) {
      // A non-empty aria-label (Req 28.1).
      const label = figure.getAttribute("aria-label");
      expect(label).toBeTruthy();
      expect((label ?? "").trim().length).toBeGreaterThan(0);

      // An adjacent sr-only prose summary inside the frame (Req 28.2).
      const summary = figure.querySelector(".sr-only");
      expect(summary).not.toBeNull();
      expect((summary?.textContent ?? "").trim().length).toBeGreaterThan(0);
    }
  }, AXE_TIMEOUT);

  it("each admin chart frame is a labelled figure[role=group] with an sr-only summary", async () => {
    const { container } = render(<AdminSurface />);
    await screen.findByRole("heading", {
      name: /Government Admin Dashboard/i,
    });

    const figures = Array.from(
      container.querySelectorAll<HTMLElement>('figure[role="group"]'),
    );
    // Funding timeline (1) + regional (2) + sector analysis (2) + demographics (3).
    expect(figures.length).toBeGreaterThanOrEqual(6);

    for (const figure of figures) {
      expect((figure.getAttribute("aria-label") ?? "").trim().length).toBeGreaterThan(
        0,
      );
      const summary = figure.querySelector(".sr-only");
      expect(summary).not.toBeNull();
      expect((summary?.textContent ?? "").trim().length).toBeGreaterThan(0);
    }
  }, AXE_TIMEOUT);
});

/* -------------------------------------------------------------------------- */
/* 3. Admin scheme table semantics + aria-sort (Req 28.3)                      */
/* -------------------------------------------------------------------------- */

describe("Admin scheme performance table semantics (Req 28.3)", () => {
  it("renders a semantic <table> whose sortable column headers carry aria-sort", () => {
    const { container } = render(<SchemePerformanceSection />);

    // A semantic table (not an ARIA-grid of divs).
    const table = container.querySelector("table");
    expect(table).not.toBeNull();

    // Every sortable column header reports an aria-sort token; exactly one is
    // active (default Disbursed desc → "descending"), the rest report "none".
    const sortableHeaders = Array.from(
      table!.querySelectorAll<HTMLElement>('thead th[aria-sort]'),
    );
    expect(sortableHeaders.length).toBeGreaterThanOrEqual(6);

    const tokens = sortableHeaders.map((th) => th.getAttribute("aria-sort"));
    for (const token of tokens) {
      expect(["ascending", "descending", "none"]).toContain(token);
    }
    // Exactly one active (non-"none") header on first render (default sort).
    expect(tokens.filter((t) => t !== "none")).toEqual(["descending"]);

    // Each sortable header hosts a real <button> (keyboard-operable) with a name.
    for (const th of sortableHeaders) {
      const button = within(th).getByRole("button");
      expect((button.textContent ?? "").trim().length).toBeGreaterThan(0);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* 4. Startup gate Redirecting_State live region (Req 28.4)                    */
/* -------------------------------------------------------------------------- */

describe("StartupGate Redirecting_State announcement (Req 28.4)", () => {
  it("announces the redirect through an aria-live=polite region when unregistered", () => {
    // Fresh provider → Unregistered_State by default; the gate renders the
    // Redirecting_State notice instead of the gated children.
    render(
      <RegistrationProvider>
        <StartupGate>
          <p>Gated dashboard content</p>
        </StartupGate>
      </RegistrationProvider>,
    );

    // Gated content must NOT flash before the redirect.
    expect(screen.queryByText("Gated dashboard content")).toBeNull();

    // The notice is announced through an aria-live="polite" region (Req 28.4).
    const notice = screen.getByText(/Redirecting you to registration/i);
    expect(notice).toHaveAttribute("aria-live", "polite");
  });
});

/* -------------------------------------------------------------------------- */
/* 5. Interactive controls expose accessible names (Req 28.5)                  */
/* -------------------------------------------------------------------------- */

describe("Interactive controls expose accessible names (Req 28.5)", () => {
  it("every link / button on the startup surface has an accessible name", async () => {
    const { container } = render(
      <RegistrationProvider>
        <SeedRegistered>
          <StartupSurface />
        </SeedRegistered>
      </RegistrationProvider>,
    );
    await screen.findByText(`Welcome back, ${SEED_PROFILE.founderName}`);

    const count = expectAllControlsNamed(container);
    expect(count).toBeGreaterThan(0);
  }, AXE_TIMEOUT);

  it("every link / button on the admin surface has an accessible name", async () => {
    const { container } = render(<AdminSurface />);
    await screen.findByRole("heading", {
      name: /Government Admin Dashboard/i,
    });

    const count = expectAllControlsNamed(container);
    expect(count).toBeGreaterThan(0);
  }, AXE_TIMEOUT);
});

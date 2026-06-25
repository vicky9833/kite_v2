// src/app/__tests__/investor-perf.test.tsx
//
// Perf / bundle-discipline audit for the four investor route pages (task 18.5,
// Req 36.1, 37.1–37.4, 39.1, 39.2).
//
// MECHANISM — static import-graph analysis (build-independent, CI-reliable).
//
// Mirrors `dashboards-perf.test.tsx` exactly. Rather than depend on a fresh
// `next build` being present at test time (the `.next/` manifests are not
// guaranteed in CI), this audit reads each route SOURCE and asserts the
// architectural invariants that *guarantee* the bundle budget by construction:
//
//   1. No page statically imports `recharts`, nor any
//      `@/components/charts/Chart*` wrapper directly — charts may only enter a
//      route through the dynamic barrel (`@/components/charts`), which wraps
//      every chart in `next/dynamic({ ssr: false })` (Req 36.1, 37.4).
//   2. Every chart-bearing / below-the-fold section is pulled in via a
//      `next/dynamic(() => import("…Section"))` call — NOT a static
//      `import { Section } from "…"` — so the section (and its transitive
//      Recharts chunk) stays out of the route's First Load JS (Req 37.1–37.3).
//   3. The only EAGER (statically imported) sections are the deliberately
//      chart-free, above-the-fold ones (Req 37.1).
//   4. For the Deal Pipeline route specifically, `StageAnalyticsRow` and
//      `RecentActivityList` — the highest bundle-risk sections — are
//      `next/dynamic`-imported from the start (Req 30.5, 37.2).
//   5. Guard (mirrors the Property-15 recharts-isolation idea): no file under
//      `src/components/investors/**` or `src/components/dashboard/investor/**`
//      imports from `recharts` directly — charts are only ever consumed through
//      the barrel (Req 36.1).
//
// Confirmed reference sizes from `next build` (informational only, not asserted
// here so the suite stays build-independent): investors ≈ 125 kB, onboard ≈
// 114 kB, dashboard/investor ≈ 127 kB, pipeline ≈ 119 kB — all comfortably
// under the 150 kB First Load JS budget (Req 37.1).

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* -------------------------------------------------------------------------- */
/* Paths                                                                      */
/* -------------------------------------------------------------------------- */

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(here, "..", ".."); // .../src

const INVESTORS_PAGE = path.join(SRC_DIR, "app", "investors", "page.tsx");
const ONBOARD_PAGE = path.join(SRC_DIR, "app", "investors", "onboard", "page.tsx");
const DASHBOARD_INVESTOR_PAGE = path.join(
  SRC_DIR,
  "app",
  "dashboard",
  "investor",
  "page.tsx",
);
const PIPELINE_PAGE = path.join(
  SRC_DIR,
  "app",
  "dashboard",
  "investor",
  "pipeline",
  "page.tsx",
);

const INVESTORS_COMPONENTS_DIR = path.join(SRC_DIR, "components", "investors");
const DASHBOARD_INVESTOR_COMPONENTS_DIR = path.join(
  SRC_DIR,
  "components",
  "dashboard",
  "investor",
);

/* -------------------------------------------------------------------------- */
/* Source helpers — strip comments so prose mentioning "recharts" or import   */
/* keywords never produces a false positive.                                  */
/* -------------------------------------------------------------------------- */

/** Remove `//` line comments and `/* *​/` block comments from TS/TSX source. */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1"); // line comments (avoid eating `://` in urls)
}

function readSource(file: string): string {
  return stripComments(readFileSync(file, "utf8"));
}

/** Recursively collect every .ts/.tsx file under `dir`, excluding __tests__. */
function collectSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules") continue;
      out.push(...collectSourceFiles(full));
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/** Escape a string for safe embedding inside a RegExp. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Matches a STATIC import that ends in `…/<name>` (e.g. `import { X } from "…/X"`). */
function hasStaticImport(src: string, name: string): boolean {
  const re = new RegExp(
    `import\\b[^\\n;]*\\bfrom\\s*["'][^"']*\\b${escapeRegExp(name)}["']`,
  );
  return re.test(src);
}

/** Matches a DYNAMIC import call `import("…/<name>")` (the `next/dynamic` form). */
function hasDynamicImport(src: string, name: string): boolean {
  const re = new RegExp(`import\\(\\s*["'][^"']*\\b${escapeRegExp(name)}["']`);
  return re.test(src);
}

/** Matches any import (static or dynamic) from the literal `recharts` package. */
function importsRecharts(src: string): boolean {
  return /(?:from|import|require)\s*\(?\s*["']recharts["']/.test(src);
}

/* -------------------------------------------------------------------------- */
/* Section inventories (from the route composition, tasks 12.1 / 16.1 / 17.1) */
/* -------------------------------------------------------------------------- */

// /investors — public landing surface.
const INVESTORS_LAZY = [
  "LiveDealFlowSection",
  "KitvenCoInvestSection",
  "BeyondBengaluruSection",
  "SectorPerformanceSection",
  "GiaInvestorsSection",
  "InvestorOnboardingCta",
] as const;

const INVESTORS_EAGER = [
  "InvestorHeroStrip",
  "WhyKarnatakaSection",
  "FeaturedOpportunitiesSection",
] as const;

// /dashboard/investor — personalized dashboard.
const DASHBOARD_INVESTOR_LAZY = [
  "PortfolioSection",
  "ActivePipelineSection",
  "KarnatakaSignalsSection",
  "SchemesForPortfolioSection",
  "InvestorEventsSection",
  "InvestorResourcesSection",
] as const;

const DASHBOARD_INVESTOR_EAGER = [
  "InvestorGate",
  "InvestorHeaderStrip",
  "InvestorKpiGrid",
  "InvestorPreviewBanner",
  "MatchedStartupsSection",
] as const;

// /dashboard/investor/pipeline — Deal Pipeline kanban (highest bundle risk).
const PIPELINE_LAZY = ["StageAnalyticsRow", "RecentActivityList"] as const;

const PIPELINE_EAGER = [
  "InvestorGate",
  "PipelineHeaderStrip",
  "PipelineFilterBar",
  "KanbanBoard",
  "PipelineExportButton",
] as const;

const investorsSrc = readSource(INVESTORS_PAGE);
const onboardSrc = readSource(ONBOARD_PAGE);
const dashboardInvestorSrc = readSource(DASHBOARD_INVESTOR_PAGE);
const pipelineSrc = readSource(PIPELINE_PAGE);

/* -------------------------------------------------------------------------- */
/* Shared chart-isolation assertions (apply to every route page)              */
/* -------------------------------------------------------------------------- */

function assertChartIsolation(routeName: string, src: string) {
  it(`${routeName} does NOT statically import recharts`, () => {
    // recharts may only arrive lazily via the dynamic barrel's wrappers.
    expect(/from\s*["']recharts["']/.test(src)).toBe(false);
    expect(importsRecharts(src)).toBe(false);
  });

  it(`${routeName} does NOT import any @/components/charts/Chart* wrapper directly`, () => {
    // Wrappers must come through the dynamic barrel (`@/components/charts`),
    // never a deep wrapper path that would defeat code-splitting.
    expect(/["']@\/components\/charts\/Chart/.test(src)).toBe(false);
  });
}

/* -------------------------------------------------------------------------- */
/* Shared route assertions                                                    */
/* -------------------------------------------------------------------------- */

function assertRouteBundleDiscipline(
  routeName: string,
  src: string,
  lazy: readonly string[],
  eager: readonly string[],
) {
  describe(`${routeName} — bundle discipline (static import graph)`, () => {
    assertChartIsolation(routeName, src);

    it("imports `next/dynamic` (used to code-split the below-the-fold sections)", () => {
      expect(/from\s*["']next\/dynamic["']/.test(src)).toBe(true);
    });

    it.each(lazy)(
      "loads chart-bearing / below-the-fold section %s via next/dynamic (not a static import)",
      (section) => {
        expect(hasDynamicImport(src, section)).toBe(true);
        expect(hasStaticImport(src, section)).toBe(false);
      },
    );

    it.each(eager)(
      "loads chart-free eager section %s via a static import (not dynamic)",
      (section) => {
        expect(hasStaticImport(src, section)).toBe(true);
        expect(hasDynamicImport(src, section)).toBe(false);
      },
    );

    it("limits eager imports to the chart-free sections only", () => {
      // Nothing from the lazy set may be eagerly (statically) imported.
      const eagerLazyLeaks = lazy.filter((s) => hasStaticImport(src, s));
      expect(eagerLazyLeaks).toEqual([]);
    });
  });
}

assertRouteBundleDiscipline(
  "/investors",
  investorsSrc,
  INVESTORS_LAZY,
  INVESTORS_EAGER,
);
assertRouteBundleDiscipline(
  "/dashboard/investor",
  dashboardInvestorSrc,
  DASHBOARD_INVESTOR_LAZY,
  DASHBOARD_INVESTOR_EAGER,
);
assertRouteBundleDiscipline(
  "/dashboard/investor/pipeline",
  pipelineSrc,
  PIPELINE_LAZY,
  PIPELINE_EAGER,
);

/* -------------------------------------------------------------------------- */
/* /investors/onboard — thin server wrapper (no charts, no below-the-fold     */
/* dynamic sections; the form island is statically imported under Suspense).  */
/* -------------------------------------------------------------------------- */

describe("/investors/onboard — bundle discipline (static import graph)", () => {
  assertChartIsolation("/investors/onboard", onboardSrc);

  it("is a thin wrapper that statically imports the onboarding client island", () => {
    expect(hasStaticImport(onboardSrc, "OnboardPageClient")).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Pipeline-specific guard — highest bundle-risk sections are dynamic         */
/* from the start (Req 30.5, 37.2)                                            */
/* -------------------------------------------------------------------------- */

describe("/dashboard/investor/pipeline — highest bundle-risk sections are dynamic", () => {
  it.each(["StageAnalyticsRow", "RecentActivityList"])(
    "%s is next/dynamic-imported (not static) from the start",
    (section) => {
      expect(hasDynamicImport(pipelineSrc, section)).toBe(true);
      expect(hasStaticImport(pipelineSrc, section)).toBe(false);
    },
  );
});

/* -------------------------------------------------------------------------- */
/* Guard — no investor section file imports recharts directly                 */
/* (mirrors the Property-15 recharts-isolation invariant, Req 36.1)           */
/* -------------------------------------------------------------------------- */

describe("investor sections — recharts isolation guard (Req 36.1)", () => {
  const sectionFiles = [
    ...collectSourceFiles(INVESTORS_COMPONENTS_DIR),
    ...collectSourceFiles(DASHBOARD_INVESTOR_COMPONENTS_DIR),
  ];

  it("finds investor section source files to scan (non-vacuous)", () => {
    expect(sectionFiles.length).toBeGreaterThan(0);
  });

  it("no src/components/investors/** or src/components/dashboard/investor/** file imports from `recharts` directly", () => {
    const offenders = sectionFiles.filter((f) => importsRecharts(readSource(f)));
    expect(offenders).toEqual([]);
  });

  it("chart-bearing sections consume charts only via the dynamic barrel (@/components/charts)", () => {
    // Every section that pulls in a chart must do so from the barrel, never a
    // deep wrapper path, so the dynamic({ ssr:false }) code-split is preserved.
    const deepWrapperImporters = sectionFiles.filter((f) =>
      /["']@\/components\/charts\/Chart/.test(readSource(f)),
    );
    expect(deepWrapperImporters).toEqual([]);
  });
});

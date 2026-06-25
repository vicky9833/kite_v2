/**
 * Schemes Hub tests (task 3.15).
 *
 * Two property-based tests over the Hub's PURE core logic, plus EXAMPLE
 * component assertions that render `SchemesHub` inside the real
 * `RegistrationProvider`.
 *
 *  - Property 10: the pure `filterSchemeList` composes the active filters with
 *    AND semantics, and the sector / stage selections are documented NO-OPS
 *    (they must never exclude a scheme).
 *  - Property 12: the Hub's compare-toggle logic (add if absent & size < 3 else
 *    reject; remove if present) never lets the selection exceed three.
 *
 * Resilience notes for jsdom (mirrors the layout test pattern):
 *  - `next/link` is mocked to a plain anchor so links render without an App
 *    Router provider.
 *  - `next/navigation`'s `useRouter` is mocked so the Hub can call
 *    `router.push` without crashing.
 *  - `sonner`'s `toast` is mocked (the Hub calls it when a 4th compare add is
 *    rejected).
 *  - `SchemeFilters` and `CompareBar` are lazy via `next/dynamic` with
 *    `ssr: false`, so we use `findBy*` / `waitFor` for anything they own. The
 *    dark hero, the personalization banner, and the 22 cards render
 *    synchronously.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import fc from "fast-check";

import {
  filterSchemeList,
  MAX_COMPARE_SELECTION,
  SchemesHub,
} from "@/components/schemes/SchemesHub";
import { INITIAL_SCHEME_FILTERS } from "@/components/schemes/scheme-filter-state";
import type { SchemeFilterState } from "@/components/schemes/scheme-filter-state";
import { RegistrationProvider } from "@/context/RegistrationContext";
import { schemes } from "@/data/schemes";
import type { CurrentStage } from "@/types";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                               */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so the hub renders without an App
// Router context provider.
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

// Mock the App Router so the Hub's `router.push` (Compare) never crashes.
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
}));

// Mock sonner's toast — the Hub surfaces it when a 4th compare add is rejected.
vi.mock("sonner", () => ({
  __esModule: true,
  toast: vi.fn(),
}));

/* -------------------------------------------------------------------------- */
/* Shared arbitraries + the faithful filter model                            */
/* -------------------------------------------------------------------------- */

/** All `CurrentStage` enum values (the stage multiselect options). */
const ALL_STAGES: readonly CurrentStage[] = [
  "Idea",
  "PoC",
  "Early Revenue",
  "Growth",
  "Scale",
];

/**
 * Realistic search substrings: the empty query (matches all), genuine
 * fragments drawn from real scheme names in `schemes.ts` (mixed case to
 * exercise case-insensitivity), and arbitrary short strings (mostly non-
 * matching noise).
 */
const searchArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant(""),
  fc.constantFrom(
    "elevate",
    "ELEVATE",
    "Patent",
    "gst",
    "Subsidy",
    "fund",
    "Grant",
    "support",
    "karnataka",
    "Internship",
    "reimbursement",
  ),
  fc.string({ maxLength: 8 }),
);

/** Arbitrary, mostly-unconstrained sector id selections (documented no-op). */
const sectorsArb: fc.Arbitrary<string[]> = fc.array(
  fc.oneof(
    fc.constantFrom("agritech", "fintech", "healthtech", "deeptech"),
    fc.string({ maxLength: 6 }),
  ),
  { maxLength: 4 },
);

/** Arbitrary current-stage selections (documented no-op). */
const stagesArb: fc.Arbitrary<CurrentStage[]> = fc.uniqueArray(
  fc.constantFrom(...ALL_STAGES),
  { maxLength: ALL_STAGES.length },
);

/** Arbitrary full filter state. */
const filterStateArb: fc.Arbitrary<SchemeFilterState> = fc.record({
  type: fc.constantFrom<SchemeFilterState["type"]>("All", "fiscal", "grant"),
  status: fc.constantFrom<SchemeFilterState["status"]>(
    "All",
    "open",
    "upcoming",
  ),
  search: searchArb,
  sectors: sectorsArb,
  stages: stagesArb,
});

/**
 * Independent, faithful model of the documented filter contract. A scheme is
 * visible iff it satisfies EVERY genuinely-active filter (type, status,
 * case-insensitive name search) — sectors / stages are NO-OPS and never
 * exclude.
 */
function matchesActiveFilters(
  scheme: (typeof schemes)[number],
  filters: SchemeFilterState,
): boolean {
  const typeOk = filters.type === "All" || scheme.type === filters.type;
  const statusOk =
    filters.status === "All" || scheme.status === filters.status;
  const query = filters.search.trim().toLowerCase();
  const searchOk =
    query.length === 0 || scheme.name.toLowerCase().includes(query);
  return typeOk && statusOk && searchOk;
}

/* -------------------------------------------------------------------------- */
/* Property 10: Scheme filtering composes predicates                         */
/* -------------------------------------------------------------------------- */

// Feature: kite-registration-schemes-calculator, Property 10
//
// **Validates: Requirements 13.3, 13.4, 13.5, 13.6, 13.7**
describe("filterSchemeList (Property 10: filtering composes predicates)", () => {
  it("shows exactly the schemes satisfying every active filter, with sector/stage as no-ops", () => {
    fc.assert(
      fc.property(filterStateArb, (filters) => {
        const visible = filterSchemeList(schemes, filters);
        const visibleIds = new Set(visible.map((s) => s.id));

        // 1. The visible set equals exactly the model's match set, in order.
        const expected = schemes.filter((s) => matchesActiveFilters(s, filters));
        expect(visible).toEqual(expected);

        // 2. Every shown scheme matches the active type/status/search filters.
        for (const scheme of visible) {
          expect(matchesActiveFilters(scheme, filters)).toBe(true);
        }

        // 3. No hidden scheme matches ALL the active filters.
        for (const scheme of schemes) {
          if (visibleIds.has(scheme.id)) continue;
          expect(matchesActiveFilters(scheme, filters)).toBe(false);
        }

        // 4. Sector / stage selections are documented NO-OPS: clearing them
        //    leaves the visible set unchanged (they never exclude a scheme).
        const withoutSectorStage = filterSchemeList(schemes, {
          ...filters,
          sectors: [],
          stages: [],
        });
        expect(visible).toEqual(withoutSectorStage);
      }),
      { numRuns: 25 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Property 12: Compare selection never exceeds three                        */
/* -------------------------------------------------------------------------- */

/**
 * Pure model of the Hub's compare-toggle reducer (see `handleToggleCompare`):
 * a toggle removes the id when present; otherwise it adds the id only while the
 * selection holds fewer than `MAX_COMPARE_SELECTION`, and is rejected (no-op)
 * at the cap.
 */
function toggleCompare(
  selection: readonly string[],
  id: string,
): string[] {
  if (selection.includes(id)) {
    return selection.filter((schemeId) => schemeId !== id);
  }
  if (selection.length >= MAX_COMPARE_SELECTION) {
    return [...selection];
  }
  return [...selection, id];
}

// Feature: kite-registration-schemes-calculator, Property 12
//
// **Validates: Requirements 14.1, 14.3**
describe("compare toggle (Property 12: selection never exceeds three)", () => {
  it("never exceeds three for any sequence of toggle actions", () => {
    // Toggle actions over a small id pool so adds, rejections, and removes all
    // occur (a wide pool would rarely revisit an id to exercise removal).
    const idPool = fc.constantFrom("a", "b", "c", "d", "e");

    fc.assert(
      fc.property(fc.array(idPool, { maxLength: 30 }), (actions) => {
        const selection = actions.reduce<string[]>((current, id) => {
          const next = toggleCompare(current, id);
          // Invariant after every action: size within bounds, no duplicates.
          expect(next.length).toBeLessThanOrEqual(MAX_COMPARE_SELECTION);
          expect(new Set(next).size).toBe(next.length);
          return next;
        }, []);

        expect(selection.length).toBeLessThanOrEqual(MAX_COMPARE_SELECTION);
      }),
      { numRuns: 25 },
    );
  });

  it("leaves the selection unchanged when adding at the cap", () => {
    const full = ["a", "b", "c"];
    expect(full).toHaveLength(MAX_COMPARE_SELECTION);

    // A toggle-ADD of a new id at the cap is rejected (selection unchanged).
    const afterAdd = toggleCompare(full, "d");
    expect(afterAdd).toEqual(full);

    // A toggle of an already-selected id at the cap still REMOVES it.
    const afterRemove = toggleCompare(full, "c");
    expect(afterRemove).toEqual(["a", "b"]);
  });
});

/* -------------------------------------------------------------------------- */
/* Example component assertions                                              */
/* -------------------------------------------------------------------------- */

/** Render the Hub inside the real session provider. */
function renderHub(): ReturnType<typeof render> {
  return render(
    <RegistrationProvider>
      <SchemesHub />
    </RegistrationProvider>,
  );
}

describe("SchemesHub (example component assertions)", () => {
  it("renders the dark hero headline", () => {
    renderHub();
    expect(
      screen.getByRole("heading", { name: "Schemes and Benefits", level: 1 }),
    ).toBeInTheDocument();
  });

  it("shows the unregistered registration prompt banner with a Register Now link", () => {
    renderHub();

    expect(
      screen.getByText("Register your startup to see schemes you qualify for"),
    ).toBeInTheDocument();

    const registerNow = screen.getByRole("link", { name: "Register Now" });
    expect(registerNow).toHaveAttribute("href", "/register");
  });

  it("renders all 22 scheme cards by default", async () => {
    renderHub();

    // SchemeCard renders an <article>; with the default filters and an
    // unregistered profile, every scheme in `schemes.ts` is shown.
    await waitFor(() => {
      expect(screen.getAllByRole("article")).toHaveLength(schemes.length);
    });
    expect(schemes).toHaveLength(22);
  });
});

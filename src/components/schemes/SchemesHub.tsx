"use client";

// src/components/schemes/SchemesHub.tsx
//
// CLIENT orchestrator for the Schemes & Benefits Hub (Req 12, 13, 14).
//
// Composition (top → bottom):
//   1. Compact DARK hero (py-12) — factual headline + restrained subhead.
//   2. Light container (max-w-7xl, py-16 md:py-24):
//        PersonalizationBanner → SchemeFilters → card grid → CompareBar.
//
// State is held in plain React state (NOT the URL, Req 13.x): the active filter
// set, the compare selection (capped at 3), and the active quick-filter. When a
// session profile exists the Hub evaluates ALL 22 schemes ONCE via `useMemo`
// keyed on the profile and threads each card its precomputed EligibilityResult;
// unregistered users get `undefined`, so no confidence dot renders.
//
// The pure `filterSchemeList` helper (exported, side-effect free) composes every
// active filter with AND semantics so it can be unit/property tested in isolation.

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { EligibilityResult, Scheme } from "@/types";
import { schemes as ALL_SCHEMES } from "@/data/schemes";
import { evaluateAllSchemes } from "@/lib/eligibility-engine";
import { useRegistration } from "@/context/RegistrationContext";

import {
  INITIAL_SCHEME_FILTERS,
  type SchemeFilterState,
} from "@/components/schemes/scheme-filter-state";
import { SchemeCard } from "@/components/schemes/SchemeCard";
import {
  PersonalizationBanner,
  type QuickFilter,
} from "@/components/schemes/PersonalizationBanner";

// CompareBar only appears once a scheme is selected, so it need not be in the
// hub's First Load. Lazy-load it client-side to keep `/schemes` under budget.
const CompareBar = dynamic(
  () => import("@/components/schemes/CompareBar").then((m) => m.CompareBar),
  { ssr: false },
);

// SchemeFilters pulls in several Radix primitives (Tabs + Select with its
// positioning library). They are only ever needed once the user interacts with
// the filter bar, and the default filter state shows all 22 schemes regardless,
// so the controls can load client-side without affecting first paint. Lazy-load
// to keep those primitives out of the `/schemes` First Load. A height-reserving
// fallback prevents layout shift while the controls hydrate.
const SchemeFilters = dynamic(
  () => import("@/components/schemes/SchemeFilters").then((m) => m.SchemeFilters),
  {
    ssr: false,
    loading: () => <div aria-hidden="true" className="h-[4.25rem]" />,
  },
);

/** Maximum number of schemes that can be queued for side-by-side comparison (Req 14.3). */
export const MAX_COMPARE_SELECTION = 3;

/**
 * Options that refine `filterSchemeList` beyond the visible filter controls:
 * the active quick-filter plus the data it needs (precomputed eligibility for
 * "Show Only Eligible", the compare selection for "Compare Selected").
 */
export interface FilterSchemeListOptions {
  /** Active quick-filter (defaults to "all" — no quick refinement). */
  quickFilter?: QuickFilter;
  /** Precomputed eligibility per scheme id; required for the "eligible" quick-filter. */
  eligibility?: Record<string, EligibilityResult>;
  /** Current compare selection; used by the "compare" quick-filter. */
  compareSelection?: readonly string[];
}

/**
 * PURE filtering core for the Hub — given the full scheme list and the active
 * filter state, returns exactly the schemes satisfying ALL active filters with
 * AND semantics (Req 13.3–13.8). No React, no side effects: same inputs → same
 * output, so it is directly unit/property testable (Property 10).
 *
 * Filters applied:
 *   - **Type tab** (Req 13.3): "All" matches everything; "fiscal"/"grant" match
 *     `scheme.type` exactly. GENUINELY filters.
 *   - **Status** (Req 13.5): "All" matches everything; "open"/"upcoming" match
 *     `scheme.status` exactly. GENUINELY filters.
 *   - **Search** (Req 13.6): case-insensitive substring of the trimmed query
 *     against `scheme.name`. Empty query matches everything. GENUINELY filters.
 *   - **Sectors / Stages**: DOCUMENTED NO-OP. The canonical `src/data/schemes.ts`
 *     records have NO sector-association field and NO lifecycle-stage field
 *     (`Scheme` is `{ id, name, type, shortDescription, amount, maxBenefit,
 *     duration, eligibility[], documents[], status, note? }`). Rather than
 *     fabricate a `scheme.sector` / `scheme.stage` field or guess from free
 *     text — which would silently drop schemes on data we don't actually have —
 *     the sector and stage selections are treated as match-all refinements that
 *     never exclude a scheme. The controls remain available for when scheme
 *     records gain those fields; until then they honestly do not filter.
 *   - **Quick-filter** (Req 14): "eligible" keeps only schemes whose precomputed
 *     status is definitely/likely-eligible (requires `options.eligibility`);
 *     "compare" keeps only schemes in `options.compareSelection`; "all" is a
 *     no-op.
 */
export function filterSchemeList(
  list: readonly Scheme[],
  filters: SchemeFilterState,
  options: FilterSchemeListOptions = {},
): Scheme[] {
  const { quickFilter = "all", eligibility, compareSelection = [] } = options;
  const query = filters.search.trim().toLowerCase();
  const compareSet = new Set(compareSelection);

  return list.filter((scheme) => {
    // Type tab — genuine filter (Req 13.3).
    if (filters.type !== "All" && scheme.type !== filters.type) {
      return false;
    }

    // Status — genuine filter (Req 13.5).
    if (filters.status !== "All" && scheme.status !== filters.status) {
      return false;
    }

    // Case-insensitive name search — genuine filter (Req 13.6).
    if (query.length > 0 && !scheme.name.toLowerCase().includes(query)) {
      return false;
    }

    // Sector / stage selections: documented no-op (no backing field on Scheme).
    // Intentionally do not exclude on `filters.sectors` / `filters.stages`.

    // Quick-filter refinement (Req 14).
    if (quickFilter === "eligible") {
      const result = eligibility?.[scheme.id];
      if (
        !result ||
        (result.status !== "definitely-eligible" &&
          result.status !== "likely-eligible")
      ) {
        return false;
      }
    } else if (quickFilter === "compare") {
      if (!compareSet.has(scheme.id)) {
        return false;
      }
    }

    return true;
  });
}

export function SchemesHub(): JSX.Element {
  const router = useRouter();
  const { registrationProfile, qualifyingCount } = useRegistration();

  // --- Hub state (plain React state, NOT the URL) ---
  const [filters, setFilters] =
    React.useState<SchemeFilterState>(INITIAL_SCHEME_FILTERS);
  const [compareSelection, setCompareSelection] = React.useState<string[]>([]);
  const [quickFilter, setQuickFilter] = React.useState<QuickFilter>("all");

  // Evaluate all 22 schemes ONCE per profile change (Req 12.4 personalization).
  // `undefined` while unregistered → cards receive no result → no dot (Req 15.5).
  const eligibilityResults = React.useMemo<
    Record<string, EligibilityResult> | undefined
  >(() => {
    if (!registrationProfile) return undefined;
    return evaluateAllSchemes(registrationProfile);
  }, [registrationProfile]);

  // Compose the visible list from every active filter (Req 13.3–13.8, 14).
  const visibleSchemes = React.useMemo(
    () =>
      filterSchemeList(ALL_SCHEMES, filters, {
        quickFilter,
        eligibility: eligibilityResults,
        compareSelection,
      }),
    [filters, quickFilter, eligibilityResults, compareSelection],
  );

  // Toggle a scheme in/out of the compare selection. A 4th add is REJECTED and
  // surfaces a toast (Req 14.3); removal and the first three adds proceed.
  const handleToggleCompare = React.useCallback(
    (id: string) => {
      if (compareSelection.includes(id)) {
        setCompareSelection((current) =>
          current.filter((schemeId) => schemeId !== id),
        );
        return;
      }
      if (compareSelection.length >= MAX_COMPARE_SELECTION) {
        toast("Maximum three schemes for comparison");
        return;
      }
      setCompareSelection((current) => [...current, id]);
    },
    [compareSelection],
  );

  const handleClearCompare = React.useCallback(() => {
    setCompareSelection([]);
  }, []);

  // Serialize the selection into the compare route's query string (Req 14.5).
  const handleCompare = React.useCallback(() => {
    if (compareSelection.length === 0) return;
    router.push(`/schemes/compare?ids=${compareSelection.join(",")}`);
  }, [compareSelection, router]);

  const hasMatches = visibleSchemes.length > 0;

  return (
    <>
      {/* 1. Compact dark hero (Req 12.1). */}
      <section className="bg-dark py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Schemes and Benefits
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/80">
            Twenty-two schemes under the Karnataka Startup Policy 2025-30 — total
            committed outlay above ₹1,200 crore across LEAP, ELEVATE, KITVEN, and
            Beyond Bengaluru programs.
          </p>
        </div>
      </section>

      {/* 2. Light content area. */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="flex flex-col gap-8">
          <PersonalizationBanner
            qualifyingCount={qualifyingCount}
            activeQuickFilter={quickFilter}
            onQuickFilter={setQuickFilter}
          />

          <SchemeFilters value={filters} onChange={setFilters} />

          {/* Section heading for the listings region. Visually hidden (the dark
              hero already titles the page) but present so the card headings
              (h3) follow an h2 and the document heading order never skips a
              level (Req 27.x / WCAG 1.3.1). */}
          <h2 className="sr-only">Scheme listings</h2>

          {hasMatches ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleSchemes.map((scheme) => (
                <SchemeCard
                  key={scheme.id}
                  scheme={scheme}
                  eligibility={eligibilityResults?.[scheme.id]}
                  selectedForCompare={compareSelection.includes(scheme.id)}
                  onToggleCompare={handleToggleCompare}
                />
              ))}
            </div>
          ) : (
            <div
              role="status"
              className="rounded-xl border border-border bg-surface px-6 py-16 text-center"
            >
              <p className="text-sm text-dark">
                No schemes match the current filters.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Fixed compare bar (renders only while 1–3 schemes are selected). */}
      <CompareBar
        selectedIds={compareSelection}
        onClear={handleClearCompare}
        onCompare={handleCompare}
      />
    </>
  );
}

export default SchemesHub;

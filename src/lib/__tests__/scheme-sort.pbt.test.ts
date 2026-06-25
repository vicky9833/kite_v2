// Property-based test for the pure scheme-table sort helper.
//
// Feature: kite-dashboards, Property 5
//
// For any array of `SchemePerformanceRow`, any `SchemeSortKey`, and any
// `SortDirection`, `sortSchemeRows(rows, key, dir)` is a permutation of the
// input (same multiset of rows) AND is ordered non-decreasingly (asc) or
// non-increasingly (desc) by the chosen key.

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { sortSchemeRows } from "@/lib/scheme-sort";
import type {
  SchemePerformanceRow,
  SchemeSortKey,
  SortDirection,
} from "@/types";

/** Canonical unions (mirrors `src/types`). */
const SCHEME_TYPES = ["fiscal", "grant"] as const;
const SCHEME_STATUSES = ["open", "upcoming"] as const;

const SORT_KEYS: readonly SchemeSortKey[] = [
  "name",
  "type",
  "applications",
  "approved",
  "disbursed",
  "status",
];
const SORT_DIRECTIONS: readonly SortDirection[] = ["asc", "desc"];

/** Arbitrary `SchemePerformanceRow` with the canonical field shape. */
const rowArb: fc.Arbitrary<SchemePerformanceRow> = fc.record({
  schemeId: fc.string(),
  name: fc.string(),
  type: fc.constantFrom(...SCHEME_TYPES),
  applications: fc.integer({ min: 0, max: 10_000 }),
  approved: fc.integer({ min: 0, max: 10_000 }),
  disbursed: fc.integer({ min: 0, max: 1_000_000_000 }),
  status: fc.constantFrom(...SCHEME_STATUSES),
});

const rowsArb = fc.array(rowArb, { maxLength: 40 });

/** Build a reference-identity multiset count map for permutation checks. */
function countByReference(
  rows: readonly SchemePerformanceRow[],
): Map<SchemePerformanceRow, number> {
  const counts = new Map<SchemePerformanceRow, number>();
  for (const row of rows) {
    counts.set(row, (counts.get(row) ?? 0) + 1);
  }
  return counts;
}

/** Compare two rows by the chosen key using the same rules as the helper. */
function compareByKey(
  a: SchemePerformanceRow,
  b: SchemePerformanceRow,
  key: SchemeSortKey,
): number {
  const av = a[key];
  const bv = b[key];
  if (typeof av === "number" && typeof bv === "number") {
    return av - bv;
  }
  return String(av).localeCompare(String(bv));
}

describe("scheme-sort property tests", () => {
  // Feature: kite-dashboards, Property 5
  it("Property 5: sortSchemeRows is an ordering permutation of its input", () => {
    fc.assert(
      fc.property(
        rowsArb,
        fc.constantFrom(...SORT_KEYS),
        fc.constantFrom(...SORT_DIRECTIONS),
        (rows, key, direction) => {
          const sorted = sortSchemeRows(rows, key, direction);

          // Does not mutate the input array and returns a fresh array.
          expect(sorted).not.toBe(rows);
          expect(sorted).toHaveLength(rows.length);

          // Permutation: identical multiset of rows (by reference identity).
          const inputCounts = countByReference(rows);
          const outputCounts = countByReference(sorted);
          expect(outputCounts).toEqual(inputCounts);

          // Ordering: non-decreasing (asc) / non-increasing (desc) by the key.
          for (let i = 1; i < sorted.length; i++) {
            const cmp = compareByKey(sorted[i - 1]!, sorted[i]!, key);
            if (direction === "asc") {
              expect(cmp).toBeLessThanOrEqual(0);
            } else {
              expect(cmp).toBeGreaterThanOrEqual(0);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  EMPTY_INCUBATOR_FILTERS,
  deriveClusterOptions,
  deriveFocusOptions,
  describeActiveFilters,
  filterIncubators,
} from "@/lib/incubator-filters";
import { incubators } from "@/data/incubators";
import type { Incubator, IncubatorFilters, IncubatorType } from "@/types";

// ===========================================================================
// Property-based tests for the pure incubator-filter module.
// Exercised against the canonical `incubators.ts` dataset AND arbitrary
// generated datasets/filters, at { numRuns: 100 } per property.
// ===========================================================================

const INCUBATOR_TYPES: readonly IncubatorType[] = [
  "Incubator",
  "Accelerator",
  "Research Park",
];

// Small finite pools so generated datasets actually share clusters/focus tags
// and types — guaranteeing that active filters produce real (non-trivial)
// matches and that AND-composition is meaningfully exercised.
const CLUSTER_POOL = ["Bengaluru", "Mangaluru", "HDB", "Mysuru", "Tumakuru"];
const FOCUS_POOL = [
  "General",
  "AI",
  "DeepTech",
  "FinTech",
  "HealthTech",
  "AgriTech",
  "Social Impact",
];

const incubatorArbitrary: fc.Arbitrary<Incubator> = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  cluster: fc.constantFrom(...CLUSTER_POOL),
  focus: fc.uniqueArray(fc.constantFrom(...FOCUS_POOL), {
    minLength: 0,
    maxLength: 4,
  }),
  type: fc.constantFrom(...INCUBATOR_TYPES),
});

const datasetArbitrary: fc.Arbitrary<Incubator[]> = fc.array(
  incubatorArbitrary,
  { maxLength: 20 },
);

/**
 * A filter generator that draws active values from the dataset where possible
 * (so matches really occur) but also injects nulls and unmatchable values to
 * cover the all-null, partially-active, fully-active, and zero-result spaces.
 */
function filtersArbitrary(data: readonly Incubator[]): fc.Arbitrary<IncubatorFilters> {
  const clustersInData = data.map((d) => d.cluster);
  const focusInData = data.flatMap((d) => d.focus);

  const clusterArb = fc.oneof(
    fc.constant(null),
    fc.constantFrom(...CLUSTER_POOL),
    ...(clustersInData.length > 0 ? [fc.constantFrom(...clustersInData)] : []),
  );
  const focusArb = fc.oneof(
    fc.constant(null),
    fc.constantFrom(...FOCUS_POOL),
    ...(focusInData.length > 0 ? [fc.constantFrom(...focusInData)] : []),
  );
  const typeArb = fc.oneof(
    fc.constant(null),
    fc.constantFrom(...INCUBATOR_TYPES),
  );

  return fc.record({
    cluster: clusterArb as fc.Arbitrary<string | null>,
    focus: focusArb as fc.Arbitrary<string | null>,
    type: typeArb as fc.Arbitrary<IncubatorType | null>,
  });
}

/** True when a single record satisfies every active dimension of `filters`. */
function satisfies(inc: Incubator, filters: IncubatorFilters): boolean {
  return (
    (filters.cluster === null || inc.cluster === filters.cluster) &&
    (filters.focus === null || inc.focus.includes(filters.focus)) &&
    (filters.type === null || inc.type === filters.type)
  );
}

function countActive(filters: IncubatorFilters): number {
  return (
    (filters.cluster !== null ? 1 : 0) +
    (filters.focus !== null ? 1 : 0) +
    (filters.type !== null ? 1 : 0)
  );
}

// Feature: kite-ecosystem-enablement, Property 5
// deriveClusterOptions / deriveFocusOptions return exactly the distinct values
// present in the data — no duplicates, none omitted.
describe("Property 5: option derivation equals the distinct values in the data", () => {
  it("deriveClusterOptions = distinct clusters (no dups, none omitted)", () => {
    fc.assert(
      fc.property(datasetArbitrary, (data) => {
        const options = deriveClusterOptions(data);
        const expected = new Set(data.map((d) => d.cluster));

        // No duplicates.
        expect(new Set(options).size).toBe(options.length);
        // Exactly the distinct set (none omitted, none fabricated).
        expect(new Set(options)).toEqual(expected);
        expect(options.length).toBe(expected.size);
      }),
      { numRuns: 100 },
    );
  });

  it("deriveFocusOptions = distinct focus values across all focus[] (no dups, none omitted)", () => {
    fc.assert(
      fc.property(datasetArbitrary, (data) => {
        const options = deriveFocusOptions(data);
        const expected = new Set(data.flatMap((d) => d.focus));

        expect(new Set(options).size).toBe(options.length);
        expect(new Set(options)).toEqual(expected);
        expect(options.length).toBe(expected.size);
      }),
      { numRuns: 100 },
    );
  });

  it("holds for the canonical incubators dataset", () => {
    const clusters = deriveClusterOptions(incubators);
    const focus = deriveFocusOptions(incubators);
    expect(new Set(clusters)).toEqual(new Set(incubators.map((i) => i.cluster)));
    expect(new Set(focus)).toEqual(new Set(incubators.flatMap((i) => i.focus)));
    expect(new Set(clusters).size).toBe(clusters.length);
    expect(new Set(focus).size).toBe(focus.length);
  });
});

// Feature: kite-ecosystem-enablement, Property 6
// filterIncubators is sound (every result satisfies every active filter),
// AND-composed (result == records satisfying ALL active dimensions), and
// subset-preserving (result ⊆ input, no fabrication/duplication).
describe("Property 6: filtering is sound, AND-composed, and subset-preserving", () => {
  it("over arbitrary datasets and filters", () => {
    fc.assert(
      fc.property(
        datasetArbitrary.chain((data) =>
          filtersArbitrary(data).map((filters) => ({ data, filters })),
        ),
        ({ data, filters }) => {
          const result = filterIncubators(data, filters);

          // Soundness: every result satisfies every active filter.
          for (const inc of result) {
            expect(satisfies(inc, filters)).toBe(true);
          }

          // AND-composition + completeness: result is exactly the input
          // records satisfying ALL active dimensions, in input order.
          const expected = data.filter((inc) => satisfies(inc, filters));
          expect(result).toEqual(expected);

          // Subset-preserving: every result element is an input element (by
          // reference) and appears no more often than in the input.
          for (const inc of result) {
            expect(data).toContain(inc);
          }
          for (const inc of new Set(result)) {
            const inResult = result.filter((r) => r === inc).length;
            const inInput = data.filter((d) => d === inc).length;
            expect(inResult).toBeLessThanOrEqual(inInput);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("over the canonical dataset with derived filters", () => {
    fc.assert(
      fc.property(filtersArbitrary(incubators), (filters) => {
        const result = filterIncubators(incubators, filters);
        for (const inc of result) {
          expect(satisfies(inc, filters)).toBe(true);
          expect(incubators).toContain(inc);
        }
        expect(result).toEqual(
          incubators.filter((inc) => satisfies(inc, filters)),
        );
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: kite-ecosystem-enablement, Property 8
// Applying EMPTY_INCUBATOR_FILTERS returns exactly the input set.
describe("Property 8: empty filters return the full input set", () => {
  it("returns the same membership as the input", () => {
    fc.assert(
      fc.property(datasetArbitrary, (data) => {
        const result = filterIncubators(data, EMPTY_INCUBATOR_FILTERS);
        // Same length, same elements, same order.
        expect(result).toEqual(data);
        expect(result.length).toBe(data.length);
      }),
      { numRuns: 100 },
    );
  });

  it("returns the full canonical dataset", () => {
    expect(filterIncubators(incubators, EMPTY_INCUBATOR_FILTERS)).toEqual(
      incubators,
    );
  });
});

// Feature: kite-ecosystem-enablement, Property 9
// Match count == result length and is within [0, dataset.length]; when the
// result is empty with >= 1 active filter, describeActiveFilters lists every
// active filter's dimension and value.
describe("Property 9: count is bounded and empty results name active filters", () => {
  it("match count equals result length and lies in [0, dataset.length]", () => {
    fc.assert(
      fc.property(
        datasetArbitrary.chain((data) =>
          filtersArbitrary(data).map((filters) => ({ data, filters })),
        ),
        ({ data, filters }) => {
          const result = filterIncubators(data, filters);
          const count = result.length;

          expect(count).toBe(result.length);
          expect(count).toBeGreaterThanOrEqual(0);
          expect(count).toBeLessThanOrEqual(data.length);

          // When empty with >= 1 active filter, the empty-state description
          // names every active filter's dimension and selected value.
          if (count === 0 && countActive(filters) >= 1) {
            const lines = describeActiveFilters(filters);
            expect(lines.length).toBe(countActive(filters));

            if (filters.cluster !== null) {
              expect(lines).toContain(`Cluster: ${filters.cluster}`);
            }
            if (filters.focus !== null) {
              expect(lines).toContain(`Focus: ${filters.focus}`);
            }
            if (filters.type !== null) {
              expect(lines).toContain(`Type: ${filters.type}`);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

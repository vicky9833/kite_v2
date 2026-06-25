import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { schemes } from "@/data/schemes";
import { clusters } from "@/data/clusters";
import { policies } from "@/data/policies";
import { giaCountries } from "@/data/gia-countries";
import { sectors } from "@/data/sectors";
import { quickActions } from "@/data/quick-actions";
import { flagshipPrograms } from "@/data/flagship-programs";
import { partnerLogos } from "@/data/social-proof";
import { ecosystemStats, homeStatsStripIds } from "@/data/ecosystem-stats";

// Feature: kite-foundation-home, Property 14: Data module cardinality

/**
 * Each tuple pairs a human-readable module name with the actual exported
 * collection length and the contractually expected count. The property below
 * quantifies over these tuples and asserts every collection matches its
 * expected cardinality. Lengths are fixed module facts, so the fast-check
 * generator enumerates the named tuples (per the design's PBT convention)
 * rather than synthesising random inputs.
 */
interface CardinalityCase {
  readonly name: string;
  readonly actual: number;
  readonly expected: number;
}

const cardinalityCases: readonly CardinalityCase[] = [
  { name: "schemes", actual: schemes.length, expected: 22 },
  { name: "clusters", actual: clusters.length, expected: 6 },
  { name: "policies", actual: policies.length, expected: 10 },
  { name: "giaCountries", actual: giaCountries.length, expected: 32 },
  // Derived taxonomy is curated to 20 sectors (not the 22 source schemes).
  { name: "sectors", actual: sectors.length, expected: 20 },
  { name: "quickActions", actual: quickActions.length, expected: 8 },
  { name: "flagshipPrograms", actual: flagshipPrograms.length, expected: 6 },
  { name: "partnerLogos", actual: partnerLogos.length, expected: 10 },
  // Full module set is 20 stats; the curated home strip selects exactly 6.
  { name: "ecosystemStats", actual: ecosystemStats.length, expected: 20 },
  { name: "homeStatsStripIds", actual: homeStatsStripIds.length, expected: 6 },
];

describe("data module cardinality (Property 14)", () => {
  it("exports every collection at its contractually expected length", () => {
    fc.assert(
      fc.property(
        fc.constantFrom<CardinalityCase>(...cardinalityCases),
        (testCase) => {
          expect(testCase.actual).toBe(testCase.expected);
        },
      ),
      { numRuns: 25 },
    );
  });
});

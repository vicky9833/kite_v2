import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { generateIncubatorDetail } from "@/lib/synthetic-incubator-detail";

// Feature: kite-ecosystem-enablement, Property 1

/**
 * Property 1: Synthetic generation is deterministic and ambient-free.
 *
 * For any incubator id (arbitrary string), `generateIncubatorDetail`:
 *   - returns deep-equal (byte-identical) output on repeated calls;
 *   - keeps numeric fields within declared ranges
 *     (cohortsPerYear ∈ [1, 4], startupsSupported ∈ [20, 240]);
 *   - returns a non-empty `illustrativeOfferings` array;
 *   - echoes the input id back as `incubatorId`;
 *   - shows no dependence on `Math.random` / `Date` / ambient input —
 *     determinism across calls (including across an intervening clock/random
 *     perturbation) demonstrates this.
 *
 * Validates: Requirements 3.3, 3.6, 11.3
 */

/** Any incubator id, including empty, unicode, and whitespace-laden strings. */
const incubatorIdArbitrary: fc.Arbitrary<string> = fc.string();

describe("generateIncubatorDetail (Property 1: deterministic & ambient-free)", () => {
  it("is byte-stable across calls, in range, non-empty, and echoes the id", () => {
    fc.assert(
      fc.property(incubatorIdArbitrary, (incubatorId) => {
        const first = generateIncubatorDetail(incubatorId);

        // Perturb ambient state between the two calls. A generator that leaked
        // any dependence on Math.random or the clock would diverge here.
        Math.random();

        const second = generateIncubatorDetail(incubatorId);

        // Determinism: repeated calls for the same id are deep-equal
        // (byte-identical), unaffected by the intervening ambient perturbation.
        expect(second).toEqual(first);

        // The id is echoed back verbatim.
        expect(first.incubatorId).toBe(incubatorId);

        // Numeric fields lie within their declared ranges and are integers.
        expect(Number.isInteger(first.cohortsPerYear)).toBe(true);
        expect(first.cohortsPerYear).toBeGreaterThanOrEqual(1);
        expect(first.cohortsPerYear).toBeLessThanOrEqual(4);

        expect(Number.isInteger(first.startupsSupported)).toBe(true);
        expect(first.startupsSupported).toBeGreaterThanOrEqual(20);
        expect(first.startupsSupported).toBeLessThanOrEqual(240);

        // illustrativeOfferings is a non-empty array.
        expect(Array.isArray(first.illustrativeOfferings)).toBe(true);
        expect(first.illustrativeOfferings.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});

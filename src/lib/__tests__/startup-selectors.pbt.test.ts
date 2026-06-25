import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { selectTopEligibleSchemes, daysSince } from "@/lib/startup-selectors";
import type { EligibilityResult, EligibilityStatus } from "@/types";

// ---------------------------------------------------------------------------
// Shared generators
// ---------------------------------------------------------------------------

const ALL_STATUSES: readonly EligibilityStatus[] = [
  "definitely-eligible",
  "likely-eligible",
  "check-requirements",
  "not-eligible",
];

const ELIGIBLE_STATUSES: ReadonlySet<EligibilityStatus> = new Set<EligibilityStatus>([
  "definitely-eligible",
  "likely-eligible",
]);

const eligibilityResultArbitrary: fc.Arbitrary<EligibilityResult> = fc.record({
  schemeId: fc.string({ minLength: 1, maxLength: 12 }),
  status: fc.constantFrom(...ALL_STATUSES),
  reasons: fc.array(fc.string({ maxLength: 30 }), { maxLength: 3 }),
  estimatedBenefit: fc.integer({ min: 0, max: 10_000_000 }),
  confidence: fc.float({ min: 0, max: 1, noNaN: true }),
});

/** A results map keyed by unique scheme ids. */
const resultsMapArbitrary: fc.Arbitrary<Record<string, EligibilityResult>> = fc
  .uniqueArray(eligibilityResultArbitrary, {
    maxLength: 30,
    selector: (r) => r.schemeId,
  })
  .map((arr) =>
    Object.fromEntries(arr.map((r) => [r.schemeId, r] as const)),
  );

// ---------------------------------------------------------------------------
// Property 13: Top eligible schemes selection — bound, membership, ordering
// ---------------------------------------------------------------------------

describe("startup selectors (Property 13: top eligible bound/membership/ordering)", () => {
  it("returns <=6 eligible results from the input, ordered by estimatedBenefit descending", () => {
    // Feature: kite-dashboards, Property 13
    fc.assert(
      fc.property(resultsMapArbitrary, (results) => {
        const selected = selectTopEligibleSchemes(results);
        const inputValues = Object.values(results);

        // Bound (default limit 6).
        expect(selected.length).toBeLessThanOrEqual(6);

        for (const item of selected) {
          // Eligible status only.
          expect(ELIGIBLE_STATUSES.has(item.status)).toBe(true);
          // Membership: each returned item is present in the input.
          expect(inputValues).toContain(item);
        }

        // Ordered non-increasingly by estimatedBenefit.
        for (let i = 1; i < selected.length; i++) {
          expect(selected[i - 1]!.estimatedBenefit).toBeGreaterThanOrEqual(
            selected[i]!.estimatedBenefit,
          );
        }
      }),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Property 14: Days-since-registration is non-negative and exact
// ---------------------------------------------------------------------------

describe("startup selectors (Property 14: daysSince non-negative + exact)", () => {
  it("daysSince is a non-negative integer equal to floor((now - registeredAt)/86_400_000)", () => {
    // Feature: kite-dashboards, Property 14
    fc.assert(
      fc.property(
        // `now` as epoch ms within a realistic range.
        fc.integer({
          min: new Date("2015-01-01").getTime(),
          max: new Date("2035-12-31").getTime(),
        }),
        // Non-negative offset back in time, so registeredAt <= now.
        fc.integer({ min: 0, max: 20 * 365 * 86_400_000 }),
        (nowMs, offsetMs) => {
          const now = new Date(nowMs);
          const registeredAtMs = nowMs - offsetMs;
          const iso = new Date(registeredAtMs).toISOString();

          const result = daysSince(iso, now);
          const expected = Math.floor((nowMs - registeredAtMs) / 86_400_000);

          expect(Number.isInteger(result)).toBe(true);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });
});

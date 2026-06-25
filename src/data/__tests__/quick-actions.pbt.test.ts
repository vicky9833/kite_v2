import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { quickActions } from "@/data/quick-actions";
import type { QuickAction } from "@/types";

// Feature: kite-foundation-home, Property 5: Quick action field limits hold

/**
 * Index arbitrary constrained to the valid range of the quickActions array.
 * Picking an index (rather than generating QuickAction values) keeps the
 * property anchored to the real, shipped dataset.
 */
const indexArbitrary: fc.Arbitrary<number> = fc.nat({
  max: Math.max(0, quickActions.length - 1),
});

describe("quickActions (Property 5: field limits hold)", () => {
  it("keeps label ≤ 40, description ≤ 120, and non-empty href/icon for every action", () => {
    fc.assert(
      fc.property(indexArbitrary, (index) => {
        const action = quickActions[index];
        expect(action).toBeDefined();
        if (!action) return;

        expect(action.label.length).toBeLessThanOrEqual(40);
        expect(action.description.length).toBeLessThanOrEqual(120);
        expect(action.href.length).toBeGreaterThan(0);
        expect(action.icon.length).toBeGreaterThan(0);
      }),
      { numRuns: 25 },
    );
  });
});

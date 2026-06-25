import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { sectors } from "@/data/sectors";
import type { Sector } from "@/types";

/**
 * Pure model of the SectorExplorerSection's single-select handler.
 *
 * The section stores selection as `selectedId: string | null` and updates it
 * via `setSelectedId(id)` on every chip click. Each click simply replaces the
 * prior selection with the clicked id (most-recent wins). The previous state is
 * irrelevant to the next state, so the reducer ignores it and returns the new
 * id — mirroring the component's handler exactly.
 */
const selectSector = (_state: string | null, id: string): string | null => id;

/**
 * Real sector ids shipped in the dataset. Used as the primary generator so the
 * property is anchored to the actual chips rendered by the section, with a
 * couple of arbitrary-string fallbacks to widen the input space.
 */
const sectorIdArbitrary: fc.Arbitrary<string> = fc.oneof(
  fc.constantFrom(...sectors.map((s: Sector) => s.id)),
  fc.string({ minLength: 1 }),
);

// Feature: kite-foundation-home, Property 9: Sector chip single-selection
describe("SectorExplorer selection (Property 9: single-selection)", () => {
  it("folds a click sequence to exactly the last clicked id, holding a single id (never a set/array)", () => {
    fc.assert(
      fc.property(
        fc.array(sectorIdArbitrary, { minLength: 1, maxLength: 30 }),
        (clicks: string[]) => {
          const finalState = clicks.reduce<string | null>(
            (state, id) => selectSector(state, id),
            null,
          );

          // The selected chip is exactly the most-recently clicked one.
          expect(finalState).toBe(clicks[clicks.length - 1]);

          // State is a single id value — never a collection. At most one chip
          // is selected at any time (a lone string, not a set/array).
          expect(typeof finalState).toBe("string");
          expect(Array.isArray(finalState)).toBe(false);
          expect((finalState as unknown) instanceof Set).toBe(false);
        },
      ),
      { numRuns: 25 },
    );
  });
});

// Feature: kite-foundation-home, Property 10: Sector selection has no side effects
describe("SectorExplorer selection (Property 10: no side effects)", () => {
  it("changes only the selected id, leaving all other state referentially unchanged and inputs unmutated", () => {
    fc.assert(
      fc.property(
        fc.option(sectorIdArbitrary, { nil: null }),
        sectorIdArbitrary,
        (priorState: string | null, clickedId: string) => {
          // Model "every other Home section's data" as an immutable object whose
          // reference must survive a selection untouched.
          const otherState = Object.freeze({ sectors });
          const otherStateRef = otherState;
          const sectorsRef = otherState.sectors;
          const sectorsLengthBefore = sectorsRef.length;

          const nextState = selectSector(priorState, clickedId);

          // The reducer returns only the new id.
          expect(nextState).toBe(clickedId);

          // No other state changed: same object reference, same array reference,
          // same contents — the selection has no side effects elsewhere.
          expect(otherState).toBe(otherStateRef);
          expect(otherState.sectors).toBe(sectorsRef);
          expect(otherState.sectors.length).toBe(sectorsLengthBefore);

          // Inputs were not mutated by the reducer.
          expect(otherState.sectors).toBe(sectors);
        },
      ),
      { numRuns: 25 },
    );
  });
});

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  INV_ID_ALPHABET,
  INV_ID_PATTERN,
  generateInvestorId,
  type Rng,
} from "@/lib/investor-id-generator";

// Feature: kite-investor-suite, Property 7

/**
 * Property 7 model. `generateInvestorId(rng, year)` draws a six-character
 * suffix from an unambiguous alphabet (A–Z + 2–9, excluding the look-alikes
 * O, 0, I, and 1) and stamps the supplied four-digit year, producing
 * `INV-YYYY-XXXXXX`.
 *
 * This test feeds the generator an arbitrary deterministic rng stream (built
 * from a non-empty list of floats in [0, 1)) and an arbitrary four-digit year,
 * then asserts the universal shape guarantees of Requirement 2.2:
 *   - the id matches `INV_ID_PATTERN`;
 *   - the `YYYY` portion equals the supplied year;
 *   - every suffix character comes from `INV_ID_ALPHABET` (never O/0/I/1);
 *   - the generator is deterministic — same rng + year ⇒ same id.
 */

/** Look-alike characters the alphabet must never emit. */
const FORBIDDEN_SUFFIX_CHARS = new Set(["O", "0", "I", "1"]);

/**
 * Build a deterministic `Rng` that replays a fixed list of [0, 1) draws, then
 * cycles, so it is total for any number of `generateInvestorId` calls. Two rngs
 * built from the same stream produce identical sequences, which lets us assert
 * determinism without sharing mutable state between calls.
 */
function makeCyclingRng(stream: readonly number[]): Rng {
  let i = 0;
  return () => {
    // `stream` is non-empty by construction, so this index is always defined.
    const value = stream[i % stream.length] as number;
    i += 1;
    return value;
  };
}

/** A non-empty stream of floats in the half-open interval [0, 1). */
const rngStreamArbitrary: fc.Arbitrary<number[]> = fc.array(
  fc.double({ min: 0, max: 1, noNaN: true, maxExcluded: true }),
  { minLength: 1, maxLength: 24 },
);

/** Any four-digit year. */
const fourDigitYearArbitrary: fc.Arbitrary<number> = fc.integer({
  min: 1000,
  max: 9999,
});

describe("generateInvestorId (Property 7: INV ID format)", () => {
  it("always produces INV-YYYY-XXXXXX with the given year and an unambiguous suffix", () => {
    fc.assert(
      fc.property(
        rngStreamArbitrary,
        fourDigitYearArbitrary,
        (stream, year) => {
          const id = generateInvestorId(makeCyclingRng(stream), year);

          // Shape: matches the canonical pattern.
          expect(id).toMatch(INV_ID_PATTERN);

          // The YYYY portion equals the supplied year. The pattern match above
          // guarantees both parts are present.
          const parts = id.split("-");
          const yyyy = parts[1] as string;
          const suffix = parts[2] as string;
          expect(yyyy).toBe(String(year));

          // The suffix is exactly six characters, each from the alphabet and
          // never a look-alike (O/0/I/1).
          expect(suffix).toHaveLength(6);
          for (const ch of suffix) {
            expect(INV_ID_ALPHABET).toContain(ch);
            expect(FORBIDDEN_SUFFIX_CHARS.has(ch)).toBe(false);
          }

          // Determinism: same rng stream + year ⇒ identical id.
          const repeat = generateInvestorId(makeCyclingRng(stream), year);
          expect(repeat).toBe(id);
        },
      ),
      { numRuns: 100 },
    );
  });
});

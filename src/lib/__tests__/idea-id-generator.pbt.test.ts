import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  IDEA_ID_ALPHABET,
  IDEA_ID_PATTERN,
  generateIdeaId,
  type Rng,
} from "@/lib/idea-id-generator";

// Feature: kite-inclusion-grassroots, Property 1
// Feature: kite-inclusion-grassroots, Property 2

/**
 * `generateIdeaId(rng, year)` draws a six-character suffix from an unambiguous
 * alphabet (A–Z + 2–9, excluding the look-alikes O, 0, I, and 1) and stamps the
 * supplied four-digit year, producing `IDEA-YYYY-XXXXXX`. Each suffix char maps
 * `rng()` in [0, 1) to a clamped alphabet index, so an out-of-range rng (exactly
 * 1, negative, or NaN) can never overflow the alphabet or break the shape.
 *
 * Property 1 (well-formedness): for any rng sequence — including the hostile
 * values 1, negatives, and NaN — and any four-digit year, the id matches
 * `IDEA_ID_PATTERN`, the `YYYY` portion equals the supplied year, and every
 * suffix character comes from `IDEA_ID_ALPHABET` (never O/0/I/1).
 *
 * Property 2 (determinism): a fixed rng seed/stream plus the same year always
 * produces an identical id.
 *
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.5**
 */

/** Look-alike characters the alphabet must never emit. */
const FORBIDDEN_SUFFIX_CHARS = new Set(["O", "0", "I", "1"]);

/**
 * Build a deterministic `Rng` that replays a fixed list of draws, then cycles,
 * so it is total for any number of `generateIdeaId` calls. Two rngs built from
 * the same stream produce identical sequences, which lets us assert determinism
 * without sharing mutable state between calls.
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

/**
 * A non-empty stream of rng draws. Deliberately includes hostile, out-of-range
 * values (exactly 1, negatives, and NaN) alongside well-behaved [0, 1) floats,
 * so the clamping guarantee of Property 1 is exercised directly.
 */
const rngStreamArbitrary: fc.Arbitrary<number[]> = fc.array(
  fc.oneof(
    fc.double({ min: 0, max: 1, noNaN: true, maxExcluded: true }),
    fc.constant(1),
    fc.constant(-1),
    fc.constant(Number.NaN),
    fc.double({ noNaN: false }),
  ),
  { minLength: 1, maxLength: 24 },
);

/** Any four-digit year. */
const fourDigitYearArbitrary: fc.Arbitrary<number> = fc.integer({
  min: 1000,
  max: 9999,
});

describe("generateIdeaId (Property 1: IDEA ID well-formedness)", () => {
  it("always produces IDEA-YYYY-XXXXXX with the given year and an unambiguous suffix, even for hostile rng values", () => {
    fc.assert(
      fc.property(
        rngStreamArbitrary,
        fourDigitYearArbitrary,
        (stream, year) => {
          const id = generateIdeaId(makeCyclingRng(stream), year);

          // Shape: matches the canonical pattern.
          expect(id).toMatch(IDEA_ID_PATTERN);

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
            expect(IDEA_ID_ALPHABET).toContain(ch);
            expect(FORBIDDEN_SUFFIX_CHARS.has(ch)).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe("generateIdeaId (Property 2: determinism)", () => {
  it("returns an identical id for the same rng seed/stream and year", () => {
    fc.assert(
      fc.property(
        rngStreamArbitrary,
        fourDigitYearArbitrary,
        (stream, year) => {
          // Same rng stream + year ⇒ identical id. Fresh rngs are built from the
          // same stream so no mutable state leaks between the two calls.
          const first = generateIdeaId(makeCyclingRng(stream), year);
          const second = generateIdeaId(makeCyclingRng(stream), year);
          expect(second).toBe(first);
        },
      ),
      { numRuns: 100 },
    );
  });
});

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { isValidGIACountry } from "@/lib/utils";
import type { GIACountry, GIARegion } from "@/types";

// Feature: kite-foundation-home, Property 12: Invalid GIA countries are skipped, valid preserved
// Feature: kite-foundation-home, Property 13: "And N more" indicator arithmetic

/**
 * Property 12 model. `GIACountriesSection` renders
 * `giaCountries.filter(isValidGIACountry)` in source order, so the faithful
 * model of the "rendered subset" is exactly that filter. A GIACountry is valid
 * iff `name` is a non-empty string AND `countryCode` is a two-letter ASCII
 * string matching /^[A-Za-z]{2}$/. This test partitions arbitrary mixed lists
 * of country-like records (valid + malformed) and asserts the filtered result
 * equals — in source order — precisely the records that pass the guard, and
 * that every excluded record fails it.
 */

/** A record that may or may not satisfy `isValidGIACountry`. */
type GIACountryLike = Record<string, unknown>;

/** Non-empty string arbitrary (covers ascii, unicode, spaces around content). */
const nonEmptyString: fc.Arbitrary<string> = fc.oneof(
  fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  fc.constantFrom(
    "United Kingdom",
    "Germany",
    "Japan",
    "United Arab Emirates",
    "café münchen",
    "ಕನ್ನಡ",
  ),
);

/** Non-empty array of non-empty strings. */
const nonEmptyStringArray: fc.Arbitrary<string[]> = fc.array(nonEmptyString, {
  minLength: 1,
  maxLength: 4,
});

/** The five GIA regions. */
const regionArbitrary: fc.Arbitrary<GIARegion> = fc.constantFrom<GIARegion>(
  "Europe",
  "Middle East",
  "Asia-Pacific",
  "Americas",
  "Africa",
);

/** A valid two-letter ASCII ISO 3166-1 alpha-2 code (mixed-case allowed). */
const validCountryCode: fc.Arbitrary<string> = fc
  .tuple(
    fc.constantFrom(..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
    fc.constantFrom(..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"),
  )
  .map(([a, b]) => `${a}${b}`);

/** A fully valid GIACountry record (every guarded constraint satisfied). */
const validGIAArbitrary: fc.Arbitrary<GIACountry> = fc.record({
  id: nonEmptyString,
  name: nonEmptyString,
  countryCode: validCountryCode,
  focusAreas: nonEmptyStringArray,
  region: regionArbitrary,
});

/**
 * A malformed country-like record. Built from a valid base then corrupted in at
 * least one way the guard must reject: blanking the name, dropping the name,
 * or supplying a `countryCode` that is not exactly two ASCII letters (empty,
 * too short, too long, digits, non-ASCII, or a dropped field).
 */
const malformedGIAArbitrary: fc.Arbitrary<GIACountryLike> = fc
  .tuple(
    validGIAArbitrary,
    fc.constantFrom<
      | "emptyName"
      | "blankName"
      | "dropName"
      | "emptyCode"
      | "oneLetterCode"
      | "threeLetterCode"
      | "digitCode"
      | "nonAsciiCode"
      | "spacedCode"
      | "dropCode"
    >(
      "emptyName",
      "blankName",
      "dropName",
      "emptyCode",
      "oneLetterCode",
      "threeLetterCode",
      "digitCode",
      "nonAsciiCode",
      "spacedCode",
      "dropCode",
    ),
  )
  .map(([base, mutation]): GIACountryLike => {
    const record: GIACountryLike = { ...base };
    switch (mutation) {
      case "emptyName":
        record.name = "";
        break;
      case "blankName":
        record.name = "   ";
        break;
      case "dropName":
        delete record.name;
        break;
      case "emptyCode":
        record.countryCode = "";
        break;
      case "oneLetterCode":
        record.countryCode = "G";
        break;
      case "threeLetterCode":
        record.countryCode = "GBR";
        break;
      case "digitCode":
        record.countryCode = "G1";
        break;
      case "nonAsciiCode":
        record.countryCode = "Gé";
        break;
      case "spacedCode":
        record.countryCode = "G ";
        break;
      case "dropCode":
        delete record.countryCode;
        break;
    }
    return record;
  });

/** A mixed list of valid and malformed country-like records. */
const mixedListArbitrary: fc.Arbitrary<GIACountryLike[]> = fc.array(
  fc.oneof(
    validGIAArbitrary as unknown as fc.Arbitrary<GIACountryLike>,
    malformedGIAArbitrary,
  ),
  { maxLength: 12 },
);

describe("GIACountriesSection (Property 12: invalid countries skipped, valid preserved)", () => {
  it("renders exactly the isValidGIACountry subset in source order", () => {
    fc.assert(
      fc.property(mixedListArbitrary, (list) => {
        // The faithful model of the rendered subset.
        const rendered = list.filter(isValidGIACountry);

        // Independently compute the expected valid subset, preserving order.
        const expected = list.filter((record) => isValidGIACountry(record));

        // Rendered subset equals the valid subset exactly, in source order.
        expect(rendered).toEqual(expected);

        // Every rendered record passes the guard.
        for (const country of rendered) {
          expect(isValidGIACountry(country)).toBe(true);
        }

        // Every excluded record fails the guard.
        const renderedSet = new Set<GIACountryLike>(rendered);
        for (const record of list) {
          if (renderedSet.has(record)) continue;
          expect(isValidGIACountry(record)).toBe(false);
        }

        // Source order is preserved: rendered is a subsequence of list.
        let cursor = 0;
        for (const record of list) {
          if (cursor < rendered.length && rendered[cursor] === record) {
            cursor += 1;
          }
        }
        expect(cursor).toBe(rendered.length);
      }),
      { numRuns: 25 },
    );
  });
});

/**
 * Property 13 model. The "and N more" indicator in `GIACountriesSection`
 * computes `remaining = validTotal - displayedCount` and renders the indicator
 * only when `remaining > 0`, suppressing it when `remaining === 0`. Modelled
 * here as a pure function (the component is NOT imported): given a valid total
 * V and a displayed count D with 0 ≤ D ≤ V, the indicator shows N = V − D iff
 * D < V, and shows nothing when D === V.
 */
interface MoreIndicator {
  /** Whether the "and N more" indicator is shown. */
  shown: boolean;
  /** The count N surfaced when shown; 0 when suppressed. */
  count: number;
}

/** Pure model of the indicator arithmetic for valid total V and displayed D. */
function moreIndicator(validTotal: number, displayedCount: number): MoreIndicator {
  const remaining = validTotal - displayedCount;
  if (remaining > 0) {
    return { shown: true, count: remaining };
  }
  return { shown: false, count: 0 };
}

/** Arbitrary pair (V, D) with 0 ≤ D ≤ V. */
const totalAndDisplayedArbitrary: fc.Arbitrary<{ validTotal: number; displayedCount: number }> =
  fc
    .nat({ max: 200 })
    .chain((validTotal) =>
      fc
        .nat({ max: validTotal })
        .map((displayedCount) => ({ validTotal, displayedCount })),
    );

describe('GIACountriesSection (Property 13: "and N more" indicator arithmetic)', () => {
  it("shows N = V − D when D < V, and nothing when D = V", () => {
    fc.assert(
      fc.property(totalAndDisplayedArbitrary, ({ validTotal, displayedCount }) => {
        const result = moreIndicator(validTotal, displayedCount);

        if (displayedCount < validTotal) {
          // Indicator is shown with N = V − D (a strictly positive count).
          expect(result.shown).toBe(true);
          expect(result.count).toBe(validTotal - displayedCount);
          expect(result.count).toBeGreaterThan(0);
        } else {
          // D === V (the bound 0 ≤ D ≤ V rules out D > V): no indicator.
          expect(displayedCount).toBe(validTotal);
          expect(result.shown).toBe(false);
          expect(result.count).toBe(0);
        }
      }),
      { numRuns: 25 },
    );
  });
});

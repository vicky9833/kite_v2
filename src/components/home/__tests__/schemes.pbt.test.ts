import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { filterSchemes, type SchemeFilterTab } from "@/lib/utils";
import { schemes as realSchemes } from "@/data/schemes";
import type { Scheme, SchemeType } from "@/types";

// Feature: kite-foundation-home, Property 8: Scheme filtering selects by type

/**
 * The concrete scheme types and the filter tabs. "All" is the identity tab;
 * "fiscal" and "grant" each select exactly their matching subset.
 */
const SCHEME_TYPES: readonly SchemeType[] = ["fiscal", "grant"];
const FILTER_TABS: readonly SchemeFilterTab[] = ["All", "fiscal", "grant"];

/**
 * Arbitrary producing a Scheme-like record. Only `type` matters to the filter
 * under test; the remaining required fields are filled with minimal valid
 * (non-empty) strings/arrays so the record is a structurally complete `Scheme`.
 */
const schemeArbitrary: fc.Arbitrary<Scheme> = fc
  .tuple(
    fc.constantFrom<SchemeType>(...SCHEME_TYPES),
    fc.string({ minLength: 1 }),
  )
  .map(([type, id]) => ({
    id,
    name: `scheme-${id}`,
    type,
    shortDescription: "desc",
    amount: "amount",
    maxBenefit: "maxBenefit",
    duration: "duration",
    eligibility: ["eligible"],
    documents: ["doc"],
    status: "open" as const,
  }));

const schemeListArbitrary: fc.Arbitrary<Scheme[]> = fc.array(schemeArbitrary, {
  maxLength: 20,
});

describe("filterSchemes (Property 8: scheme filtering selects by type)", () => {
  it("partitions exactly by the selected tab", () => {
    fc.assert(
      fc.property(
        schemeListArbitrary,
        fc.constantFrom<SchemeFilterTab>(...FILTER_TABS),
        (schemes, tab) => {
          const visible = filterSchemes(schemes, tab);
          const visibleSet = new Set(visible);

          if (tab === "All") {
            // "All" → identity: the visible set equals the full set.
            expect(visible.length).toBe(schemes.length);
            expect(visible).toEqual(schemes);
            return;
          }

          // Every SHOWN scheme has exactly the selected type.
          for (const scheme of visible) {
            expect(scheme.type).toBe(tab);
          }

          // Every HIDDEN scheme does NOT have the selected type.
          for (const scheme of schemes) {
            if (visibleSet.has(scheme)) continue;
            expect(scheme.type).not.toBe(tab);
          }

          // Precise partition: visible count == count of schemes of that type.
          const expectedCount = schemes.filter((s) => s.type === tab).length;
          expect(visible.length).toBe(expectedCount);
        },
      ),
      { numRuns: 25 },
    );
  });

  it("partitions the real schemes module by each tab (sanity check)", () => {
    expect(filterSchemes(realSchemes, "All")).toEqual(realSchemes);

    for (const tab of SCHEME_TYPES) {
      const visible = filterSchemes(realSchemes, tab);
      expect(visible.every((scheme) => scheme.type === tab)).toBe(true);
      expect(visible.length).toBe(
        realSchemes.filter((scheme) => scheme.type === tab).length,
      );
    }
  });
});

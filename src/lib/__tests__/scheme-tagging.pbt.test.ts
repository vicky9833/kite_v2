// src/lib/__tests__/scheme-tagging.pbt.test.ts
//
// Property-based tests for the pure scheme-tagging badge helper.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  WOMEN_PREFERENCE_SCHEME_IDS,
  CSR_ALIGNED_SCHEME_IDS,
  GRASSROOTS_FRIENDLY_SCHEME_IDS,
  hasSchemeBadge,
  type SchemeBadge,
} from "@/lib/scheme-tagging";
import { schemes } from "@/data/schemes";

const BADGES: readonly SchemeBadge[] = [
  "Women Preference",
  "CSR-Aligned",
  "Grassroots Friendly",
];

const BADGE_SETS: Record<SchemeBadge, readonly string[]> = {
  "Women Preference": WOMEN_PREFERENCE_SCHEME_IDS,
  "CSR-Aligned": CSR_ALIGNED_SCHEME_IDS,
  "Grassroots Friendly": GRASSROOTS_FRIENDLY_SCHEME_IDS,
};

const REAL_SCHEME_IDS = new Set(schemes.map((scheme) => scheme.id));

// All documented badge ids across the three sets.
const ALL_BADGE_IDS = [
  ...WOMEN_PREFERENCE_SCHEME_IDS,
  ...CSR_ALIGNED_SCHEME_IDS,
  ...GRASSROOTS_FRIENDLY_SCHEME_IDS,
];

describe("scheme-tagging", () => {
  // Feature: kite-inclusion-grassroots, Property 16
  // hasSchemeBadge(id, badge) is true exactly when id is a member of that
  // badge's documented set; every id in all three sets exists in schemes.ts
  // (Scheme_Data); and none equals the literal 'rural-innovation-center'.
  // Validates: Requirements 10.2, 10.6, 18.2, 18.4, 31.2, 31.3, 38.2
  it("Property 16: tagging is sound and references only real schemes", () => {
    // Generator covers documented badge ids, real scheme ids, and arbitrary
    // strings so the membership equivalence is exercised on hits and misses.
    const idArb = fc.oneof(
      fc.constantFrom(...ALL_BADGE_IDS),
      fc.constantFrom(...schemes.map((scheme) => scheme.id)),
      fc.string(),
      fc.constant("rural-innovation-center"),
    );

    fc.assert(
      fc.property(idArb, fc.constantFrom(...BADGES), (id, badge) => {
        const expected = BADGE_SETS[badge].includes(id);
        expect(hasSchemeBadge(id, badge)).toBe(expected);
      }),
      { numRuns: 100 },
    );

    // Every documented id across all three sets exists in Scheme_Data and is
    // never the non-existent 'rural-innovation-center' literal.
    for (const id of ALL_BADGE_IDS) {
      expect(REAL_SCHEME_IDS.has(id)).toBe(true);
      expect(id).not.toBe("rural-innovation-center");
    }
  });
});

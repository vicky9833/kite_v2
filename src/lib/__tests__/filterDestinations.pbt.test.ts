import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { filterDestinations } from "@/lib/utils";
import type { NavItem } from "@/types";

// Feature: kite-foundation-home, Property 2: Command palette filters by case-insensitive substring

/**
 * Arbitrary producing a single NavItem-like destination. Labels intentionally
 * span mixed case, unicode, spaces, and the empty string so the substring
 * predicate is exercised across the full input space; every item also carries a
 * valid-looking internal href (irrelevant to filtering, present for realism).
 */
const labelArbitrary: fc.Arbitrary<string> = fc.oneof(
  fc.string(), // arbitrary (includes empty, ascii, control chars)
  fc.string({ minLength: 1 }).map((s) => s.toUpperCase()),
  fc.string({ minLength: 1 }).map((s) => s.toLowerCase()),
  fc.constantFrom(
    "",
    "Startups",
    "ALL SCHEMES",
    "Women Hub",
    "Idea Bank",
    "Market Access & GIA",
    "café münchen",
    "  spaced  label  ",
    "ಕನ್ನಡ",
    "日本語ナビ",
  ),
);

const navItemArbitrary: fc.Arbitrary<NavItem> = fc.record({
  label: labelArbitrary,
  href: fc
    .string({ minLength: 1 })
    .filter((s) => !s.includes("/"))
    .map((segment) => `/${segment}`),
});

const listArbitrary: fc.Arbitrary<NavItem[]> = fc.array(navItemArbitrary, {
  maxLength: 12,
});

/**
 * Query arbitrary. To guarantee real matches occur (not just empty results), it
 * sometimes derives the query from a substring of an existing label — at varied
 * casing — alongside empty/whitespace/unicode and fully random strings.
 */
function queryArbitrary(list: NavItem[]): fc.Arbitrary<string> {
  const generators: fc.Arbitrary<string>[] = [
    fc.string(),
    fc.constantFrom("", " ", "   ", "\t", "\n", "  \t \n "),
    fc.constantFrom(" café", "ಕನ್ನಡ", "日本", "MÜNCHEN"),
  ];

  // Derive a query from a substring of some non-empty label so matches happen.
  const nonEmptyLabels = list.map((i) => i.label).filter((l) => l.length > 0);
  if (nonEmptyLabels.length > 0) {
    generators.push(
      fc
        .constantFrom(...nonEmptyLabels)
        .chain((label) =>
          fc
            .tuple(
              fc.nat({ max: Math.max(0, label.length - 1) }),
              fc.integer({ min: 1, max: label.length }),
            )
            .map(([start, len]) => label.slice(start, start + len)),
        )
        // Vary the casing of the derived substring.
        .chain((sub) =>
          fc.constantFrom(sub, sub.toUpperCase(), sub.toLowerCase()),
        ),
    );
  }

  return fc.oneof(...generators);
}

describe("filterDestinations (Property 2: case-insensitive substring filter)", () => {
  it("partitions exactly by the case-insensitive substring predicate", () => {
    fc.assert(
      fc.property(
        listArbitrary.chain((list) =>
          queryArbitrary(list).map((query) => ({ list, query })),
        ),
        ({ list, query }) => {
          const normalized = query.trim().toLowerCase();
          const result = filterDestinations(list, query);
          const resultSet = new Set(result);

          // Every SHOWN item's label contains the normalized query.
          for (const item of result) {
            expect(item.label.toLowerCase().includes(normalized)).toBe(true);
          }

          // Every EXCLUDED item's label does NOT contain the normalized query —
          // unless the normalized query is empty, in which case nothing is
          // excluded (the full list is returned).
          for (const item of list) {
            if (resultSet.has(item)) continue;
            // If it was excluded, it must fail the predicate.
            expect(item.label.toLowerCase().includes(normalized)).toBe(false);
          }

          // When the normalized query is empty, the full list is returned.
          if (normalized.length === 0) {
            expect(result.length).toBe(list.length);
          }
        },
      ),
      { numRuns: 25 },
    );
  });
});

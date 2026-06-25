import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { isPlaceholder } from "@/lib/utils";

import { schemes } from "@/data/schemes";
import { clusters } from "@/data/clusters";
import { policies } from "@/data/policies";
import { giaCountries } from "@/data/gia-countries";
import { sectors } from "@/data/sectors";
import { quickActions } from "@/data/quick-actions";
import { flagshipPrograms } from "@/data/flagship-programs";
import { partnerLogos } from "@/data/social-proof";
import { ecosystemStats } from "@/data/ecosystem-stats";
import { events } from "@/data/events";
import { incubators } from "@/data/incubators";

// Feature: kite-foundation-home, Property 16: No placeholder or fabricated content

/**
 * Recursively collect every string value reachable from `value`. This walks
 * arrays (covering `string[]` fields and the data collections themselves) and
 * plain objects (covering each record's string fields, including optional
 * fields that are only present on some records). Non-string leaves (numbers,
 * booleans, null/undefined) are ignored — Property 16 only constrains string
 * content.
 */
function collectStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectStrings(entry));
  }
  if (value !== null && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((entry) =>
      collectStrings(entry),
    );
  }
  return [];
}

/**
 * Every authored string across ALL data modules, flattened into one list.
 * Optional fields contribute only when present (absent keys yield no entries),
 * and `string[]` field entries are included individually.
 */
const allStrings: readonly string[] = [
  schemes,
  clusters,
  policies,
  giaCountries,
  sectors,
  quickActions,
  flagshipPrograms,
  partnerLogos,
  ecosystemStats,
  events,
  incubators,
].flatMap((collection) => collectStrings(collection));

describe("data modules contain no placeholder content (Property 16)", () => {
  it("never authors a placeholder or fabricated string field", () => {
    // Guard: the corpus must be non-empty, otherwise the index property would
    // pass vacuously and silently stop protecting the data layer.
    expect(allStrings.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.nat({ max: allStrings.length - 1 }),
        (index) => {
          const value = allStrings[index] as string;
          expect(isPlaceholder(value)).toBe(false);
        },
      ),
      { numRuns: 25 },
    );
  });
});

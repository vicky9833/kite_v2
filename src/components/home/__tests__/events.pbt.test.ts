import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { selectPreview } from "@/lib/utils";
import { events } from "@/data/events";
import type { EcosystemEvent, EventCategory } from "@/types";

// Feature: kite-foundation-home, Property 11: Events preview is sorted and bounded

/** The fixed set of allowed event categories (for minimal valid records). */
const CATEGORIES: readonly EventCategory[] = [
  "summit",
  "demo-day",
  "hackathon",
  "convening",
  "masterclass",
];

/**
 * Arbitrary producing a valid ISO-8601 date string (YYYY-MM-DD). The day/month
 * ranges are intentionally clamped so every generated value is a real,
 * lexicographically-orderable date — `selectPreview` sorts on the raw string,
 * and zero-padded ISO dates sort identically to chronological order.
 */
const isoDateArbitrary: fc.Arbitrary<string> = fc
  .tuple(
    fc.integer({ min: 2024, max: 2030 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
  )
  .map(([year, month, day]) => {
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  });

/**
 * Arbitrary for a single EcosystemEvent-like record. `startDate` varies widely
 * (driving unsorted order and duplicate dates across an array); the remaining
 * required fields are minimal valid non-empty values.
 */
const eventArbitrary: fc.Arbitrary<EcosystemEvent> = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  startDate: isoDateArbitrary,
  endDate: isoDateArbitrary,
  location: fc.string({ minLength: 1 }),
  category: fc.constantFrom(...CATEGORIES),
  description: fc.string({ minLength: 1 }),
  href: fc.string({ minLength: 1 }).map((segment) => `/events/${segment}`),
});

/**
 * Arbitrary for a source array of at least 6 events (up to ~20). Generating at
 * least 6 guarantees the preview can reach its [4,6] band; duplicate dates and
 * unsorted insertion order arise naturally from the per-element generator.
 */
const eventsSourceArbitrary: fc.Arbitrary<EcosystemEvent[]> = fc.array(
  eventArbitrary,
  { minLength: 6, maxLength: 20 },
);

/** True iff `list` is ordered ascending by `startDate` (string compare). */
function isSortedAscending(list: EcosystemEvent[]): boolean {
  for (let i = 1; i < list.length; i += 1) {
    if (list[i - 1]!.startDate > list[i]!.startDate) {
      return false;
    }
  }
  return true;
}

describe("selectPreview (Property 11: sorted and bounded events preview)", () => {
  it("returns a sorted, bounded subset of any source array of >=6 events", () => {
    fc.assert(
      fc.property(eventsSourceArbitrary, (source) => {
        const result = selectPreview(source);

        // (c) length between 4 and 6 inclusive.
        expect(result.length).toBeGreaterThanOrEqual(4);
        expect(result.length).toBeLessThanOrEqual(6);

        // (b) ordered ascending by startDate.
        expect(isSortedAscending(result)).toBe(true);

        // (a) every result item is present in the source.
        for (const item of result) {
          expect(source.includes(item)).toBe(true);
        }
      }),
      { numRuns: 25 },
    );
  });

  it("sanity: the real events dataset yields a sorted, bounded preview", () => {
    const result = selectPreview(events);

    expect(result.length).toBeGreaterThanOrEqual(4);
    expect(result.length).toBeLessThanOrEqual(6);
    expect(isSortedAscending(result)).toBe(true);
    for (const item of result) {
      expect(events.includes(item)).toBe(true);
    }
  });
});

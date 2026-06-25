// src/lib/__tests__/verified-data-integrity.pbt.test.ts
//
// Property-based test for verified-incubator-data integrity through the pure
// filter pipeline and the synthetic detail generator.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { incubators } from "@/data/incubators";
import { filterIncubators } from "@/lib/incubator-filters";
import { generateIncubatorDetail } from "@/lib/synthetic-incubator-detail";
import type { IncubatorFilters, IncubatorType } from "@/types";

// Distinct verified values used to build realistic, occasionally-matching
// filter selections (plus `null` = inactive on each dimension).
const CLUSTERS = Array.from(new Set(incubators.map((i) => i.cluster)));
const FOCUSES = Array.from(new Set(incubators.flatMap((i) => i.focus)));
const TYPES: IncubatorType[] = ["Incubator", "Accelerator", "Research Park"];

// The verified field names that MUST NEVER appear on the illustrative detail.
const VERIFIED_FIELDS = ["name", "cluster", "type", "focus"] as const;
// The exact (and only) shape of the illustrative detail.
const DETAIL_KEYS = [
  "incubatorId",
  "aboutParagraph",
  "cohortsPerYear",
  "startupsSupported",
  "illustrativeOfferings",
  "illustrativeContactLabel",
].sort();

// An arbitrary IncubatorFilters drawing from real values so filters sometimes
// match and sometimes don't; `null` means inactive on that dimension.
const filtersArb: fc.Arbitrary<IncubatorFilters> = fc.record({
  cluster: fc.option(fc.constantFrom(...CLUSTERS), { nil: null }),
  focus: fc.option(fc.constantFrom(...FOCUSES), { nil: null }),
  type: fc.option(fc.constantFrom(...TYPES), { nil: null }),
});

describe("verified-data-integrity", () => {
  // Feature: kite-ecosystem-enablement, Property 10
  // For any incubator record passed through filterIncubators and/or the detail
  // generator, name/cluster/type are unaltered character-for-character and
  // focus[] is preserved exactly in stored order (one tag per entry, never
  // altered or reordered). The synthetic detail neither includes nor mutates
  // the verified fields.
  it("Property 10: verified name/cluster/type/focus survive filtering & detail verbatim", () => {
    // Snapshot the source data deeply so we can detect any mutation afterwards.
    const sourceSnapshot = incubators.map((i) => ({
      id: i.id,
      name: i.name,
      cluster: i.cluster,
      type: i.type,
      focus: [...i.focus],
    }));
    const byId = new Map(incubators.map((i) => [i.id, i]));

    fc.assert(
      fc.property(filtersArb, (filters) => {
        const result = filterIncubators(incubators, filters);

        // Result is a subset preserving source order.
        const sourceIndex = new Map(incubators.map((rec, idx) => [rec, idx]));
        let lastIdx = -1;
        for (const rec of result) {
          const idx = sourceIndex.get(rec);
          // Same object reference must come from the source array.
          expect(idx).toBeDefined();
          expect(idx as number).toBeGreaterThan(lastIdx);
          lastIdx = idx as number;
        }

        for (const rec of result) {
          const original = byId.get(rec.id);
          expect(original).toBeDefined();

          // filterIncubators returns the SAME object references.
          expect(rec).toBe(original);

          // name/cluster/type unaltered character-for-character.
          expect(rec.name).toBe(original!.name);
          expect(rec.cluster).toBe(original!.cluster);
          expect(rec.type).toBe(original!.type);

          // focus[] preserved exactly in stored order: one tag per entry,
          // never altered or reordered.
          expect(rec.focus).toEqual(original!.focus);
          rec.focus.forEach((tag, i) => {
            expect(tag).toBe(original!.focus[i]);
          });

          // The synthetic detail must NOT carry or mutate verified fields.
          const detail = generateIncubatorDetail(rec.id);
          expect(detail.incubatorId).toBe(rec.id);
          // Shape carries only incubatorId + illustrative fields.
          expect(Object.keys(detail).sort()).toEqual(DETAIL_KEYS);
          for (const field of VERIFIED_FIELDS) {
            expect(field in detail).toBe(false);
          }

          // Generating the detail did not mutate the verified record.
          expect(rec.name).toBe(original!.name);
          expect(rec.cluster).toBe(original!.cluster);
          expect(rec.type).toBe(original!.type);
          expect(rec.focus).toEqual(original!.focus);
        }
      }),
      { numRuns: 100 },
    );

    // Nothing in the source verified dataset changed across all runs.
    const after = incubators.map((i) => ({
      id: i.id,
      name: i.name,
      cluster: i.cluster,
      type: i.type,
      focus: [...i.focus],
    }));
    expect(after).toEqual(sourceSnapshot);
  });
});

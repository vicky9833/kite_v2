import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { flagshipPrograms } from "@/data/flagship-programs";
import type { ProgramStatus } from "@/types";

// Feature: kite-foundation-home, Property 6: Flagship program field validity

/** The fixed, exhaustive set of allowed ProgramStatus values. */
const ALLOWED_STATUSES: readonly ProgramStatus[] = ["active", "upcoming"];

/**
 * Arbitrary selecting a valid index into the flagshipPrograms array. Using an
 * index (rather than constantFrom over the objects) keeps the generator tied to
 * the real, ordered dataset and exercises every entry across runs.
 */
const indexArbitrary: fc.Arbitrary<number> = fc.nat({
  max: Math.max(0, flagshipPrograms.length - 1),
});

describe("flagshipPrograms (Property 6: field validity)", () => {
  it("every program has a valid description, status, and non-empty display fields", () => {
    fc.assert(
      fc.property(indexArbitrary, (index) => {
        const program = flagshipPrograms[index];
        expect(program).toBeDefined();
        if (!program) return;

        // description: non-empty and at most 300 characters.
        expect(program.description.length).toBeGreaterThanOrEqual(1);
        expect(program.description.length).toBeLessThanOrEqual(300);

        // status: a member of the fixed ProgramStatus set.
        expect(ALLOWED_STATUSES).toContain(program.status);

        // Remaining display fields must be non-empty for good measure.
        expect(program.name.length).toBeGreaterThanOrEqual(1);
        expect(program.tagline.length).toBeGreaterThanOrEqual(1);
        expect(program.keyMetric.length).toBeGreaterThanOrEqual(1);
        expect(program.ctaLabel.length).toBeGreaterThanOrEqual(1);
        expect(program.href.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 25 },
    );
  });
});

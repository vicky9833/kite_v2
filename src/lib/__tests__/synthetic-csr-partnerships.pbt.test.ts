// src/lib/__tests__/synthetic-csr-partnerships.pbt.test.ts
//
// Property-based tests for the synthetic CSR partnership preview module.

import { afterEach, describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { CSR_PARTNER_TYPES } from "@/types";
import { generateCsrPartnerships } from "@/lib/synthetic-csr-partnerships";

describe("synthetic-csr-partnerships", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Feature: kite-inclusion-grassroots, Property 6
  // generateCsrPartnerships() returns EXACTLY 6 CsrPartnership records; each has
  // a non-empty partnerName, a partnerType drawn from the four canonical
  // CSR_PARTNER_TYPES, a non-empty focusArea, a numeric scaleCrore, and a
  // non-empty partnershipType.
  it("Property 6: exactly 6 well-formed CSR partnership records", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const partnerships = generateCsrPartnerships();

        // Exactly 6 records (Req 5.2).
        expect(partnerships).toHaveLength(6);

        for (const partnership of partnerships) {
          expect(partnership.id.trim().length).toBeGreaterThan(0);
          expect(partnership.partnerName.trim().length).toBeGreaterThan(0);

          // partnerType is one of the four canonical values.
          expect(CSR_PARTNER_TYPES).toContain(partnership.partnerType);

          expect(partnership.focusArea.trim().length).toBeGreaterThan(0);

          // scaleCrore is a finite number.
          expect(typeof partnership.scaleCrore).toBe("number");
          expect(Number.isFinite(partnership.scaleCrore)).toBe(true);

          expect(partnership.partnershipType.trim().length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-inclusion-grassroots, Property 7
  // Deterministic & ambient-free: repeated calls deep-equal, even across a faked
  // system clock and after a Math.random perturbation. The generator never
  // consults Math.random or the system clock.
  it("Property 7: deterministic & ambient-free", () => {
    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not be used by synthetic CSR partnerships");
    });

    // Byte-stable across repeated calls, regardless of the system clock.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const previewEarly = generateCsrPartnerships();
    vi.setSystemTime(new Date("2099-12-31T23:59:59Z"));
    const previewLate = generateCsrPartnerships();
    vi.useRealTimers();

    expect(previewLate).toEqual(previewEarly);
    expect(generateCsrPartnerships()).toEqual(generateCsrPartnerships());

    // Determinism across arbitrary call counts / interleavings.
    fc.assert(
      fc.property(fc.nat({ max: 5 }), () => {
        expect(generateCsrPartnerships()).toEqual(generateCsrPartnerships());
      }),
      { numRuns: 100 },
    );

    expect(randomSpy).not.toHaveBeenCalled();
  });
});

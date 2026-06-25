// src/lib/__tests__/synthetic-ngo-partners.pbt.test.ts
//
// Property-based tests for the synthetic NGO partner module.

import { afterEach, describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import {
  generateNgoPartner,
  generateNgoPartners,
  NGO_PARTNER_COUNT,
} from "@/lib/synthetic-ngo-partners";

describe("synthetic-ngo-partners", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Feature: kite-inclusion-grassroots, Property 6
  // generateNgoPartners() returns at least 3 NgoPartner records; each has a
  // non-empty name, focus, geographicReach, and partnershipType.
  it("Property 6: returns >= 3 well-formed NGO partner records", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const partners = generateNgoPartners();

        expect(partners.length).toBeGreaterThanOrEqual(3);
        expect(partners.length).toBe(NGO_PARTNER_COUNT);

        for (const partner of partners) {
          expect(partner.name.trim().length).toBeGreaterThan(0);
          expect(partner.focus.trim().length).toBeGreaterThan(0);
          expect(partner.geographicReach.trim().length).toBeGreaterThan(0);
          expect(partner.partnershipType.trim().length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );

    // Well-formedness also holds for arbitrary per-record keys.
    fc.assert(
      fc.property(fc.string(), (key) => {
        const partner = generateNgoPartner(key);
        expect(partner.name.trim().length).toBeGreaterThan(0);
        expect(partner.focus.trim().length).toBeGreaterThan(0);
        expect(partner.geographicReach.trim().length).toBeGreaterThan(0);
        expect(partner.partnershipType.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-inclusion-grassroots, Property 7
  // Synthetic generation is deterministic and ambient-free: repeated calls are
  // deep-equal regardless of system clock, and Math.random is never consulted.
  it("Property 7: deterministic & ambient-free", () => {
    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not be used by synthetic NGO partners");
    });

    // Byte-stable across repeated calls, regardless of the system clock.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const partnersEarly = generateNgoPartners();
    vi.setSystemTime(new Date("2099-12-31T23:59:59Z"));
    const partnersLate = generateNgoPartners();
    vi.useRealTimers();

    expect(partnersLate).toEqual(partnersEarly);
    expect(generateNgoPartners()).toEqual(generateNgoPartners());

    // Determinism for arbitrary keys: same key -> deep-equal output.
    fc.assert(
      fc.property(fc.string(), (key) => {
        expect(generateNgoPartner(key)).toEqual(generateNgoPartner(key));
      }),
      { numRuns: 100 },
    );

    // No reliance on call order: generating keys in different orders yields
    // identical per-key records.
    fc.assert(
      fc.property(fc.uniqueArray(fc.string(), { minLength: 1 }), (keys) => {
        const forward = keys.map((k) => generateNgoPartner(k));
        const reversed = [...keys].reverse().map((k) => generateNgoPartner(k));
        reversed.reverse();
        expect(reversed).toEqual(forward);
      }),
      { numRuns: 100 },
    );

    expect(randomSpy).not.toHaveBeenCalled();
  });
});

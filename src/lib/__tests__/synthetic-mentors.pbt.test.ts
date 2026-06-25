// src/lib/__tests__/synthetic-mentors.pbt.test.ts
//
// Property-based tests for the synthetic mentor directory module.

import { afterEach, describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import {
  generateMentor,
  generateMentors,
  getMentorCount,
} from "@/lib/synthetic-mentors";
import { MENTOR_AVAILABILITY, MENTOR_TYPES } from "@/types";
import { sectors } from "@/data/sectors";

const CANONICAL_SECTOR_IDS = sectors.map((sector) => sector.id);

describe("synthetic-mentors", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Feature: kite-ecosystem-enablement, Property 1
  // generateMentors() returns deep-equal output on repeated calls;
  // generateMentor(key) is deep-equal across calls for arbitrary keys and
  // independent of call order — and consults no ambient/time input.
  it("Property 1: deterministic & ambient-free", () => {
    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not be used by synthetic mentors");
    });

    // generateMentors() is byte-stable across repeated calls, regardless of
    // the system clock (time-independence).
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const directoryEarly = generateMentors();
    vi.setSystemTime(new Date("2099-12-31T23:59:59Z"));
    const directoryLate = generateMentors();
    vi.useRealTimers();
    expect(directoryLate).toEqual(directoryEarly);
    expect(generateMentors()).toEqual(generateMentors());

    fc.assert(
      fc.property(fc.string(), (key) => {
        // Determinism for arbitrary keys: same key -> deep-equal output.
        expect(generateMentor(key)).toEqual(generateMentor(key));
      }),
      { numRuns: 100 },
    );

    // No reliance on call order: generating keys in different orders yields
    // identical per-key profiles.
    fc.assert(
      fc.property(fc.uniqueArray(fc.string(), { minLength: 1 }), (keys) => {
        const forward = keys.map((k) => generateMentor(k));
        const reversed = [...keys].reverse().map((k) => generateMentor(k));
        reversed.reverse();
        expect(reversed).toEqual(forward);
      }),
      { numRuns: 100 },
    );

    expect(randomSpy).not.toHaveBeenCalled();
  });

  // Feature: kite-ecosystem-enablement, Property 2
  // generateMentors() length is in [24, 30] inclusive (and matches getMentorCount).
  it("Property 2: directory length is within [24, 30]", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const count = getMentorCount();
        expect(count).toBeGreaterThanOrEqual(24);
        expect(count).toBeLessThanOrEqual(30);

        const directory = generateMentors();
        expect(directory.length).toBe(count);
        expect(directory.length).toBeGreaterThanOrEqual(24);
        expect(directory.length).toBeLessThanOrEqual(30);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-ecosystem-enablement, Property 3
  // Every generated MentorProfile is well-formed.
  it("Property 3: every mentor profile is well-formed", () => {
    const sectorIdSet = new Set(CANONICAL_SECTOR_IDS);

    fc.assert(
      fc.property(fc.string(), (key) => {
        const mentor = generateMentor(key);

        // Non-empty identity/editorial fields.
        expect(mentor.name.trim().length).toBeGreaterThan(0);
        expect(mentor.title.trim().length).toBeGreaterThan(0);
        expect(mentor.firm.trim().length).toBeGreaterThan(0);
        expect(mentor.bio.trim().length).toBeGreaterThan(0);

        // Sectors: non-empty AND a subset of the 20 canonical sector ids.
        expect(mentor.sectors.length).toBeGreaterThan(0);
        for (const sectorId of mentor.sectors) {
          expect(sectorIdSet.has(sectorId)).toBe(true);
        }

        // yearsExperience: a positive integer.
        expect(Number.isInteger(mentor.yearsExperience)).toBe(true);
        expect(mentor.yearsExperience).toBeGreaterThan(0);

        // Enumerations.
        expect(MENTOR_TYPES).toContain(mentor.mentorType);
        expect(MENTOR_AVAILABILITY).toContain(mentor.availability);

        // initialsAvatar: 1–2 uppercase letters.
        expect(mentor.initialsAvatar).toMatch(/^[A-Z]{1,2}$/);
      }),
      { numRuns: 100 },
    );

    // Also enforce well-formedness across the full generated directory.
    for (const mentor of generateMentors()) {
      expect(mentor.sectors.length).toBeGreaterThan(0);
      for (const sectorId of mentor.sectors) {
        expect(sectorIdSet.has(sectorId)).toBe(true);
      }
      expect(mentor.initialsAvatar).toMatch(/^[A-Z]{1,2}$/);
    }
  });
});

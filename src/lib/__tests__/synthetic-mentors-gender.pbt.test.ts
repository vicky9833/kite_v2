// src/lib/__tests__/synthetic-mentors-gender.pbt.test.ts
//
// Property-based tests for the additive `illustrativeGender` extension to the
// synthetic mentor directory (kite-inclusion-grassroots, Req 6.2, 6.3).
//
// NOTE on framing: `illustrativeGender` is an ILLUSTRATIVE label on synthetic
// preview data — it is NOT a demographic claim about any real person. These
// tests therefore assert only on (a) the value domain {'woman','man'},
// (b) determinism/ambient-freedom, and (c) the realized distribution across the
// generated directory; they make no claim beyond that realized distribution.

import { afterEach, describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { generateMentor, generateMentors } from "@/lib/synthetic-mentors";

const VALID_GENDERS = ["woman", "man"] as const;

describe("synthetic-mentors illustrativeGender", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Feature: kite-inclusion-grassroots, Property 8
  // Every generated MentorProfile carries a deterministic illustrativeGender in
  // {'woman','man'}; the realized women fraction across generateMentors() is
  // within [0.35, 0.40] inclusive (an illustrative-distribution assertion only).
  // Validates: Requirements 6.2, 6.3
  it("Property 8: every profile has a gender in {'woman','man'} and the realized women fraction is within [0.35, 0.40]", () => {
    // (a) Domain check across arbitrary per-mentor keys: the label is always one
    // of the two illustrative values and is deterministic for a given key.
    fc.assert(
      fc.property(fc.string(), (key) => {
        const mentor = generateMentor(key);
        expect(VALID_GENDERS).toContain(mentor.illustrativeGender);
        // Deterministic per key.
        expect(generateMentor(key).illustrativeGender).toBe(
          mentor.illustrativeGender,
        );
      }),
      { numRuns: 100 },
    );

    // (b) Realized-distribution check on the actual directory. The directory is
    // deterministic, so this is a fixed fact; wrapping it in fc.property simply
    // re-affirms stability across runs.
    fc.assert(
      fc.property(fc.constant(null), () => {
        const directory = generateMentors();
        expect(directory.length).toBeGreaterThan(0);

        for (const mentor of directory) {
          expect(VALID_GENDERS).toContain(mentor.illustrativeGender);
        }

        const womenCount = directory.filter(
          (mentor) => mentor.illustrativeGender === "woman",
        ).length;
        const womenFraction = womenCount / directory.length;

        expect(womenFraction).toBeGreaterThanOrEqual(0.35);
        expect(womenFraction).toBeLessThanOrEqual(0.4);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-inclusion-grassroots, Property 7
  // Deterministic & ambient-free: generateMentors() is deep-equal across calls
  // regardless of the system clock, never consults Math.random, and each
  // profile's illustrativeGender is stable per key.
  // Validates: Requirements 6.2, 6.3
  it("Property 7: illustrativeGender is deterministic & ambient-free", () => {
    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not be used by synthetic mentors");
    });

    // Byte-stable across calls, independent of the system clock.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const directoryEarly = generateMentors();
    vi.setSystemTime(new Date("2099-12-31T23:59:59Z"));
    const directoryLate = generateMentors();
    vi.useRealTimers();

    expect(directoryLate).toEqual(directoryEarly);
    expect(directoryEarly.map((m) => m.illustrativeGender)).toEqual(
      directoryLate.map((m) => m.illustrativeGender),
    );

    // Per-key stability of the gender label across arbitrary keys.
    fc.assert(
      fc.property(fc.string(), (key) => {
        expect(generateMentor(key).illustrativeGender).toBe(
          generateMentor(key).illustrativeGender,
        );
      }),
      { numRuns: 100 },
    );

    expect(randomSpy).not.toHaveBeenCalled();
  });
});

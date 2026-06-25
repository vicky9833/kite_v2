// src/lib/__tests__/synthetic-ideas.pbt.test.ts
//
// Property-based tests for the synthetic seed-ideas module that powers the
// Public_Ideas_Board.

import { afterEach, describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { generateSeedIdeas, getSeedIdeaCount } from "@/lib/synthetic-ideas";
import { IDEA_ID_PATTERN } from "@/lib/idea-id-generator";
import { IDEA_CATEGORIES, INNOVATOR_TYPES } from "@/types";
import { schemes } from "@/data/schemes";

const REAL_SCHEME_IDS = new Set(schemes.map((scheme) => scheme.id));

// A submittedAt is a valid ISO 8601 instant when it round-trips through Date
// without producing NaN and re-serialises to the exact same string.
function isValidIso(value: string): boolean {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return false;
  }
  return new Date(parsed).toISOString() === value;
}

describe("synthetic-ideas", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Feature: kite-inclusion-grassroots, Property 6
  // generateSeedIdeas() returns between 12 and 18 records inclusive; each has a
  // well-formed ideaId, a matchedSchemeIds array of only real scheme ids,
  // status 'submitted', a valid ISO submittedAt, and all board-rendered fields.
  // Validates: Requirements 5.4, 5.6, 5.8
  it("Property 6: every seed idea is well-formed", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const ideas = generateSeedIdeas();

        // Count is within [12, 18] inclusive and matches getSeedIdeaCount().
        expect(ideas.length).toBe(getSeedIdeaCount());
        expect(ideas.length).toBeGreaterThanOrEqual(12);
        expect(ideas.length).toBeLessThanOrEqual(18);

        for (const idea of ideas) {
          // Well-formed ideaId.
          expect(idea.ideaId).toMatch(IDEA_ID_PATTERN);

          // matchedSchemeIds is an array whose every id is a REAL scheme id.
          expect(Array.isArray(idea.matchedSchemeIds)).toBe(true);
          for (const schemeId of idea.matchedSchemeIds) {
            expect(REAL_SCHEME_IDS.has(schemeId)).toBe(true);
          }

          // Status and a valid ISO submittedAt.
          expect(idea.status).toBe("submitted");
          expect(isValidIso(idea.submittedAt)).toBe(true);

          // All board-rendered fields present and well-typed.
          expect(idea.ideaTitle.trim().length).toBeGreaterThan(0);
          expect(IDEA_CATEGORIES).toContain(idea.ideaCategory);
          expect(INNOVATOR_TYPES).toContain(idea.innovatorType);
          expect(idea.location.trim().length).toBeGreaterThan(0);
          expect(idea.ideaSummary.trim().length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-inclusion-grassroots, Property 7
  // Deterministic & ambient-free: generateSeedIdeas() returns deep-equal output
  // on repeated calls across a faked clock and with Math.random spied to throw.
  // Validates: Requirements 5.5, 5.7
  it("Property 7: deterministic & ambient-free", () => {
    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not be used by synthetic ideas");
    });

    // Byte-stable across the system clock (time-independence).
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const ideasEarly = generateSeedIdeas();
    vi.setSystemTime(new Date("2099-12-31T23:59:59Z"));
    const ideasLate = generateSeedIdeas();
    vi.useRealTimers();

    expect(ideasLate).toEqual(ideasEarly);
    expect(generateSeedIdeas()).toEqual(generateSeedIdeas());

    fc.assert(
      fc.property(fc.constant(null), () => {
        expect(generateSeedIdeas()).toEqual(ideasEarly);
        expect(getSeedIdeaCount()).toBe(ideasEarly.length);
      }),
      { numRuns: 100 },
    );

    expect(randomSpy).not.toHaveBeenCalled();
  });
});

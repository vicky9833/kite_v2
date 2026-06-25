// Feature: kite-ecosystem-enablement
//
// Property-based tests for the pure mentor-filtering module
// (src/lib/mentor-filters.ts): `filterMentors`, `EMPTY_MENTOR_FILTERS`,
// `describeActiveMentorFilters`, and `EXPERIENCE_BANDS`.
//
// Arbitraries build structurally valid MentorProfile arrays from the canonical
// sector ids, MENTOR_TYPES, and MENTOR_AVAILABILITY, plus MentorFilters whose
// dimensions independently toggle between inactive (null) and a valid selection
// drawn from the same domains. yearsExperience spans the full positive-integer
// range that the three EXPERIENCE_BANDS partition, so the band predicate is
// exercised at and around every boundary.

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import {
  EMPTY_MENTOR_FILTERS,
  EXPERIENCE_BANDS,
  describeActiveMentorFilters,
  filterMentors,
} from '@/lib/mentor-filters';
import { sectors } from '@/data/sectors';
import {
  MENTOR_AVAILABILITY,
  MENTOR_TYPES,
  type ExperienceLevel,
  type MentorAvailability,
  type MentorFilters,
  type MentorProfile,
  type MentorType,
} from '@/types';

/* -------------------------------------------------------------------------- */
/* Canonical domains                                                          */
/* -------------------------------------------------------------------------- */

const SECTOR_IDS: readonly string[] = sectors.map((s) => s.id);
const EXPERIENCE_LEVELS: readonly ExperienceLevel[] = EXPERIENCE_BANDS.map((b) => b.id);

/* -------------------------------------------------------------------------- */
/* Arbitraries                                                                */
/* -------------------------------------------------------------------------- */

// One well-formed mentor. `yearsExperience` ranges from 1 (below the emerging
// floor) up to 40 (well into the open-ended veteran band) to probe boundaries.
const mentorArb: fc.Arbitrary<MentorProfile> = fc
  .record({
    id: fc.string({ minLength: 1, maxLength: 12 }),
    name: fc.string({ minLength: 1, maxLength: 16 }),
    title: fc.string({ minLength: 1, maxLength: 16 }),
    firm: fc.string({ minLength: 1, maxLength: 16 }),
    sectors: fc.uniqueArray(fc.constantFrom(...SECTOR_IDS), {
      minLength: 1,
      maxLength: 3,
    }),
    yearsExperience: fc.integer({ min: 1, max: 40 }),
    mentorType: fc.constantFrom<MentorType>(...MENTOR_TYPES),
    availability: fc.constantFrom<MentorAvailability>(...MENTOR_AVAILABILITY),
    bio: fc.string({ minLength: 1, maxLength: 40 }),
  })
  .map((r) => ({
    id: r.id,
    name: r.name,
    initialsAvatar: 'XX',
    title: r.title,
    firm: r.firm,
    sectors: r.sectors,
    yearsExperience: r.yearsExperience,
    mentorType: r.mentorType,
    availability: r.availability,
    bio: r.bio,
  }));

const mentorsArb: fc.Arbitrary<MentorProfile[]> = fc.array(mentorArb, {
  maxLength: 30,
});

// Each filter dimension independently toggles between inactive (null) and a
// valid selection from its canonical domain.
const filtersArb: fc.Arbitrary<MentorFilters> = fc.record({
  sector: fc.option(fc.constantFrom(...SECTOR_IDS), { nil: null }),
  mentorType: fc.option(fc.constantFrom<MentorType>(...MENTOR_TYPES), {
    nil: null,
  }),
  experienceLevel: fc.option(
    fc.constantFrom<ExperienceLevel>(...EXPERIENCE_LEVELS),
    { nil: null },
  ),
});

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** True when `result` is an order-preserving subsequence of `input` (by ===). */
function isSubsequence(
  result: readonly MentorProfile[],
  input: readonly MentorProfile[],
): boolean {
  let cursor = 0;
  for (const item of result) {
    let found = false;
    while (cursor < input.length) {
      if (input[cursor] === item) {
        found = true;
        cursor += 1;
        break;
      }
      cursor += 1;
    }
    if (!found) {
      return false;
    }
  }
  return true;
}

function activeCount(filters: MentorFilters): number {
  return (
    (filters.sector !== null ? 1 : 0) +
    (filters.mentorType !== null ? 1 : 0) +
    (filters.experienceLevel !== null ? 1 : 0)
  );
}

/* -------------------------------------------------------------------------- */
/* Property 7                                                                 */
/* -------------------------------------------------------------------------- */

describe('Property 7: filterMentors is sound, AND-composed, and subset-preserving', () => {
  it('every result satisfies every active filter and is an order-preserving subset', () => {
    fc.assert(
      fc.property(mentorsArb, filtersArb, (mentors, filters) => {
        const result = filterMentors(mentors, filters);
        const band =
          filters.experienceLevel === null
            ? null
            : EXPERIENCE_BANDS.find((b) => b.id === filters.experienceLevel) ?? null;

        // Soundness: every kept mentor satisfies every active dimension (AND).
        for (const mentor of result) {
          if (filters.sector !== null) {
            expect(mentor.sectors).toContain(filters.sector);
          }
          if (filters.mentorType !== null) {
            expect(mentor.mentorType).toBe(filters.mentorType);
          }
          if (band !== null) {
            expect(mentor.yearsExperience).toBeGreaterThanOrEqual(band.min);
            expect(mentor.yearsExperience).toBeLessThanOrEqual(band.max);
          }
        }

        // Subset-preserving: result is an order-preserving subsequence of input
        // (nothing fabricated, duplicated, or reordered).
        expect(isSubsequence(result, mentors)).toBe(true);
        expect(result.length).toBeLessThanOrEqual(mentors.length);

        // Completeness of the AND: any input mentor satisfying all active
        // filters must be present in the result.
        const expected = mentors.filter(
          (m) =>
            (filters.sector === null || m.sectors.includes(filters.sector)) &&
            (filters.mentorType === null || m.mentorType === filters.mentorType) &&
            (band === null ||
              (m.yearsExperience >= band.min && m.yearsExperience <= band.max)),
        );
        expect(result).toEqual(expected);
      }),
      { numRuns: 100 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Property 8                                                                 */
/* -------------------------------------------------------------------------- */

describe('Property 8: applying EMPTY_MENTOR_FILTERS returns exactly the input set', () => {
  it('returns the same members in the same order as the input', () => {
    fc.assert(
      fc.property(mentorsArb, (mentors) => {
        const result = filterMentors(mentors, EMPTY_MENTOR_FILTERS);
        expect(result).toEqual(mentors);
        expect(result.length).toBe(mentors.length);
        result.forEach((m, i) => expect(m).toBe(mentors[i]));
      }),
      { numRuns: 100 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Property 9                                                                 */
/* -------------------------------------------------------------------------- */

describe('Property 9: match count equals result length, is bounded, and empty results name active filters', () => {
  it('count = result length within [0, mentors.length]; empty state names every active filter', () => {
    fc.assert(
      fc.property(mentorsArb, filtersArb, (mentors, filters) => {
        const result = filterMentors(mentors, filters);

        // Match count is exactly the result length, bounded by the dataset size.
        const matchCount = result.length;
        expect(matchCount).toBeGreaterThanOrEqual(0);
        expect(matchCount).toBeLessThanOrEqual(mentors.length);

        // When the result is empty and >=1 filter is active, the empty-state
        // description lists every active filter's dimension and selected value.
        if (matchCount === 0 && activeCount(filters) >= 1) {
          const lines = describeActiveMentorFilters(filters);
          expect(lines.length).toBe(activeCount(filters));

          if (filters.sector !== null) {
            expect(
              lines.some(
                (l) => l.includes('Sector') && l.includes(filters.sector as string),
              ),
            ).toBe(true);
          }
          if (filters.mentorType !== null) {
            expect(
              lines.some(
                (l) =>
                  l.includes('Mentor type') &&
                  l.includes(filters.mentorType as string),
              ),
            ).toBe(true);
          }
          if (filters.experienceLevel !== null) {
            const band = EXPERIENCE_BANDS.find(
              (b) => b.id === filters.experienceLevel,
            );
            expect(
              lines.some(
                (l) =>
                  l.includes('Experience level') &&
                  (band ? l.includes(band.label) : true),
              ),
            ).toBe(true);
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});

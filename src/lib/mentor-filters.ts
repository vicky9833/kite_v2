// ===========================================================================
// KITE Ecosystem Enablement (Prompt 5) — Mentor filtering (pure module).
//
// PURITY CONTRACT: every export is a pure function of its arguments. No I/O,
// no `fetch`/network, no `localStorage`/`sessionStorage`/cookies, no
// `Math.random`, no `Date`/`Date.now`/`performance.now`, and no other ambient
// input. Same arguments -> same result on every call.
//
// Covers: EXPERIENCE_BANDS, EMPTY_MENTOR_FILTERS, filterMentors,
// describeActiveMentorFilters, deriveInitials.
// Requirements: 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 8.2, 14.7.
// ===========================================================================

import type {
  ExperienceBand,
  ExperienceLevel,
  MentorFilters,
  MentorProfile,
} from '@/types';

/**
 * Experience banding used by the Experience_Level filter. Bands are inclusive
 * on both ends (`[min, max]`) and partition years-of-experience into three
 * non-overlapping ranges. The veteran band is open-ended, capped at
 * `Number.MAX_SAFE_INTEGER` so any positive integer of years is covered.
 * (Req 9.6)
 */
export const EXPERIENCE_BANDS: readonly ExperienceBand[] = [
  { id: 'emerging', label: 'Emerging (2–7 yrs)', min: 2, max: 7 },
  { id: 'established', label: 'Established (8–15 yrs)', min: 8, max: 15 },
  { id: 'veteran', label: 'Veteran (16+ yrs)', min: 16, max: Number.MAX_SAFE_INTEGER },
];

/** No active mentor filters; `null` on a field means "any" / inactive. */
export const EMPTY_MENTOR_FILTERS: MentorFilters = {
  sector: null,
  mentorType: null,
  experienceLevel: null,
};

/** Look up an experience band by its id, or `null` if none matches. */
function findExperienceBand(level: ExperienceLevel | null): ExperienceBand | null {
  if (level === null) {
    return null;
  }
  return EXPERIENCE_BANDS.find((band) => band.id === level) ?? null;
}

/**
 * Sound, subset-preserving AND filter over a mentor directory (Req 9.4–9.8).
 *
 * A mentor is kept iff it satisfies every active filter:
 *   - sector membership: `sectors` includes the selected sector,
 *   - mentorType equality: `mentorType` equals the selected type,
 *   - experience band: `yearsExperience` is within the selected band's
 *     inclusive `[min, max]`.
 *
 * A `null` filter field is inactive ("any"). The result is always a subset of
 * the input in original order; nothing is fabricated, duplicated, or reordered.
 */
export function filterMentors(
  mentors: readonly MentorProfile[],
  filters: MentorFilters,
): MentorProfile[] {
  const band = findExperienceBand(filters.experienceLevel);
  return mentors.filter(
    (mentor) =>
      (filters.sector === null || mentor.sectors.includes(filters.sector)) &&
      (filters.mentorType === null || mentor.mentorType === filters.mentorType) &&
      (band === null ||
        (mentor.yearsExperience >= band.min && mentor.yearsExperience <= band.max)),
  );
}

/**
 * One human-readable line per active filter, naming the dimension and the
 * selected value, for the No_Results_State empty state (Req 9.9). Returns an
 * empty array when no filters are active.
 */
export function describeActiveMentorFilters(filters: MentorFilters): string[] {
  const lines: string[] = [];
  if (filters.sector !== null) {
    lines.push(`Sector: ${filters.sector}`);
  }
  if (filters.mentorType !== null) {
    lines.push(`Mentor type: ${filters.mentorType}`);
  }
  if (filters.experienceLevel !== null) {
    const band = findExperienceBand(filters.experienceLevel);
    lines.push(`Experience level: ${band ? band.label : filters.experienceLevel}`);
  }
  return lines;
}

/**
 * Derive an initials-avatar placeholder from a name: the uppercased first
 * letter of each of the first up-to-two whitespace-separated tokens.
 *   "Asha Nair" -> "AN"; "Ravi" -> "R".
 * Returns 1–2 uppercase letters and never references an image, so it is usable
 * directly as the avatar's text alternative (Req 8.2, 14.7).
 */
export function deriveInitials(name: string): string {
  const tokens = name.trim().split(/\s+/).filter((token) => token.length > 0);
  return tokens
    .slice(0, 2)
    .map((token) => token.charAt(0).toUpperCase())
    .join('');
}

// src/lib/synthetic-mentors.ts
//
// ===========================================================================
// Determinism contract (Req 7.2, 7.3, 7.4, 11.3)
// ---------------------------------------------------------------------------
//  - Every export is PURE and hash-seeded SOLELY from stable string keys
//    (`mentors|count` for the directory size; `mentor|${i}` for each profile).
//    The same key always yields byte-identical output, in every process, on
//    every reload — the mentor directory preview is byte-stable, and
//    `generateMentors()` returns a deep-equal `MentorProfile[]` on every call.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    locale, environment, or any other ambient/time-dependent input.
//  - All randomness flows through `synthetic-prng.ts`
//    (seededRng/seededInt/seededPick/seededShuffle); every helper respects its
//    stated range. Each profile draws from ONE `seededRng(key)` stream, so all
//    fields are stable and independent of call order.
//  - Every value is ILLUSTRATIVE synthetic data — no real mentor exists. The
//    directory is surfaced behind an IllustrativeBadge by its consumers.
//
//  ADDITIVE EXTENSION (Req 6.2, 6.3 — kite-inclusion-grassroots)
//  ---------------------------------------------------------------------------
//  - `generateMentor` assigns an optional, ILLUSTRATIVE `illustrativeGender`
//    drawn from the SAME per-mentor seeded stream. The gender draw is taken
//    LAST — strictly after every pre-existing draw (including the two bio
//    fragment picks) — so all previously-generated fields (name, title, firm,
//    sectors, yearsExperience, mentorType, availability, bio) remain
//    byte-identical and the directory's existing shape, ordering, and
//    byte-stability are preserved. For STANDALONE callers, the per-key label is
//    a `[0,1)` draw with a 0.375 threshold, so it is always present and stable.
//  - `generateMentors()` is the CANONICAL directory whose realized distribution
//    must hit the 35–40% women band. Rather than relying on the per-mentor
//    probability threshold (which only realizes the target in expectation, and
//    drifted to ~31% on the fixed 29-mentor directory), it applies a
//    DETERMINISTIC QUOTA: it computes `target = Math.round(0.375 * count)` women
//    and chooses WHICH mentors are women by ranking every mentor by a stable,
//    independent secondary draw `seededRng('mentor-gender|' + i)()` and marking
//    the `target` lowest-draw mentors `'woman'` and the rest `'man'`. This
//    guarantees `target/count ∈ [0.35, 0.40]` for any count in 24–30
//    (e.g. round(0.375*29)=11 → 11/29 ≈ 37.9%). Only the `illustrativeGender`
//    field is overridden; every other field is left byte-identical to the
//    per-mentor draw, and the override is a pure function of the stable index.
//  - This label is clearly illustrative, never a definitive demographic
//    classification, and consults no `Math.random`/`Date`/ambient input.
// ===========================================================================

import type { IllustrativeGender, MentorProfile } from '@/types';
import { MENTOR_AVAILABILITY, MENTOR_TYPES } from '@/types';
import { sectors } from '@/data/sectors';
import { seededInt, seededPick, seededRng, seededShuffle } from '@/lib/synthetic-prng';
import { deriveInitials } from '@/lib/mentor-filters';

// --- Fixed seed keys --------------------------------------------------------

const MENTOR_COUNT_SEED = 'mentors|count';

// --- Canonical sector ids (the 20-sector taxonomy) --------------------------

// Derived once from the canonical Sector_Data; mentor sectors are always a
// non-empty subset of these ids (Req 7.5, 8.4).
const CANONICAL_SECTOR_IDS: readonly string[] = sectors.map((sector) => sector.id);

// --- Fixed, time-independent value pools ------------------------------------

const FIRST_NAMES: readonly string[] = [
  'Asha', 'Ravi', 'Meera', 'Arjun', 'Priya', 'Vikram', 'Sneha', 'Karthik',
  'Divya', 'Rahul', 'Ananya', 'Suresh', 'Lakshmi', 'Naveen', 'Pooja', 'Manoj',
  'Kavya', 'Rohan', 'Deepa', 'Sanjay', 'Nisha', 'Anil', 'Shreya', 'Girish',
];

const LAST_NAMES: readonly string[] = [
  'Nair', 'Rao', 'Sharma', 'Iyer', 'Reddy', 'Hegde', 'Shetty', 'Gowda',
  'Kulkarni', 'Menon', 'Pillai', 'Bhat', 'Murthy', 'Patil', 'Desai', 'Kamath',
  'Prasad', 'Krishnan', 'Naik', 'Bhatt',
];

const TITLES: readonly string[] = [
  'Founder & CEO',
  'Managing Partner',
  'Chief Technology Officer',
  'Head of Product',
  'Principal Investor',
  'Innovation Advisor',
  'Operating Partner',
  'Director of Strategy',
  'Venture Partner',
  'Programme Director',
];

const FIRMS: readonly string[] = [
  'Sahyadri Ventures',
  'Cauvery Capital',
  'Deccan Innovation Labs',
  'Western Ghats Partners',
  'Vidhana Advisory',
  'Tungabhadra Holdings',
  'Malnad Tech Collective',
  'Brigade Growth Partners',
  'Karavali Ventures',
  'Nandi Hills Capital',
];

// Bio sentence fragments, composed deterministically per mentor.
const MENTOR_FOCUS_PHRASES: readonly string[] = [
  'scaling early-stage teams',
  'building go-to-market strategy',
  'navigating fundraising and investor relations',
  'translating research into commercial products',
  'establishing operational rigour',
  'expanding into new markets',
];

const MENTOR_CONTRIBUTION_PHRASES: readonly string[] = [
  'shares practical, hands-on guidance with founders',
  'advises ventures on durable growth',
  'supports first-time founders through critical milestones',
  'helps teams sharpen their product and positioning',
  'works closely with founders on strategy and execution',
];

/**
 * Build a one-paragraph illustrative bio in declarative, third-person voice
 * from the mentor's picked fields and seeded fragments (Req 8.8, 6.6).
 */
function buildBio(
  rng: () => number,
  name: string,
  title: string,
  firm: string,
  yearsExperience: number,
): string {
  const focus = seededPick(rng, MENTOR_FOCUS_PHRASES);
  const contribution = seededPick(rng, MENTOR_CONTRIBUTION_PHRASES);
  return (
    `${name} is ${title} at ${firm}, bringing ${yearsExperience} years of experience ` +
    `in ${focus}. As an illustrative mentor profile, ${name} ${contribution}. This bio ` +
    `is synthetic preview content provided to demonstrate the directory.`
  );
}

/**
 * Deterministic directory size in `[24, 30]` inclusive, derived from the fixed
 * `mentors|count` seed (Req 7.1).
 */
export function getMentorCount(): number {
  return seededInt(seededRng(MENTOR_COUNT_SEED), 24, 30);
}

/**
 * Generate one `MentorProfile` from a stable per-mentor key (Req 7.2). All
 * fields are drawn from ONE seeded stream, so they are stable and independent
 * of call order.
 */
export function generateMentor(key: string): MentorProfile {
  const rng = seededRng(key);

  const firstName = seededPick(rng, FIRST_NAMES);
  const lastName = seededPick(rng, LAST_NAMES);
  const name = `${firstName} ${lastName}`;

  const title = seededPick(rng, TITLES);
  const firm = seededPick(rng, FIRMS);

  // 1–3 distinct sector ids drawn from the 20 canonical sectors (Req 7.5, 8.4).
  const sectorCount = seededInt(rng, 1, 3);
  const sectorsOfExpertise = seededShuffle(rng, CANONICAL_SECTOR_IDS).slice(0, sectorCount);

  // Positive integer years of experience in [2, 32] (Req 8.5).
  const yearsExperience = seededInt(rng, 2, 32);

  const mentorType = seededPick(rng, MENTOR_TYPES);
  const availability = seededPick(rng, MENTOR_AVAILABILITY);

  const bio = buildBio(rng, name, title, firm, yearsExperience);

  // --- Additive illustrative-gender draw (Req 6.2, 6.3) ---------------------
  // Taken LAST, after every pre-existing draw above (including the two bio
  // fragment picks inside buildBio), so all existing fields stay byte-identical.
  // A [0,1) draw < 0.375 -> 'woman' yields ~37.5% women across the directory.
  const WOMEN_GENDER_THRESHOLD = 0.375;
  const genderDraw = rng();
  const illustrativeGender: IllustrativeGender =
    genderDraw < WOMEN_GENDER_THRESHOLD ? 'woman' : 'man';

  return {
    id: `mentor-${key.split('|')[1] ?? key}`,
    name,
    initialsAvatar: deriveInitials(name),
    title,
    firm,
    sectors: sectorsOfExpertise,
    yearsExperience,
    mentorType,
    availability,
    bio,
    illustrativeGender,
  };
}

/**
 * The full synthetic mentor directory; byte-stable across calls (Req 7.4).
 * Each profile is seeded by the stable key `mentor|${i}`, and the directory
 * length is the deterministic `getMentorCount()` in `[24, 30]`.
 *
 * The realized `illustrativeGender` distribution is fixed by a DETERMINISTIC
 * QUOTA (Req 6.2, 6.3): exactly `Math.round(0.375 * count)` mentors are women,
 * chosen as the `target` lowest by a stable secondary draw
 * `seededRng('mentor-gender|' + i)()`. This guarantees a women fraction within
 * [0.35, 0.40] for any count in 24–30. Only `illustrativeGender` is overridden;
 * all other fields stay byte-identical to the per-mentor draw.
 */
export function generateMentors(): MentorProfile[] {
  const count = getMentorCount();
  const base = Array.from({ length: count }, (_unused, i) =>
    generateMentor(`mentor|${i}`),
  );

  // Deterministic women quota: target = round(0.375 * count).
  const target = Math.round(0.375 * count);

  // Rank mentors by a stable, independent secondary gender draw; the `target`
  // lowest-draw mentors become women, the rest men. Ties broken by index for
  // total determinism.
  const ranked = base
    .map((_unused, i) => ({ i, draw: seededRng(`mentor-gender|${i}`)() }))
    .sort((a, b) => a.draw - b.draw || a.i - b.i);

  const womenIndices = new Set(ranked.slice(0, target).map((entry) => entry.i));

  return base.map((mentor, i) => ({
    ...mentor,
    illustrativeGender: womenIndices.has(i) ? 'woman' : 'man',
  }));
}

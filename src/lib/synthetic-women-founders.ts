// src/lib/synthetic-women-founders.ts
//
// ===========================================================================
// Determinism contract (Req 5.1, 5.5, 5.6, 5.7, 5.8)
// ---------------------------------------------------------------------------
//  - Every export is PURE and hash-seeded SOLELY from stable string keys
//    (`women-founders|${i}` for each founder card). The same key always yields
//    byte-identical output, in every process, on every reload —
//    `generateWomenFounders()` returns a deep-equal `WomenFounderCard[]` on
//    every call.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    locale, environment, or any other ambient/time-dependent input.
//  - All randomness flows through `synthetic-prng.ts`
//    (seededRng/seededInt/seededPick); every helper respects its stated range.
//    Each card draws from ONE `seededRng(key)` stream, so all fields are stable
//    and independent of call order.
//  - Every value is ILLUSTRATIVE synthetic data — no real founder or company
//    exists. The directory is surfaced behind an IllustrativeBadge by its
//    consumers. The Karnataka context (sectors, stages, companies) is plausible
//    but fictional.
// ===========================================================================

import type { WomenFounderCard } from '@/types';
import { sectors } from '@/data/sectors';
import { seededPick, seededRng } from '@/lib/synthetic-prng';
import { deriveInitials } from '@/lib/mentor-filters';

// --- Fixed seed key ---------------------------------------------------------

const WOMEN_FOUNDERS_SEED = 'women-founders';

// --- Fixed, time-independent value pools ------------------------------------

// Plausible Karnataka women-founder first/last names; composed deterministically.
const FIRST_NAMES: readonly string[] = [
  'Aishwarya', 'Bhavana', 'Chaitra', 'Deepika', 'Gayathri', 'Harini',
  'Ishita', 'Jyothi', 'Keerthi', 'Lavanya', 'Manasa', 'Nandini',
  'Pallavi', 'Rachana', 'Sahana', 'Tanvi', 'Varsha', 'Yamini',
];

const LAST_NAMES: readonly string[] = [
  'Acharya', 'Bhandari', 'Deshpande', 'Gowda', 'Hegde', 'Kamath',
  'Kulkarni', 'Nayak', 'Pai', 'Rao', 'Shenoy', 'Shetty',
];

// Synthetic company name fragments, composed into a plausible startup brand.
const COMPANY_PREFIXES: readonly string[] = [
  'Sahya', 'Cauvery', 'Tunga', 'Nandi', 'Kadamba', 'Hampi',
  'Malnad', 'Karavali', 'Vidya', 'Chola', 'Banni', 'Sharavathi',
];

const COMPANY_SUFFIXES: readonly string[] = [
  'Labs', 'Works', 'Tech', 'Innovations', 'Systems', 'Ventures',
  'Solutions', 'Collective', 'Nexus', 'Forge',
];

// Plausible early-to-growth startup stages.
const STAGES: readonly string[] = [
  'Idea',
  'Pre-Seed',
  'Seed',
  'Early Revenue',
  'Growth',
];

// One-line pitch fragments, composed into a single declarative sentence.
const PITCH_SOLUTIONS: readonly string[] = [
  'an affordable platform',
  'a field-tested toolkit',
  'a data-driven marketplace',
  'a mobile-first service',
  'a low-cost device',
  'an accessible workflow',
];

const PITCH_AUDIENCES: readonly string[] = [
  'for smallholder farmers',
  'for rural health workers',
  'for first-generation students',
  'for women-led micro-enterprises',
  'for local artisans and weavers',
  'for tier-2 and tier-3 towns',
];

const PITCH_OUTCOMES: readonly string[] = [
  'across Karnataka',
  'to widen access and incomes',
  'to cut waste and costs',
  'to bridge the last mile',
  'to build durable livelihoods',
];

// Canonical sector names (the curated taxonomy); each card's sector is always
// a plausible member of this verified list (no fabricated sectors).
const SECTOR_NAMES: readonly string[] = sectors.map((sector) => sector.name);

/**
 * Build a one-line illustrative pitch from the founder's seeded fragments.
 */
function buildPitch(rng: () => number): string {
  const solution = seededPick(rng, PITCH_SOLUTIONS);
  const audience = seededPick(rng, PITCH_AUDIENCES);
  const outcome = seededPick(rng, PITCH_OUTCOMES);
  return `Building ${solution} ${audience} ${outcome}.`;
}

/**
 * Generate one `WomenFounderCard` from a stable per-founder key (Req 5.1, 5.5).
 * All fields are drawn from ONE seeded stream, so they are stable and
 * independent of call order.
 */
export function generateWomenFounder(key: string): WomenFounderCard {
  const rng = seededRng(key);

  const firstName = seededPick(rng, FIRST_NAMES);
  const lastName = seededPick(rng, LAST_NAMES);
  const name = `${firstName} ${lastName}`;

  const company = `${seededPick(rng, COMPANY_PREFIXES)}${seededPick(rng, COMPANY_SUFFIXES)}`;
  const sector = seededPick(rng, SECTOR_NAMES);
  const stage = seededPick(rng, STAGES);
  const pitch = buildPitch(rng);

  return {
    id: `women-founder-${key.split('|')[1] ?? key}`,
    name,
    company,
    sector,
    stage,
    pitch,
    initialsAvatar: deriveInitials(name),
  };
}

/**
 * The full synthetic women-founder showcase; EXACTLY 6 cards, byte-stable
 * across calls (Req 5.1, 5.8). Each card is seeded by the stable key
 * `women-founders|${i}`.
 */
export function generateWomenFounders(): WomenFounderCard[] {
  return Array.from({ length: 6 }, (_unused, i) =>
    generateWomenFounder(`${WOMEN_FOUNDERS_SEED}|${i}`),
  );
}

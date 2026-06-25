// src/lib/synthetic-ideas.ts
//
// ===========================================================================
// Determinism contract (Req 5.4, 5.5, 5.6, 5.7, 5.8)
// ---------------------------------------------------------------------------
//  - Every export is PURE and hash-seeded SOLELY from stable string keys
//    (`seed-ideas|count` for the record count and `seed-idea|${i}` for each
//    seed idea). The same key always yields byte-identical output, in every
//    process, on every reload — `getSeedIdeaCount()` is constant and
//    `generateSeedIdeas()` returns a deep-equal `IdeaSubmission[]` on every
//    call.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `new Date`,
//    `performance.now`, locale, environment, or any other ambient/time-
//    dependent input. The `ideaId` year and every `submittedAt` timestamp are
//    derived from FIXED constants (`FIXED_SEED_YEAR`, `BASE_*`) plus a seeded
//    offset, and the ISO timestamp is assembled with pure integer arithmetic
//    (no `Date`).
//  - All randomness flows through `synthetic-prng.ts`
//    (seededRng/seededInt/seededPick); every helper respects its stated range.
//  - Every value is ILLUSTRATIVE synthetic data — no real innovator or idea
//    exists. The board is surfaced behind an IllustrativeBadge by its
//    consumers.
//  - Every scheme reference is produced by the canonical `matchIdeaToSchemes`
//    engine, so `matchedSchemeIds` contains only REAL scheme ids that exist in
//    `schemes.ts`. The literal `rural-innovation-center` never appears.
// ===========================================================================

import type { IdeaCategory, IdeaSubmission, InnovatorType, LocationKarnataka } from '@/types';
import { IDEA_CATEGORIES, INNOVATOR_TYPES } from '@/types';
import { seededInt, seededPick, seededRng } from '@/lib/synthetic-prng';
import { generateIdeaId } from '@/lib/idea-id-generator';
import { matchIdeaToSchemes } from '@/lib/idea-scheme-matching';

// --- Fixed seed keys --------------------------------------------------------

const IDEAS_COUNT_SEED = 'seed-ideas|count';
const SEED_IDEA_KEY_PREFIX = 'seed-idea';

// --- Fixed, time-independent calendar constants -----------------------------
//
// The board's relative timestamps are anchored to a FIXED "as-of" date, never
// the wall clock. Each seed idea's `submittedAt` is this base date minus a
// seeded day/time offset, so the ordering is stable across reloads. The widest
// offset (≤ 150 days back from 2025-06-15 ≈ 2025-01-16) keeps every timestamp
// inside FIXED_SEED_YEAR, matching the year baked into each `ideaId`.

const FIXED_SEED_YEAR = 2025;
const BASE_YEAR = 2025;
const BASE_MONTH = 6; // June
const BASE_DAY = 15;
const MAX_OFFSET_DAYS = 150;

// --- Pure civil <-> epoch-day conversion (Howard Hinnant's algorithm) -------
//
// Deterministic integer arithmetic; NO `Date`. `daysFromCivil` returns the day
// count since 1970-01-01 for a proleptic-Gregorian date; `civilFromDays` is its
// inverse. Both are total functions over the year range we use.

function daysFromCivil(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor((y >= 0 ? y : y - 399) / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (month > 2 ? month - 3 : month + 9) + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

function civilFromDays(daysSinceEpoch: number): { year: number; month: number; day: number } {
  const z = daysSinceEpoch + 719468;
  const era = Math.floor((z >= 0 ? z : z - 146096) / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  );
  const year = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  return { year: month <= 2 ? year + 1 : year, month, day };
}

const BASE_EPOCH_DAYS = daysFromCivil(BASE_YEAR, BASE_MONTH, BASE_DAY);

function pad2(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

function pad4(value: number): string {
  return value.toString().padStart(4, '0');
}

/**
 * Build a deterministic ISO 8601 timestamp from the FIXED base date minus a
 * seeded day offset, plus a seeded time-of-day. Pure integer arithmetic — no
 * `Date`. The result sorts lexicographically in chronological order, which the
 * Public_Ideas_Board relies on for most-recent ordering.
 */
function buildSubmittedAt(rng: () => number): string {
  const offsetDays = seededInt(rng, 0, MAX_OFFSET_DAYS);
  const hour = seededInt(rng, 0, 23);
  const minute = seededInt(rng, 0, 59);
  const second = seededInt(rng, 0, 59);
  const { year, month, day } = civilFromDays(BASE_EPOCH_DAYS - offsetDays);
  return `${pad4(year)}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:${pad2(second)}.000Z`;
}

// --- Fixed, time-independent value pools (plausible Karnataka context) ------

// Every value of the existing `LocationKarnataka` union — drawn from for each
// idea's location (no fabricated locations).
const LOCATIONS: readonly LocationKarnataka[] = [
  'Bengaluru Urban',
  'Bengaluru Rural',
  'Mysuru',
  'Mangaluru',
  'Hubballi-Dharwad-Belagavi',
  'Kalaburagi',
  'Shivamogga',
  'Tumakuru',
  'Other Karnataka',
];

const FIRST_NAMES: readonly string[] = [
  'Anil', 'Bhavana', 'Chandan', 'Divya', 'Ganesh', 'Harini',
  'Imran', 'Jyothi', 'Kiran', 'Lakshmi', 'Manjunath', 'Nivedita',
  'Prakash', 'Rashmi', 'Suresh', 'Tara', 'Umesh', 'Vidya',
];

const LAST_NAMES: readonly string[] = [
  'Acharya', 'Bhat', 'Desai', 'Gowda', 'Hegde', 'Kamath',
  'Kulkarni', 'Naik', 'Patil', 'Rao', 'Shetty', 'Yadav',
];

// Category-specific framing fragments. Each idea draws the fragment set keyed by
// its `ideaCategory`, so titles/summaries read coherently for that domain.
const CATEGORY_FRAGMENTS: Record<
  IdeaCategory,
  { noun: string; problem: string; solution: string }
> = {
  AgriTech: {
    noun: 'crop advisory platform',
    problem: 'smallholder farmers lack timely, local-language guidance on pests, prices, and weather',
    solution: 'a low-cost mobile advisory that pairs sensor data with agronomist support',
  },
  HealthTech: {
    noun: 'community health service',
    problem: 'rural patients travel long distances for routine diagnostics and follow-ups',
    solution: 'a portable screening kit linked to tele-consultations with district hospitals',
  },
  ClimateTech: {
    noun: 'clean-energy solution',
    problem: 'unreliable power and crop-residue burning raise costs and pollution in farming belts',
    solution: 'a decentralised biomass-to-energy unit sized for village cooperatives',
  },
  EdTech: {
    noun: 'learning platform',
    problem: 'first-generation learners in tier-2 and tier-3 towns lack affordable skilling pathways',
    solution: 'an offline-first, Kannada-language skilling app with mentor check-ins',
  },
  FinTech: {
    noun: 'inclusive finance tool',
    problem: 'micro-entrepreneurs are excluded from formal credit for want of a usable history',
    solution: 'an alternative-data credit layer that bundles savings, payments, and micro-insurance',
  },
  'Rural Development': {
    noun: 'rural livelihoods initiative',
    problem: 'village producers capture little value because they sell raw, unaggregated output',
    solution: 'a producer-collective marketplace that aggregates, grades, and brands local goods',
  },
  Manufacturing: {
    noun: 'shop-floor toolkit',
    problem: 'small manufacturers in industrial clusters run blind on machine downtime and waste',
    solution: 'a retrofit IoT toolkit that tracks utilisation and flags maintenance early',
  },
  'Other Social Impact': {
    noun: 'social-impact service',
    problem: 'frontline community workers coordinate with paper records and fragmented messaging',
    solution: 'a lightweight case-management app built for low-bandwidth field conditions',
  },
};

const TITLE_OPENERS: readonly string[] = [
  'Affordable',
  'Last-Mile',
  'Field-Tested',
  'Accessible',
  'Frugal',
  'Community-Led',
];

const TITLE_AUDIENCES: readonly string[] = [
  'for smallholder farmers',
  'for rural communities',
  'for first-generation founders',
  'for tier-2 and tier-3 towns',
  'for women-led micro-enterprises',
  'for grassroots innovators',
];

// --- Single-record generator ------------------------------------------------

/**
 * Build one fully-populated, illustrative {@link IdeaSubmission} from a stable
 * per-idea key (`seed-idea|${i}`). All 15 fields are populated. The `ideaId`
 * uses `generateIdeaId(seededRng(key), FIXED_SEED_YEAR)`, `matchedSchemeIds`
 * comes from the canonical matching engine, `status` is `'submitted'`, and
 * `submittedAt` is the FIXED base date minus a seeded offset. Pure and
 * order-independent: every value derives from the same seeded `key`.
 */
function generateSeedIdea(key: string): IdeaSubmission {
  const rng = seededRng(key);

  const innovatorType: InnovatorType = seededPick(rng, INNOVATOR_TYPES);
  const ideaCategory: IdeaCategory = seededPick(rng, IDEA_CATEGORIES);
  const location: LocationKarnataka = seededPick(rng, LOCATIONS);
  const innovatorAge = seededInt(rng, 18, 62);

  const firstName = seededPick(rng, FIRST_NAMES);
  const lastName = seededPick(rng, LAST_NAMES);
  const innovatorName = `${firstName} ${lastName}`;
  const innovatorEmail = `${firstName}.${lastName}@example.org`.toLowerCase();

  const fragments = CATEGORY_FRAGMENTS[ideaCategory];
  const opener = seededPick(rng, TITLE_OPENERS);
  const audience = seededPick(rng, TITLE_AUDIENCES);

  const ideaTitle = `${opener} ${ideaCategory} ${fragments.noun} ${audience}`;
  const ideaSummary =
    `A ${ideaCategory} idea proposing ${fragments.solution} ${audience}, ` +
    `developed by a ${innovatorType.toLowerCase()} based in ${location}.`;
  const problemStatement =
    `In ${location}, ${fragments.problem}. This gap limits incomes, access, and ` +
    `participation for the people this idea serves.`;
  const proposedSolution =
    `Build ${fragments.solution}, piloted locally and designed to scale across ` +
    `Karnataka through existing grassroots and ecosystem partners.`;

  // `ideaId` is derived from a FIXED year and the seeded key (Req 5.6) — never
  // a clock read. A fresh `seededRng(key)` stream feeds the suffix.
  const ideaId = generateIdeaId(seededRng(key), FIXED_SEED_YEAR);
  const submittedAt = buildSubmittedAt(rng);

  const base: IdeaSubmission = {
    id: ideaId, // session record key equals ideaId
    innovatorName,
    innovatorEmail,
    innovatorAge,
    innovatorType,
    ideaTitle,
    ideaCategory,
    ideaSummary,
    problemStatement,
    proposedSolution,
    location,
    submittedAt,
    status: 'submitted',
    matchedSchemeIds: [],
    ideaId,
  };

  // Populate matches from the canonical engine so every scheme reference is a
  // real id (Req 5.8); the engine is pure and deterministic.
  return { ...base, matchedSchemeIds: matchIdeaToSchemes(base) };
}

// --- Public API -------------------------------------------------------------

/**
 * Deterministic seed-idea count in the inclusive range `[12, 18]` (Req 5.4),
 * derived solely from the fixed `seed-ideas|count` key. Constant across calls.
 */
export function getSeedIdeaCount(): number {
  return seededInt(seededRng(IDEAS_COUNT_SEED), 12, 18);
}

/**
 * Generate the 12–18 illustrative seed `IdeaSubmission` records for the
 * Public_Ideas_Board (Req 5.4). Pure and byte-stable: the same deep-equal array
 * is returned on every call, each record seeded by `seed-idea|${i}`. Every
 * `matchedSchemeIds` entry is a real scheme id produced by the matching engine.
 */
export function generateSeedIdeas(): IdeaSubmission[] {
  return Array.from({ length: getSeedIdeaCount() }, (_unused, i) =>
    generateSeedIdea(`${SEED_IDEA_KEY_PREFIX}|${i}`),
  );
}

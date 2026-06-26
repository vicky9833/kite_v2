// src/lib/synthetic-gia-data.ts
//
// ===========================================================================
// Determinism contract (Req 3.3)
// ---------------------------------------------------------------------------
//  - Every export is PURE and hash-seeded SOLELY from stable string keys
//    derived from the country code (e.g. `gia-bilateral|{code}|{i}`). The same
//    code always yields byte-identical output, in every process, on every
//    reload.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    locale, environment, or any other ambient/time-dependent input.
//  - Every startup-sector reference draws from the country's verified
//    `focusAreas` where applicable. All values are ILLUSTRATIVE synthetic
//    content surfaced behind an IllustrativeBadge.
// ===========================================================================

import type {
  BilateralProgram,
  CountryStartupEngagement,
  CountrySuccessStory,
  GIACountry,
  RecentEngagement,
} from '@/types';
import { giaCountries } from '@/data/gia-countries';
import { seededInt, seededPick, seededRng } from '@/lib/synthetic-prng';

const RECENT_COUNT_SEED = 'gia-recent|count';

// --- Fixed value pools ------------------------------------------------------

const PROGRAM_TYPES: readonly string[] = [
  'Bridge', 'Exchange', 'Joint Centre', 'Accelerator Track', 'Research Partnership',
  'Market Access Program', 'Innovation Corridor',
];

const PROGRAM_DESCRIPTIONS: readonly string[] = [
  'A bilateral track connecting Karnataka startups with partners for co-development and market entry.',
  'Joint programming spanning soft-landing support, mentorship, and pilot deployments.',
  'A structured exchange enabling founders to access networks, capital, and customers in both ecosystems.',
  'Collaborative research and commercialization across priority sectors of mutual interest.',
];

const ENGAGEMENT_TYPES: readonly string[] = [
  'Market entry pilot', 'Soft-landing support', 'Joint R&D', 'Investor introduction',
  'Trade delegation', 'Technology transfer',
];

const STARTUP_NAME_PREFIXES: readonly string[] = [
  'Nova', 'Astra', 'Vega', 'Lumen', 'Sahya', 'Cauvery', 'Deccan', 'Kaveri',
  'Quanta', 'Helix', 'Terra', 'Orbit', 'Vidya', 'Pravaha', 'Sankalp', 'Udaya',
];

const STARTUP_NAME_SUFFIXES: readonly string[] = [
  'Labs', 'Systems', 'Works', 'Technologies', 'Innovations', 'Dynamics',
  'Analytics', 'Robotics', 'Networks', 'Bio',
];

const STORY_OUTCOMES: readonly string[] = [
  'secured a strategic pilot with a partner-country enterprise',
  'raised a cross-border seed round from partner-country investors',
  'opened a representative office to serve the partner market',
  'signed a distribution agreement expanding into the partner region',
  'completed a joint research milestone with a partner-country institution',
];

const ENGAGEMENT_DESCRIPTIONS: readonly string[] = [
  'Engaged through a KDEM-facilitated delegation and follow-on introductions.',
  'Participated in a bilateral cohort with mentorship and customer access.',
  'Worked with the partner ecosystem on a pilot and regulatory navigation.',
  'Accessed capital and channel partners via the alliance framework.',
];

// --- Helpers ----------------------------------------------------------------

function countryByCode(code: string): GIACountry | undefined {
  const lower = code.toLowerCase();
  return giaCountries.find((c) => c.countryCode.toLowerCase() === lower);
}

function syntheticStartupName(rng: () => number): string {
  return `${seededPick(rng, STARTUP_NAME_PREFIXES)} ${seededPick(rng, STARTUP_NAME_SUFFIXES)}`;
}

/** Focus areas for a code; falls back to a generic set for unknown codes. */
function focusAreasFor(code: string): readonly string[] {
  const country = countryByCode(code);
  return country?.focusAreas.length ? country.focusAreas : ['Technology', 'Innovation'];
}

// --- Bilateral programs (3–5 per country) -----------------------------------

/** 3–5 illustrative bilateral programs for `countryCode` (Req 3.1). */
export function generateBilateralPrograms(countryCode: string): BilateralProgram[] {
  const code = countryCode.toLowerCase();
  const country = countryByCode(code);
  const countryName = country?.name ?? countryCode.toUpperCase();
  const focus = focusAreasFor(code);
  const count = seededInt(seededRng(`gia-bilateral|${code}|count`), 3, 5);

  return Array.from({ length: count }, (_u, i) => {
    const rng = seededRng(`gia-bilateral|${code}|${i}`);
    const focusArea = focus[i % focus.length] as string;
    const programType = seededPick(rng, PROGRAM_TYPES);
    const sinceYear = seededInt(rng, 2019, 2025);
    const status = seededInt(rng, 0, 4) === 0 ? 'upcoming' : 'active';
    return {
      id: `gia-program-${code}-${i}`,
      name: `Karnataka\u2013${countryName} ${focusArea} ${programType}`,
      focusArea,
      sinceYear,
      description: seededPick(rng, PROGRAM_DESCRIPTIONS),
      status,
    };
  });
}

// --- Success stories (2–3 per country) --------------------------------------

/** 2–3 illustrative success stories for `countryCode` (Req 3.1). */
export function generateCountrySuccessStories(countryCode: string): CountrySuccessStory[] {
  const code = countryCode.toLowerCase();
  const focus = focusAreasFor(code);
  const count = seededInt(seededRng(`gia-story|${code}|count`), 2, 3);

  return Array.from({ length: count }, (_u, i) => {
    const rng = seededRng(`gia-story|${code}|${i}`);
    const sector = focus[i % focus.length] as string;
    return {
      id: `gia-story-${code}-${i}`,
      startupName: syntheticStartupName(rng),
      sector,
      outcome: seededPick(rng, STORY_OUTCOMES),
    };
  });
}

// --- Startup engagements (exactly 6 per country) ----------------------------

/** Exactly 6 illustrative Karnataka startup engagements for `countryCode` (Req 3.1). */
export function generateCountryStartupEngagements(
  countryCode: string,
): CountryStartupEngagement[] {
  const code = countryCode.toLowerCase();
  const focus = focusAreasFor(code);

  return Array.from({ length: 6 }, (_u, i) => {
    const rng = seededRng(`gia-engage|${code}|${i}`);
    const sector = focus[i % focus.length] as string;
    return {
      id: `gia-engage-${code}-${i}`,
      startupName: syntheticStartupName(rng),
      sector,
      engagementType: seededPick(rng, ENGAGEMENT_TYPES),
      description: seededPick(rng, ENGAGEMENT_DESCRIPTIONS),
    };
  });
}

// --- Recent engagements (GIA index, 12–15) ----------------------------------

const RECENT_TITLE_TEMPLATES: readonly string[] = [
  '{country} delegation visited Bengaluru',
  'Karnataka\u2013{country} MoU signed',
  '{country} startup exchange completed',
  'Karnataka hosted {country} innovation roundtable',
  '{country} investors toured Beyond Bengaluru clusters',
  'Joint Karnataka\u2013{country} sector briefing held',
];

const RECENT_SUMMARIES: readonly string[] = [
  'The engagement explored co-investment, market access, and joint programming.',
  'Both sides agreed to deepen collaboration across priority sectors.',
  'The visit included startup showcases and ecosystem partner meetings.',
  'Follow-on activities and a pilot cohort are under discussion.',
];

/** 12–15 illustrative recent engagements for the GIA index (Req 3.2). */
export function generateRecentEngagements(): RecentEngagement[] {
  const count = seededInt(seededRng(RECENT_COUNT_SEED), 12, 15);
  return Array.from({ length: count }, (_u, i) => {
    const rng = seededRng(`gia-recent|${i}`);
    const country = seededPick(rng, giaCountries);
    const title = seededPick(rng, RECENT_TITLE_TEMPLATES).replace('{country}', country.name);
    return {
      id: `gia-recent-${i}`,
      countryCode: country.countryCode.toLowerCase(),
      title,
      dateLabel: seededPick(rng, ['1 week ago', '2 weeks ago', '1 month ago', '6 weeks ago', '2 months ago']),
      summary: seededPick(rng, RECENT_SUMMARIES),
    };
  });
}

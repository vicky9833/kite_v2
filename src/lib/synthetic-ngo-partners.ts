// src/lib/synthetic-ngo-partners.ts
//
// ===========================================================================
// Determinism contract (Req 5.3, 5.5, 5.6, 5.7)
// ---------------------------------------------------------------------------
//  - Every export is PURE and hash-seeded SOLELY from stable string keys
//    (`ngo-partners|${i}` for each NGO partner). The same key always yields
//    byte-identical output, in every process, on every reload — the NGO
//    partner list is byte-stable, and `generateNgoPartners()` returns a
//    deep-equal `NgoPartner[]` on every call.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    locale, environment, or any other ambient/time-dependent input.
//  - All randomness flows through `synthetic-prng.ts`
//    (seededRng/seededInt/seededPick); every helper respects its stated range.
//    Each record draws from ONE `seededRng(key)` stream, so all fields are
//    stable and independent of call order.
//  - Every value is ILLUSTRATIVE synthetic data — no real NGO partner exists.
//    The list is surfaced behind an IllustrativeBadge by its consumers.
// ===========================================================================

import type { NgoPartner } from '@/types';
import { seededPick, seededRng } from '@/lib/synthetic-prng';

// --- Fixed seed key ---------------------------------------------------------

const NGO_PARTNERS_SEED = 'ngo-partners';

/**
 * Number of synthetic NGO partners generated. Fixed (≥3) so the list is
 * byte-stable across reloads rather than derived from a per-call count draw.
 */
export const NGO_PARTNER_COUNT = 4;

// --- Fixed, time-independent value pools (plausible Karnataka NGO context) --

// Illustrative NGO-style names rooted in Karnataka geography and civic themes.
const NGO_NAME_PREFIXES: readonly string[] = [
  'Sahyadri',
  'Cauvery',
  'Tungabhadra',
  'Malnad',
  'Deccan',
  'Karavali',
  'Vidhana',
  'Nandi',
  'Hampi',
  'Kalyana',
];

const NGO_NAME_SUFFIXES: readonly string[] = [
  'Grassroots Foundation',
  'Rural Development Trust',
  'Community Innovation Society',
  'Livelihoods Foundation',
  'Empowerment Trust',
  'Social Impact Collective',
];

const NGO_FOCUS_AREAS: readonly string[] = [
  'Rural livelihoods and grassroots entrepreneurship',
  'Women empowerment and self-help group enterprise',
  'Skilling and digital literacy for rural youth',
  'Smallholder farmer and AgriTech adoption',
  'Education access and student innovation',
  'Healthcare access in underserved districts',
  'Climate resilience and sustainable livelihoods',
];

// Plausible Karnataka geographic coverage descriptors.
const NGO_GEOGRAPHIC_REACH: readonly string[] = [
  'North Karnataka districts (Kalaburagi, Ballari, Vijayapura)',
  'Coastal Karnataka (Dakshina Kannada, Udupi, Uttara Kannada)',
  'Malnad region (Shivamogga, Chikkamagaluru, Hassan)',
  'Kalyana Karnataka tier-2 and tier-3 towns',
  'Bengaluru Rural and surrounding peri-urban clusters',
  'Statewide across Karnataka',
];

const NGO_PARTNERSHIP_TYPES: readonly string[] = [
  'Implementation partner',
  'Grassroots mobilisation partner',
  'Co-funding and CSR channel partner',
  'Capacity-building and training partner',
  'Last-mile delivery partner',
];

/**
 * Generate one `NgoPartner` from a stable per-record key (Req 5.3). All fields
 * are drawn from ONE seeded stream, so they are stable and independent of call
 * order.
 */
export function generateNgoPartner(key: string): NgoPartner {
  const rng = seededRng(key);

  const prefix = seededPick(rng, NGO_NAME_PREFIXES);
  const suffix = seededPick(rng, NGO_NAME_SUFFIXES);
  const name = `${prefix} ${suffix}`;

  const focus = seededPick(rng, NGO_FOCUS_AREAS);
  const geographicReach = seededPick(rng, NGO_GEOGRAPHIC_REACH);
  const partnershipType = seededPick(rng, NGO_PARTNERSHIP_TYPES);

  return {
    id: `ngo-partner-${key.split('|')[1] ?? key}`,
    name,
    focus,
    geographicReach,
    partnershipType,
  };
}

/**
 * The full synthetic NGO partner list; byte-stable across calls (Req 5.3, 5.7).
 * Each record is seeded by the stable key `ngo-partners|${i}`, and the list
 * length is the fixed `NGO_PARTNER_COUNT` (≥3).
 */
export function generateNgoPartners(): NgoPartner[] {
  return Array.from({ length: NGO_PARTNER_COUNT }, (_unused, i) =>
    generateNgoPartner(`${NGO_PARTNERS_SEED}|${i}`),
  );
}

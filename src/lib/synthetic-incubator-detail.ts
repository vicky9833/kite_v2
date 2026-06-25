// src/lib/synthetic-incubator-detail.ts
//
// ===========================================================================
// Determinism contract (Req 3.3, 3.6)
// ---------------------------------------------------------------------------
//  - `generateIncubatorDetail` is PURE and hash-seeded SOLELY from the
//    incubator id (seed key `incubator-detail|${incubatorId}`). Regenerating
//    for the same id yields byte-identical output, in every process, on every
//    reload — the incubator detail preview is byte-stable.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    locale, environment, or any other ambient/time-dependent input.
//  - All randomness flows through `synthetic-prng.ts`
//    (seededRng/seededInt/seededShuffle); every helper respects its stated range.
//  - This shape is ILLUSTRATIVE only. The verified fields
//    (name/cluster/type/focus) are NOT part of this shape — the detail panel
//    reads those straight from the `Incubator` record (Req 3.2). The
//    `illustrativeContactLabel` is a fixed string, never a real address.
// ===========================================================================

import type { IncubatorDetail } from '@/types';
import { seededInt, seededPick, seededRng, seededShuffle } from '@/lib/synthetic-prng';

// --- Fixed, time-independent template/value pools --------------------------

// Sentence fragments composed into the illustrative "about" paragraph. Every
// pool is a fixed constant — only the seeded selection varies by incubator id.
const FOCUS_THEMES: readonly string[] = [
  'early-stage product validation',
  'deep-tech commercialisation',
  'go-to-market readiness',
  'founder capability building',
  'pilot and proof-of-concept support',
  'market access and partnerships',
];

const SUPPORT_MODES: readonly string[] = [
  'structured cohort programming',
  'hands-on mentorship',
  'shared infrastructure and lab access',
  'investor and corporate introductions',
  'regulatory and compliance guidance',
];

const ECOSYSTEM_ROLES: readonly string[] = [
  'a connective node in the regional startup ecosystem',
  'a launchpad for first-time founders',
  'a bridge between research institutions and industry',
  'a catalyst for emerging-sector ventures',
];

// Fixed pool of illustrative offerings; a seeded subset is surfaced per record.
const OFFERING_POOL: readonly string[] = [
  'Co-working and dedicated desk space',
  'Seed grant and milestone funding guidance',
  'One-on-one mentor matching',
  'Prototyping lab and equipment access',
  'Legal, IP and incorporation support',
  'Pitch and demo-day preparation',
  'Corporate pilot facilitation',
  'Market research and validation clinics',
  'Investor readiness workshops',
  'Talent and hiring support',
];

// Fixed, illustrative contact label — NEVER a real address or contact detail.
const ILLUSTRATIVE_CONTACT_LABEL = 'Illustrative contact — reach out via the official KITE directory';

/**
 * Build the illustrative "about" paragraph from fixed fragments selected by the
 * seeded RNG. The text is declarative, third-person and clearly illustrative.
 */
function buildAboutParagraph(rng: () => number): string {
  const focus = seededPick(rng, FOCUS_THEMES);
  const support = seededPick(rng, SUPPORT_MODES);
  const role = seededPick(rng, ECOSYSTEM_ROLES);
  return (
    `This incubator illustratively concentrates on ${focus}, pairing founders with ` +
    `${support}. It operates as ${role}, helping ventures move from idea toward ` +
    `sustainable traction. Programming is delivered in cohorts with ongoing advisory ` +
    `support throughout each engagement.`
  );
}

/**
 * Generate the synthetic, illustrative detail for an incubator, seeded ONLY by
 * the incubator id. See the module determinism contract above: the same id
 * always yields byte-identical output.
 */
export function generateIncubatorDetail(incubatorId: string): IncubatorDetail {
  const rng = seededRng(`incubator-detail|${incubatorId}`);

  const aboutParagraph = buildAboutParagraph(rng);
  const cohortsPerYear = seededInt(rng, 1, 4);
  const startupsSupported = seededInt(rng, 20, 240);

  // Seeded permutation of the fixed offering pool, then a seeded-length slice
  // (3..6 offerings). Both the order and the count are deterministic per id.
  const shuffled = seededShuffle(rng, OFFERING_POOL);
  const offeringCount = seededInt(rng, 3, 6);
  const illustrativeOfferings = shuffled.slice(0, offeringCount);

  return {
    incubatorId,
    aboutParagraph,
    cohortsPerYear,
    startupsSupported,
    illustrativeOfferings,
    illustrativeContactLabel: ILLUSTRATIVE_CONTACT_LABEL,
  };
}

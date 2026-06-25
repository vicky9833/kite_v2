// src/lib/synthetic-csr-partnerships.ts
//
// ===========================================================================
// Determinism contract (Req 5.2, 5.5, 5.6, 5.7)
// ---------------------------------------------------------------------------
//  - Every export is PURE and hash-seeded SOLELY from stable string keys
//    (`csr-partnerships|${i}` for each partnership). The same key always yields
//    byte-identical output, in every process, on every reload — the CSR
//    partnership preview is byte-stable, and `generateCsrPartnerships()`
//    returns a deep-equal `CsrPartnership[]` on every call.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    locale, environment, or any other ambient/time-dependent input.
//  - All randomness flows through `synthetic-prng.ts`
//    (seededRng/seededInt/seededPick); every helper respects its stated range.
//    Each partnership draws from ONE `seededRng(key)` stream, so all fields are
//    stable and independent of call order.
//  - Every value is ILLUSTRATIVE synthetic data — no real CSR partnership
//    exists and all CSR numbers (including `scaleCrore`) are illustrative. The
//    list is surfaced behind an IllustrativeBadge by its consumers.
// ===========================================================================

import type { CsrPartnership, CsrPartnerType } from '@/types';
import { CSR_PARTNER_TYPES } from '@/types';
import { seededInt, seededPick, seededRng } from '@/lib/synthetic-prng';

// --- Fixed record count (fixed for byte-stability) --------------------------

const CSR_PARTNERSHIP_COUNT = 6;

// --- Fixed, time-independent value pools (plausible Karnataka CSR context) --

const PARTNER_NAMES: readonly string[] = [
  'Bengaluru Tech Foundation',
  'Mysuru Manufacturing Trust',
  'Coastal Karnataka Family Office',
  'Hubballi Industrial CSR Council',
  'Sahyadri Impact Foundation',
  'Karnataka Energy PSU Foundation',
  'Mangaluru Port Trust Foundation',
  'Deccan Enterprises Family Office',
  'Kalyana Karnataka Development Trust',
];

const FOCUS_AREAS: readonly string[] = [
  'Rural Innovation & Grassroots Startups',
  'Women Entrepreneurship & Founder Stake',
  'STEM Education & Skilling',
  'Healthcare Access & MedTech',
  'Climate Resilience & CleanTech',
  'Beyond Bengaluru Cluster Development',
  'AgriTech & Farmer Producer Organisations',
  'Tier-2 & Tier-3 Digital Inclusion',
];

const PARTNERSHIP_TYPES: readonly string[] = [
  'Direct Grant',
  'Matched Funding Program',
  'Ecosystem Partnership',
  'Incubation Sponsorship',
  'Accelerator Co-Investment',
];

// --- Single-record generator ------------------------------------------------

/**
 * Build one illustrative {@link CsrPartnership} from the stable key
 * `csr-partnerships|${index}`. All fields are drawn from a single seeded stream
 * so the record is byte-stable and order-independent. `partnerType` is always a
 * member of {@link CSR_PARTNER_TYPES}; `scaleCrore` is an illustrative ₹ crore
 * figure in `[5, 50]`.
 */
function generateCsrPartnership(index: number): CsrPartnership {
  const rng = seededRng(`csr-partnerships|${index}`);

  const partnerName = seededPick(rng, PARTNER_NAMES);
  const partnerType: CsrPartnerType = seededPick(rng, CSR_PARTNER_TYPES);
  const focusArea = seededPick(rng, FOCUS_AREAS);
  const scaleCrore = seededInt(rng, 5, 50);
  const partnershipType = seededPick(rng, PARTNERSHIP_TYPES);

  return {
    id: `csr-partnership-${index}`,
    partnerName,
    partnerType,
    focusArea,
    scaleCrore,
    partnershipType,
  };
}

// --- Public API -------------------------------------------------------------

/**
 * Generate the EXACTLY 6 illustrative CSR partnership records. Pure and
 * byte-stable: the same deep-equal array is returned on every call, with each
 * record seeded by `csr-partnerships|${i}`. Every `partnerType` is one of the
 * four canonical {@link CSR_PARTNER_TYPES}; all CSR figures are illustrative.
 */
export function generateCsrPartnerships(): CsrPartnership[] {
  return Array.from({ length: CSR_PARTNERSHIP_COUNT }, (_, i) =>
    generateCsrPartnership(i),
  );
}

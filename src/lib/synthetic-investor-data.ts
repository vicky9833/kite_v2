// src/lib/synthetic-investor-data.ts
//
// ===========================================================================
// Determinism contract (Req 6.3, 6.4, 6.5)
// ---------------------------------------------------------------------------
//  - Every export is PURE and hash-seeded solely from its string key (and the
//    explicit arguments passed in). The same key always yields deep-equal
//    output, in every process, on every reload — the investor preview is
//    byte-stable.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    locale, environment, or any other ambient/time-dependent input. The
//    relative timestamp labels in the deal-flow ticker are FIXED strings
//    ("2h ago", …), never computed from the clock.
//  - All randomness flows through `synthetic-prng.ts`
//    (seededRng/seededInt/seededPick); every helper respects its stated range.
//  - Canonical taxonomy (sectors, clusters) comes from `src/data/*`; nothing
//    here fabricates sector or cluster ids.
// ===========================================================================

import type {
  ClusterFraming,
  DealFlowEvent,
  InvestmentStage,
  LocationKarnataka,
  OpportunityCardData,
  SectorCountSeries,
  SectorFundingDatum,
  StartupCandidate,
} from '@/types';
import { sectors } from '@/data/sectors';
import { KITE_ID_ALPHABET } from '@/lib/kite-id-generator';
import { seededInt, seededPick, seededRng } from '@/lib/synthetic-prng';

// --- Fixed, time-independent label/value pools -----------------------------

const INVESTMENT_STAGES: readonly InvestmentStage[] = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B Plus',
  'Growth',
];

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

const DEAL_TYPES: readonly string[] = [
  'Seed round',
  'Pre-Seed round',
  'Series A round',
  'Series B round',
  'Bridge',
  'Follow-on',
  'Angel round',
];

// Fixed relative labels — never derived from the clock (Req 10.2).
const TIMESTAMP_LABELS: readonly string[] = [
  '15m ago',
  '40m ago',
  '1h ago',
  '2h ago',
  '3h ago',
  '5h ago',
  '8h ago',
  '12h ago',
  '1d ago',
  '2d ago',
];

// 24 fixed month labels (two fiscal years) for the sector-count growth series.
const MONTHS: readonly string[] = [
  "Jan '23", "Feb '23", "Mar '23", "Apr '23", "May '23", "Jun '23",
  "Jul '23", "Aug '23", "Sep '23", "Oct '23", "Nov '23", "Dec '23",
  "Jan '24", "Feb '24", "Mar '24", "Apr '24", "May '24", "Jun '24",
  "Jul '24", "Aug '24", "Sep '24", "Oct '24", "Nov '24", "Dec '24",
];

const NAME_PREFIXES: readonly string[] = [
  'Vega', 'Nova', 'Astra', 'Kaveri', 'Tunga', 'Sahya', 'Indus', 'Orbit',
  'Pixel', 'Quanta', 'Lumen', 'Terra', 'Cobalt', 'Ember', 'Drishti', 'Saaki',
];

const NAME_SUFFIXES: readonly string[] = [
  'Labs', 'Works', 'AI', 'Systems', 'Tech', 'Networks', 'Dynamics',
  'Ventures', 'Bio', 'Mobility', 'Health', 'Logic',
];

const PITCH_VERBS: readonly string[] = [
  'building', 'scaling', 'reimagining', 'automating', 'democratizing',
];

const PITCH_MARKETS: readonly string[] = [
  'emerging markets',
  'Indian SMBs',
  'rural Karnataka',
  'enterprise teams',
  'frontline workers',
  'the next billion users',
];

/** Fixed synthetic year for candidate KITE ids — never clock-derived. */
const SYNTHETIC_ID_YEAR = 2024;

// --- Internal pure builders ------------------------------------------------

function makeCompanyName(rng: () => number): string {
  return `${seededPick(rng, NAME_PREFIXES)} ${seededPick(rng, NAME_SUFFIXES)}`;
}

function makePitch(rng: () => number, company: string, sectorName: string): string {
  return `${company} is ${seededPick(rng, PITCH_VERBS)} ${sectorName.toLowerCase()} solutions for ${seededPick(rng, PITCH_MARKETS)}.`;
}

/** Synthetic KITE id: seeded RNG fed into the canonical KITE-id alphabet. */
function makeKiteId(rng: () => number): string {
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    const index = seededInt(rng, 0, KITE_ID_ALPHABET.length - 1);
    suffix += KITE_ID_ALPHABET[index] ?? 'A';
  }
  return `KITE-${SYNTHETIC_ID_YEAR}-${suffix}`;
}

// --- Public generators -----------------------------------------------------

/** Exactly 6 featured opportunity cards, seeded `featured|<i>` (Req 9.1). */
export function getFeaturedOpportunities(): OpportunityCardData[] {
  return Array.from({ length: 6 }, (_, i) => {
    const rng = seededRng(`featured|${i}`);
    const sector = seededPick(rng, sectors);
    const companyName = makeCompanyName(rng);
    const stage = seededPick(rng, INVESTMENT_STAGES);
    const askLakhs = seededInt(rng, 50, 2000);
    const location = seededPick(rng, LOCATIONS);
    const pitch = makePitch(rng, companyName, sector.name);
    return {
      id: `featured-${i}`,
      companyName,
      sector: sector.id,
      stage,
      askLakhs,
      pitch,
      location,
    };
  });
}

/** Exactly 20 deal-flow ticker events, seeded `ticker|<i>` (Req 10.2). */
export function getDealFlowTicker(): DealFlowEvent[] {
  return Array.from({ length: 20 }, (_, i) => {
    const rng = seededRng(`ticker|${i}`);
    const sector = seededPick(rng, sectors);
    const stage = seededPick(rng, INVESTMENT_STAGES);
    const dealType = seededPick(rng, DEAL_TYPES);
    const amountLakhs = seededInt(rng, 25, 1500);
    const timestampLabel = seededPick(rng, TIMESTAMP_LABELS);
    return {
      id: `ticker-${i}`,
      timestampLabel,
      sector: sector.id,
      stage,
      dealType,
      amountLakhs,
    };
  });
}

/** Exactly 50 startup candidates, seeded `candidate|<seedKey>|<i>` (Req 20.2). */
export function getCandidatePool(seedKey: string): StartupCandidate[] {
  return Array.from({ length: 50 }, (_, i) => {
    const rng = seededRng(`candidate|${seedKey}|${i}`);
    const sector = seededPick(rng, sectors);
    const companyName = makeCompanyName(rng);
    const stage = seededPick(rng, INVESTMENT_STAGES);
    const askLakhs = seededInt(rng, 25, 2500);
    const location = seededPick(rng, LOCATIONS);
    const kiteId = makeKiteId(rng);
    const pitch = makePitch(rng, companyName, sector.name);
    return { kiteId, companyName, sector: sector.id, stage, askLakhs, location, pitch };
  });
}

/**
 * Exactly 10 canonical sectors mapped to a seeded funding figure (₹ Cr),
 * sorted strictly non-increasing by `fundingCrore` with a stable `sectorId`
 * tie-break (Req 13.2).
 */
export function getSectorFundingTop10(): SectorFundingDatum[] {
  const data: SectorFundingDatum[] = sectors.slice(0, 10).map((s) => {
    const rng = seededRng(`sector-funding|${s.id}`);
    return { sectorId: s.id, name: s.name, fundingCrore: seededInt(rng, 50, 1200) };
  });
  return data.sort((a, b) => {
    if (b.fundingCrore !== a.fundingCrore) return b.fundingCrore - a.fundingCrore;
    return a.sectorId < b.sectorId ? -1 : a.sectorId > b.sectorId ? 1 : 0;
  });
}

/**
 * Top-5 sectors (by funding) with a 24-month seeded startup-count series each
 * (Req 13.3). `months` is a fixed 24-label array; every series `counts` has
 * length 24.
 */
export function getSectorCountGrowth(): SectorCountSeries {
  const top5 = getSectorFundingTop10().slice(0, 5);
  const series = top5.map((s) => {
    const rng = seededRng(`sector-growth|${s.sectorId}`);
    const counts = MONTHS.map(() => seededInt(rng, 20, 400));
    return { sectorId: s.sectorId, name: s.name, counts };
  });
  return { months: [...MONTHS], series };
}

/**
 * Seeded investor framing for a cluster: soonicorn count + co-invest capacity
 * (₹ Cr), seeded `cluster-framing|<clusterId>` (Req 12.2).
 */
export function getClusterInvestorFraming(clusterId: string): ClusterFraming {
  const rng = seededRng(`cluster-framing|${clusterId}`);
  return {
    clusterId,
    soonicornCount: seededInt(rng, 1, 9),
    coInvestCapacityCrore: seededInt(rng, 10, 75),
  };
}

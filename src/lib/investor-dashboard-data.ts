// src/lib/investor-dashboard-data.ts
//
// ===========================================================================
// Determinism contract (Req 6.2, 6.3, 6.4, 6.5)
// ---------------------------------------------------------------------------
//  - Every export is PURE and hash-seeded solely from its string key (and the
//    explicit arguments passed in). The same key always yields deep-equal
//    output, in every process, on every reload — the dashboard preview is
//    byte-stable.
//  - There is NO use of ambient randomness (the platform RNG), the clock/time
//    APIs, `performance` timing, locale, environment, or any other
//    ambient/time-dependent input. Relative "last login" labels and invested
//    dates are FIXED strings drawn from a seeded pool, never computed from the
//    clock.
//  - All randomness flows through `synthetic-prng.ts`
//    (seededRng/seededInt/seededPick/seededFloat); every helper respects its
//    stated range.
//  - Canonical sector taxonomy comes from `src/data/sectors`; nothing here
//    fabricates sector ids.
// ===========================================================================

import type {
  EcosystemSignalsData,
  FundingPoint,
  InvestmentStage,
  KitvenCoInvestment,
  LocationKarnataka,
  PortfolioCompany,
  PortfolioStatus,
} from '@/types';
import { sectors } from '@/data/sectors';
import {
  seededFloat,
  seededInt,
  seededPick,
  seededRng,
} from '@/lib/synthetic-prng';

// --- Fixed, time-independent label/value pools -----------------------------

const INVESTMENT_STAGES: readonly InvestmentStage[] = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B Plus',
  'Growth',
];

const PORTFOLIO_STATUSES: readonly PortfolioStatus[] = [
  'Active',
  'Active',
  'Active',
  'Exited',
  'Written-Off',
  'Folded',
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

// Fixed invested-date pool — never derived from the clock (Req 21.x).
const INVESTED_DATES: readonly string[] = [
  '2021-04-15',
  '2021-09-02',
  '2022-01-20',
  '2022-06-11',
  '2022-11-30',
  '2023-03-08',
  '2023-08-22',
  '2024-02-14',
];

// Fixed relative "last login" labels — never clock-derived (Req 18.2).
const LAST_LOGIN_LABELS: readonly string[] = [
  'Last login: 2 hours ago',
  'Last login: 5 hours ago',
  'Last login: yesterday',
  'Last login: 2 days ago',
  'Last login: 3 days ago',
  'Last login: last week',
];

// 12 fixed month labels for the ecosystem funding line (Req 23.2).
const FUNDING_MONTHS: readonly string[] = [
  "Jan '24", "Feb '24", "Mar '24", "Apr '24", "May '24", "Jun '24",
  "Jul '24", "Aug '24", "Sep '24", "Oct '24", "Nov '24", "Dec '24",
];

const COMPANY_PREFIXES: readonly string[] = [
  'Kaveri', 'Tunga', 'Sahya', 'Vega', 'Nova', 'Astra', 'Orbit', 'Lumen',
  'Terra', 'Drishti', 'Saaki', 'Indus',
];

const COMPANY_SUFFIXES: readonly string[] = [
  'Labs', 'Works', 'AI', 'Systems', 'Tech', 'Health', 'Mobility', 'Bio',
];

// --- Internal pure builders ------------------------------------------------

function makeCompanyName(rng: () => number): string {
  return `${seededPick(rng, COMPANY_PREFIXES)} ${seededPick(rng, COMPANY_SUFFIXES)}`;
}

// --- Public generators -----------------------------------------------------

/**
 * Deterministic portfolio seed set (a handful of companies), seeded
 * `portfolio|<seedKey>|<i>` (Req 21.1). Returns 4 companies.
 */
export function getPortfolioSeed(seedKey: string): PortfolioCompany[] {
  return Array.from({ length: 4 }, (_, i) => {
    const rng = seededRng(`portfolio|${seedKey}|${i}`);
    const sector = seededPick(rng, sectors);
    const companyName = makeCompanyName(rng);
    const stage = seededPick(rng, INVESTMENT_STAGES);
    const investedAmountLakhs = seededInt(rng, 50, 2000);
    const investedDate = seededPick(rng, INVESTED_DATES);
    const currentStatus = seededPick(rng, PORTFOLIO_STATUSES);
    const location = seededPick(rng, LOCATIONS);
    return {
      id: `pf-${seedKey}-${i}`,
      companyName,
      sector: sector.id,
      stage,
      investedAmountLakhs,
      investedDate,
      currentStatus,
      location,
    };
  });
}

/**
 * KITVEN co-investments: a seeded count in `[3,4]`, then that many rows of
 * company/sector/stage/amount, seeded `kitven|<seedKey>|<i>` (Req 23.4).
 */
export function getKitvenCoInvestments(seedKey: string): KitvenCoInvestment[] {
  const countRng = seededRng(`kitven-count|${seedKey}`);
  const count = seededInt(countRng, 3, 4);
  return Array.from({ length: count }, (_, i) => {
    const rng = seededRng(`kitven|${seedKey}|${i}`);
    const sector = seededPick(rng, sectors);
    const companyName = makeCompanyName(rng);
    const stage = seededPick(rng, INVESTMENT_STAGES);
    const amountLakhs = seededInt(rng, 100, 1500);
    return {
      id: `kitven-${seedKey}-${i}`,
      companyName,
      sector: sector.id,
      stage,
      amountLakhs,
    };
  });
}

/**
 * Ecosystem signals chart data (Req 23.2, 23.3):
 *  - `focusSectorsFunding`: exactly 12 `FundingPoint`s (line), seeded from the
 *    focus-sector list.
 *  - `stageDistribution`: one `{ stage, count }` entry per focus stage (bar),
 *    seeded from the focus-stage list.
 */
export function getEcosystemSignals(
  focusSectors: string[],
  focusStages: InvestmentStage[],
): EcosystemSignalsData {
  const fundingSeed = focusSectors.join(',');
  const focusSectorsFunding: FundingPoint[] = FUNDING_MONTHS.map((month, i) => {
    const rng = seededRng(`signals-funding|${fundingSeed}|${i}`);
    return { month, rupeesCrore: seededInt(rng, 50, 900) };
  });

  const stageDistribution = focusStages.map((stage) => {
    const rng = seededRng(`signals-stage|${focusStages.join(',')}|${stage}`);
    return { stage, count: seededInt(rng, 5, 120) };
  });

  return { focusSectorsFunding, stageDistribution };
}

/** Fixed synthetic relative "last login" label, seeded `last-login|<seedKey>` (Req 18.2). */
export function getLastLoginLabel(seedKey: string): string {
  const rng = seededRng(`last-login|${seedKey}`);
  return seededPick(rng, LAST_LOGIN_LABELS);
}

/** Seeded synthetic exit count for the year, seeded `exits|<seedKey>` (Req 19.6). */
export function getExitsThisYear(seedKey: string): number {
  const rng = seededRng(`exits|${seedKey}`);
  return seededInt(rng, 0, 5);
}

/**
 * Seeded synthetic current estimated value (lakhs) for a portfolio company,
 * seeded `estimated-value|<company.id>` (Req 21.1). Scales the invested amount
 * by a seeded multiplier in `[0.5, 4]` so the figure is plausibly above or
 * below cost.
 */
export function getCurrentEstimatedValue(company: PortfolioCompany): number {
  const rng = seededRng(`estimated-value|${company.id}`);
  const multiplier = seededFloat(rng, 0.5, 4);
  return Math.round(company.investedAmountLakhs * multiplier);
}

/** Seeded synthetic days-in-stage for a deal, seeded `days-in-stage|<dealId>` (Req 28.3). */
export function getDaysInStage(dealId: string): number {
  const rng = seededRng(`days-in-stage|${dealId}`);
  return seededInt(rng, 1, 90);
}

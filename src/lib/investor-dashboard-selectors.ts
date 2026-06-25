// src/lib/investor-dashboard-selectors.ts
//
// Pure six-KPI derivations for the Investor Dashboard (Req 19.2–19.7).
//
// Every selector is a total, pure function of the supplied `InvestorProfile`
// (and, for the synthetic exits figure, the deterministic dashboard-data
// module). All selectors null-guard the profile and return a safe `0`/empty
// result so callers stay total under `noUncheckedIndexedAccess`.

import type { DealStage, InvestorProfile, LocationKarnataka } from '@/types';
import { getCurrentEstimatedValue, getExitsThisYear } from '@/lib/investor-dashboard-data';

/** Deal stages that are NOT considered active pipeline. */
const INACTIVE_DEAL_STAGES: ReadonlySet<DealStage> = new Set<DealStage>([
  'Closed',
  'Passed',
]);

/** All Karnataka location values (every `LocationKarnataka` member is in Karnataka). */
const KARNATAKA_LOCATIONS: ReadonlySet<LocationKarnataka> = new Set<LocationKarnataka>([
  'Bengaluru Urban',
  'Bengaluru Rural',
  'Mysuru',
  'Mangaluru',
  'Hubballi-Dharwad-Belagavi',
  'Kalaburagi',
  'Shivamogga',
  'Tumakuru',
  'Other Karnataka',
]);

/**
 * Synthetic aggregate portfolio value (lakhs): the sum of each portfolio
 * company's seeded current estimated value (Req 19.2).
 */
export function selectPortfolioValue(profile: InvestorProfile | null): number {
  if (!profile) return 0;
  return profile.portfolioCompanies.reduce(
    (total, company) => total + getCurrentEstimatedValue(company),
    0,
  );
}

/**
 * Count of active deals — deals whose `currentStage` is neither `Closed` nor
 * `Passed` (Req 19.3).
 */
export function selectActiveDealCount(profile: InvestorProfile | null): number {
  if (!profile) return 0;
  return profile.dealsTracked.filter(
    (deal) => !INACTIVE_DEAL_STAGES.has(deal.currentStage),
  ).length;
}

/**
 * Pipeline value (lakhs): the sum of `askLakhs` over exactly the active deals
 * (Req 19.4).
 */
export function selectPipelineValue(profile: InvestorProfile | null): number {
  if (!profile) return 0;
  return profile.dealsTracked
    .filter((deal) => !INACTIVE_DEAL_STAGES.has(deal.currentStage))
    .reduce((total, deal) => total + deal.askLakhs, 0);
}

/** Count of portfolio companies whose `currentStatus` is `Active` (Req 19.5). */
export function selectActiveCompanyCount(profile: InvestorProfile | null): number {
  if (!profile) return 0;
  return profile.portfolioCompanies.filter(
    (company) => company.currentStatus === 'Active',
  ).length;
}

/** Synthetic exits-this-year count, seeded by the investor id (Req 19.6). */
export function selectExitsThisYear(profile: InvestorProfile | null): number {
  if (!profile) return 0;
  return getExitsThisYear(profile.investorId);
}

/**
 * Karnataka allocation as a percentage in the inclusive range `[0, 100]`: the
 * share of portfolio companies located in Karnataka, by count. Returns `0`
 * for an empty (or null) portfolio (Req 19.7).
 */
export function selectKarnatakaAllocation(profile: InvestorProfile | null): number {
  if (!profile) return 0;
  const companies = profile.portfolioCompanies;
  if (companies.length === 0) return 0;
  const inKarnataka = companies.filter(
    (company) => company.location !== undefined && KARNATAKA_LOCATIONS.has(company.location),
  ).length;
  return (inKarnataka / companies.length) * 100;
}

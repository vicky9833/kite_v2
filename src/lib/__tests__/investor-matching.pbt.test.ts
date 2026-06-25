// Feature: kite-investor-suite, Property 1: Match score is always within [0,100]
// Feature: kite-investor-suite, Property 2: Signal bins match the score thresholds
// Feature: kite-investor-suite, Property 3: Match reasons are never empty
// Feature: kite-investor-suite, Property 4: evaluateMatch is deterministic and derives startupId from kiteId
// Feature: kite-investor-suite, Property 5: evaluateSchemeRelevance is deterministic with a non-empty reason
// Feature: kite-investor-suite, Property 6: KITVEN Fund-5 is relevant to every investor
//
// Property-based tests for the pure investor matching engine
// (`src/lib/investor-matching.ts`). All targets are pure, so these run cheaply
// at numRuns: 100. The arbitraries build structurally valid InvestorProfile and
// StartupCandidate values drawn from the canonical enums, and deliberately
// include edge cases (empty focusSectors/focusStages, zero/equal ticket bands,
// non-Karnataka geographic focus).

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import { evaluateMatch, evaluateSchemeRelevance } from '@/lib/investor-matching';
import { schemes } from '@/data/schemes';
import { sectors } from '@/data/sectors';
import type {
  FirmType,
  InvestmentStage,
  InvestorProfile,
  InvestorRole,
  LocationKarnataka,
  Scheme,
  StartupCandidate,
} from '@/types';

/* -------------------------------------------------------------------------- */
/* Canonical enum domains                                                     */
/* -------------------------------------------------------------------------- */

const SECTOR_IDS: readonly string[] = sectors.map((s) => s.id);

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

const INVESTOR_ROLES: readonly InvestorRole[] = [
  'GP',
  'Partner',
  'Principal',
  'Associate',
  'Angel',
  'Family Office',
  'Corporate VC',
  'Government Fund',
];

const FIRM_TYPES: readonly FirmType[] = [
  'VC',
  'Angel Network',
  'Family Office',
  'Corporate VC',
  'Government Fund',
  'Accelerator Fund',
];

const GEO_FOCUS_OPTIONS: readonly string[] = [
  'Karnataka',
  'Karnataka Beyond Bengaluru',
  'India',
  'Global',
  'Bengaluru Urban',
  'Mysuru',
];

/* -------------------------------------------------------------------------- */
/* Arbitraries                                                                */
/* -------------------------------------------------------------------------- */

const investorArb: fc.Arbitrary<InvestorProfile> = fc
  .record({
    investorName: fc.string({ minLength: 2, maxLength: 12 }),
    firmName: fc.string({ minLength: 2, maxLength: 12 }),
    investorEmail: fc.constant('investor@example.com'),
    investorPhone: fc.constant('9876543210'),
    role: fc.constantFrom(...INVESTOR_ROLES),
    firmType: fc.constantFrom(...FIRM_TYPES),
    assetsUnderManagement: fc.nat({ max: 1_000_000 }),
    foundedYear: fc.integer({ min: 1900, max: 2024 }),
    // Edge cases: focusSectors / focusStages may be empty.
    focusSectors: fc.uniqueArray(fc.constantFrom(...SECTOR_IDS), { maxLength: 5 }),
    focusStages: fc.uniqueArray(fc.constantFrom(...INVESTMENT_STAGES), {
      maxLength: 5,
    }),
    // Two non-negative bounds; normalized below so max >= min (incl. equal/zero).
    ticketLo: fc.nat({ max: 5000 }),
    ticketHi: fc.nat({ max: 5000 }),
    geographicFocus: fc.uniqueArray(fc.constantFrom(...GEO_FOCUS_OPTIONS), {
      maxLength: 3,
    }),
  })
  .map((r) => {
    const ticketSizeMinLakhs = Math.min(r.ticketLo, r.ticketHi);
    const ticketSizeMaxLakhs = Math.max(r.ticketLo, r.ticketHi);
    const profile: InvestorProfile = {
      investorName: r.investorName,
      firmName: r.firmName,
      investorEmail: r.investorEmail,
      investorPhone: r.investorPhone,
      role: r.role,
      firmType: r.firmType,
      assetsUnderManagement: r.assetsUnderManagement,
      foundedYear: r.foundedYear,
      focusSectors: r.focusSectors,
      focusStages: r.focusStages,
      ticketSizeMinLakhs,
      ticketSizeMaxLakhs,
      geographicFocus: r.geographicFocus,
      portfolioCompanies: [],
      dealsTracked: [],
      isOnboarded: true,
      investorId: 'INV-2024-ABCDEF',
      onboardedAt: '2024-01-01T00:00:00.000Z',
    };
    return profile;
  });

const startupArb: fc.Arbitrary<StartupCandidate> = fc.record({
  kiteId: fc.string({ minLength: 1, maxLength: 16 }),
  companyName: fc.string({ minLength: 1, maxLength: 16 }),
  sector: fc.constantFrom(...SECTOR_IDS),
  stage: fc.constantFrom(...INVESTMENT_STAGES),
  askLakhs: fc.nat({ max: 10_000 }),
  location: fc.constantFrom(...LOCATIONS),
  pitch: fc.string({ maxLength: 40 }),
});

const schemeArb: fc.Arbitrary<Scheme> = fc.constantFrom(...schemes);

/** A profile guaranteed to score 0 on every factor (for Property 3 edge case). */
const zeroScoringInvestorArb: fc.Arbitrary<InvestorProfile> = investorArb.map(
  (p) => ({
    ...p,
    focusSectors: [], //   no sector overlap → sector factor 0
    focusStages: [], //    no stage overlap → stage factor 0
    ticketSizeMinLakhs: 0, // empty [0,0] band; paired with a positive ask below
    ticketSizeMaxLakhs: 0, // so the ask never falls inside the band → ticket 0
    geographicFocus: [], // no geo coverage at all → geo factor 0
  }),
);

/**
 * A startup whose ask is strictly positive. Paired with the [0,0] ticket band of
 * `zeroScoringInvestorArb`, this guarantees the ticket factor scores 0 (a band of
 * [0,0] would otherwise legitimately *match* an ask of 0).
 */
const positiveAskStartupArb: fc.Arbitrary<StartupCandidate> = startupArb.map(
  (s) => ({ ...s, askLakhs: s.askLakhs + 1 }),
);

/* -------------------------------------------------------------------------- */
/* Property 1: score is an integer in [0,100]                                 */
/* -------------------------------------------------------------------------- */

describe('Property 1: match score is always within [0,100]', () => {
  it('returns an integer score in the inclusive range 0..100', () => {
    fc.assert(
      fc.property(investorArb, startupArb, (investor, startup) => {
        const { score } = evaluateMatch(investor, startup);
        expect(Number.isInteger(score)).toBe(true);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }),
      { numRuns: 100 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Property 2: signal bins match the score thresholds                         */
/* -------------------------------------------------------------------------- */

describe('Property 2: signal bins match the score thresholds', () => {
  it('maps strong iff >=80, possible iff 50..79, out-of-thesis iff <50', () => {
    fc.assert(
      fc.property(investorArb, startupArb, (investor, startup) => {
        const { score, signal } = evaluateMatch(investor, startup);
        if (score >= 80) {
          expect(signal).toBe('strong');
        } else if (score >= 50) {
          expect(signal).toBe('possible');
        } else {
          expect(signal).toBe('out-of-thesis');
        }
        // And the reverse implication: each signal pins the score band.
        if (signal === 'strong') expect(score).toBeGreaterThanOrEqual(80);
        if (signal === 'possible') {
          expect(score).toBeGreaterThanOrEqual(50);
          expect(score).toBeLessThanOrEqual(79);
        }
        if (signal === 'out-of-thesis') expect(score).toBeLessThan(50);
      }),
      { numRuns: 100 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Property 3: reasons are never empty (even when all factors score 0)        */
/* -------------------------------------------------------------------------- */

describe('Property 3: match reasons are never empty', () => {
  it('returns a non-empty reasons array for any inputs', () => {
    fc.assert(
      fc.property(investorArb, startupArb, (investor, startup) => {
        const { reasons } = evaluateMatch(investor, startup);
        expect(reasons.length).toBeGreaterThanOrEqual(1);
        expect(reasons.every((r) => r.length > 0)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('returns non-empty reasons even when every factor scores 0', () => {
    fc.assert(
      fc.property(
        zeroScoringInvestorArb,
        positiveAskStartupArb,
        (investor, startup) => {
          const { score, reasons } = evaluateMatch(investor, startup);
          expect(score).toBe(0);
          expect(reasons.length).toBeGreaterThanOrEqual(1);
        },
      ),
      { numRuns: 100 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Property 4: deterministic + startupId derived from kiteId                  */
/* -------------------------------------------------------------------------- */

describe('Property 4: evaluateMatch is deterministic and derives startupId from kiteId', () => {
  it('yields deep-equal results across two calls and sets startupId === kiteId', () => {
    fc.assert(
      fc.property(investorArb, startupArb, (investor, startup) => {
        const first = evaluateMatch(investor, startup);
        const second = evaluateMatch(investor, startup);
        expect(first).toEqual(second);
        expect(first.startupId).toBe(startup.kiteId);
      }),
      { numRuns: 100 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Property 5: scheme relevance is deterministic with a non-empty reason      */
/* -------------------------------------------------------------------------- */

describe('Property 5: evaluateSchemeRelevance is deterministic with a non-empty reason', () => {
  it('yields deep-equal results across two calls with a non-empty reason', () => {
    fc.assert(
      fc.property(investorArb, schemeArb, (investor, scheme) => {
        const first = evaluateSchemeRelevance(investor, scheme);
        const second = evaluateSchemeRelevance(investor, scheme);
        expect(first).toEqual(second);
        expect(first.reason.length).toBeGreaterThan(0);
        expect(first.schemeId).toBe(scheme.id);
      }),
      { numRuns: 100 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Property 6: KITVEN Fund-5 is relevant to every investor                    */
/* -------------------------------------------------------------------------- */

describe('Property 6: KITVEN Fund-5 is relevant to every investor', () => {
  const kitvenFund5 = schemes.find((s) => s.id === 'kitven-fund-5');

  it('has the canonical KITVEN Fund-5 scheme in the data set', () => {
    expect(kitvenFund5).toBeDefined();
  });

  it('returns isRelevant === true for any investor', () => {
    fc.assert(
      fc.property(investorArb, (investor) => {
        const result = evaluateSchemeRelevance(investor, kitvenFund5 as Scheme);
        expect(result.isRelevant).toBe(true);
        expect(result.reason.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});

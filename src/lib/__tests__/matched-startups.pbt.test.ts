// Feature: kite-investor-suite, Property 17: Top matches are the highest scorers in non-increasing order
//
// Property-based test for `selectTopMatches` (src/lib/investor-match-display.ts),
// the pure selection extracted from MatchedStartupsSection so the ranking can be
// exercised without a DOM. For any candidate pool and any investor profile,
// selecting the top six (sort by score desc, tie-break startupId) must:
//   - return at most six results,
//   - be ordered non-increasing by score, and
//   - exclude no candidate that outscores an included one.
//
// The arbitraries build structurally valid InvestorProfile and StartupCandidate
// values from the canonical enums, including edge cases (empty focus arrays,
// equal/zero ticket bands, pools both smaller and larger than the limit).

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import { evaluateMatch } from '@/lib/investor-matching';
import { selectTopMatches } from '@/lib/investor-match-display';
import { sectors } from '@/data/sectors';
import type {
  FirmType,
  InvestmentStage,
  InvestorProfile,
  InvestorRole,
  LocationKarnataka,
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
    role: fc.constantFrom(...INVESTOR_ROLES),
    firmType: fc.constantFrom(...FIRM_TYPES),
    assetsUnderManagement: fc.nat({ max: 1_000_000 }),
    foundedYear: fc.integer({ min: 1900, max: 2024 }),
    focusSectors: fc.uniqueArray(fc.constantFrom(...SECTOR_IDS), { maxLength: 5 }),
    focusStages: fc.uniqueArray(fc.constantFrom(...INVESTMENT_STAGES), {
      maxLength: 5,
    }),
    ticketLo: fc.nat({ max: 5000 }),
    ticketHi: fc.nat({ max: 5000 }),
    geographicFocus: fc.uniqueArray(fc.constantFrom(...GEO_FOCUS_OPTIONS), {
      maxLength: 3,
    }),
  })
  .map((r) => {
    const profile: InvestorProfile = {
      investorName: r.investorName,
      firmName: r.firmName,
      investorEmail: 'investor@example.com',
      investorPhone: '9876543210',
      role: r.role,
      firmType: r.firmType,
      assetsUnderManagement: r.assetsUnderManagement,
      foundedYear: r.foundedYear,
      focusSectors: r.focusSectors,
      focusStages: r.focusStages,
      ticketSizeMinLakhs: Math.min(r.ticketLo, r.ticketHi),
      ticketSizeMaxLakhs: Math.max(r.ticketLo, r.ticketHi),
      geographicFocus: r.geographicFocus,
      portfolioCompanies: [],
      dealsTracked: [],
      isOnboarded: true,
      investorId: 'INV-2024-ABCDEF',
      onboardedAt: '2024-01-01T00:00:00.000Z',
    };
    return profile;
  });

// Unique kiteId per candidate keeps the tie-break total and avoids ambiguity.
const candidatePoolArb: fc.Arbitrary<StartupCandidate[]> = fc.uniqueArray(
  fc.record({
    kiteId: fc.string({ minLength: 1, maxLength: 16 }),
    companyName: fc.string({ minLength: 1, maxLength: 16 }),
    sector: fc.constantFrom(...SECTOR_IDS),
    stage: fc.constantFrom(...INVESTMENT_STAGES),
    askLakhs: fc.nat({ max: 10_000 }),
    location: fc.constantFrom(...LOCATIONS),
    pitch: fc.string({ maxLength: 40 }),
  }),
  { maxLength: 30, selector: (c) => c.kiteId },
);

/* -------------------------------------------------------------------------- */
/* Property 17                                                                */
/* -------------------------------------------------------------------------- */

describe('Property 17: top matches are the highest scorers in non-increasing order', () => {
  it('returns at most `limit`, ordered non-increasing, with no excluded outscorer', () => {
    fc.assert(
      fc.property(
        investorArb,
        candidatePoolArb,
        fc.integer({ min: 1, max: 10 }),
        (investor, pool, limit) => {
          const selected = selectTopMatches(investor, pool, limit);

          // (1) At most `limit` (and never more than the pool size).
          expect(selected.length).toBeLessThanOrEqual(limit);
          expect(selected.length).toBeLessThanOrEqual(pool.length);

          // (2) Ordered non-increasing by score.
          for (let i = 1; i < selected.length; i += 1) {
            const prev = selected[i - 1]!;
            const curr = selected[i]!;
            expect(prev.match.score).toBeGreaterThanOrEqual(curr.match.score);
          }

          // (3) No excluded candidate outscores any included one.
          const includedIds = new Set(selected.map((m) => m.candidate.kiteId));
          const excluded = pool.filter((c) => !includedIds.has(c.kiteId));
          if (selected.length > 0 && selected.length < pool.length) {
            const minIncluded = Math.min(
              ...selected.map((m) => m.match.score),
            );
            for (const candidate of excluded) {
              const score = evaluateMatch(investor, candidate).score;
              expect(score).toBeLessThanOrEqual(minIncluded);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('defaults to a limit of six when none is supplied', () => {
    fc.assert(
      fc.property(investorArb, candidatePoolArb, (investor, pool) => {
        const selected = selectTopMatches(investor, pool);
        expect(selected.length).toBeLessThanOrEqual(6);
        expect(selected.length).toBeLessThanOrEqual(pool.length);
      }),
      { numRuns: 100 },
    );
  });
});

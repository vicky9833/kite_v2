// Property-based tests for the pure Deal Pipeline helpers.
//
// Feature: kite-investor-suite
//   Property 18 — filterDeals is sound and returns a subset.
//   Property 19 — dealsToCsv row count is deterministic (deals.length + 1).
//   Property 20 — computeStageAnalytics stays within bounds.
//   Property 21 — within-stage ordering follows the manual order.
//
// Each property runs with { numRuns: 100 }.

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import type { TrackedDeal, DealStage, InvestmentStage } from '@/types';
import { DEAL_STAGE_ORDER } from '@/types';
import { sectors } from '@/data/sectors';
import {
  filterDeals,
  dealsForStage,
  dealsToCsv,
  computeStageAnalytics,
  type DealFilters,
} from '@/lib/deal-pipeline';

/* -------------------------------------------------------------------------- */
/* Arbitraries                                                                */
/* -------------------------------------------------------------------------- */

const SECTOR_IDS: string[] = sectors.map((s) => s.id);

const INVESTMENT_STAGES: InvestmentStage[] = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B Plus',
  'Growth',
];

const dealStageArb: fc.Arbitrary<DealStage> = fc.constantFrom(...DEAL_STAGE_ORDER);
const investmentStageArb: fc.Arbitrary<InvestmentStage> = fc.constantFrom(...INVESTMENT_STAGES);
const sectorIdArb: fc.Arbitrary<string> = fc.constantFrom(...SECTOR_IDS);

// A well-formed TrackedDeal. companyName / notes may contain commas, quotes and
// newlines so the CSV escaping path is exercised by Property 19.
const trackedDealArb: fc.Arbitrary<TrackedDeal> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 12 }),
  companyName: fc.string({ maxLength: 30 }),
  sector: sectorIdArb,
  stage: investmentStageArb,
  askLakhs: fc.double({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
  currentStage: dealStageArb,
  orderInStage: fc.integer({ min: 0, max: 1000 }),
  notes: fc.option(fc.string({ maxLength: 30 }), { nil: undefined }),
});

const dealsArb: fc.Arbitrary<TrackedDeal[]> = fc.array(trackedDealArb, { maxLength: 40 });

// DealFilters where each criterion is independently present or absent.
const filtersArb: fc.Arbitrary<DealFilters> = fc.record({
  sector: fc.option(sectorIdArb, { nil: undefined }),
  stageRange: fc.option(
    fc.record({
      fromIndex: fc.integer({ min: 0, max: DEAL_STAGE_ORDER.length - 1 }),
      toIndex: fc.integer({ min: 0, max: DEAL_STAGE_ORDER.length - 1 }),
    }),
    { nil: undefined },
  ),
  askRange: fc.option(
    fc
      .tuple(
        fc.double({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 0, max: 1_000_000, noNaN: true, noDefaultInfinity: true }),
      )
      .map(([a, b]) => ({ minLakhs: Math.min(a, b), maxLakhs: Math.max(a, b) })),
    { nil: undefined },
  ),
  dateRange: fc.option(
    fc.constant({ fromIso: '2024-01-01', toIso: '2024-12-31' }),
    { nil: undefined },
  ),
  query: fc.option(fc.string({ maxLength: 6 }), { nil: undefined }),
});

/* -------------------------------------------------------------------------- */
/* Property 18 — filterDeals soundness + subset                              */
/* -------------------------------------------------------------------------- */

describe('Property 18: filterDeals is sound and returns a subset', () => {
  it('every result satisfies every active criterion and is a member of the input', () => {
    fc.assert(
      fc.property(dealsArb, filtersArb, (deals, filters) => {
        const result = filterDeals(deals, filters);

        // Subset: never longer than input, and every element is an input member
        // (by reference — no fabricated or duplicated deals).
        expect(result.length).toBeLessThanOrEqual(deals.length);
        for (const deal of result) {
          expect(deals).toContain(deal);
        }

        // Soundness: each active criterion holds for every returned deal.
        for (const deal of result) {
          if (filters.sector !== undefined) {
            expect(deal.sector).toBe(filters.sector);
          }
          if (filters.stageRange !== undefined) {
            const index = DEAL_STAGE_ORDER.indexOf(deal.currentStage);
            const lo = Math.min(filters.stageRange.fromIndex, filters.stageRange.toIndex);
            const hi = Math.max(filters.stageRange.fromIndex, filters.stageRange.toIndex);
            expect(index).toBeGreaterThanOrEqual(lo);
            expect(index).toBeLessThanOrEqual(hi);
          }
          if (filters.askRange !== undefined) {
            expect(deal.askLakhs).toBeGreaterThanOrEqual(filters.askRange.minLakhs);
            expect(deal.askLakhs).toBeLessThanOrEqual(filters.askRange.maxLakhs);
          }
          if (filters.query !== undefined) {
            expect(deal.companyName.toLowerCase()).toContain(filters.query.toLowerCase());
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Property 19 — dealsToCsv row count                                        */
/* -------------------------------------------------------------------------- */

describe('Property 19: dealsToCsv row count is deterministic', () => {
  it('produces exactly deals.length + 1 lines', () => {
    fc.assert(
      fc.property(dealsArb, (deals) => {
        const csv = dealsToCsv(deals);
        const lines = csv.split('\n');
        expect(lines.length).toBe(deals.length + 1);
      }),
      { numRuns: 100 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Property 20 — analytics bounds                                            */
/* -------------------------------------------------------------------------- */

describe('Property 20: stage analytics stay within bounds', () => {
  it('per-stage counts sum to deals.length, rates in [0,1], velocity >= 0', () => {
    fc.assert(
      fc.property(dealsArb, (deals) => {
        const analytics = computeStageAnalytics(deals);

        const sum = analytics.perStage.reduce((total, p) => total + p.count, 0);
        expect(sum).toBe(deals.length);

        for (const conv of analytics.conversion) {
          expect(conv.rate).toBeGreaterThanOrEqual(0);
          expect(conv.rate).toBeLessThanOrEqual(1);
        }

        expect(analytics.velocityThisWeek).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Property 21 — within-stage ordering + membership                          */
/* -------------------------------------------------------------------------- */

describe('Property 21: within-stage ordering follows the manual order', () => {
  it('dealsForStage returns exactly the stage members in non-decreasing orderInStage', () => {
    fc.assert(
      fc.property(dealsArb, dealStageArb, (deals, stage) => {
        const shown = dealsForStage(deals, stage);

        // Membership: exactly the deals whose currentStage equals the stage.
        const expectedCount = deals.filter((d) => d.currentStage === stage).length;
        expect(shown.length).toBe(expectedCount);
        expect(shown.every((d) => d.currentStage === stage)).toBe(true);

        // Ordering: non-decreasing orderInStage.
        for (let i = 1; i < shown.length; i++) {
          const prev = shown[i - 1] as TrackedDeal;
          const curr = shown[i] as TrackedDeal;
          expect(curr.orderInStage).toBeGreaterThanOrEqual(prev.orderInStage);
        }
      }),
      { numRuns: 100 },
    );
  });
});

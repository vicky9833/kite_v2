// Property-based tests for the admin aggregate synthetic-data module.
//
// These cover Properties 3, 4, 6, 7, 8, 9 and 10 from the kite-dashboards
// design. Each property is its own `fc.assert(..., { numRuns: 100 })` block.
// The generators are nullary and fully deterministic, so the fast-check inputs
// drive *repetition* (to exercise the determinism guarantees) and selection
// among the produced rows.

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import {
  getActivityFeed,
  getDemographics,
  getFundingTimeline,
  getInternationalPartnerships,
  getProgramPerformance,
  getRegionalDisbursement,
  getRegionalStartupCounts,
  getSchemePerformance,
  getSectorGrowth,
  getSectorTreemap,
} from '@/lib/synthetic-admin-data';
import type { GIARegion } from '@/types';
import { sectors } from '@/data/sectors';

/** The canonical set of GIA regions (matches the `GIARegion` union). */
const CANONICAL_GIA_REGIONS: ReadonlySet<GIARegion> = new Set<GIARegion>([
  'Europe',
  'Middle East',
  'Asia-Pacific',
  'Americas',
  'Africa',
]);

/** Canonical sector id set (20 sectors). */
const CANONICAL_SECTOR_IDS: ReadonlySet<string> = new Set(
  sectors.map((s) => s.id),
);

/** The 10 admin generators, each producing a fresh value on call. */
const GENERATORS: ReadonlyArray<readonly [string, () => unknown]> = [
  ['getFundingTimeline', getFundingTimeline],
  ['getSchemePerformance', getSchemePerformance],
  ['getRegionalStartupCounts', getRegionalStartupCounts],
  ['getRegionalDisbursement', getRegionalDisbursement],
  ['getSectorTreemap', getSectorTreemap],
  ['getSectorGrowth', getSectorGrowth],
  ['getDemographics', getDemographics],
  ['getProgramPerformance', getProgramPerformance],
  ['getInternationalPartnerships', getInternationalPartnerships],
  ['getActivityFeed', getActivityFeed],
];

describe('synthetic-admin-data property tests', () => {
  // Feature: kite-dashboards, Property 3
  it('Property 3: every admin generator is deep-equal on repeated calls', () => {
    fc.assert(
      fc.property(fc.constantFrom(...GENERATORS), ([, generate]) => {
        expect(generate()).toEqual(generate());
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-dashboards, Property 4
  it('Property 4: getSchemePerformance has 22 rows; approved ≤ applications, applications ≥ 0, disbursed ≥ 0', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const rows = getSchemePerformance();
        expect(rows).toHaveLength(22);
        for (const row of rows) {
          expect(row.applications).toBeGreaterThanOrEqual(0);
          expect(row.disbursed).toBeGreaterThanOrEqual(0);
          expect(row.approved).toBeLessThanOrEqual(row.applications);
          expect(row.approved).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-dashboards, Property 6
  it('Property 6: getSectorTreemap sectorId set equals canonical 20; startupCount ≥ 0, fundingIntensity ∈ [0,1]', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const nodes = getSectorTreemap();
        expect(nodes).toHaveLength(CANONICAL_SECTOR_IDS.size);
        const ids = new Set(nodes.map((n) => n.sectorId));
        expect(ids).toEqual(CANONICAL_SECTOR_IDS);
        for (const node of nodes) {
          expect(node.startupCount).toBeGreaterThanOrEqual(0);
          expect(node.fundingIntensity).toBeGreaterThanOrEqual(0);
          expect(node.fundingIntensity).toBeLessThanOrEqual(1);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-dashboards, Property 7
  it('Property 7: getSectorGrowth length 10, from canonical sectors, non-increasing by growthPct', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const growth = getSectorGrowth();
        expect(growth).toHaveLength(10);
        for (const datum of growth) {
          expect(CANONICAL_SECTOR_IDS.has(datum.sectorId)).toBe(true);
        }
        for (let i = 1; i < growth.length; i++) {
          // Non-increasing by growthPct.
          expect(growth[i - 1]!.growthPct).toBeGreaterThanOrEqual(
            growth[i]!.growthPct,
          );
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-dashboards, Property 8
  it('Property 8: getInternationalPartnerships sum countryCount = 32, regions ⊆ canonical GIARegion, jointPrograms ≥ 0', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const partnerships = getInternationalPartnerships();
        const total = partnerships.reduce((sum, p) => sum + p.countryCount, 0);
        expect(total).toBe(32);
        for (const p of partnerships) {
          expect(CANONICAL_GIA_REGIONS.has(p.region)).toBe(true);
          expect(p.jointPrograms).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-dashboards, Property 9
  it('Property 9: getProgramPerformance length 6; completionPct ∈ [0,100], enrolled ≥ 0, disbursed ≥ 0', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const programs = getProgramPerformance();
        expect(programs).toHaveLength(6);
        for (const program of programs) {
          expect(program.completionPct).toBeGreaterThanOrEqual(0);
          expect(program.completionPct).toBeLessThanOrEqual(100);
          expect(program.enrolled).toBeGreaterThanOrEqual(0);
          expect(program.disbursed).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-dashboards, Property 10
  it('Property 10: getActivityFeed length ∈ [15,20]; non-empty description/timestampLabel + valid internal href; deep-equal on repeat', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const feed = getActivityFeed();
        expect(feed.length).toBeGreaterThanOrEqual(15);
        expect(feed.length).toBeLessThanOrEqual(20);
        for (const entry of feed) {
          expect(entry.description.length).toBeGreaterThan(0);
          expect(entry.timestampLabel.length).toBeGreaterThan(0);
          // Valid internal href: a single leading slash (not protocol-relative).
          expect(entry.href.startsWith('/')).toBe(true);
          expect(entry.href.startsWith('//')).toBe(false);
        }
        // Deep-equal on repeat (determinism).
        expect(getActivityFeed()).toEqual(feed);
      }),
      { numRuns: 100 },
    );
  });
});

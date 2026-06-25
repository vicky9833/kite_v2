// Feature: kite-dashboards, Property 2
//
// Property 2: Startup synthetic-data determinism and cardinality.
//
// For any `sectorId`, two calls to `getSectorDashboardData(sectorId)` return
// deep-equal results, and the result always has 12 `monthlyFunding` points,
// 7 `clusterStartups` (the 6 Beyond Bengaluru clusters + Bengaluru), and
// 5 `topSchemes` ordered non-increasing by `rupees`.
//
// Validates: Requirements 6.5, 6.7, 24.1, 24.3, 24.5, 24.8

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import { getSectorDashboardData } from '@/lib/synthetic-dashboard-data';
import { clusters } from '@/data/clusters';

/** The 7 expected cluster bar names: 6 canonical clusters + Bengaluru. */
const EXPECTED_CLUSTERS = new Set<string>([
  ...clusters.map((c) => c.name),
  'Bengaluru',
]);

describe('getSectorDashboardData — determinism and cardinality (Property 2)', () => {
  it('is deep-equal on repeated calls and has canonical cardinalities/ordering', () => {
    fc.assert(
      fc.property(fc.string(), (sectorId) => {
        const first = getSectorDashboardData(sectorId);
        const second = getSectorDashboardData(sectorId);

        // Determinism: two calls are deep-equal.
        expect(second).toEqual(first);

        // Cardinality: 12 monthly funding points.
        expect(first.monthlyFunding).toHaveLength(12);

        // Cardinality: 7 cluster bars = 6 Beyond Bengaluru clusters + Bengaluru.
        expect(first.clusterStartups).toHaveLength(7);
        const clusterNames = new Set(first.clusterStartups.map((d) => d.cluster));
        expect(clusterNames).toEqual(EXPECTED_CLUSTERS);

        // Cardinality: 5 top schemes.
        expect(first.topSchemes).toHaveLength(5);

        // Ordering: top schemes are non-increasing by `rupees`.
        for (let i = 1; i < first.topSchemes.length; i++) {
          const prev = first.topSchemes[i - 1]!;
          const curr = first.topSchemes[i]!;
          expect(prev.rupees).toBeGreaterThanOrEqual(curr.rupees);
        }
      }),
      { numRuns: 100 },
    );
  });
});

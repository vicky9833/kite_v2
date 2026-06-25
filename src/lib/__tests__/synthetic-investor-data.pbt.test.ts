// src/lib/__tests__/synthetic-investor-data.pbt.test.ts
//
// Property-based tests for the Investor Connect synthetic-data module.

import { afterEach, describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import {
  getCandidatePool,
  getClusterInvestorFraming,
  getDealFlowTicker,
  getFeaturedOpportunities,
  getSectorCountGrowth,
  getSectorFundingTop10,
} from "@/lib/synthetic-investor-data";

describe("synthetic-investor-data", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Feature: kite-investor-suite, Property 8
  // For any seed key, each generator returns deep-equal output on repeated
  // calls, using no Math.random and no time-dependent value.
  it("Property 8: generators are deterministic and time-free", () => {
    // Behavioral guarantee: Math.random is never consulted by any generator.
    const randomSpy = vi
      .spyOn(Math, "random")
      .mockImplementation(() => {
        throw new Error("Math.random must not be used by synthetic generators");
      });

    fc.assert(
      fc.property(fc.string(), (seedKey) => {
        // Same output regardless of the system clock → time-independent.
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
        const featuredEarly = getFeaturedOpportunities();
        const candidatesEarly = getCandidatePool(seedKey);
        const clusterEarly = getClusterInvestorFraming(seedKey);
        vi.setSystemTime(new Date("2099-12-31T23:59:59Z"));
        const featuredLate = getFeaturedOpportunities();
        const candidatesLate = getCandidatePool(seedKey);
        const clusterLate = getClusterInvestorFraming(seedKey);
        vi.useRealTimers();

        expect(featuredLate).toEqual(featuredEarly);
        expect(candidatesLate).toEqual(candidatesEarly);
        expect(clusterLate).toEqual(clusterEarly);

        // Repeated calls are deep-equal (determinism for a given seed key).
        expect(getDealFlowTicker()).toEqual(getDealFlowTicker());
        expect(getSectorFundingTop10()).toEqual(getSectorFundingTop10());
        expect(getSectorCountGrowth()).toEqual(getSectorCountGrowth());
      }),
      { numRuns: 100 },
    );

    expect(randomSpy).not.toHaveBeenCalled();
  });

  // Feature: kite-investor-suite, Property 9
  // For any seed key: 6 featured, 20 ticker, 50 candidates, 10 sector-funding
  // (non-increasing by fundingCrore), and 5 growth series each of 24 points.
  it("Property 9: generators produce the documented cardinalities", () => {
    fc.assert(
      fc.property(fc.string(), (seedKey) => {
        expect(getFeaturedOpportunities()).toHaveLength(6);
        expect(getDealFlowTicker()).toHaveLength(20);
        expect(getCandidatePool(seedKey)).toHaveLength(50);

        const funding = getSectorFundingTop10();
        expect(funding).toHaveLength(10);
        const values = funding.map((d) => d.fundingCrore);
        for (let i = 1; i < values.length; i++) {
          const prev = values[i - 1];
          const cur = values[i];
          expect(prev !== undefined && cur !== undefined && prev >= cur).toBe(
            true,
          );
        }

        const growth = getSectorCountGrowth();
        expect(growth.months).toHaveLength(24);
        expect(growth.series).toHaveLength(5);
        for (const s of growth.series) {
          expect(s.counts).toHaveLength(24);
        }
      }),
      { numRuns: 100 },
    );
  });
});

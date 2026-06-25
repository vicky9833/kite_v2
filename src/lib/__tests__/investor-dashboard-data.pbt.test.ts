// src/lib/__tests__/investor-dashboard-data.pbt.test.ts
//
// Property-based tests for the Investor Dashboard synthetic-data module.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { InvestmentStage, PortfolioCompany } from "@/types";
import {
  getCurrentEstimatedValue,
  getDaysInStage,
  getEcosystemSignals,
  getExitsThisYear,
  getKitvenCoInvestments,
  getLastLoginLabel,
  getPortfolioSeed,
} from "@/lib/investor-dashboard-data";

const here = path.dirname(fileURLToPath(import.meta.url));
const MODULE_SRC = readFileSync(
  path.resolve(here, "..", "investor-dashboard-data.ts"),
  "utf8",
);

const INVESTMENT_STAGES: InvestmentStage[] = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B Plus",
  "Growth",
];

const portfolioCompanyArb: fc.Arbitrary<PortfolioCompany> = fc.record({
  id: fc.string({ minLength: 1 }),
  companyName: fc.string({ minLength: 1 }),
  sector: fc.string({ minLength: 1 }),
  stage: fc.constantFrom(...INVESTMENT_STAGES),
  investedAmountLakhs: fc.integer({ min: 0, max: 5000 }),
  investedDate: fc.constant("2023-01-01"),
  currentStatus: fc.constantFrom(
    "Active" as const,
    "Exited" as const,
    "Written-Off" as const,
    "Folded" as const,
  ),
});

describe("investor-dashboard-data", () => {
  // Feature: kite-investor-suite, Property 8
  // For any seed key, each generator returns deep-equal output on repeated
  // calls, and the module uses no Math.random and no time-dependent value.
  it("Property 8: generators are deterministic and time-free", () => {
    // Static guarantee: the source reads no ambient randomness or clock. Bare
    // identifiers are matched so a substring like `updatedAt` never trips it.
    expect(/\bMath\s*\.\s*random\b/.test(MODULE_SRC)).toBe(false);
    expect(/\bDate\b/.test(MODULE_SRC)).toBe(false);
    expect(/\bperformance\s*\.\s*now\b/.test(MODULE_SRC)).toBe(false);

    fc.assert(
      fc.property(
        fc.string(),
        fc.array(fc.string(), { maxLength: 6 }),
        fc.array(fc.constantFrom(...INVESTMENT_STAGES), { maxLength: 5 }),
        portfolioCompanyArb,
        (seedKey, focusSectors, focusStages, company) => {
          expect(getPortfolioSeed(seedKey)).toEqual(getPortfolioSeed(seedKey));
          expect(getKitvenCoInvestments(seedKey)).toEqual(
            getKitvenCoInvestments(seedKey),
          );
          expect(getEcosystemSignals(focusSectors, focusStages)).toEqual(
            getEcosystemSignals(focusSectors, focusStages),
          );
          expect(getLastLoginLabel(seedKey)).toEqual(getLastLoginLabel(seedKey));
          expect(getExitsThisYear(seedKey)).toEqual(getExitsThisYear(seedKey));
          expect(getCurrentEstimatedValue(company)).toEqual(
            getCurrentEstimatedValue(company),
          );
          expect(getDaysInStage(seedKey)).toEqual(getDaysInStage(seedKey));
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: kite-investor-suite, Property 9
  // For any seed key, getKitvenCoInvestments returns between 3 and 4 rows.
  it("Property 9: getKitvenCoInvestments returns 3–4 rows", () => {
    fc.assert(
      fc.property(fc.string(), (seedKey) => {
        const rows = getKitvenCoInvestments(seedKey);
        expect(rows.length).toBeGreaterThanOrEqual(3);
        expect(rows.length).toBeLessThanOrEqual(4);
      }),
      { numRuns: 100 },
    );
  });
});

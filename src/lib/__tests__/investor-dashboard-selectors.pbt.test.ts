// src/lib/__tests__/investor-dashboard-selectors.pbt.test.ts
//
// Property-based tests for the Investor Dashboard KPI selectors.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import type {
  DealStage,
  InvestmentStage,
  InvestorProfile,
  LocationKarnataka,
  PortfolioCompany,
  PortfolioStatus,
  TrackedDeal,
} from "@/types";
import {
  selectActiveCompanyCount,
  selectActiveDealCount,
  selectKarnatakaAllocation,
  selectPipelineValue,
} from "@/lib/investor-dashboard-selectors";

// --- Arbitraries -----------------------------------------------------------

const INVESTMENT_STAGES: InvestmentStage[] = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B Plus",
  "Growth",
];

const DEAL_STAGES: DealStage[] = [
  "Sourced",
  "Screening",
  "Diligence",
  "Term-Sheet",
  "Closed",
  "Passed",
];

const PORTFOLIO_STATUSES: PortfolioStatus[] = [
  "Active",
  "Exited",
  "Written-Off",
  "Folded",
];

const KARNATAKA_LOCATIONS: LocationKarnataka[] = [
  "Bengaluru Urban",
  "Bengaluru Rural",
  "Mysuru",
  "Mangaluru",
  "Hubballi-Dharwad-Belagavi",
  "Kalaburagi",
  "Shivamogga",
  "Tumakuru",
  "Other Karnataka",
];

const trackedDealArb: fc.Arbitrary<TrackedDeal> = fc.record({
  id: fc.string({ minLength: 1 }),
  companyName: fc.string({ minLength: 1 }),
  sector: fc.string({ minLength: 1 }),
  stage: fc.constantFrom(...INVESTMENT_STAGES),
  askLakhs: fc.integer({ min: 0, max: 5000 }),
  currentStage: fc.constantFrom(...DEAL_STAGES),
  orderInStage: fc.integer({ min: 0, max: 20 }),
});

const portfolioCompanyArb: fc.Arbitrary<PortfolioCompany> = fc.record({
  id: fc.string({ minLength: 1 }),
  companyName: fc.string({ minLength: 1 }),
  sector: fc.string({ minLength: 1 }),
  stage: fc.constantFrom(...INVESTMENT_STAGES),
  investedAmountLakhs: fc.integer({ min: 0, max: 5000 }),
  investedDate: fc.constant("2023-01-01"),
  currentStatus: fc.constantFrom(...PORTFOLIO_STATUSES),
  // Sometimes undefined (not located), sometimes a Karnataka location.
  location: fc.option(fc.constantFrom(...KARNATAKA_LOCATIONS), { nil: undefined }),
});

function makeProfile(
  deals: TrackedDeal[],
  companies: PortfolioCompany[],
): InvestorProfile {
  return {
    investorName: "Test Investor",
    firmName: "Test Capital",
    investorEmail: "test@example.com",
    investorPhone: "9876543210",
    role: "GP",
    firmType: "VC",
    assetsUnderManagement: 1000,
    foundedYear: 2010,
    focusSectors: ["deep-tech"],
    focusStages: ["Seed"],
    ticketSizeMinLakhs: 50,
    ticketSizeMaxLakhs: 500,
    geographicFocus: ["Karnataka"],
    portfolioCompanies: companies,
    dealsTracked: deals,
    isOnboarded: true,
    investorId: "INV-2024-ABCDEF",
    onboardedAt: "2024-01-01T00:00:00.000Z",
  };
}

const INACTIVE: DealStage[] = ["Closed", "Passed"];

// --- Properties ------------------------------------------------------------

describe("investor-dashboard-selectors", () => {
  // Feature: kite-investor-suite, Property 14
  // selectActiveDealCount equals the count of deals whose currentStage is
  // neither Closed nor Passed; selectPipelineValue equals the sum of askLakhs
  // over exactly those active deals.
  it("Property 14: active-deal selectors are sound", () => {
    fc.assert(
      fc.property(
        fc.array(trackedDealArb, { maxLength: 30 }),
        (deals) => {
          const profile = makeProfile(deals, []);
          const active = deals.filter((d) => !INACTIVE.includes(d.currentStage));
          const expectedValue = active.reduce((sum, d) => sum + d.askLakhs, 0);

          expect(selectActiveDealCount(profile)).toBe(active.length);
          expect(selectPipelineValue(profile)).toBe(expectedValue);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: kite-investor-suite, Property 15
  // selectActiveCompanyCount equals the number of companies whose
  // currentStatus is Active.
  it("Property 15: active portfolio count is sound", () => {
    fc.assert(
      fc.property(
        fc.array(portfolioCompanyArb, { maxLength: 30 }),
        (companies) => {
          const profile = makeProfile([], companies);
          const expected = companies.filter(
            (c) => c.currentStatus === "Active",
          ).length;
          expect(selectActiveCompanyCount(profile)).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: kite-investor-suite, Property 16
  // selectKarnatakaAllocation returns a value in [0,100], equal to 0 when the
  // portfolio is empty.
  it("Property 16: Karnataka allocation is a valid percentage", () => {
    fc.assert(
      fc.property(
        fc.array(portfolioCompanyArb, { maxLength: 30 }),
        (companies) => {
          const profile = makeProfile([], companies);
          const allocation = selectKarnatakaAllocation(profile);

          expect(allocation).toBeGreaterThanOrEqual(0);
          expect(allocation).toBeLessThanOrEqual(100);
          if (companies.length === 0) {
            expect(allocation).toBe(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

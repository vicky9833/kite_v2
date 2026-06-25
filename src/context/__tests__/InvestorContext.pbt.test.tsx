/**
 * Context property tests — InvestorProvider mutators (task 2.4).
 *
 * Property-based tests (fast-check, { numRuns: 100 }) for the session-only
 * investor context's mutation logic. Each property drives the real provider via
 * `renderHook` + `act` and a `useInvestor` consumer, so the tests exercise the
 * exact functional-setState code path used in production (no extracted reducer,
 * no mocks).
 *
 * Properties (from design "Correctness Properties"):
 *  - Property 10 — updateInvestorProfile merge preserves untouched fields.
 *  - Property 11 — addDeal / addPortfolioCompany grow their collection by one
 *    and contain the new item.
 *  - Property 12 — updateDealStage changes only the targeted deal.
 *  - Property 13 — removeDeal removes exactly the targeted deal.
 */

import * as React from "react";
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import fc from "fast-check";

import { InvestorProvider, useInvestor } from "@/context/InvestorContext";
import { DEAL_STAGE_ORDER } from "@/types";
import type {
  DealStage,
  FirmType,
  InvestmentStage,
  InvestorProfile,
  InvestorRole,
  PortfolioCompany,
  PortfolioStatus,
  TrackedDeal,
} from "@/types";

/* ------------------------------------------------------------------------ */
/* Test harness                                                             */
/* ------------------------------------------------------------------------ */

function wrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return <InvestorProvider>{children}</InvestorProvider>;
}

/** Mount a fresh provider + `useInvestor` consumer for one property run. */
function renderInvestor() {
  return renderHook(() => useInvestor(), { wrapper });
}

/* ------------------------------------------------------------------------ */
/* Arbitraries                                                              */
/* ------------------------------------------------------------------------ */

const investmentStageArb = fc.constantFrom<InvestmentStage>(
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B Plus",
  "Growth",
);

const dealStageArb = fc.constantFrom<DealStage>(...DEAL_STAGE_ORDER);

const portfolioStatusArb = fc.constantFrom<PortfolioStatus>(
  "Active",
  "Exited",
  "Written-Off",
  "Folded",
);

const roleArb = fc.constantFrom<InvestorRole>(
  "GP",
  "Partner",
  "Principal",
  "Associate",
  "Angel",
  "Family Office",
  "Corporate VC",
  "Government Fund",
);

const firmTypeArb = fc.constantFrom<FirmType>(
  "VC",
  "Angel Network",
  "Family Office",
  "Corporate VC",
  "Government Fund",
  "Accelerator Fund",
);

const sectorArb = fc.constantFrom(
  "fintech",
  "deep-tech",
  "agritech",
  "healthtech",
  "edtech",
  "spacetech",
);

/** A full, well-formed InvestorProfile (holdings empty by default). */
const profileArb = fc.record<InvestorProfile>({
  investorName: fc.string(),
  firmName: fc.string(),
  investorEmail: fc.string(),
  investorPhone: fc.string(),
  role: roleArb,
  firmType: firmTypeArb,
  assetsUnderManagement: fc.integer({ min: 0, max: 1_000_000 }),
  foundedYear: fc.integer({ min: 1900, max: 2024 }),
  focusSectors: fc.array(sectorArb),
  focusStages: fc.array(investmentStageArb),
  ticketSizeMinLakhs: fc.integer({ min: 0, max: 1000 }),
  ticketSizeMaxLakhs: fc.integer({ min: 0, max: 1000 }),
  geographicFocus: fc.array(fc.string()),
  portfolioCompanies: fc.constant([]),
  dealsTracked: fc.constant([]),
  isOnboarded: fc.boolean(),
  investorId: fc.string(),
  onboardedAt: fc.string(),
});

/** A single TrackedDeal (id is overwritten with a unique value downstream). */
const dealArb = fc.record({
  id: fc.string(),
  companyName: fc.string(),
  sector: sectorArb,
  stage: investmentStageArb,
  askLakhs: fc.integer({ min: 0, max: 100_000 }),
  currentStage: dealStageArb,
  orderInStage: fc.nat(),
});

/** A non-empty deals list with guaranteed-unique ids (`deal-0`, `deal-1`, …). */
const dealsListArb = fc
  .array(dealArb, { minLength: 1, maxLength: 8 })
  .map((deals): TrackedDeal[] =>
    deals.map((d, i) => ({ ...d, id: `deal-${i}` })),
  );

/** A deals list plus a valid index into it (to pick an existing deal). */
const dealsWithIndexArb = dealsListArb.chain((deals) =>
  fc.record({
    deals: fc.constant(deals),
    index: fc.integer({ min: 0, max: deals.length - 1 }),
  }),
);

const companyArb = fc.record<PortfolioCompany>({
  id: fc.string(),
  companyName: fc.string(),
  sector: sectorArb,
  stage: investmentStageArb,
  investedAmountLakhs: fc.integer({ min: 0, max: 100_000 }),
  investedDate: fc.constant("2024-01-01"),
  currentStatus: portfolioStatusArb,
});

/* ------------------------------------------------------------------------ */
/* Property 10                                                              */
/* ------------------------------------------------------------------------ */

const PROFILE_KEYS = [
  "investorName",
  "firmName",
  "investorEmail",
  "investorPhone",
  "role",
  "firmType",
  "assetsUnderManagement",
  "foundedYear",
  "focusSectors",
  "focusStages",
  "ticketSizeMinLakhs",
  "ticketSizeMaxLakhs",
  "geographicFocus",
  "isOnboarded",
  "investorId",
  "onboardedAt",
] as const satisfies readonly (keyof InvestorProfile)[];

describe("InvestorContext PBT — Property 10/11/12/13", () => {
  // Feature: kite-investor-suite, Property 10
  it("Property 10: updateInvestorProfile merge preserves untouched fields", () => {
    fc.assert(
      fc.property(
        profileArb,
        profileArb,
        fc.subarray(PROFILE_KEYS as unknown as (keyof InvestorProfile)[]),
        (base, overrides, keys) => {
          // Build an arbitrary Partial<InvestorProfile> from a subset of keys.
          const partial: Partial<InvestorProfile> = {};
          for (const k of keys) {
            (partial as Record<string, unknown>)[k] = overrides[k];
          }

          const { result, unmount } = renderInvestor();
          try {
            // Seed the base profile, then apply the partial.
            act(() => {
              result.current.updateInvestorProfile(base);
            });
            act(() => {
              result.current.updateInvestorProfile(partial);
            });

            const merged = result.current.investorProfile;
            expect(merged).not.toBeNull();

            const touched = new Set<string>(keys as string[]);
            for (const key of PROFILE_KEYS) {
              if (touched.has(key)) {
                // Touched keys equal the partial's value.
                expect(merged![key]).toEqual(partial[key]);
              } else {
                // Untouched keys equal the base value.
                expect(merged![key]).toEqual(base[key]);
              }
            }
          } finally {
            unmount();
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /* ---------------------------------------------------------------------- */
  /* Property 11                                                            */
  /* ---------------------------------------------------------------------- */

  // Feature: kite-investor-suite, Property 11
  it("Property 11: addDeal and addPortfolioCompany grow by one and contain the item", () => {
    fc.assert(
      fc.property(dealsListArb, dealArb, companyArb, (seedDeals, newDeal, newCompany) => {
        const { result, unmount } = renderInvestor();
        try {
          // Seed a profile carrying the existing deals + an existing company.
          const seedCompanies: PortfolioCompany[] = [
            { ...newCompany, id: "seed-co" },
          ];
          act(() => {
            result.current.updateInvestorProfile({
              dealsTracked: seedDeals,
              portfolioCompanies: seedCompanies,
            });
          });

          const beforeDeals =
            result.current.investorProfile!.dealsTracked.length;
          const beforeCompanies =
            result.current.investorProfile!.portfolioCompanies.length;

          // addDeal: a distinct id avoids colliding with the seeded deal-N ids.
          const addedDeal: TrackedDeal = { ...newDeal, id: "NEW-DEAL" };
          act(() => {
            result.current.addDeal(addedDeal);
          });

          const afterDeals = result.current.investorProfile!.dealsTracked;
          expect(afterDeals.length).toBe(beforeDeals + 1);
          const found = afterDeals.find((d) => d.id === "NEW-DEAL");
          expect(found).toBeDefined();
          // Core fields are preserved (orderInStage is re-assigned by the mutator).
          expect(found!.companyName).toBe(addedDeal.companyName);
          expect(found!.sector).toBe(addedDeal.sector);
          expect(found!.askLakhs).toBe(addedDeal.askLakhs);
          expect(found!.currentStage).toBe(addedDeal.currentStage);

          // addPortfolioCompany: grows by one and contains the company verbatim.
          const addedCompany: PortfolioCompany = { ...newCompany, id: "NEW-CO" };
          act(() => {
            result.current.addPortfolioCompany(addedCompany);
          });

          const afterCompanies =
            result.current.investorProfile!.portfolioCompanies;
          expect(afterCompanies.length).toBe(beforeCompanies + 1);
          expect(afterCompanies).toContainEqual(addedCompany);
        } finally {
          unmount();
        }
      }),
      { numRuns: 100 },
    );
  });

  /* ---------------------------------------------------------------------- */
  /* Property 12                                                            */
  /* ---------------------------------------------------------------------- */

  // Feature: kite-investor-suite, Property 12
  it("Property 12: updateDealStage changes only the targeted deal", () => {
    fc.assert(
      fc.property(dealsWithIndexArb, dealStageArb, ({ deals, index }, target) => {
        const targetId = deals[index]!.id;

        const { result, unmount } = renderInvestor();
        try {
          act(() => {
            result.current.updateInvestorProfile({ dealsTracked: deals });
          });
          act(() => {
            result.current.updateDealStage(targetId, target);
          });

          const after = result.current.investorProfile!.dealsTracked;
          expect(after.length).toBe(deals.length);

          for (const original of deals) {
            const updated = after.find((d) => d.id === original.id);
            expect(updated).toBeDefined();
            if (original.id === targetId) {
              // Targeted deal's stage equals the target.
              expect(updated!.currentStage).toBe(target);
            } else {
              // Every other deal is unchanged (id, sector, ask, original stage).
              expect(updated!.sector).toBe(original.sector);
              expect(updated!.askLakhs).toBe(original.askLakhs);
              expect(updated!.currentStage).toBe(original.currentStage);
            }
          }
        } finally {
          unmount();
        }
      }),
      { numRuns: 100 },
    );
  });

  /* ---------------------------------------------------------------------- */
  /* Property 13                                                            */
  /* ---------------------------------------------------------------------- */

  // Feature: kite-investor-suite, Property 13
  it("Property 13: removeDeal removes exactly the targeted deal", () => {
    fc.assert(
      fc.property(dealsWithIndexArb, ({ deals, index }) => {
        const targetId = deals[index]!.id;

        const { result, unmount } = renderInvestor();
        try {
          act(() => {
            result.current.updateInvestorProfile({ dealsTracked: deals });
          });
          act(() => {
            result.current.removeDeal(targetId);
          });

          const after = result.current.investorProfile!.dealsTracked;
          // Length decreases by exactly one.
          expect(after.length).toBe(deals.length - 1);
          // The removed id is absent.
          expect(after.some((d) => d.id === targetId)).toBe(false);
          // Every other deal remains.
          for (const original of deals) {
            if (original.id !== targetId) {
              expect(after.some((d) => d.id === original.id)).toBe(true);
            }
          }
        } finally {
          unmount();
        }
      }),
      { numRuns: 100 },
    );
  });
});

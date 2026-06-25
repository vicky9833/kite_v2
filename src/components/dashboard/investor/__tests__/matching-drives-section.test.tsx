// src/components/dashboard/investor/__tests__/matching-drives-section.test.tsx
//
// Task 12.4 — Matching-drives-section integration test (Req 20, 24).
//
// Proves the dashboard sections are DERIVED DETERMINISTICALLY from the investor
// thesis, not hard-coded:
//
//   1. `MatchedStartupsSection` — rendered for two profiles that share the same
//      `investorId` (so `getCandidatePool` returns an identical 50-candidate
//      pool) but carry DIFFERENT theses (different focusSectors / focusStages /
//      geographicFocus / ticket band). The rendered top-6 match order changes,
//      and it matches exactly what the pure `selectTopMatches` engine produces
//      for each thesis — so the matching engine is what drives the section.
//
//   2. `SchemesForPortfolioSection` — rendered for the same two profiles; the
//      relevance-ranked scheme order changes with the thesis (e.g. a
//      Beyond-Bengaluru / deep-tech thesis surfaces the cluster seed fund and
//      the R&D grant as relevant), proving the relevance engine drives the
//      ranking.

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string | { pathname?: string };
    children: React.ReactNode;
  }) => (
    <a href={typeof href === "string" ? href : (href?.pathname ?? "#")} {...props}>
      {children}
    </a>
  ),
}));

// Imported AFTER the mocks so the surfaces pick up the stubs.
import { InvestorProvider, useInvestor } from "@/context/InvestorContext";
import { MatchedStartupsSection } from "@/components/dashboard/investor/MatchedStartupsSection";
import { SchemesForPortfolioSection } from "@/components/dashboard/investor/SchemesForPortfolioSection";
import { selectTopMatches } from "@/lib/investor-match-display";
import { getCandidatePool } from "@/lib/synthetic-investor-data";
import type { InvestorProfile } from "@/types";

/* -------------------------------------------------------------------------- */
/* Fixtures — two theses sharing one investorId (so the pool is identical)     */
/* -------------------------------------------------------------------------- */

const SHARED_INVESTOR_ID = "INV-2024-SHARED1";

const BASE: InvestorProfile = {
  investorName: "Thesis Tester",
  firmName: "Compare Capital",
  investorEmail: "tester@compare.example",
  investorPhone: "9000000000",
  role: "GP",
  firmType: "VC",
  assetsUnderManagement: 10000,
  foundedYear: 2019,
  focusSectors: [],
  focusStages: [],
  ticketSizeMinLakhs: 0,
  ticketSizeMaxLakhs: 0,
  geographicFocus: [],
  portfolioCompanies: [],
  dealsTracked: [],
  isOnboarded: true,
  investorId: SHARED_INVESTOR_ID,
  onboardedAt: "2024-01-01T00:00:00.000Z",
};

/** Thesis A — fintech / Seed / Bengaluru, small tickets. */
const THESIS_A: InvestorProfile = {
  ...BASE,
  focusSectors: ["fintech"],
  focusStages: ["Seed"],
  ticketSizeMinLakhs: 50,
  ticketSizeMaxLakhs: 500,
  geographicFocus: ["Bengaluru Urban"],
};

/** Thesis B — agri-tech + deep-tech / later stages / Beyond Bengaluru, large tickets. */
const THESIS_B: InvestorProfile = {
  ...BASE,
  focusSectors: ["agri-tech", "deep-tech"],
  focusStages: ["Series A", "Series B Plus"],
  ticketSizeMinLakhs: 800,
  ticketSizeMaxLakhs: 2500,
  geographicFocus: ["Karnataka Beyond Bengaluru"],
};

/** Seed the session context with a given profile (no onboarding overwrite). */
function SeedProfile({
  profile,
  children,
}: {
  profile: InvestorProfile;
  children: React.ReactNode;
}) {
  const { updateInvestorProfile, investorProfile } = useInvestor();
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      updateInvestorProfile(profile);
    }
  }, [updateInvestorProfile, profile]);
  // Render children only once the profile is committed, so the section derives
  // from the seeded thesis on its first observed render.
  return investorProfile ? <>{children}</> : null;
}

/** Read the ordered level-3 heading texts (card titles) within a container. */
function headingTexts(container: HTMLElement): string[] {
  return within(container)
    .getAllByRole("heading", { level: 3 })
    .map((h) => h.textContent?.trim() ?? "");
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("Matching drives the dashboard sections (Req 20, 24)", () => {
  it("MatchedStartupsSection re-derives the top matches from the thesis", async () => {
    // Expected order computed directly from the pure engine over the shared pool.
    const pool = getCandidatePool(SHARED_INVESTOR_ID);
    const expectedA = selectTopMatches(THESIS_A, pool, 6).map(
      (m) => m.candidate.companyName,
    );
    const expectedB = selectTopMatches(THESIS_B, pool, 6).map(
      (m) => m.candidate.companyName,
    );

    // Sanity: the two theses genuinely produce different top-6 selections.
    expect(expectedA).not.toEqual(expectedB);

    // Render thesis A and confirm the DOM order matches the engine output.
    const a = render(
      <InvestorProvider>
        <SeedProfile profile={THESIS_A}>
          <MatchedStartupsSection />
        </SeedProfile>
      </InvestorProvider>,
    );
    await within(a.container).findByText(/Showing top \d+ of \d+ matches/i);
    expect(headingTexts(a.container)).toEqual(expectedA);
    a.unmount();

    // Render thesis B and confirm the DOM order matches its (different) output.
    const b = render(
      <InvestorProvider>
        <SeedProfile profile={THESIS_B}>
          <MatchedStartupsSection />
        </SeedProfile>
      </InvestorProvider>,
    );
    await within(b.container).findByText(/Showing top \d+ of \d+ matches/i);
    expect(headingTexts(b.container)).toEqual(expectedB);

    // And the rendered sets differ, proving the thesis drives the section.
    expect(headingTexts(b.container)).not.toEqual(expectedA);
  });

  it("SchemesForPortfolioSection re-ranks schemes from the thesis (Req 24)", async () => {
    // Thesis A.
    const a = render(
      <InvestorProvider>
        <SeedProfile profile={THESIS_A}>
          <SchemesForPortfolioSection />
        </SeedProfile>
      </InvestorProvider>,
    );
    await within(a.container).findByRole("heading", {
      name: /Government Schemes for Your Portfolio/i,
    });
    const orderA = headingTexts(a.container);
    const relevantA = within(a.container).queryAllByText(/^Relevant$/).length;
    a.unmount();

    // Thesis B (Beyond-Bengaluru + deep-tech) should surface MORE relevant
    // schemes and re-order the ranked list.
    const b = render(
      <InvestorProvider>
        <SeedProfile profile={THESIS_B}>
          <SchemesForPortfolioSection />
        </SeedProfile>
      </InvestorProvider>,
    );
    await within(b.container).findByRole("heading", {
      name: /Government Schemes for Your Portfolio/i,
    });
    const orderB = headingTexts(b.container);
    const relevantB = within(b.container).queryAllByText(/^Relevant$/).length;

    // The ranked scheme order changes with the thesis.
    expect(orderB).not.toEqual(orderA);
    // The deep-tech + Beyond-Bengaluru thesis is relevant to strictly more schemes.
    expect(relevantB).toBeGreaterThan(relevantA);
  });
});

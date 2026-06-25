// src/components/dashboard/investor/__tests__/portfolio-mutation.test.tsx
//
// Task 12.3 — Portfolio-mutation integration test (Req 21.3, 21.4).
//
// Renders `PortfolioSection` inside `InvestorProvider`, seeded into the
// Onboarded_State with an EMPTY `portfolioCompanies` list. With no holdings the
// section shows its inline "Add Portfolio Company" empty-state form; filling it
// in and submitting commits a `PortfolioCompany` through the context's
// `addPortfolioCompany` mutator, which grows the session state — and the
// section re-renders the portfolio TABLE with the new row. This proves the
// add-form is wired to the live context and that the table is driven by it.

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import { InvestorProvider, useInvestor } from "@/context/InvestorContext";
import { PortfolioSection } from "@/components/dashboard/investor/PortfolioSection";
import type { InvestorProfile } from "@/types";

/* -------------------------------------------------------------------------- */
/* Fixture + seeding harness                                                   */
/* -------------------------------------------------------------------------- */

/** A complete onboarded profile with NO portfolio companies. */
const EMPTY_PORTFOLIO_PROFILE: InvestorProfile = {
  investorName: "Ravi Menon",
  firmName: "Tunga Ventures",
  investorEmail: "ravi@tunga.example",
  investorPhone: "9988776655",
  role: "Partner",
  firmType: "VC",
  assetsUnderManagement: 12000,
  foundedYear: 2020,
  focusSectors: ["fintech"],
  focusStages: ["Seed"],
  ticketSizeMinLakhs: 50,
  ticketSizeMaxLakhs: 600,
  geographicFocus: ["Karnataka"],
  portfolioCompanies: [],
  dealsTracked: [],
  isOnboarded: true,
  investorId: "INV-2024-EMPTY1",
  onboardedAt: "2024-02-01T00:00:00.000Z",
};

/** Seed the session context into the Onboarded_State once on mount. */
function SeedInvestor({ children }: { children: React.ReactNode }) {
  const { updateInvestorProfile, completeOnboarding } = useInvestor();
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      updateInvestorProfile(EMPTY_PORTFOLIO_PROFILE);
      completeOnboarding();
    }
  }, [updateInvestorProfile, completeOnboarding]);
  return <>{children}</>;
}

function renderPortfolio() {
  return render(
    <InvestorProvider>
      <SeedInvestor>
        <PortfolioSection />
      </SeedInvestor>
    </InvestorProvider>,
  );
}

/* -------------------------------------------------------------------------- */
/* Test                                                                        */
/* -------------------------------------------------------------------------- */

describe("PortfolioSection add-company mutation (Req 21.3, 21.4)", () => {
  it("shows the empty-state form, then grows the table when a company is added", async () => {
    renderPortfolio();

    // Empty state: the inline add form is shown, no table yet.
    expect(
      await screen.findByText(/No portfolio companies yet/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();

    // Fill the company name (the only field that gates submission besides the
    // pre-filled valid amount) and submit.
    const nameInput = screen.getByLabelText(/Company name/i);
    fireEvent.change(nameInput, { target: { value: "Kaveri Labs" } });

    const submit = screen.getByRole("button", { name: /Add Portfolio Company/i });
    fireEvent.click(submit);

    // The mutator grew the context → the table now renders with the new row.
    const table = await screen.findByRole("table");
    expect(within(table).getByText("Kaveri Labs")).toBeInTheDocument();
    expect(screen.getByText(/1 portfolio company\b/i)).toBeInTheDocument();
  });
});

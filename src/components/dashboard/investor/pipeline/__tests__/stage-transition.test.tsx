// src/components/dashboard/investor/pipeline/__tests__/stage-transition.test.tsx
//
// Task 15.5 — Stage-transition integration test (Req 29.1, 29.2, 29.3).
//
// Drives the real `/dashboard/investor/pipeline` page (seeded into the
// Onboarded_State) through two card-level mutations and asserts the board
// reflects each one:
//   - Changing a card's Move <select> calls `updateDealStage`, moving the deal
//     out of its old column and into the destination (counts update both ways).
//   - Clicking a card's Remove button calls `removeDeal`, dropping the card and
//     its column count.
//
// Native <select> interactions use `fireEvent.change`. The card controls are in
// the DOM (revealed via opacity, not display) so they are queryable without
// hover.

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";

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

vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/dashboard/investor/pipeline",
}));

import { InvestorProvider, useInvestor } from "@/context/InvestorContext";
import DealPipelinePage from "@/app/dashboard/investor/pipeline/page";
import type { InvestorProfile } from "@/types";

/* -------------------------------------------------------------------------- */
/* Fixture + seeding harness                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Two deals: "Vega Systems" in Sourced (the move target), "Tunga Labs" in
 * Screening (the remove target). Every other field is a realistic complete
 * onboarded profile.
 */
const SEED_PROFILE: InvestorProfile = {
  investorName: "Asha Rao",
  firmName: "Kite Capital Partners",
  investorEmail: "asha@kitecapital.example",
  investorPhone: "9876543210",
  role: "GP",
  firmType: "VC",
  assetsUnderManagement: 25000,
  foundedYear: 2018,
  focusSectors: ["deep-tech", "ai-ml"],
  focusStages: ["Seed", "Series A"],
  ticketSizeMinLakhs: 100,
  ticketSizeMaxLakhs: 1500,
  geographicFocus: ["Karnataka"],
  portfolioCompanies: [],
  dealsTracked: [
    { id: "d1", companyName: "Vega Systems", sector: "ai-ml", stage: "Seed", askLakhs: 400, currentStage: "Sourced", orderInStage: 0 },
    { id: "d2", companyName: "Tunga Labs", sector: "deep-tech", stage: "Seed", askLakhs: 150, currentStage: "Screening", orderInStage: 0 },
  ],
  isOnboarded: true,
  investorId: "INV-2024-ABCDEF",
  onboardedAt: "2024-01-15T00:00:00.000Z",
};

function SeedInvestor({ children }: { children: React.ReactNode }) {
  const { updateInvestorProfile, completeOnboarding, isOnboarded } = useInvestor();
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      updateInvestorProfile(SEED_PROFILE);
      completeOnboarding();
    }
  }, [updateInvestorProfile, completeOnboarding]);
  return isOnboarded ? <>{children}</> : null;
}

function renderPipeline() {
  return render(
    <InvestorProvider>
      <SeedInvestor>
        <DealPipelinePage />
      </SeedInvestor>
    </InvestorProvider>,
  );
}

async function findColumns() {
  renderPipeline();
  return screen.findAllByRole("region", { name: /\(\d+ deals?\)$/ });
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("Deal Pipeline stage transitions (Req 29.1, 29.2, 29.3)", () => {
  it("moving a card's Move <select> relocates the deal across columns (updateDealStage)", async () => {
    await findColumns();

    // Before: Vega Systems sits in Sourced (1 deal); Diligence is empty.
    expect(screen.getByRole("region", { name: "Sourced (1 deal)" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Diligence (0 deals)" })).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Vega Systems — Sourced" }),
    ).toBeInTheDocument();

    // Change the Move select on the Vega card to "Diligence".
    const card = screen.getByRole("article", { name: "Vega Systems — Sourced" });
    const moveSelect = within(card).getByRole("combobox", {
      name: /Move Vega Systems to a different stage/i,
    });
    fireEvent.change(moveSelect, { target: { value: "Diligence" } });

    // After: the deal now lives in Diligence; Sourced is empty.
    expect(
      screen.getByRole("article", { name: "Vega Systems — Diligence" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Diligence (1 deal)" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Sourced (0 deals)" })).toBeInTheDocument();

    // The Vega card no longer appears under Sourced.
    const sourced = screen.getByRole("region", { name: "Sourced (0 deals)" });
    expect(within(sourced).queryByRole("article")).not.toBeInTheDocument();
  });

  it("clicking Remove drops the deal and its column count (removeDeal)", async () => {
    await findColumns();

    // Before: Tunga Labs is the only card in Screening.
    expect(screen.getByRole("region", { name: "Screening (1 deal)" })).toBeInTheDocument();
    const card = screen.getByRole("article", { name: "Tunga Labs — Screening" });

    fireEvent.click(
      within(card).getByRole("button", { name: /Remove Tunga Labs from the pipeline/i }),
    );

    // After: the card is gone and Screening is empty.
    expect(
      screen.queryByRole("article", { name: "Tunga Labs — Screening" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Screening (0 deals)" })).toBeInTheDocument();
  });
});

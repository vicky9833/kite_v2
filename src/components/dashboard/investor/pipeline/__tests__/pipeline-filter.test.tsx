// src/components/dashboard/investor/pipeline/__tests__/pipeline-filter.test.tsx
//
// Task 15.6 — Pipeline filter integration test (Req 27.1, 27.2, 27.3).
//
// Drives the real `/dashboard/investor/pipeline` page (seeded into the
// Onboarded_State with deals spanning multiple sectors / asks / companies)
// through the `PipelineFilterBar` controls and asserts the kanban board narrows
// accordingly:
//   - typing a company name in the search input narrows to matching cards,
//   - selecting a sector narrows to that sector,
//   - an ask-min / ask-max narrows by ask amount.
// It also confirms every filter control carries an accessible label.
//
// The board feeds the filter value to the PURE `filterDeals` helper, so each
// control's effect is observable as a change in the set of visible deal cards.
// Native control changes use `fireEvent.change`. Each `it` renders fresh so the
// filter state is independent across cases.

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

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
 * Five deals spanning distinct companies, sectors, and ask amounts:
 *   - Vega Systems   ai-ml        400
 *   - Tunga Labs     deep-tech    150
 *   - Kaveri Health  health-tech  800
 *   - Nandi Finance  fintech     1200
 *   - Sharavathi AI  ai-ml        250
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
    { id: "d3", companyName: "Kaveri Health", sector: "health-tech", stage: "Series A", askLakhs: 800, currentStage: "Diligence", orderInStage: 0 },
    { id: "d4", companyName: "Nandi Finance", sector: "fintech", stage: "Series A", askLakhs: 1200, currentStage: "Term-Sheet", orderInStage: 0 },
    { id: "d5", companyName: "Sharavathi AI", sector: "ai-ml", stage: "Seed", askLakhs: 250, currentStage: "Sourced", orderInStage: 1 },
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

/** Accessible names of every deal card currently on the board. */
function visibleCardNames(): string[] {
  return screen
    .queryAllByRole("article", { name: /—/ })
    .map((c) => c.getAttribute("aria-label") ?? "");
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("Deal Pipeline filtering (Req 27.1, 27.2, 27.3)", () => {
  it("every filter control has an accessible label (Req 27.1)", async () => {
    await findColumns();
    for (const label of [
      "Search company",
      "Sector",
      "Stage from",
      "Stage to",
      "Ask min (₹ lakhs)",
      "Ask max (₹ lakhs)",
      "Added from",
      "Added to",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("typing a company name in search narrows the visible cards (Req 27.3)", async () => {
    await findColumns();
    expect(visibleCardNames()).toHaveLength(5);

    fireEvent.change(screen.getByLabelText("Search company"), {
      target: { value: "Vega" },
    });

    const names = visibleCardNames();
    expect(names).toHaveLength(1);
    expect(names[0]).toMatch(/Vega Systems/);
  });

  it("selecting a sector narrows to that sector (Req 27.2)", async () => {
    await findColumns();

    fireEvent.change(screen.getByLabelText("Sector"), {
      target: { value: "ai-ml" },
    });

    // Only the two ai-ml deals remain (Vega Systems + Sharavathi AI).
    const names = visibleCardNames();
    expect(names).toHaveLength(2);
    expect(names.some((n) => /Vega Systems/.test(n))).toBe(true);
    expect(names.some((n) => /Sharavathi AI/.test(n))).toBe(true);
    expect(names.some((n) => /Nandi Finance/.test(n))).toBe(false);
  });

  it("an ask-min narrows by ask amount (Req 27.2)", async () => {
    await findColumns();

    fireEvent.change(screen.getByLabelText("Ask min (₹ lakhs)"), {
      target: { value: "1000" },
    });

    // Only Nandi Finance (₹1200 lakhs) clears a 1000-lakh floor.
    const names = visibleCardNames();
    expect(names).toHaveLength(1);
    expect(names[0]).toMatch(/Nandi Finance/);
  });

  it("an ask-max narrows by ask amount (Req 27.2)", async () => {
    await findColumns();

    fireEvent.change(screen.getByLabelText("Ask max (₹ lakhs)"), {
      target: { value: "300" },
    });

    // Only Tunga Labs (150) and Sharavathi AI (250) fall under a 300 ceiling.
    const names = visibleCardNames();
    expect(names).toHaveLength(2);
    expect(names.some((n) => /Tunga Labs/.test(n))).toBe(true);
    expect(names.some((n) => /Sharavathi AI/.test(n))).toBe(true);
  });
});

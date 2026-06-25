// src/components/dashboard/investor/pipeline/__tests__/DealPipeline.test.tsx
//
// Task 15.4 — Deal Pipeline component test (Req 26, 27, 28, 29, 32).
//
// Renders the real `/dashboard/investor/pipeline` page wrapped in
// `InvestorProvider`, seeded into the Onboarded_State by a small `SeedInvestor`
// harness that commits a complete `InvestorProfile` (with several `dealsTracked`
// spread across multiple kanban stages) via `updateInvestorProfile` then
// finalises with `completeOnboarding` — mirroring `SeedInvestor`/`SeedRegistered`
// in the prior dashboard tests. Once onboarded, `InvestorGate` renders the
// pipeline and we assert the eager board surface:
//   - six stage columns, each a `role="region"` whose aria-label carries the
//     stage name + a deal count (Req 28.1, 28.2),
//   - the header subhead counting ACTIVE deals (Req 26.1),
//   - the "Drop deals here / Add deal" placeholder in an empty stage (Req 28.4),
//   - focusable deal cards (tabIndex 0) with accessible names (Req 29.x, 32.1),
//   - each card's Move native <select> (six stage options) + Remove button
//     (Req 29.1, 29.3, 32.3).
//
// Module mocks (mirroring the dashboard component tests):
//   - `next/link` → a plain anchor,
//   - `next/navigation` → a stubbed router/searchParams/pathname.
// The analytics row + recent-activity list load lazily; we assert on the eager
// board and scope all queries inside it so those sections never interfere.

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

// Imported AFTER the mocks so the page picks up the stubs.
import { InvestorProvider, useInvestor } from "@/context/InvestorContext";
import DealPipelinePage from "@/app/dashboard/investor/pipeline/page";
import { DEAL_STAGE_ORDER, type InvestorProfile } from "@/types";

/* -------------------------------------------------------------------------- */
/* Fixture + seeding harness                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A complete onboarded investor profile whose `dealsTracked` spread across
 * multiple `currentStage` values: 2 in Sourced, 1 in Screening, 1 in Diligence,
 * 1 in Term-Sheet — and Closed + Passed left EMPTY so a placeholder is asserted.
 * Active deals (currentStage neither Closed nor Passed) = 5.
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
    { id: "d2", companyName: "Tunga Labs", sector: "deep-tech", stage: "Seed", askLakhs: 150, currentStage: "Sourced", orderInStage: 1 },
    { id: "d3", companyName: "Kaveri Health", sector: "health-tech", stage: "Series A", askLakhs: 800, currentStage: "Screening", orderInStage: 0 },
    { id: "d4", companyName: "Nandi Finance", sector: "fintech", stage: "Series A", askLakhs: 1200, currentStage: "Diligence", orderInStage: 0 },
    { id: "d5", companyName: "Sharavathi AI", sector: "ai-ml", stage: "Seed", askLakhs: 250, currentStage: "Term-Sheet", orderInStage: 0 },
  ],
  isOnboarded: true,
  investorId: "INV-2024-ABCDEF",
  onboardedAt: "2024-01-15T00:00:00.000Z",
};

/** Seed the session context into the Onboarded_State once on mount. */
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

/**
 * Wait for the board to render, returning the six stage-column regions. Each
 * kanban column is a `role="region"` whose accessible name ends with a deal
 * count "(N deal[s])" — that pattern excludes the filter-bar / analytics /
 * activity regions, isolating exactly the six columns.
 */
async function findColumns() {
  renderPipeline();
  return screen.findAllByRole("region", { name: /\(\d+ deals?\)$/ });
}

/** A specific stage column by its name + expected count. */
function getColumn(stage: string, count: number) {
  const noun = count === 1 ? "deal" : "deals";
  return screen.getByRole("region", { name: `${stage} (${count} ${noun})` });
}

/** Every deal card on the board: <article>s whose accessible name has the em dash. */
function getCards() {
  return screen.getAllByRole("article", { name: /—/ });
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("Deal Pipeline page (Req 26, 27, 28, 29, 32)", () => {
  it("renders six stage columns, each a region whose label carries the stage name + count (Req 28.1, 28.2)", async () => {
    const columns = await findColumns();
    expect(columns).toHaveLength(6);

    const expectedCounts: Record<string, number> = {
      Sourced: 2,
      Screening: 1,
      Diligence: 1,
      "Term-Sheet": 1,
      Closed: 0,
      Passed: 0,
    };

    for (const stage of DEAL_STAGE_ORDER) {
      const count = expectedCounts[stage] ?? 0;
      const region = getColumn(stage, count);
      expect(region).toBeInTheDocument();
      // The visible column header shows the stage name too.
      expect(within(region).getByRole("heading", { name: stage })).toBeInTheDocument();
    }
  });

  it("subhead counts the active deals (Req 26.1)", async () => {
    await findColumns();
    // 5 active deals (Closed + Passed excluded).
    expect(
      screen.getByText(/Managing 5 active deals across six stages/i),
    ).toBeInTheDocument();
  });

  it("shows the 'Drop deals here / Add deal' placeholder in an empty stage (Req 28.4)", async () => {
    await findColumns();
    // Closed and Passed are empty → two placeholders.
    const closed = getColumn("Closed", 0);
    expect(within(closed).getByText(/Drop deals here/i)).toBeInTheDocument();
    expect(within(closed).getByText(/Add deal/i)).toBeInTheDocument();

    const passed = getColumn("Passed", 0);
    expect(within(passed).getByText(/Drop deals here/i)).toBeInTheDocument();
  });

  it("renders focusable deal cards (tabIndex 0) with accessible names (Req 29.x, 32.1)", async () => {
    await findColumns();
    // Deal cards are <article> with an aria-label of "{company} — {stage}".
    const cards = getCards();
    expect(cards).toHaveLength(5);

    for (const card of cards) {
      expect(card.tabIndex).toBe(0);
      expect(card.getAttribute("aria-label")).toBeTruthy();
    }

    // A specific card is reachable by its accessible name.
    expect(
      screen.getByRole("article", { name: "Vega Systems — Sourced" }),
    ).toBeInTheDocument();
  });

  it("each card exposes a Move <select> of the six stages and a Remove button (Req 29.1, 29.3, 32.3)", async () => {
    await findColumns();
    const card = screen.getByRole("article", {
      name: "Nandi Finance — Diligence",
    });

    // Move: a native <select> (combobox) listing exactly the six stages.
    const moveSelect = within(card).getByRole("combobox", {
      name: /Move Nandi Finance to a different stage/i,
    });
    const options = within(moveSelect).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual([...DEAL_STAGE_ORDER]);
    // The select reflects the deal's current stage.
    expect((moveSelect as HTMLSelectElement).value).toBe("Diligence");

    // Remove: a button targeting this deal.
    expect(
      within(card).getByRole("button", {
        name: /Remove Nandi Finance from the pipeline/i,
      }),
    ).toBeInTheDocument();
  });
});

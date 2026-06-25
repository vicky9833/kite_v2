/**
 * End-to-end integration test (task 5.3).
 *
 * Exercises the full second-slice flow across THREE real surfaces wired to a
 * single, shared session `RegistrationContext`, proving the personalization
 * threads end-to-end and stays internally consistent:
 *
 *   1. REGISTER — a Registration_Profile is committed to the live context via
 *      `updateProfile` + `completeRegistration` (the robust, deterministic path
 *      the task allows in place of clicking through the lazy six-step wizard).
 *      Before registration the home banner is absent and scheme cards carry no
 *      confidence dot (Unregistered_State — Req 24.4, 15.5).
 *
 *   2. SCHEMES PERSONALIZATION — once registered, the home
 *      `SchemesPersonalizationBanner` renders "You qualify for X of 22 schemes"
 *      with X computed by the engine (Req 24.1, 24.2), and the real `SchemesHub`
 *      threads each card its precomputed `EligibilityResult` so a `ConfidenceDot`
 *      appears per card with the status the engine assigned (Req 12.4).
 *
 *   3. CALCULATOR TOTALS — the real `Calculator` (→ `CalculatorResults`) shows
 *      the status-grouped breakdown plus a total estimated benefit and a
 *      "Across X schemes you qualify for" caption that are CONSISTENT with the
 *      same profile and the same engine (Req 21.2).
 *
 * Expected values are DERIVED from the pure engine (`evaluateAllSchemes`,
 * `totalEstimatedBenefit`, `weightedAverageConfidence`, `confidenceLabel`) and
 * the shared `formatNumber` formatter — never hard-coded — so the assertions
 * track the engine instead of duplicating magic numbers.
 *
 * jsdom / Next notes (mirrors a11y.test.tsx + wizard.integration.test.tsx):
 *  - `next/link` → plain anchor; `next/navigation` `useRouter` → stub; `sonner`
 *    `toast` → spy, so the client islands render without an App Router provider.
 *  - The Calculator code-splits its results view via `next/dynamic({ ssr:false })`,
 *    so post-registration assertions on that view use retrying `findBy*`/`waitFor`
 *    queries with a generous budget. Scheme cards in the Hub are NOT lazy, so the
 *    confidence dots assert synchronously.
 *  - jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView / pointer
 *    capture) come from the global `src/test/setup.ts`.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";

/* -------------------------------------------------------------------------- */
/* Async budgets (lazy next/dynamic chunk for CalculatorResults)              */
/* -------------------------------------------------------------------------- */

const ASYNC_TIMEOUT = 8000;
const WAIT_OPTS = { timeout: ASYNC_TIMEOUT } as const;
const TEST_TIMEOUT = 30000;

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so the banner / hub / calculator CTAs
// render without an App Router context provider.
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

// Stub the App Router (SchemesHub reaches for `useRouter`).
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Spy on sonner so the Hub's compare-cap toast never touches a real toaster.
const toastFn = vi.fn();
vi.mock("sonner", () => ({
  __esModule: true,
  toast: Object.assign((...args: unknown[]) => toastFn(...args), {
    success: (...args: unknown[]) => toastFn(...args),
    error: (...args: unknown[]) => toastFn(...args),
  }),
}));

// Imported AFTER the mocks so the islands pick up the stubs.
import {
  RegistrationProvider,
  useRegistration,
} from "@/context/RegistrationContext";
import { SchemesPersonalizationBanner } from "@/components/home/SchemesPersonalizationBanner";
import { SchemesHub } from "@/components/schemes/SchemesHub";
import { Calculator } from "@/components/calculator/Calculator";

import {
  evaluateAllSchemes,
  totalEstimatedBenefit,
  weightedAverageConfidence,
} from "@/lib/eligibility-engine";
import { confidenceLabel } from "@/components/calculator/CalculatorResults";
import { formatNumber } from "@/lib/utils";
import type { EligibilityResult, RegistrationProfile } from "@/types";

/* -------------------------------------------------------------------------- */
/* Fixture profile + engine-derived expectations                              */
/* -------------------------------------------------------------------------- */

/**
 * A complete, realistic profile chosen to land schemes across MULTIPLE statuses
 * (several definitely-eligible, some likely, some check-requirements, some
 * not-eligible) so every assertion below is meaningful:
 *   - DPIIT + GST + Early Revenue  → SGST definitely-eligible
 *   - DPIIT                        → patent / internship definitely-eligible
 *   - founderAge 28 (≤ 30)         → RGEP definitely-eligible
 *   - Early Revenue                → KITVEN definitely-eligible
 *   - Mysuru (Zone 2, not BLR Urban) → new-incubation-centers + beyond-bengaluru definitely
 */
const PROFILE: RegistrationProfile = {
  founderName: "Anjali Rao",
  founderEmail: "anjali@example.com",
  founderPhone: "9876543210",
  founderAge: 28,
  companyName: "Acme Innovations",
  dpiitRecognized: true,
  gstRegistered: true,
  incorporationDate: "2022-06-15",
  currentStage: "Early Revenue",
  teamSize: 12,
  womenFounderStake: 60,
  womenEmployeePercentage: 40,
  scStFounder: false,
  primarySector: "deep-tech",
  secondarySectors: ["ai-ml"],
  location: "Mysuru",
  fundingStage: "Seed",
  fundingRaised: 10,
  // Status fields are set by completeRegistration(); seed values are inert for
  // the engine (no evaluator reads them).
  isRegistered: false,
  kiteId: "",
  registeredAt: "",
};

// Derive every expectation from the SAME pure engine the components use.
const RESULTS: Record<string, EligibilityResult> = evaluateAllSchemes(PROFILE);
const ALL = Object.values(RESULTS);

const EXPECTED_QUALIFYING = ALL.filter(
  (r) => r.status === "definitely-eligible" || r.status === "likely-eligible",
).length;
const EXPECTED_DEFINITELY = ALL.filter(
  (r) => r.status === "definitely-eligible",
).length;
const EXPECTED_LIKELY = ALL.filter((r) => r.status === "likely-eligible").length;

const EXPECTED_TOTAL = totalEstimatedBenefit(RESULTS);
const EXPECTED_TOTAL_STR = `₹${formatNumber(EXPECTED_TOTAL)}`;
const EXPECTED_CONFIDENCE_LABEL = confidenceLabel(
  weightedAverageConfidence(RESULTS),
);

/* -------------------------------------------------------------------------- */
/* Harness                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Commits the fixture profile to the live context on demand, simulating the
 * end of a successful registration without driving the lazy six-step wizard.
 */
function RegistrationDriver({ profile }: { profile: RegistrationProfile }) {
  const { updateProfile, completeRegistration } = useRegistration();
  return (
    <button
      type="button"
      onClick={() => {
        updateProfile(profile);
        completeRegistration();
      }}
    >
      Run registration
    </button>
  );
}

/**
 * One provider feeding all three surfaces, each scoped in a labelled wrapper so
 * cross-surface queries stay unambiguous.
 */
function Flow({ profile }: { profile: RegistrationProfile }) {
  return (
    <RegistrationProvider>
      <RegistrationDriver profile={profile} />
      <div data-testid="home-banner">
        <SchemesPersonalizationBanner />
      </div>
      <div data-testid="schemes-hub">
        <SchemesHub />
      </div>
      <div data-testid="calculator">
        <Calculator />
      </div>
    </RegistrationProvider>
  );
}

/* -------------------------------------------------------------------------- */
/* Test                                                                        */
/* -------------------------------------------------------------------------- */

describe("Registration → schemes personalization → calculator (e2e)", () => {
  beforeEach(() => {
    pushMock.mockClear();
    toastFn.mockClear();
  });

  it(
    "personalizes the home banner, scheme cards, and calculator totals from one profile",
    async () => {
      // Sanity: the fixture really does straddle multiple statuses, so the
      // assertions below are non-trivial.
      expect(EXPECTED_DEFINITELY).toBeGreaterThan(0);
      expect(EXPECTED_QUALIFYING).toBe(EXPECTED_DEFINITELY + EXPECTED_LIKELY);
      expect(EXPECTED_TOTAL).toBeGreaterThan(0);

      render(<Flow profile={PROFILE} />);

      const banner = () => within(screen.getByTestId("home-banner"));
      const hub = within(screen.getByTestId("schemes-hub"));
      const calc = within(screen.getByTestId("calculator"));

      /* -- 1. Unregistered_State: no banner, no confidence dots -------------- */
      expect(banner().queryByText(/You qualify for/i)).toBeNull();
      expect(hub.queryAllByLabelText("Definitely eligible")).toHaveLength(0);

      /* -- 2. Register (commit the profile to the live context) -------------- */
      fireEvent.click(screen.getByRole("button", { name: "Run registration" }));

      /* -- 3. Schemes personalization: home banner (Req 24.1, 24.2) ---------- */
      await waitFor(() =>
        expect(
          banner().getByText(
            `You qualify for ${EXPECTED_QUALIFYING} of 22 schemes`,
          ),
        ).toBeInTheDocument(),
      );

      /* -- 4. Schemes personalization: per-card ConfidenceDots (Req 12.4) ---- */
      // Each card now carries a dot whose accessible name is the engine's status
      // for that scheme; the per-status counts must match the engine exactly.
      expect(hub.getAllByLabelText("Definitely eligible")).toHaveLength(
        EXPECTED_DEFINITELY,
      );
      if (EXPECTED_LIKELY > 0) {
        expect(hub.getAllByLabelText("Likely eligible")).toHaveLength(
          EXPECTED_LIKELY,
        );
      }

      /* -- 5. Calculator totals (Req 21.2) — lazy results view --------------- */
      // The results view is code-split (next/dynamic, ssr:false): wait for it.
      await calc.findByText("Scheme breakdown", undefined, WAIT_OPTS);

      // Total estimated benefit consistent with the profile + engine.
      expect(calc.getByText(EXPECTED_TOTAL_STR)).toBeInTheDocument();

      // "Across X schemes you qualify for" — X consistent with the home banner.
      expect(
        calc.getByText(
          new RegExp(
            `Across ${EXPECTED_QUALIFYING} schemes you qualify for`,
          ),
        ),
      ).toBeInTheDocument();

      // Weighted-average confidence label rendered (Req 21.3 support of 21.2).
      expect(
        calc.getByText(`${EXPECTED_CONFIDENCE_LABEL} Confidence`),
      ).toBeInTheDocument();

      /* -- 6. Calculator status-grouped breakdown (Req 21.2 breakdown) ------- */
      // Definitely / Likely groups are expanded by default; assert the present
      // groups render with their headings.
      expect(calc.getByText("Definitely Eligible")).toBeInTheDocument();
      if (EXPECTED_LIKELY > 0) {
        expect(calc.getByText("Likely Eligible")).toBeInTheDocument();
      }
    },
    TEST_TIMEOUT,
  );
});

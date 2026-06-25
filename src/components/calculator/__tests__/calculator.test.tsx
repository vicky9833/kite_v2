/**
 * Calculator tests (task 4.6) — Property 15 + entry/results state, aria-live
 * total region, and quick-profile → results integration.
 *
 * This file holds:
 *  - ONE property-based test (Property 15: confidence-label thresholds) driving
 *    the PURE `confidenceLabel` exported from `CalculatorResults`.
 *  - EXAMPLE / integration tests for the `Calculator` coordinator wrapped in the
 *    real `RegistrationProvider`.
 *
 * Resilience notes for jsdom + next/dynamic:
 *  - `CalculatorEntry`, `CalculatorResults`, and `QuickProfileForm` are loaded
 *    via `next/dynamic({ ssr: false })`, so their markup arrives on a later
 *    microtask AND their JS chunk has to load. Every assertion that depends on a
 *    lazy view therefore uses a *retrying* query (`findBy*` / `waitFor`) with a
 *    generous explicit timeout — never a bare `getBy*` across the lazy boundary.
 *  - jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView / pointer
 *    capture) live in `src/test/setup.ts`.
 *  - `next/link` is mocked to a plain anchor and `next/navigation`'s `useRouter`
 *    is stubbed (mirrors the layout/wizard test pattern) so links render without
 *    an App Router provider.
 *
 * Founder-judgment on the quick-profile → results integration:
 *  Radix Select/Slider operation under jsdom is flaky, and here the entire
 *  QuickProfileForm arrives behind a lazy `next/dynamic` chunk, compounding that
 *  flakiness under full-suite CPU contention. Per the task's explicit allowance
 *  we split the contract into two deterministic halves:
 *    (a) clicking "Use quick profile" REVEALS the lazy form (findBy), proving the
 *        entry → form reveal wiring; and
 *    (b) the save → results transition (updateProfile entering Profile_Set_State,
 *        coordinator swapping entry for results) is exercised deterministically
 *        via a context-seeding wrapper that calls `updateProfile(...)` on mount.
 *  Together these cover the same path a real save drives, without depending on
 *  fragile portalled Radix interactions inside a lazy chunk.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import fc from "fast-check";

import type { RegistrationProfile } from "@/types";

/* -------------------------------------------------------------------------- */
/* Async budgets                                                               */
/* -------------------------------------------------------------------------- */

/** Generous budget for lazy `next/dynamic` chunk loads under full-suite load. */
const ASYNC_TIMEOUT = 8000;
const WAIT_OPTS = { timeout: ASYNC_TIMEOUT } as const;

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so the entry/results links render
// without an App Router context provider (the tests only care about hrefs).
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

// Stub the App Router so anything reaching for it never crashes.
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

// Imported AFTER the mocks above so the coordinator/views pick up the stubs.
import { RegistrationProvider, useRegistration } from "@/context/RegistrationContext";
import { Calculator } from "@/components/calculator/Calculator";
import { confidenceLabel } from "@/components/calculator/CalculatorResults";

beforeEach(() => {
  pushMock.mockClear();
});

/* -------------------------------------------------------------------------- */
/* Fixtures + helpers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * A profile crafted to make SEVERAL schemes qualify (and many of them
 * `definitely-eligible`), so the results view renders a non-zero total, a
 * "schemes you qualify for" caption, a confidence label, and a "Definitely
 * Eligible" group. Per the eligibility engine this yields definitely-eligible
 * SGST (DPIIT+GST+Early Revenue), patent (DPIIT), internship (DPIIT), RGEP
 * (age ≤ 30), KITVEN (Early Revenue), new-incubation-centers + beyond-Bengaluru
 * cluster (Zone 2 / non-Bengaluru-Urban), plus several likely-eligible schemes.
 */
const ELIGIBLE_PROFILE: Partial<RegistrationProfile> = {
  founderName: "Test Founder",
  founderEmail: "founder@example.com",
  founderPhone: "9876543210",
  founderAge: 28,
  companyName: "Test Innovations",
  dpiitRecognized: true,
  gstRegistered: true,
  incorporationDate: "2022-06-15",
  currentStage: "Early Revenue",
  teamSize: 12,
  womenFounderStake: 0,
  womenEmployeePercentage: 0,
  scStFounder: false,
  primarySector: "deep-tech",
  secondarySectors: [],
  location: "Mysuru",
  fundingStage: "Seed",
  fundingRaised: 10,
};

/**
 * Context-seeding wrapper: calls `updateProfile(profile)` exactly once on mount,
 * driving the provider into Profile_Set_State so the coordinator swaps the entry
 * card for the results view deterministically — without driving the lazy,
 * Radix-heavy QuickProfileForm.
 */
function SeedProfile({
  profile,
  children,
}: {
  profile: Partial<RegistrationProfile>;
  children: React.ReactNode;
}) {
  const { updateProfile } = useRegistration();
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      updateProfile(profile);
    }
  }, [profile, updateProfile]);
  return <>{children}</>;
}

/* -------------------------------------------------------------------------- */
/* Property 15 — Confidence label thresholds                                   */
/* -------------------------------------------------------------------------- */

describe("confidenceLabel — Property 15 (confidence label thresholds)", () => {
  it("classifies any value in [0,1] by the documented thresholds", () => {
    // Feature: kite-registration-schemes-calculator, Property 15
    // **Validates: Requirements 21.3**
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1, noNaN: true }), (value) => {
        const label = confidenceLabel(value);
        if (value > 0.8) {
          expect(label).toBe("High");
        } else if (value > 0.5) {
          expect(label).toBe("Medium");
        } else {
          expect(label).toBe("Low");
        }
      }),
      { numRuns: 25 },
    );
  });

  it("classifies the exact threshold boundaries", () => {
    // Feature: kite-registration-schemes-calculator, Property 15
    // 0.8 is the High/Medium boundary (strictly-greater-than ⇒ Medium at 0.8).
    expect(confidenceLabel(0.8)).toBe("Medium");
    // Just above 0.8 ⇒ High.
    expect(confidenceLabel(0.8 + 1e-9)).toBe("High");
    // 0.5 is the Medium/Low boundary (strictly-greater-than ⇒ Low at 0.5).
    expect(confidenceLabel(0.5)).toBe("Low");
    // Just above 0.5 ⇒ Medium; full extremes resolve as expected.
    expect(confidenceLabel(0.5 + 1e-9)).toBe("Medium");
    expect(confidenceLabel(1)).toBe("High");
    expect(confidenceLabel(0)).toBe("Low");
  });
});

/* -------------------------------------------------------------------------- */
/* State 1 — No profile → entry card                                           */
/* -------------------------------------------------------------------------- */

describe("Calculator — State 1 (No_Profile_State)", () => {
  it("shows the entry card (registration link + quick-profile button) and NOT the results", async () => {
    render(
      <RegistrationProvider>
        <Calculator />
      </RegistrationProvider>,
    );

    // The compact hero is static; the entry card is lazy → wait for it.
    const registerLink = await screen.findByRole(
      "link",
      { name: /Go to registration/i },
      WAIT_OPTS,
    );
    expect(registerLink).toHaveAttribute("href", "/register");

    // "Use quick profile" reveal button.
    expect(
      await screen.findByRole(
        "button",
        { name: /Use quick profile/i },
        WAIT_OPTS,
      ),
    ).toBeInTheDocument();

    // The results view must NOT be present in No_Profile_State.
    expect(
      screen.queryByText(/you qualify for/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Estimated total benefits/i),
    ).not.toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* State 2 — Profile set → results view                                        */
/* -------------------------------------------------------------------------- */

describe("Calculator — State 2 (Profile_Set_State)", () => {
  it("renders the results view: total, caption, confidence label, Definitely Eligible group, aria-live total", async () => {
    const { container } = render(
      <RegistrationProvider>
        <SeedProfile profile={ELIGIBLE_PROFILE}>
          <Calculator />
        </SeedProfile>
      </RegistrationProvider>,
    );

    // The results chunk mounts once the seed enters Profile_Set_State.
    await screen.findByText(/Estimated total benefits/i, undefined, WAIT_OPTS);

    // "Across X schemes you qualify for" caption (X ≥ 1 for this profile).
    const caption = await screen.findByText(
      /Across\s+\d+\s+schemes?\s+you qualify for/i,
      undefined,
      WAIT_OPTS,
    );
    expect(caption).toBeInTheDocument();

    // Confidence meter label — one of High / Medium / Low.
    expect(
      await screen.findByText(/(High|Medium|Low) Confidence/i, undefined, WAIT_OPTS),
    ).toBeInTheDocument();

    // At least the "Definitely Eligible" group heading is present (this profile
    // produces multiple definitely-eligible schemes).
    expect(
      await screen.findByText("Definitely Eligible", undefined, WAIT_OPTS),
    ).toBeInTheDocument();

    // The headline total + confidence sit inside an aria-live="polite" region,
    // and that region contains the large ₹ figure (Req 27.6).
    await waitFor(() => {
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).not.toBeNull();
      expect(liveRegion?.textContent ?? "").toMatch(/₹[\d,]+/);
    }, WAIT_OPTS);
  });
});

/* -------------------------------------------------------------------------- */
/* Quick-profile → results integration                                         */
/* -------------------------------------------------------------------------- */

describe("Calculator — quick-profile integration", () => {
  it("reveals the lazy QuickProfileForm when 'Use quick profile' is clicked", async () => {
    render(
      <RegistrationProvider>
        <Calculator />
      </RegistrationProvider>,
    );

    const revealButton = await screen.findByRole(
      "button",
      { name: /Use quick profile/i },
      WAIT_OPTS,
    );
    fireEvent.click(revealButton);

    // The lazy QuickProfileForm chunk mounts and shows its "Quick profile"
    // heading + Save control.
    expect(
      await screen.findByRole(
        "heading",
        { name: /Quick profile/i },
        WAIT_OPTS,
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole(
        "button",
        { name: /Save quick profile/i },
        WAIT_OPTS,
      ),
    ).toBeInTheDocument();
  });

  it("switches from entry to results once a profile is saved (Profile_Set_State transition)", async () => {
    // The save → results transition is the same `updateProfile` path a real
    // QuickProfileForm save fires; we drive it deterministically via the seeding
    // wrapper to avoid fragile portalled Radix interactions inside a lazy chunk.
    render(
      <RegistrationProvider>
        <SeedProfile profile={ELIGIBLE_PROFILE}>
          <Calculator />
        </SeedProfile>
      </RegistrationProvider>,
    );

    // Results view is shown…
    await screen.findByText(/Estimated total benefits/i, undefined, WAIT_OPTS);

    // …and the entry card's reveal button is gone (we left No_Profile_State).
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /Use quick profile/i }),
      ).not.toBeInTheDocument();
    }, WAIT_OPTS);
  });
});

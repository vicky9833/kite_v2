/**
 * Registration-gating integration test (task 6.4).
 *
 * Covers the cohesive registration-gating unit across two real surfaces wired
 * to a shared session `RegistrationContext`:
 *
 *  1. GATE (`StartupGate`) — an UNREGISTERED visitor of `/dashboard/startup`
 *     sees the `Redirecting_State` (an `aria-live="polite"` region, never the
 *     gated children) and the gate calls `router.push` to
 *     `/register?redirectFrom=dashboard/startup` (Req 1.1–1.4, 28.4). A
 *     REGISTERED visitor sees the gated children.
 *
 *  2. `/register` ROUND-TRIP (`RegisterPageClient` + real `RegistrationWizard`)
 *     — with `redirectFrom=dashboard/startup` in the search params, walking the
 *     real six-step wizard to submit pushes to `/dashboard/startup` (Req 1.5,
 *     1.6). With `redirectFrom` absent, the same walkthrough renders the default
 *     `RegistrationSuccess` screen and performs NO dashboard push (Req 1.7).
 *
 * jsdom / Next notes (mirrors a11y.test.tsx + wizard.integration.test.tsx):
 *  - `next/link` → plain anchor; `next/navigation` `useRouter` → push spy and
 *    `useSearchParams` → a `URLSearchParams` driven per test, so the islands
 *    render without an App Router provider.
 *  - Wizard steps + the success screen are code-split via
 *    `next/dynamic({ ssr:false })`, so every step boundary and post-submit
 *    assertion uses a *retrying* `findBy*` / `waitFor` query with a generous
 *    budget, and each walkthrough test carries a long per-test budget — the
 *    deterministic path proven by `wizard.integration.test.tsx`.
 *  - jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView / pointer
 *    capture) come from the global `src/test/setup.ts`.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { sectors } from "@/data/sectors";

/* -------------------------------------------------------------------------- */
/* Async budgets                                                               */
/* -------------------------------------------------------------------------- */

const ASYNC_TIMEOUT = 8000;
const WAIT_OPTS = { timeout: ASYNC_TIMEOUT } as const;
const TEST_TIMEOUT = 30000;

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so wizard / success CTAs render
// without an App Router context provider.
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

// Stub the App Router (`useRouter().push` spy) and `useSearchParams` (driven
// per test through a mutable `URLSearchParams`).
const pushMock = vi.fn();
let searchParams = new URLSearchParams();
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
  useSearchParams: () => searchParams,
}));

// Spy on sonner so any toast never touches a real toaster.
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
import { StartupGate } from "../StartupGate";
import { RegisterPageClient } from "@/components/registration/RegisterPageClient";
import type { RegistrationProfile } from "@/types";

/* -------------------------------------------------------------------------- */
/* Wizard walkthrough helpers (mirrors wizard.integration.test.tsx)            */
/* -------------------------------------------------------------------------- */

async function fillInput(name: RegExp | string, value: string) {
  const input = await screen.findByLabelText(name, undefined, WAIT_OPTS);
  fireEvent.change(input, { target: { value } });
}

async function selectOption(triggerName: RegExp, optionName: RegExp | string) {
  const trigger = await screen.findByRole(
    "combobox",
    { name: triggerName },
    WAIT_OPTS,
  );
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  const option = await screen.findByRole(
    "option",
    { name: optionName },
    WAIT_OPTS,
  );
  fireEvent.click(option);
  await waitFor(
    () =>
      expect(
        screen.getByRole("combobox", { name: triggerName }),
      ).toHaveTextContent(optionName),
    WAIT_OPTS,
  );
}

function nudgeSlider(index: number) {
  const sliders = screen.getAllByRole("slider");
  const thumb = sliders[index]!;
  thumb.focus();
  fireEvent.keyDown(thumb, { key: "ArrowRight" });
}

async function clickContinue() {
  const button = await screen.findByRole(
    "button",
    { name: "Continue" },
    WAIT_OPTS,
  );
  fireEvent.click(button);
}

/** Drive the real six-step wizard with valid data and submit. */
async function completeWizard() {
  // Step 1 — Founder details.
  await screen.findByLabelText("Full name", undefined, WAIT_OPTS);
  await fillInput("Full name", "Anjali Rao");
  await fillInput("Email address", "anjali@example.com");
  await fillInput("Mobile number", "9876543210");
  await fillInput("Your age", "32");
  await clickContinue();

  // Step 2 — Company basics.
  await screen.findByLabelText("Company name", undefined, WAIT_OPTS);
  await fillInput("Company name", "Acme Innovations");
  await waitFor(
    () => expect(screen.getAllByRole("radio", { name: "Yes" })).toHaveLength(2),
    WAIT_OPTS,
  );
  const yesRadios = screen.getAllByRole("radio", { name: "Yes" });
  fireEvent.click(yesRadios[0]!); // DPIIT
  fireEvent.click(yesRadios[1]!); // GST
  await fillInput("Incorporation date", "2022-06-15");
  await selectOption(/Current stage/i, "Early Revenue");
  await clickContinue();

  // Step 3 — Team composition.
  await screen.findByLabelText("Team size", undefined, WAIT_OPTS);
  await fillInput("Team size", "12");
  await waitFor(
    () => expect(screen.getAllByRole("slider")).toHaveLength(2),
    WAIT_OPTS,
  );
  nudgeSlider(0);
  nudgeSlider(1);
  await clickContinue();

  // Step 4 — Sector focus.
  await screen.findByRole("combobox", { name: /Primary sector/i }, WAIT_OPTS);
  await selectOption(/Primary sector/i, sectors[0]!.name);
  await clickContinue();

  // Step 5 — Location & funding.
  await screen.findByRole("combobox", { name: /Primary location/i }, WAIT_OPTS);
  await selectOption(/Primary location/i, "Bengaluru Urban");
  await selectOption(/Funding stage/i, "Seed");
  await fillInput(/Funding raised/i, "10");
  await clickContinue();

  // Step 6 — Review & submit.
  await screen.findByText(
    /I confirm the above information is accurate/i,
    undefined,
    WAIT_OPTS,
  );
  const accuracyCheckbox = await screen.findByRole(
    "checkbox",
    undefined,
    WAIT_OPTS,
  );
  fireEvent.click(accuracyCheckbox);
  const submitButton = await screen.findByRole(
    "button",
    { name: "Submit Registration" },
    WAIT_OPTS,
  );
  fireEvent.click(submitButton);
}

/* -------------------------------------------------------------------------- */
/* Gate fixtures / harness                                                     */
/* -------------------------------------------------------------------------- */

const PROFILE: RegistrationProfile = {
  founderName: "Anjali Rao",
  founderEmail: "anjali@example.com",
  founderPhone: "9876543210",
  founderAge: 32,
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
  location: "Bengaluru Urban",
  fundingStage: "Seed",
  fundingRaised: 10,
  isRegistered: false,
  kiteId: "",
  registeredAt: "",
};

/** Commits the fixture profile to the live context (deterministic register). */
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

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("Registration gating + /register round-trip (integration)", () => {
  beforeEach(() => {
    pushMock.mockClear();
    toastFn.mockClear();
    searchParams = new URLSearchParams();
  });

  it("redirects an unregistered visitor of the startup dashboard with an aria-live notice (Req 1.1–1.3, 28.4)", () => {
    render(
      <RegistrationProvider>
        <StartupGate>
          <div data-testid="gated-content">Startup dashboard</div>
        </StartupGate>
      </RegistrationProvider>,
    );

    // Redirecting_State, not the gated children (Req 1.2, 1.3).
    expect(screen.queryByTestId("gated-content")).toBeNull();

    // The notice is announced through an aria-live="polite" region (Req 28.4).
    const notice = screen.getByText(/Redirecting you to registration/i);
    expect(notice).toBeInTheDocument();
    expect(notice).toHaveAttribute("aria-live", "polite");

    // The gate pushes to /register with the redirectFrom marker (Req 1.1).
    expect(pushMock).toHaveBeenCalledWith(
      "/register?redirectFrom=dashboard/startup",
    );
  });

  it("renders the gated children once registered (Req 1.4)", () => {
    render(
      <RegistrationProvider>
        <RegistrationDriver profile={PROFILE} />
        <StartupGate>
          <div data-testid="gated-content">Startup dashboard</div>
        </StartupGate>
      </RegistrationProvider>,
    );

    // Unregistered first: gated content absent.
    expect(screen.queryByTestId("gated-content")).toBeNull();

    // Register, then the children render and the redirecting notice clears.
    fireEvent.click(screen.getByRole("button", { name: "Run registration" }));
    expect(screen.getByTestId("gated-content")).toBeInTheDocument();
    expect(screen.queryByText(/Redirecting you to registration/i)).toBeNull();
  });

  it(
    "round-trips redirectFrom=dashboard/startup → completing the wizard pushes to /dashboard/startup (Req 1.5, 1.6)",
    async () => {
      searchParams = new URLSearchParams("redirectFrom=dashboard/startup");

      render(
        <RegistrationProvider>
          <RegisterPageClient />
        </RegistrationProvider>,
      );

      await completeWizard();

      // RegisterPageClient resolved redirectFrom → redirectTo and handed it to
      // the wizard, whose submit branch pushes to the mapped internal path.
      await waitFor(
        () => expect(pushMock).toHaveBeenCalledWith("/dashboard/startup"),
        WAIT_OPTS,
      );
    },
    TEST_TIMEOUT,
  );

  it(
    "preserves default success-screen behavior when redirectFrom is absent (Req 1.7)",
    async () => {
      // No search params → redirectTo undefined → no push, success screen shows.
      render(
        <RegistrationProvider>
          <RegisterPageClient />
        </RegistrationProvider>,
      );

      await completeWizard();

      // The default RegistrationSuccess screen renders (lazy chunk).
      const heading = await screen.findByRole(
        "heading",
        { name: "Registration Complete" },
        WAIT_OPTS,
      );
      expect(heading).toBeInTheDocument();

      // No dashboard redirect occurred (Req 1.7).
      expect(pushMock).not.toHaveBeenCalledWith("/dashboard/startup");
    },
    TEST_TIMEOUT,
  );
});

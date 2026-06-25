/**
 * Investor onboarding wizard tests (task 8.3).
 *
 * Two layers:
 *
 *  1. PURE REDUCER — `investorWizardReducer` is exercised directly as a pure
 *     `(state, action) => state` function: NEXT no-ops on a step with recorded
 *     errors and at step 4, BACK no-ops at step 1, TOGGLE_ACCURACY flips the
 *     flag, SET_FIELD merges into the draft, SUBMIT flips `submitted`.
 *
 *  2. COMPONENT INTEGRATION — the real `InvestorOnboardingWizard`, wrapped in
 *     the real `InvestorProvider`, driven through the four steps to the success
 *     screen (Req 16.1–16.5). The steps are code-split via
 *     `next/dynamic({ ssr:false })`, so every step boundary and post-interaction
 *     assertion uses a *retrying* `findBy*` / `waitFor` query with a generous
 *     budget (mirrors `registration/__tests__/wizard.integration.test.tsx`).
 *
 * jsdom / Next notes: `next/link` → plain anchor; `next/navigation` `useRouter`
 * → push spy; `sonner` stubbed so the success screen never touches a toaster.
 * jsdom polyfills come from the global `src/test/setup.ts`.
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

const toastFn = vi.fn();
vi.mock("sonner", () => ({
  __esModule: true,
  toast: Object.assign((...args: unknown[]) => toastFn(...args), {
    success: (...args: unknown[]) => toastFn(...args),
    error: (...args: unknown[]) => toastFn(...args),
  }),
}));

// Imported AFTER the mocks so the wizard / success pick up the stubs.
import { InvestorProvider } from "@/context/InvestorContext";
import {
  InvestorOnboardingWizard,
  investorWizardReducer,
  initialInvestorWizardState,
  type InvestorWizardState,
} from "../InvestorOnboardingWizard";

/* -------------------------------------------------------------------------- */
/* Interaction helpers (mirror wizard.integration.test.tsx)                    */
/* -------------------------------------------------------------------------- */

async function fillInput(name: RegExp | string, value: string) {
  const input = await screen.findByLabelText(name, undefined, WAIT_OPTS);
  fireEvent.change(input, { target: { value } });
}

/** Drive a Radix Select reliably under jsdom (focus, ArrowDown, click option). */
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

/** Toggle an accessible chip (a button whose accessible name is its label). */
async function toggleChip(name: RegExp | string) {
  const chip = await screen.findByRole("button", { name }, WAIT_OPTS);
  fireEvent.click(chip);
}

async function clickContinue() {
  const button = await screen.findByRole(
    "button",
    { name: "Continue" },
    WAIT_OPTS,
  );
  fireEvent.click(button);
}

/* -------------------------------------------------------------------------- */
/* 1. Pure reducer                                                             */
/* -------------------------------------------------------------------------- */

describe("investorWizardReducer (pure)", () => {
  it("NEXT no-ops when the current step has recorded errors", () => {
    const state: InvestorWizardState = {
      ...initialInvestorWizardState,
      errors: {
        ...initialInvestorWizardState.errors,
        1: { investorName: "Required" },
      },
    };
    expect(investorWizardReducer(state, { type: "NEXT" }).currentStep).toBe(1);
  });

  it("NEXT advances when the current step is error-free", () => {
    const next = investorWizardReducer(initialInvestorWizardState, {
      type: "NEXT",
    });
    expect(next.currentStep).toBe(2);
  });

  it("NEXT no-ops at the final step (4)", () => {
    const state: InvestorWizardState = {
      ...initialInvestorWizardState,
      currentStep: 4,
    };
    expect(investorWizardReducer(state, { type: "NEXT" }).currentStep).toBe(4);
  });

  it("BACK no-ops at step 1", () => {
    expect(
      investorWizardReducer(initialInvestorWizardState, { type: "BACK" })
        .currentStep,
    ).toBe(1);
  });

  it("TOGGLE_ACCURACY sets the accuracy flag", () => {
    const on = investorWizardReducer(initialInvestorWizardState, {
      type: "TOGGLE_ACCURACY",
      value: true,
    });
    expect(on.accuracyConfirmed).toBe(true);
    const off = investorWizardReducer(on, {
      type: "TOGGLE_ACCURACY",
      value: false,
    });
    expect(off.accuracyConfirmed).toBe(false);
  });

  it("SET_FIELD merges a value into the profile draft", () => {
    const next = investorWizardReducer(initialInvestorWizardState, {
      type: "SET_FIELD",
      field: "investorName",
      value: "Anjali Rao",
    });
    expect(next.profile.investorName).toBe("Anjali Rao");
    // Untouched fields are preserved (draft starts empty here).
    expect(next.profile.investorEmail).toBeUndefined();
  });

  it("SUBMIT flips submitted to true", () => {
    expect(
      investorWizardReducer(initialInvestorWizardState, { type: "SUBMIT" })
        .submitted,
    ).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* 2. Component integration                                                    */
/* -------------------------------------------------------------------------- */

function renderWizard() {
  return render(
    <InvestorProvider>
      <InvestorOnboardingWizard />
    </InvestorProvider>,
  );
}

/** Fill step 1 with valid identity data and advance. */
async function completeStep1() {
  await fillInput("Full name", "Anjali Rao");
  await fillInput("Firm name", "Western Ghats Ventures");
  await fillInput("Email address", "anjali@example.com");
  await fillInput("Mobile number", "9876543210");
  await selectOption(/Your role/i, "GP");
  await clickContinue();
}

describe("InvestorOnboardingWizard (integration)", () => {
  beforeEach(() => {
    pushMock.mockClear();
    toastFn.mockClear();
  });

  it(
    "renders step 1 with a 4-step progressbar at value 1",
    async () => {
      renderWizard();
      // Step 1's first field confirms the lazy chunk mounted.
      await screen.findByLabelText("Full name", undefined, WAIT_OPTS);

      const progressbar = screen.getByRole("progressbar");
      expect(progressbar).toHaveAttribute("aria-valuenow", "1");
      expect(progressbar).toHaveAttribute("aria-valuemax", "4");
    },
    TEST_TIMEOUT,
  );

  it(
    "blocks advancing past step 1 with invalid fields and surfaces errors",
    async () => {
      renderWizard();

      // Enter invalid values and blur so the fields are touched.
      const name = await screen.findByLabelText("Full name", undefined, WAIT_OPTS);
      fireEvent.change(name, { target: { value: "A" } }); // < 2 chars
      fireEvent.blur(name);
      const email = await screen.findByLabelText("Email address", undefined, WAIT_OPTS);
      fireEvent.change(email, { target: { value: "nope" } });
      fireEvent.blur(email);

      await clickContinue();

      // An error message surfaces (Continue dispatched VALIDATE_STEP).
      await screen.findByText(/at least 2 characters/i, undefined, WAIT_OPTS);

      // And the wizard stayed on step 1.
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "1",
      );
    },
    TEST_TIMEOUT,
  );

  it(
    "advances to step 2 once step 1 is valid",
    async () => {
      renderWizard();
      await completeStep1();

      // Step 2's own content (the firm heading) confirms the advance.
      await screen.findByRole(
        "heading",
        { name: /Your firm/i },
        WAIT_OPTS,
      );
      await waitFor(
        () =>
          expect(screen.getByRole("progressbar")).toHaveAttribute(
            "aria-valuenow",
            "2",
          ),
        WAIT_OPTS,
      );
    },
    TEST_TIMEOUT,
  );

  it(
    "gates the step-4 Submit on the accuracy checkbox, then reaches success with an Investor ID",
    async () => {
      renderWizard();

      // Step 1.
      await completeStep1();

      // Step 2 — Firm.
      await selectOption(/Firm type/i, "VC");
      await fillInput(/Assets under management/i, "5000");
      await fillInput(/Year founded/i, "2015");
      await clickContinue();

      // Step 3 — Thesis (chip multi-selects + ticket inputs).
      await toggleChip(sectors[0]!.name);
      await toggleChip("Seed");
      await fillInput(/Minimum ticket size/i, "50");
      await fillInput(/Maximum ticket size/i, "500");
      await toggleChip("Karnataka");
      await clickContinue();

      // Step 4 — Review & submit. The accuracy checkbox gates Submit.
      const submitButton = await screen.findByRole(
        "button",
        { name: "Submit" },
        WAIT_OPTS,
      );
      expect(submitButton).toHaveAttribute("aria-disabled", "true");

      const checkbox = await screen.findByRole("checkbox", undefined, WAIT_OPTS);
      fireEvent.click(checkbox);

      await waitFor(
        () =>
          expect(
            screen.getByRole("button", { name: "Submit" }),
          ).toHaveAttribute("aria-disabled", "false"),
        WAIT_OPTS,
      );

      fireEvent.click(screen.getByRole("button", { name: "Submit" }));

      // Success screen shows the generated Investor ID (INV-YYYY-XXXXXX).
      await screen.findByRole(
        "heading",
        { name: /You're onboarded/i },
        WAIT_OPTS,
      );
      const investorId = await screen.findByText(
        /^INV-\d{4}-[A-Z2-9]{6}$/,
        undefined,
        WAIT_OPTS,
      );
      expect(investorId).toBeInTheDocument();
    },
    TEST_TIMEOUT,
  );
});

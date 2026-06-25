/**
 * Onboard redirect e2e (task 8.5).
 *
 * Drives the real `OnboardPageClient` (which reads `useSearchParams()` and
 * resolves `redirectFrom` → guarded `redirectTo` through `REDIRECT_MAP`) wrapped
 * in the real `InvestorProvider`, completing the four-step wizard each time
 * (Req 16.6):
 *
 *  - `redirectFrom=dashboard/investor`          → submit pushes `/dashboard/investor`.
 *  - `redirectFrom=dashboard/investor/pipeline` → submit pushes `/dashboard/investor/pipeline`.
 *  - no `redirectFrom`                          → success screen renders, NO push.
 *
 * jsdom / Next notes (mirror `dashboard/startup/__tests__/gating.integration.test.tsx`):
 * `next/link` → plain anchor; `next/navigation` `useRouter().push` → spy,
 * `useSearchParams` → a mutable `URLSearchParams` driven per test; `sonner`
 * stubbed. Steps are code-split via `next/dynamic({ ssr:false })`, so every
 * step boundary uses a retrying `findBy*` / `waitFor` with a generous budget.
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

const toastFn = vi.fn();
vi.mock("sonner", () => ({
  __esModule: true,
  toast: Object.assign((...args: unknown[]) => toastFn(...args), {
    success: (...args: unknown[]) => toastFn(...args),
    error: (...args: unknown[]) => toastFn(...args),
  }),
}));

// Imported AFTER the mocks so the island picks up the stubs.
import { InvestorProvider } from "@/context/InvestorContext";
import { OnboardPageClient } from "@/components/investors/OnboardPageClient";

/* -------------------------------------------------------------------------- */
/* Wizard walkthrough helpers (mirror wizard.integration.test.tsx)             */
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

/** Drive the real four-step investor wizard with valid data and submit. */
async function completeWizard() {
  // Step 1 — Identity.
  await fillInput("Full name", "Anjali Rao");
  await fillInput("Firm name", "Western Ghats Ventures");
  await fillInput("Email address", "anjali@example.com");
  await fillInput("Mobile number", "9876543210");
  await selectOption(/Your role/i, "GP");
  await clickContinue();

  // Step 2 — Firm.
  await selectOption(/Firm type/i, "VC");
  await fillInput(/Assets under management/i, "5000");
  await fillInput(/Year founded/i, "2015");
  await clickContinue();

  // Step 3 — Thesis.
  await toggleChip(sectors[0]!.name);
  await toggleChip("Seed");
  await fillInput(/Minimum ticket size/i, "50");
  await fillInput(/Maximum ticket size/i, "500");
  await toggleChip("Karnataka");
  await clickContinue();

  // Step 4 — Review & submit.
  const checkbox = await screen.findByRole("checkbox", undefined, WAIT_OPTS);
  fireEvent.click(checkbox);
  await waitFor(
    () =>
      expect(screen.getByRole("button", { name: "Submit" })).toHaveAttribute(
        "aria-disabled",
        "false",
      ),
    WAIT_OPTS,
  );
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("OnboardPageClient redirect round-trip (e2e)", () => {
  beforeEach(() => {
    pushMock.mockClear();
    toastFn.mockClear();
    searchParams = new URLSearchParams();
  });

  it(
    "redirectFrom=dashboard/investor → submit pushes /dashboard/investor",
    async () => {
      searchParams = new URLSearchParams("redirectFrom=dashboard/investor");
      render(
        <InvestorProvider>
          <OnboardPageClient />
        </InvestorProvider>,
      );

      await completeWizard();

      await waitFor(
        () => expect(pushMock).toHaveBeenCalledWith("/dashboard/investor"),
        WAIT_OPTS,
      );
    },
    TEST_TIMEOUT,
  );

  it(
    "redirectFrom=dashboard/investor/pipeline → submit pushes /dashboard/investor/pipeline",
    async () => {
      searchParams = new URLSearchParams(
        "redirectFrom=dashboard/investor/pipeline",
      );
      render(
        <InvestorProvider>
          <OnboardPageClient />
        </InvestorProvider>,
      );

      await completeWizard();

      await waitFor(
        () =>
          expect(pushMock).toHaveBeenCalledWith(
            "/dashboard/investor/pipeline",
          ),
        WAIT_OPTS,
      );
    },
    TEST_TIMEOUT,
  );

  it(
    "no redirectFrom → success screen renders and no dashboard push occurs",
    async () => {
      // searchParams left empty by beforeEach.
      render(
        <InvestorProvider>
          <OnboardPageClient />
        </InvestorProvider>,
      );

      await completeWizard();

      // The default success screen renders.
      await screen.findByRole(
        "heading",
        { name: /You're onboarded/i },
        WAIT_OPTS,
      );

      // No redirect push occurred.
      expect(pushMock).not.toHaveBeenCalled();
    },
    TEST_TIMEOUT,
  );
});

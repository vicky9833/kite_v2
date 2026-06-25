/**
 * Full-wizard integration test (task 2.13).
 *
 * Drives the real six-step `RegistrationWizard` — wrapped in the real
 * `RegistrationProvider` — end-to-end through valid data on every step until the
 * post-submit success state renders, then asserts the success contract (Req 9.5,
 * 10.1–10.4): the "Registration Complete" heading, a well-formed KITE ID, the
 * three CTA links (`/schemes`, `/calculator`, `/`), and the Copy-to-clipboard
 * action.
 *
 * Resilience notes for jsdom + Radix + next/dynamic:
 *  - Steps are code-split via `next/dynamic({ ssr: false })`, so each step's
 *    markup arrives on a later microtask AND its JS chunk has to load. Under the
 *    full suite's CPU contention those chunk loads — and the Radix portal
 *    updates that follow a Select open/commit — can take noticeably longer than
 *    Testing Library's default (~1s) `findBy`/`waitFor` window and longer than
 *    Vitest's default 5s per-test timeout. To make the walkthrough deterministic
 *    both in isolation AND under load, every step boundary and every
 *    post-interaction assertion uses a *retrying* query (`findBy*` / `waitFor`)
 *    with a generous explicit timeout, and the test itself is given a long
 *    per-test budget. No `getBy*` is used across a step boundary, so a
 *    not-yet-mounted lazy chunk retries instead of throwing.
 *  - jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView / pointer
 *    capture) live in `src/test/setup.ts`; Radix Select/Slider would otherwise
 *    throw on mount.
 *  - Radix controls are driven the most reliable way under jsdom (verified
 *    empirically): text/number inputs and the date input via `fireEvent.change`;
 *    Yes/No `RadioGroup`s via `fireEvent.click`; `Select`s by focusing the
 *    trigger, opening with `ArrowDown`, then clicking the portalled option — and
 *    crucially waiting for the trigger to reflect the chosen value before the
 *    next Continue, so a value commit can never race the advance; and the 0–100
 *    `Slider`s with a single `ArrowRight` keydown (the step's stake fields are
 *    otherwise `undefined`, which the Step-3 validator rejects). All of these
 *    dispatch the SAME reducer actions the UI uses, so the reducer draft — and
 *    the context sync on each advance — is exercised for real.
 *  - `next/link` is mocked to a plain anchor and `next/navigation`'s `useRouter`
 *    is stubbed (mirrors the layout/home test pattern) so the success-state
 *    CTA links render without an App Router provider. All shared mocks are reset
 *    before each test and the clipboard is reassigned per test + restored after,
 *    so nothing leaks across files when the full suite runs.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";

import { sectors } from "@/data/sectors";

/* -------------------------------------------------------------------------- */
/* Async budgets                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Generous explicit budget for every retrying query. Lazy `next/dynamic` chunk
 * loads and Radix portal updates need headroom well above Testing Library's ~1s
 * default when the full suite is hammering the CPU.
 */
const ASYNC_TIMEOUT = 8000;
/** waitForOptions passed to `findBy*` (3rd arg) and `waitFor` (2nd arg). */
const WAIT_OPTS = { timeout: ASYNC_TIMEOUT } as const;
/**
 * Per-test budget. The walkthrough crosses six lazy step boundaries plus the
 * success chunk, so it must comfortably exceed the sum of the individual waits
 * and never trip Vitest's default 5s test timeout under load.
 */
const TEST_TIMEOUT = 30000;

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so the success CTAs render without an
// App Router context provider (the test only cares about hrefs / labels).
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

// Spy on sonner's toast so the copy confirmation never touches a real toaster.
const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  __esModule: true,
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

// Imported AFTER the mocks above so the wizard/success pick up the stubs.
import { RegistrationProvider } from "@/context/RegistrationContext";
import { RegistrationWizard } from "../RegistrationWizard";

/* -------------------------------------------------------------------------- */
/* Interaction helpers                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Set a text/number/date input found by its accessible (label) name. Resolves
 * the control with a *retrying* `findByLabelText` so it tolerates a still-
 * mounting lazy step chunk under load.
 */
async function fillInput(name: RegExp | string, value: string) {
  const input = await screen.findByLabelText(name, undefined, WAIT_OPTS);
  fireEvent.change(input, { target: { value } });
}

/**
 * Operate a Radix Select reliably under jsdom: focus the trigger (resolved by
 * its accessible name, which comes from the WizardField <label htmlFor>), open
 * with ArrowDown, then click the portalled option. Verified to dispatch the
 * same `onValueChange` the pointer UI would. Every step waits with an explicit
 * budget, and the chosen value is confirmed on the trigger before returning so
 * the subsequent Continue can never fire before the value commits.
 */
async function selectOption(triggerName: RegExp, optionName: RegExp | string) {
  const trigger = await screen.findByRole(
    "combobox",
    { name: triggerName },
    WAIT_OPTS,
  );
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  // Wait for the portalled listbox option to mount, then commit the choice.
  const option = await screen.findByRole(
    "option",
    { name: optionName },
    WAIT_OPTS,
  );
  fireEvent.click(option);
  // The trigger reflects the chosen value once the popover closes; block on it
  // so the next Continue advances only after the value has committed.
  await waitFor(
    () =>
      expect(
        screen.getByRole("combobox", { name: triggerName }),
      ).toHaveTextContent(optionName),
    WAIT_OPTS,
  );
}

/** Nudge a 0–100 Radix Slider off its undefined initial value via keyboard. */
function nudgeSlider(index: number) {
  const sliders = screen.getAllByRole("slider");
  const thumb = sliders[index]!;
  thumb.focus();
  fireEvent.keyDown(thumb, { key: "ArrowRight" });
}

/** Click the wizard's Continue control (label changes on the last step). */
async function clickContinue() {
  const button = await screen.findByRole(
    "button",
    { name: "Continue" },
    WAIT_OPTS,
  );
  fireEvent.click(button);
}

/* -------------------------------------------------------------------------- */
/* Test                                                                        */
/* -------------------------------------------------------------------------- */

describe("RegistrationWizard — full walkthrough to success (integration)", () => {
  // Preserve any pre-existing clipboard so cross-file state cannot leak: we
  // reassign a fresh stub per test and restore the original afterwards.
  const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    "clipboard",
  );

  beforeEach(() => {
    // Reset all shared mocks so a prior file's interactions never bleed in.
    pushMock.mockClear();
    toastSuccess.mockClear();
    toastError.mockClear();

    // A fresh clipboard whose writeText resolves so the copy handler hits its
    // success branch (toast.success + inline "Copied"). Reassigned per test.
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      writable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    // Restore the original clipboard (or remove our stub) so other files start
    // from a clean global.
    if (originalClipboardDescriptor) {
      Object.defineProperty(navigator, "clipboard", originalClipboardDescriptor);
    } else {
      // No original descriptor existed; drop our stub.
      delete (navigator as { clipboard?: unknown }).clipboard;
    }
    pushMock.mockClear();
    toastSuccess.mockClear();
    toastError.mockClear();
  });

  it(
    "walks all six steps with valid data and reaches Registration Complete",
    async () => {
      render(
        <RegistrationProvider>
          <RegistrationWizard />
        </RegistrationProvider>,
      );

      /* -- Step 1: Founder details --------------------------------------- */
      // Lazy chunk: wait for the first field to mount.
      await screen.findByLabelText("Full name", undefined, WAIT_OPTS);
      await fillInput("Full name", "Anjali Rao");
      await fillInput("Email address", "anjali@example.com");
      await fillInput("Mobile number", "9876543210");
      await fillInput("Your age", "32");
      await clickContinue();

      /* -- Step 2: Company basics ---------------------------------------- */
      await screen.findByLabelText("Company name", undefined, WAIT_OPTS);
      await fillInput("Company name", "Acme Innovations");
      // DPIIT + GST Yes/No radio groups → two "Yes" radios in DOM order. Wait
      // for both to be present before clicking (lazy chunk + portal headroom).
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

      /* -- Step 3: Team composition -------------------------------------- */
      await screen.findByLabelText("Team size", undefined, WAIT_OPTS);
      await fillInput("Team size", "12");
      // Stakes are undefined until the sliders move; the Step-3 validator
      // requires finite values, so nudge both off 0. Wait for both thumbs first.
      await waitFor(
        () => expect(screen.getAllByRole("slider")).toHaveLength(2),
        WAIT_OPTS,
      );
      nudgeSlider(0); // women founder stake
      nudgeSlider(1); // women in workforce
      await clickContinue();

      /* -- Step 4: Sector focus ------------------------------------------ */
      await screen.findByRole(
        "combobox",
        { name: /Primary sector/i },
        WAIT_OPTS,
      );
      await selectOption(/Primary sector/i, sectors[0]!.name); // Deep Tech
      await clickContinue();

      /* -- Step 5: Location & funding ------------------------------------ */
      await screen.findByRole(
        "combobox",
        { name: /Primary location/i },
        WAIT_OPTS,
      );
      await selectOption(/Primary location/i, "Bengaluru Urban");
      await selectOption(/Funding stage/i, "Seed");
      // fundingRaised is undefined until changed; the validator requires ≥ 0.
      await fillInput(/Funding raised/i, "10");
      await clickContinue();

      /* -- Step 6: Review & submit --------------------------------------- */
      // Wait for the lazy step-6 chunk's own content (the accuracy confirmation),
      // not the progress-header title which also reads "Review & submit".
      await screen.findByText(
        /I confirm the above information is accurate/i,
        undefined,
        WAIT_OPTS,
      );
      // Confirm the entered values surfaced on the review cards (chunk is mounted
      // now, but use retrying queries to stay robust under load).
      await screen.findByText("Anjali Rao", undefined, WAIT_OPTS);
      await screen.findByText("Acme Innovations", undefined, WAIT_OPTS);
      await screen.findByText(sectors[0]!.name, undefined, WAIT_OPTS);

      // Accuracy checkbox gates the submit control.
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

      /* -- Success state ------------------------------------------------- */
      const heading = await screen.findByRole(
        "heading",
        { name: "Registration Complete" },
        WAIT_OPTS,
      );
      expect(heading).toBeInTheDocument();

      // A well-formed KITE ID is shown (KITE-YYYY-XXXXXX, unambiguous alphabet).
      const kiteId = await screen.findByText(
        /^KITE-\d{4}-[A-Z2-9]{6}$/,
        undefined,
        WAIT_OPTS,
      );
      expect(kiteId).toBeInTheDocument();

      // Exactly the three CTA links, routing to /schemes, /calculator, and /.
      const schemesLink = await screen.findByRole(
        "link",
        { name: /See Schemes You Qualify For/i },
        WAIT_OPTS,
      );
      const calculatorLink = await screen.findByRole(
        "link",
        { name: /Calculate Your Benefits/i },
        WAIT_OPTS,
      );
      const exploreLink = await screen.findByRole(
        "link",
        { name: /Explore the Ecosystem/i },
        WAIT_OPTS,
      );
      expect(schemesLink).toHaveAttribute("href", "/schemes");
      expect(calculatorLink).toHaveAttribute("href", "/calculator");
      expect(exploreLink).toHaveAttribute("href", "/");

      /* -- Copy KITE ID -------------------------------------------------- */
      const copyButton = await screen.findByRole(
        "button",
        { name: /Copy KITE ID to clipboard/i },
        WAIT_OPTS,
      );
      fireEvent.click(copyButton);

      await waitFor(
        () =>
          expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            kiteId.textContent,
          ),
        WAIT_OPTS,
      );
      // The success branch also flips the button to its "Copied" affordance.
      expect(
        await within(copyButton).findByText("Copied", undefined, WAIT_OPTS),
      ).toBeInTheDocument();
      await waitFor(() => expect(toastSuccess).toHaveBeenCalled(), WAIT_OPTS);
    },
    TEST_TIMEOUT,
  );
});

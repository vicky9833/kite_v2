/**
 * Slice-wide accessibility audit (task 5.4) — Requirements 27.1–27.8.
 *
 * Runs an automated `axe-core` audit over every user-facing surface of the
 * Registration / Schemes / Calculator slice, then asserts the specific ARIA
 * contracts the design promises:
 *
 *   - `/register`          → RegistrationWizard
 *   - `/schemes`           → SchemesHub
 *   - `/schemes/[id]`      → SchemeDetailContent (real scheme record)
 *   - `/schemes/compare`   → CompareView (two real scheme ids)
 *   - `/calculator`        → Calculator (results view, seeded profile)
 *
 * Targeted ARIA assertions (beyond the zero-violations audit):
 *   - `role="progressbar"` values on the wizard progress header (Req 27.1).
 *   - the wizard Continue button uses `aria-disabled` and NEVER native
 *     `disabled` (Req 27.2).
 *   - inline field errors render inside an `aria-live="polite"` region
 *     (Req 27.3).
 *   - the Compare View is a semantic table with programmatically associated
 *     column headers (one `<th scope="col">` per scheme) and row headers
 *     (`<th scope="row">`) (Req 27.5).
 *   - the calculator total + confidence sit inside an `aria-live="polite"`
 *     region (Req 27.6).
 *
 * jsdom + axe notes (mirrors `src/app/__tests__/a11y.test.tsx`):
 *  - The shared jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView /
 *    pointer capture) live in `src/test/setup.ts`.
 *  - `next/link` is mocked to a plain anchor; `next/navigation`'s `useRouter`,
 *    `useSearchParams`, and `usePathname` are stubbed so the client surfaces
 *    render without an App Router provider.
 *  - The `color-contrast` axe rule is DISABLED: jsdom does not perform layout or
 *    resolve token/Tailwind colors, so it cannot compute contrast ratios.
 *    Contrast is enforced via the canonical design tokens and verified in the
 *    visual QA pass (Req 27.7). This is the only rule disabled.
 *  - Several slice surfaces lazy-load children via `next/dynamic({ ssr:false })`
 *    (wizard steps, scheme filters, calculator results). In jsdom the chunk
 *    resolves on a later microtask, so every audit first `await`s a stable
 *    element from the lazy content before running axe — never auditing a bare
 *    fallback. Where a route page needs server `params` / a Suspense boundary
 *    (`/schemes/[id]`, `/schemes/compare`), we render the CONTENT component
 *    directly with props, which is the cleanest renderable unit for the DOM.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axe from "axe-core";

import { LanguageProvider } from "@/context/LanguageContext";
import {
  RegistrationProvider,
  useRegistration,
} from "@/context/RegistrationContext";
import { schemes } from "@/data/schemes";
import type { RegistrationProfile } from "@/types";

import { RegistrationWizard } from "@/components/registration/RegistrationWizard";
import { SchemesHub } from "@/components/schemes/SchemesHub";
import { SchemeDetailContent } from "@/components/schemes/SchemeDetailContent";
import { CompareView } from "@/components/schemes/CompareView";
import { Calculator } from "@/components/calculator/Calculator";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

// Holds the search params returned by the mocked `useSearchParams`. CompareView
// reads `searchParams.get("ids")`; tests set this before rendering it.
const searchParamsHolder = vi.hoisted(() => ({
  current: new URLSearchParams() as URLSearchParams,
}));

// Render Next's <Link> as a plain anchor so link-bearing surfaces render
// without an App Router context provider (the audit only cares about hrefs /
// accessible names).
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

// Stub the App Router hooks the client surfaces reach for.
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
  useSearchParams: () => searchParamsHolder.current,
  usePathname: () => "/",
}));

/* -------------------------------------------------------------------------- */
/* axe configuration + helpers                                                 */
/* -------------------------------------------------------------------------- */

// Only `color-contrast` is disabled — jsdom cannot compute layout/colors, so
// contrast is enforced via design tokens and verified in the visual QA pass.
const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    "color-contrast": { enabled: false },
  },
};

/** Generous budget for lazy `next/dynamic` chunk loads under full-suite load. */
const LAZY_TIMEOUT = 15000;
/** Generous per-test budget for an axe audit of a full surface. */
const AXE_TIMEOUT = 30000;

/** Run axe against a container and return a readable summary of any violations. */
async function auditViolations(container: HTMLElement): Promise<string[]> {
  const results = await axe.run(container, AXE_OPTIONS);
  return results.violations.map(
    (v) =>
      `${v.id} (${v.impact ?? "n/a"}): ${v.help} — ${v.nodes.length} node(s): ` +
      v.nodes.map((n) => n.target.join(" ")).join("; "),
  );
}

/**
 * Render harness mirroring the real app's body: the session `RegistrationProvider`
 * + `LanguageProvider` the slice components consume, wrapping the surface in a
 * single `<main id="main">` landmark. The `<main>` satisfies the landmark /
 * region structure axe expects (the real surfaces render inside `RootLayout`'s
 * `<main>`), so the audit reflects the page as shipped rather than a
 * landmark-less fragment.
 */
function Surface({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <LanguageProvider>
      <RegistrationProvider>
        <main id="main">{children}</main>
      </RegistrationProvider>
    </LanguageProvider>
  );
}

/* -------------------------------------------------------------------------- */
/* Real data fixtures                                                          */
/* -------------------------------------------------------------------------- */

// Real scheme ids from `src/data/schemes.ts` — never fabricated.
const DETAIL_SCHEME = schemes.find((s) => s.id === "sgst-reimbursement")!;
const COMPARE_IDS = ["sgst-reimbursement", "patent-subsidy"] as const;
const COMPARE_SCHEMES = COMPARE_IDS.map(
  (id) => schemes.find((s) => s.id === id)!,
);

/**
 * A profile crafted so the calculator results view renders a non-zero total and
 * a "Definitely Eligible" group (same fixture shape as the calculator tests).
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
 * Seeds the session context into Profile_Set_State once on mount so the
 * `Calculator` coordinator deterministically swaps to its results view (the
 * Radix-heavy QuickProfileForm is intentionally not driven here).
 */
function SeedProfile({
  profile,
  children,
}: {
  profile: Partial<RegistrationProfile>;
  children: React.ReactNode;
}): React.JSX.Element {
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
/* 1. Automated axe audit per slice surface                                    */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of the slice surfaces (color-contrast disabled — enforced via tokens / visual QA)", () => {
  it("/register (RegistrationWizard) has zero violations", async () => {
    const { container } = render(
      <Surface>
        <RegistrationWizard />
      </Surface>,
    );
    // Step 1 loads via next/dynamic — wait for its first control before auditing.
    await screen.findByLabelText(/Full name/i, undefined, { timeout: LAZY_TIMEOUT });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("/schemes (SchemesHub) has zero violations", async () => {
    const { container } = render(
      <Surface>
        <SchemesHub />
      </Surface>,
    );
    // The card grid renders synchronously; the filter bar is lazy. Wait for both
    // so axe audits the fully-hydrated hub, not a fallback.
    await screen.findByText(DETAIL_SCHEME.name, undefined, { timeout: LAZY_TIMEOUT });
    await screen.findByLabelText(/Search schemes/i, undefined, {
      timeout: LAZY_TIMEOUT,
    });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("/schemes/[id] (SchemeDetailContent) has zero violations", async () => {
    const { container } = render(
      <Surface>
        <SchemeDetailContent scheme={DETAIL_SCHEME} />
      </Surface>,
    );
    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("/schemes/compare (CompareView) has zero violations", async () => {
    searchParamsHolder.current = new URLSearchParams(
      `ids=${COMPARE_IDS.join(",")}`,
    );
    const { container } = render(
      <Surface>
        <CompareView />
      </Surface>,
    );
    // The comparison table renders synchronously once ids resolve.
    await screen.findByRole("table", undefined, { timeout: LAZY_TIMEOUT });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("/calculator (Calculator results view) has zero violations", async () => {
    const { container } = render(
      <Surface>
        <SeedProfile profile={ELIGIBLE_PROFILE}>
          <Calculator />
        </SeedProfile>
      </Surface>,
    );
    // Results view mounts via next/dynamic once the profile is seeded.
    await screen.findByText(/Estimated total benefits/i, undefined, {
      timeout: LAZY_TIMEOUT,
    });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);
});

/* -------------------------------------------------------------------------- */
/* 2. Wizard progress + Continue control + live error region (Req 27.1–27.3)  */
/* -------------------------------------------------------------------------- */

describe("RegistrationWizard ARIA contracts (Req 27.1, 27.2, 27.3)", () => {
  it("exposes a progressbar with the current step value and bounds", async () => {
    const { container } = render(
      <Surface>
        <RegistrationWizard />
      </Surface>,
    );
    await screen.findByLabelText(/Full name/i, undefined, { timeout: LAZY_TIMEOUT });

    const progressbar = container.querySelector('[role="progressbar"]');
    expect(progressbar).not.toBeNull();
    // Step 1 of 6 on first render (Req 27.1).
    expect(progressbar?.getAttribute("aria-valuenow")).toBe("1");
    expect(progressbar?.getAttribute("aria-valuemin")).toBe("1");
    expect(progressbar?.getAttribute("aria-valuemax")).toBe("6");
  }, AXE_TIMEOUT);

  it("renders the Continue control with aria-disabled and never the native disabled attribute", async () => {
    render(
      <Surface>
        <RegistrationWizard />
      </Surface>,
    );
    await screen.findByLabelText(/Full name/i, undefined, { timeout: LAZY_TIMEOUT });

    const continueButton = screen.getByRole("button", { name: /^Continue$/i });
    // The control must expose its state through aria-disabled (Req 27.2)…
    expect(continueButton.hasAttribute("aria-disabled")).toBe(true);
    // …and must NEVER use the native disabled attribute (so SR users can focus
    // it and hear why it is unavailable — Req 3.10, 27.2).
    expect(continueButton.hasAttribute("disabled")).toBe(false);
  }, AXE_TIMEOUT);

  it("announces inline field errors inside an aria-live=polite region", async () => {
    const { container } = render(
      <Surface>
        <RegistrationWizard />
      </Surface>,
    );
    const nameInput = await screen.findByLabelText(/Full name/i, undefined, {
      timeout: LAZY_TIMEOUT,
    });

    // The polite live regions exist up front (one per field, ready to announce).
    const liveRegions = container.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions.length).toBeGreaterThan(0);

    // Drive a real validation error: blur the (empty) name field to mark it
    // touched, then attempt Continue to record step errors. The gated error
    // then surfaces inside its field's aria-live region (Req 27.3).
    fireEvent.blur(nameInput);
    fireEvent.click(screen.getByRole("button", { name: /^Continue$/i }));

    await waitFor(
      () => {
        const errorInLiveRegion = container.querySelector(
          '[aria-live="polite"] [id$="-error"]',
        );
        expect(errorInLiveRegion).not.toBeNull();
        expect((errorInLiveRegion?.textContent ?? "").trim().length).toBeGreaterThan(0);
      },
      { timeout: LAZY_TIMEOUT },
    );

    // With recorded errors the Continue control is now aria-disabled true,
    // still without the native disabled attribute.
    const continueButton = screen.getByRole("button", { name: /^Continue$/i });
    expect(continueButton.getAttribute("aria-disabled")).toBe("true");
    expect(continueButton.hasAttribute("disabled")).toBe(false);
  }, AXE_TIMEOUT);
});

/* -------------------------------------------------------------------------- */
/* 3. Compare View semantic table headers (Req 27.5)                           */
/* -------------------------------------------------------------------------- */

describe("CompareView semantic table (Req 27.5)", () => {
  it("associates one column header per scheme and uses row headers with scope attributes", async () => {
    searchParamsHolder.current = new URLSearchParams(
      `ids=${COMPARE_IDS.join(",")}`,
    );
    const { container } = render(
      <Surface>
        <CompareView />
      </Surface>,
    );
    const table = await screen.findByRole("table", undefined, {
      timeout: LAZY_TIMEOUT,
    });

    // Column headers: one leading corner cell + one per selected scheme, each a
    // <th scope="col"> (Req 27.5).
    const colHeaders = Array.from(
      table.querySelectorAll('thead th[scope="col"]'),
    );
    expect(colHeaders.length).toBe(COMPARE_SCHEMES.length + 1);

    // Each scheme name appears as a programmatic column header.
    const colHeaderText = colHeaders.map((th) => th.textContent ?? "");
    for (const scheme of COMPARE_SCHEMES) {
      expect(colHeaderText.some((t) => t.includes(scheme.name))).toBe(true);
    }

    // Row headers: each attribute row leads with a <th scope="row"> (Req 27.5).
    const rowHeaders = Array.from(
      table.querySelectorAll('tbody th[scope="row"]'),
    );
    expect(rowHeaders.length).toBeGreaterThanOrEqual(6);
    const rowHeaderText = rowHeaders.map((th) => (th.textContent ?? "").trim());
    for (const label of ["Type", "Status", "Amount"]) {
      expect(rowHeaderText).toContain(label);
    }

    // Every header carries an explicit scope (no implicit/ambiguous headers).
    const allHeaders = Array.from(container.querySelectorAll("th"));
    for (const th of allHeaders) {
      expect(["col", "row"]).toContain(th.getAttribute("scope"));
    }
  }, AXE_TIMEOUT);
});

/* -------------------------------------------------------------------------- */
/* 4. Calculator total live region (Req 27.6)                                  */
/* -------------------------------------------------------------------------- */

describe("Calculator total announcement (Req 27.6)", () => {
  it("places the total benefits figure inside an aria-live=polite region", async () => {
    const { container } = render(
      <Surface>
        <SeedProfile profile={ELIGIBLE_PROFILE}>
          <Calculator />
        </SeedProfile>
      </Surface>,
    );
    await screen.findByText(/Estimated total benefits/i, undefined, {
      timeout: LAZY_TIMEOUT,
    });

    // The headline total (and confidence label) live inside an aria-live=polite
    // region so assistive tech announces updates (Req 27.6).
    await waitFor(
      () => {
        const liveRegions = Array.from(
          container.querySelectorAll('[aria-live="polite"]'),
        );
        const totalRegion = liveRegions.find((el) =>
          /₹[\d,]+/.test(el.textContent ?? ""),
        );
        expect(totalRegion).toBeDefined();
        expect(totalRegion?.textContent ?? "").toMatch(/Confidence/i);
      },
      { timeout: LAZY_TIMEOUT },
    );
  }, AXE_TIMEOUT);
});

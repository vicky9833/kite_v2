/**
 * Inclusion & Grassroots Layer accessibility audit (task 17.4) — Requirement 35.
 *
 * Runs an automated `axe-core` audit over the THREE inclusion routes, then
 * asserts the specific ARIA contracts the design's Accessibility Strategy
 * promises (Req 35.1–35.7). The audit mirrors
 * `src/app/__tests__/enablement-a11y.test.tsx` exactly: the same `axe-core`
 * import, the same `AXE_OPTIONS` (color-contrast the ONLY disabled rule), the
 * same `auditViolations` helper shape, the same `expectAllControlsNamed`
 * helper, the same heading-order / region helpers, and the same generous
 * per-test budget.
 *
 *   - WomenPage (`/women`)  — Women Founders Hub.
 *   - CsrPage   (`/csr`)    — CSR & NGO Hub.
 *   - IdeasPage (`/ideas`)  — Idea Bank (submission form + success + board).
 *
 * Targeted assertions (beyond the zero-violations audit):
 *   - Heading order — each route exposes exactly one `h1`; heading levels never
 *     skip a level downward (Req 35, design Accessibility Strategy).
 *   - Idea form — every field carries a programmatic `<label>` and an
 *     `aria-describedby` pointing at its help text (Req 35.1).
 *   - Submit control — `aria-disabled` while the form is invalid (Req 35.3).
 *   - aria-live regions — the form's error region and the success state both
 *     announce through `aria-live` (Req 35.2, 35.4).
 *   - Public board — ideas render as a semantic list (`<ul>`/`<li>`) (Req 35.5).
 *   - Filters — the board filters and the scheme-list filters carry programmatic
 *     labels and are keyboard-operable native controls (Req 35.6).
 *   - Women mentors — the section frames `illustrativeGender` as illustrative,
 *     not a definitive demographic classification (Req 35.7).
 *
 * jsdom + axe notes (mirrors `enablement-a11y.test.tsx`):
 *  - The shared jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView /
 *    pointer capture) live in `src/test/setup.ts`.
 *  - The pages use `IdeaBankProvider` via `layout.tsx`. Rendering a page
 *    component directly does NOT include the layout, so the `/ideas` render is
 *    wrapped in `IdeaBankProvider` so `useIdeaBank()` resolves.
 *  - The `color-contrast` axe rule is DISABLED: jsdom performs no layout and
 *    cannot resolve token/Tailwind colors, so it cannot compute contrast ratios.
 *    Contrast is enforced via the canonical design tokens and verified in the
 *    visual QA pass. This is the only rule disabled.
 */

import * as React from "react";
import { describe, it, expect } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import axe from "axe-core";

import WomenPage from "@/app/women/page";
import CsrPage from "@/app/csr/page";
import IdeasPage from "@/app/ideas/page";
import { IdeaBankProvider } from "@/context/IdeaBankContext";

/* -------------------------------------------------------------------------- */
/* axe configuration + helpers (mirrors enablement-a11y.test.tsx)              */
/* -------------------------------------------------------------------------- */

// Only `color-contrast` is disabled — jsdom cannot compute layout/colors, so
// contrast is enforced via design tokens and verified in the visual QA pass.
const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    "color-contrast": { enabled: false },
  },
};

/** Generous per-test budget for an axe audit of a full inclusion surface. */
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
 * Assert every interactive control (`<a href>` / `<button>`) in the subtree
 * exposes an accessible name — visible text or an `aria-label` /
 * `aria-labelledby` / `title`. Returns the count checked so callers can
 * sanity-check the surface had controls.
 */
function expectAllControlsNamed(container: HTMLElement): number {
  const controls = Array.from(
    container.querySelectorAll<HTMLElement>("a[href], button"),
  );
  const anonymous = controls.filter((el) => {
    const text = (el.textContent ?? "").trim();
    const label =
      el.getAttribute("aria-label") ??
      el.getAttribute("aria-labelledby") ??
      el.getAttribute("title");
    return text.length === 0 && (label == null || label.trim().length === 0);
  });
  expect(
    anonymous.map((el) => `${el.tagName.toLowerCase()} ${el.className}`),
  ).toEqual([]);
  return controls.length;
}

/** Return the heading levels (1–6) in DOM order. */
function headingLevels(container: HTMLElement): number[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6"),
  ).map((h) => Number(h.tagName[1]));
}

/** Assert exactly one `h1` and that heading levels never skip a level downward. */
function expectWellOrderedHeadings(container: HTMLElement): void {
  const levels = headingLevels(container);
  expect(levels.filter((l) => l === 1)).toHaveLength(1);
  for (let i = 1; i < levels.length; i += 1) {
    const prev = levels[i - 1]!;
    const curr = levels[i]!;
    // Going deeper, a heading may only increase by one level at a time.
    if (curr > prev) {
      expect(curr - prev).toBeLessThanOrEqual(1);
    }
  }
}

/** Assert every `role="region"` landmark carries a non-empty accessible name. */
function expectRegionsLabelled(container: HTMLElement): number {
  // `<section aria-label>` is exposed as role="region"; explicit role="region" too.
  const regions = Array.from(
    container.querySelectorAll<HTMLElement>(
      'section[aria-label], section[aria-labelledby], [role="region"]',
    ),
  );
  for (const region of regions) {
    const label =
      region.getAttribute("aria-label") ??
      region.getAttribute("aria-labelledby");
    expect((label ?? "").trim().length).toBeGreaterThan(0);
  }
  return regions.length;
}

/** Render `/ideas` wrapped in the session-only IdeaBankProvider (Req 3.9). */
function renderIdeasPage() {
  return render(
    <IdeaBankProvider>
      <IdeasPage />
    </IdeaBankProvider>,
  );
}

/**
 * Fill the Idea Submission Form (scoped to the `#idea-form` section) with valid
 * values so the submit control enables and a submit reaches the success state.
 * Mirrors the validation thresholds in `idea-form-validation.ts`.
 */
function fillIdeaFormValidly(form: HTMLElement): void {
  const scope = within(form);
  const longText =
    "This is a clear, plain-language description that comfortably exceeds the fifty character minimum constraint.";

  fireEvent.change(scope.getByLabelText("Your name"), {
    target: { value: "Asha Rao" },
  });
  fireEvent.change(scope.getByLabelText("Email address"), {
    target: { value: "asha@example.com" },
  });
  fireEvent.change(scope.getByLabelText("Age"), { target: { value: "29" } });

  // Required radio group — pick the first innovator type.
  const radios = scope.getAllByRole("radio");
  fireEvent.click(radios[0]!);

  fireEvent.change(scope.getByLabelText("Idea title"), {
    target: { value: "Smart irrigation for small farms" },
  });

  // Required selects — choose the first real option (skip the placeholder).
  const categorySelect = scope.getByLabelText("Category") as HTMLSelectElement;
  fireEvent.change(categorySelect, {
    target: { value: categorySelect.options[1]!.value },
  });

  fireEvent.change(scope.getByLabelText("Idea summary"), {
    target: { value: longText },
  });
  fireEvent.change(scope.getByLabelText("What problem does it solve?"), {
    target: { value: longText },
  });
  fireEvent.change(scope.getByLabelText("How would you solve it?"), {
    target: { value: longText },
  });

  const locationSelect = scope.getByLabelText("Location") as HTMLSelectElement;
  fireEvent.change(locationSelect, {
    target: { value: locationSelect.options[1]!.value },
  });
}

/* -------------------------------------------------------------------------- */
/* 1. Women Founders Hub (/women) — axe audit + heading order + mentor framing */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of /women (color-contrast disabled — enforced via tokens / visual QA)", () => {
  it("has zero violations", async () => {
    const { container } = render(<WomenPage />);
    await screen.findByRole("heading", {
      level: 1,
      name: /women founders/i,
    });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("has a single h1, non-skipping heading order, labelled regions, and named controls", async () => {
    const { container } = render(<WomenPage />);
    await screen.findByRole("heading", { level: 1 });

    expectWellOrderedHeadings(container);
    expect(expectRegionsLabelled(container)).toBeGreaterThan(0);
    expect(expectAllControlsNamed(container)).toBeGreaterThan(0);
  }, AXE_TIMEOUT);

  it("labels the women-schemes filter controls and keeps them keyboard-operable native controls (Req 35.6)", () => {
    render(<WomenPage />);
    const typeFilter = screen.getByLabelText("Scheme type");
    expect(typeFilter.tagName).toBe("SELECT");
    expect(screen.getByLabelText("Women Preference only").tagName).toBe(
      "INPUT",
    );
  });

  it("frames the mentor illustrative-gender section as illustrative, not a demographic claim (Req 35.7)", () => {
    render(<WomenPage />);
    expect(
      screen.getByText(/not\s+a\s+definitive\s+demographic\s+classification/i),
    ).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* 2. CSR & NGO Hub (/csr) — axe audit + heading order + filter labels         */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of /csr (color-contrast disabled — enforced via tokens / visual QA)", () => {
  it("has zero violations", async () => {
    const { container } = render(<CsrPage />);
    await screen.findByRole("heading", { level: 1, name: /csr/i });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("has a single h1, non-skipping heading order, labelled regions, and named controls", async () => {
    const { container } = render(<CsrPage />);
    await screen.findByRole("heading", { level: 1 });

    expectWellOrderedHeadings(container);
    expect(expectRegionsLabelled(container)).toBeGreaterThan(0);
    expect(expectAllControlsNamed(container)).toBeGreaterThan(0);
  }, AXE_TIMEOUT);

  it("labels the CSR-aligned programs filter and keeps it a keyboard-operable native control (Req 35.6)", () => {
    render(<CsrPage />);
    const typeFilter = screen.getByLabelText("Scheme type");
    expect(typeFilter.tagName).toBe("SELECT");
  });
});

/* -------------------------------------------------------------------------- */
/* 3. Idea Bank (/ideas) — axe audit + form labels + aria-live + semantic board */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of /ideas (color-contrast disabled — enforced via tokens / visual QA)", () => {
  it("has zero violations in the default (form) view", async () => {
    const { container } = renderIdeasPage();
    await screen.findByRole("heading", { level: 1, name: /your idea/i });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("has a single h1, non-skipping heading order, labelled regions, and named controls", async () => {
    const { container } = renderIdeasPage();
    await screen.findByRole("heading", { level: 1 });

    expectWellOrderedHeadings(container);
    expect(expectRegionsLabelled(container)).toBeGreaterThan(0);
    expect(expectAllControlsNamed(container)).toBeGreaterThan(0);
  }, AXE_TIMEOUT);

  it("gives every form field a programmatic label and an aria-describedby (Req 35.1)", async () => {
    const { container } = renderIdeasPage();
    await screen.findByRole("heading", { level: 1 });

    const form = container.querySelector("#idea-form") as HTMLElement;
    expect(form).not.toBeNull();
    const scope = within(form);

    const fields: ReadonlyArray<[string, string]> = [
      ["Your name", "innovatorName-help"],
      ["Email address", "innovatorEmail-help"],
      ["Age", "innovatorAge-help"],
      ["Idea title", "ideaTitle-help"],
      ["Category", "ideaCategory-help"],
      ["Idea summary", "ideaSummary-help"],
      ["What problem does it solve?", "problemStatement-help"],
      ["How would you solve it?", "proposedSolution-help"],
      ["Location", "location-help"],
    ];

    for (const [label, helpId] of fields) {
      const field = scope.getByLabelText(label);
      const describedBy = field.getAttribute("aria-describedby") ?? "";
      expect(describedBy).toContain(helpId);
      // The referenced help node must actually exist in the document.
      expect(document.getElementById(helpId)).not.toBeNull();
    }
  }, AXE_TIMEOUT);

  it("marks the submit control aria-disabled while the form is invalid (Req 35.3)", async () => {
    renderIdeasPage();
    await screen.findByRole("heading", { level: 1 });

    // The submission form is code-split (next/dynamic) — wait for it to mount.
    const submit = await screen.findByRole("button", { name: /submit idea/i });
    expect(submit).toHaveAttribute("aria-disabled", "true");
  }, AXE_TIMEOUT);

  it("exposes an aria-live error region in the form (Req 35.2)", async () => {
    const { container } = renderIdeasPage();
    await screen.findByRole("heading", { level: 1 });

    // The submission form is code-split (next/dynamic) — wait for it to mount.
    await screen.findByRole("button", { name: /submit idea/i });
    const form = container.querySelector("#idea-form") as HTMLElement;
    expect(
      form.querySelectorAll('[aria-live="polite"]').length,
    ).toBeGreaterThan(0);
  }, AXE_TIMEOUT);

  it("renders the public ideas board as a semantic list with labelled, keyboard-operable filters (Req 35.5, 35.6)", async () => {
    const { container } = renderIdeasPage();
    await screen.findByRole("heading", { level: 1 });

    // The public board is code-split (next/dynamic) and lazily mounted — wait
    // for one of its filter controls before auditing its structure.
    await screen.findByLabelText("Innovator type");
    const board = container.querySelector("#ideas-board") as HTMLElement;
    expect(board).not.toBeNull();
    const scope = within(board);

    // Semantic list — the board renders its ideas as <ul>/<li>.
    const list = scope.getByRole("list");
    expect(list.tagName).toBe("UL");
    expect(scope.getAllByRole("listitem").length).toBeGreaterThan(0);

    // Filters are labelled native <select> controls (keyboard-operable).
    for (const label of ["Category", "Innovator type", "Location"]) {
      const control = scope.getByLabelText(label);
      expect(control.tagName).toBe("SELECT");
    }
  }, AXE_TIMEOUT);

  it("announces the Idea_Id and matched-scheme count through an aria-live region on success, with zero violations (Req 35.4)", async () => {
    const { container } = renderIdeasPage();
    await screen.findByRole("heading", { level: 1 });

    const form = container.querySelector("#idea-form") as HTMLElement;
    fillIdeaFormValidly(form);

    const submit = within(form).getByRole("button", { name: /submit idea/i });
    expect(submit).toHaveAttribute("aria-disabled", "false");
    fireEvent.click(submit);

    // Success state renders an sr-only polite announcement of the id + count.
    const announcement = await screen.findByText(
      /your idea identifier is IDEA-\d{4}-[A-Z0-9]{6}\./i,
    );
    const liveRegion = announcement.closest('[aria-live]');
    expect(liveRegion).not.toBeNull();
    expect(announcement.textContent ?? "").toMatch(
      /(matched scheme|no matched schemes)/i,
    );

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);
});

/**
 * Inclusion & Grassroots Layer end-to-end journey (task 17.3) — Requirements
 * 26–30.
 *
 * This is the behavioural counterpart to the static a11y audit in
 * `inclusion-a11y.test.tsx`: instead of inspecting ARIA contracts, it drives the
 * three inclusion surfaces the way a visitor would and asserts the user-visible
 * outcomes promised by the design's interaction flows.
 *
 *   - Idea Bank (`/ideas`) — the full submission journey: fill the form
 *     (`#idea-form`) with valid values so the submit control enables
 *     (`aria-disabled="false"`), submit, land on the success state showing the
 *     assigned `IDEA-YYYY-XXXXXX` identifier and a matched-scheme count (Req 26,
 *     27, 28), click "Submit Another Idea" to return to the form (Req 28.6), see
 *     the just-submitted idea pinned on the public board (`#ideas-board`) with a
 *     "Yours" badge (Req 29.8), and pre-fill the form from a category spotlight
 *     card (Req 30.3).
 *   - Women Hub (`/women`) — the `WomenSchemesList` "Women Preference only"
 *     filter narrows the visible scheme rows (Req 10.3).
 *   - CSR Hub (`/csr`) — the `CsrAlignedPrograms` scheme-type filter recomputes
 *     the visible program rows (Req 18.5).
 *
 * jsdom notes (mirrors `inclusion-a11y.test.tsx`):
 *  - The shared jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView /
 *    pointer capture) live in `src/test/setup.ts`.
 *  - The `/ideas` route consumes `useIdeaBank()` (wired via `IdeaBankProvider`
 *    in `layout.tsx`). Rendering the page component directly does NOT include
 *    the layout, so every `/ideas` render is wrapped in `IdeaBankProvider`.
 *
 * The `fillIdeaFormValidly` helper is copied from `inclusion-a11y.test.tsx` so
 * the two suites fill the form identically; all queries are scoped with
 * `within()` so the form / success / board regions never cross-match.
 */

import * as React from "react";
import { describe, it, expect } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

import WomenPage from "@/app/women/page";
import CsrPage from "@/app/csr/page";
import IdeasPage from "@/app/ideas/page";
import { IdeaBankProvider } from "@/context/IdeaBankContext";

/* -------------------------------------------------------------------------- */
/* Render + form-fill helpers (mirrors inclusion-a11y.test.tsx)                */
/* -------------------------------------------------------------------------- */

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
 * Mirrors the validation thresholds in `idea-form-validation.ts`. Returns the
 * chosen category so callers can assert against the matched outcome.
 */
function fillIdeaFormValidly(form: HTMLElement): { category: string } {
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
  const category = categorySelect.options[1]!.value;
  fireEvent.change(categorySelect, { target: { value: category } });

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

  return { category };
}

/** The submission form section (`#idea-form`), asserted present. */
function getIdeaForm(container: HTMLElement): HTMLElement {
  const form = container.querySelector("#idea-form") as HTMLElement | null;
  expect(form).not.toBeNull();
  return form as HTMLElement;
}

/** The public board section (`#ideas-board`), asserted present. */
function getIdeasBoard(container: HTMLElement): HTMLElement {
  const board = container.querySelector("#ideas-board") as HTMLElement | null;
  expect(board).not.toBeNull();
  return board as HTMLElement;
}

/* -------------------------------------------------------------------------- */
/* 1. Idea Bank (/ideas) — full submission journey                            */
/* -------------------------------------------------------------------------- */

describe("Idea Bank end-to-end journey (/ideas)", () => {
  it("fills the form, enables submit, submits, and shows the success state with an IDEA id and matched-scheme count (Req 26, 27, 28)", async () => {
    const { container } = renderIdeasPage();
    await screen.findByRole("heading", { level: 1 });

    const form = getIdeaForm(container);

    // Before filling, the submit control is announced disabled (Req 26.11).
    const submit = within(form).getByRole("button", { name: /submit idea/i });
    expect(submit).toHaveAttribute("aria-disabled", "true");

    // Fill the form with valid values → the submit control enables (Req 26).
    fillIdeaFormValidly(form);
    expect(submit).toHaveAttribute("aria-disabled", "false");

    // Submit → the success state replaces the form (Req 27.2, 27.4).
    fireEvent.click(submit);

    const successHeading = await screen.findByRole("heading", {
      name: /idea submitted/i,
    });
    expect(successHeading).toBeInTheDocument();

    // The assigned Idea_Id is shown prominently in the success state (Req 28.2).
    const idMatch = await screen.findByText(/^IDEA-\d{4}-[A-Z0-9]{6}$/);
    expect(idMatch).toBeInTheDocument();

    // The polite announcement names the id and the matched-scheme count. The
    // chosen category (AgriTech) matches real schemes, so the count is > 0
    // (Req 28.3, 35.4).
    const announcement = await screen.findByText(
      /your idea identifier is IDEA-\d{4}-[A-Z0-9]{6}\./i,
    );
    expect(announcement.textContent ?? "").toMatch(/\d+ matched scheme/i);

    // The success state lists at least one matched scheme card (Req 28.3).
    const matchedSection = container.querySelector(
      "#idea-matched-schemes",
    ) as HTMLElement;
    expect(matchedSection).not.toBeNull();
    expect(within(matchedSection).getAllByRole("listitem").length).toBeGreaterThan(
      0,
    );
  });

  it("pins the just-submitted idea on the public board with a 'Yours' badge, then returns to the form on 'Submit Another Idea' (Req 28.6, 29.8)", async () => {
    const { container } = renderIdeasPage();
    await screen.findByRole("heading", { level: 1 });

    const form = getIdeaForm(container);
    fillIdeaFormValidly(form);
    const submit = within(form).getByRole("button", { name: /submit idea/i });
    fireEvent.click(submit);

    // We reached the success state.
    await screen.findByRole("heading", { name: /idea submitted/i });

    // The public board now surfaces the visitor's own submission, pinned with a
    // "Yours" badge alongside the submitted title (Req 29.8).
    const board = getIdeasBoard(container);
    const yoursBadges = within(board).getAllByText(/^Yours$/);
    expect(yoursBadges.length).toBe(1);

    const yoursCard = yoursBadges[0]!.closest("li") as HTMLElement;
    expect(yoursCard).not.toBeNull();
    expect(
      within(yoursCard).getByText("Smart irrigation for small farms"),
    ).toBeInTheDocument();

    // "Submit Another Idea" returns the surface to the submission form (Req 28.6).
    fireEvent.click(
      screen.getByRole("button", { name: /submit another idea/i }),
    );

    expect(getIdeaForm(container)).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /idea submitted/i }),
    ).not.toBeInTheDocument();
  });

  it("pre-fills the form's category from a Categories spotlight card (Req 30.3)", async () => {
    const { container } = renderIdeasPage();
    await screen.findByRole("heading", { level: 1 });

    // The category select starts empty (placeholder selected).
    const categorySelectBefore = getIdeaForm(container).querySelector(
      "#ideaCategory",
    ) as HTMLSelectElement;
    expect(categorySelectBefore.value).toBe("");

    // Locate the spotlight section and its "HealthTech" card, then activate its
    // "Submit in This Category" control.
    const spotlight = container.querySelector(
      'section[aria-labelledby="idea-categories-spotlight-heading"]',
    ) as HTMLElement;
    expect(spotlight).not.toBeNull();

    const cards = within(spotlight).getAllByRole("listitem");
    const healthCard = cards.find((card) =>
      within(card).queryByText("HealthTech"),
    );
    expect(healthCard).toBeDefined();

    fireEvent.click(
      within(healthCard as HTMLElement).getByRole("button", {
        name: /submit in this category/i,
      }),
    );

    // The form's category field is now pre-filled with the chosen category.
    const categorySelectAfter = getIdeaForm(container).querySelector(
      "#ideaCategory",
    ) as HTMLSelectElement;
    expect(categorySelectAfter.value).toBe("HealthTech");
  });
});

/* -------------------------------------------------------------------------- */
/* 2. Women Hub (/women) — WomenSchemesList "Women Preference only" filter      */
/* -------------------------------------------------------------------------- */

describe("Women Hub scheme filter (/women)", () => {
  it("narrows the visible scheme rows when 'Women Preference only' is toggled on (Req 10.3)", async () => {
    const { container } = render(<WomenPage />);
    await screen.findByRole("heading", { level: 1 });

    const section = container.querySelector(
      'section[aria-labelledby="women-schemes-heading"]',
    ) as HTMLElement;
    expect(section).not.toBeNull();
    const scope = within(section);

    // Count the table's data rows before filtering (excludes the header row).
    const table = scope.getByRole("table");
    const rowsBefore = within(table).getAllByRole("row").length;

    // Toggle the women-preference-only filter on.
    const toggle = scope.getByLabelText("Women Preference only");
    expect(toggle.tagName).toBe("INPUT");
    fireEvent.click(toggle);

    const tableAfter = scope.getByRole("table");
    const rowsAfter = within(tableAfter).getAllByRole("row").length;

    // Fewer rows are shown, and at least the women-preference rows remain.
    expect(rowsAfter).toBeLessThan(rowsBefore);
    expect(rowsAfter).toBeGreaterThan(1); // header row + ≥1 preference scheme
  });
});

/* -------------------------------------------------------------------------- */
/* 3. CSR Hub (/csr) — CsrAlignedPrograms scheme-type filter recompute          */
/* -------------------------------------------------------------------------- */

describe("CSR Hub program filter (/csr)", () => {
  it("recomputes the visible program rows when the scheme-type filter changes (Req 18.5)", async () => {
    const { container } = render(<CsrPage />);
    await screen.findByRole("heading", { level: 1 });

    const section = container.querySelector("#csr-aligned-programs") as HTMLElement;
    expect(section).not.toBeNull();
    const scope = within(section);

    // Count the table's data rows with no filter applied ("All scheme types").
    const rowsAll = within(scope.getByRole("table")).getAllByRole("row").length;

    // Narrow to fiscal incentives only — the CSR-aligned set has a single fiscal
    // scheme (`rd-project-grant`), so the row count recomputes downward.
    const typeFilter = scope.getByLabelText("Scheme type") as HTMLSelectElement;
    expect(typeFilter.tagName).toBe("SELECT");
    fireEvent.change(typeFilter, { target: { value: "fiscal" } });

    const rowsFiscal = within(scope.getByRole("table")).getAllByRole("row").length;
    expect(rowsFiscal).toBeLessThan(rowsAll);
    expect(rowsFiscal).toBeGreaterThan(1); // header row + ≥1 fiscal scheme
  });
});

/**
 * Ecosystem-enablement accessibility audit (task 12.4) — Requirements 14.1–14.7.
 *
 * Runs an automated `axe-core` audit over the FOUR enablement routes, then
 * asserts the specific ARIA contracts the design's Accessibility Strategy
 * promises. The audit mirrors `src/app/__tests__/investor-a11y.test.tsx`
 * exactly: the same `axe-core` import, the same `AXE_OPTIONS` (color-contrast
 * the ONLY disabled rule), the same `auditViolations` helper shape, the same
 * `expectAllControlsNamed` helper, and the same generous per-test budget.
 *
 *   - IncubatorsPage (`/incubators`)            — filterable verified index + illustrative detail.
 *   - MentorsPage (`/mentors`)                  — synthetic mentor directory + illustrative detail.
 *   - KAN editorial page (`/programs/kan`)      — verified editorial program page.
 *   - K-Combinator editorial page (`/programs/k-combinator`) — verified editorial program page.
 *
 * Targeted assertions (beyond the zero-violations audit):
 *   - Heading order — each route exposes exactly one `h1`; the editorial program
 *     pages carry sequential `h2` section headings beneath it (Req 14.1).
 *   - Filter labels — every directory filter `<select>` has an associated visible
 *     `<label>` / accessible name (Req 14.2, 14.4).
 *   - Region landmarks — each `role="region"` landmark carries a non-empty
 *     `aria-label` (Req 14.5).
 *   - aria-live counts — each directory's matching count lives in an
 *     `aria-live="polite"` region (Req 14.6).
 *   - Initials-avatar text alternatives — each mentor initials avatar is a
 *     `role="img"` with an accessible name equal to the mentor's name (Req 14.7).
 *   - Detail panels — the incubators directory is also audited with one detail
 *     panel open (Req 14.3, 14.5).
 *
 * jsdom + axe notes (mirrors `investor-a11y.test.tsx`):
 *  - The shared jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView /
 *    pointer capture) live in `src/test/setup.ts`.
 *  - The four enablement routes use neither `next/link` nor `next/navigation`
 *    (they are self-contained in-memory islands / server compositions), so no
 *    router mocks are required.
 *  - The `color-contrast` axe rule is DISABLED: jsdom performs no layout and
 *    cannot resolve token/Tailwind colors, so it cannot compute contrast ratios.
 *    Contrast is enforced via the canonical design tokens and verified in the
 *    visual QA pass. This is the only rule disabled.
 */

import * as React from "react";
import { describe, it, expect } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import axe from "axe-core";

import IncubatorsPage from "@/app/incubators/page";
import MentorsPage from "@/app/mentors/page";
import KanProgramPage from "@/app/programs/kan/page";
import KCombinatorPage from "@/app/programs/k-combinator/page";

/* -------------------------------------------------------------------------- */
/* axe configuration + helpers (mirrors investor-a11y.test.tsx)                */
/* -------------------------------------------------------------------------- */

// Only `color-contrast` is disabled — jsdom cannot compute layout/colors, so
// contrast is enforced via design tokens and verified in the visual QA pass.
const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    "color-contrast": { enabled: false },
  },
};

/** Generous per-test budget for an axe audit of a full enablement surface. */
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

/* -------------------------------------------------------------------------- */
/* 1. Incubators index — axe audit + filter labels + landmarks                 */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of /incubators (color-contrast disabled — enforced via tokens / visual QA)", () => {
  it("the index has zero violations", async () => {
    const { container } = render(<IncubatorsPage />);
    await screen.findByRole("heading", {
      level: 1,
      name: /164\+ incubators and accelerators/i,
    });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("has well-ordered headings (single h1), labelled regions, and named controls", async () => {
    const { container } = render(<IncubatorsPage />);
    await screen.findByRole("heading", { level: 1 });

    expectWellOrderedHeadings(container);
    expect(expectRegionsLabelled(container)).toBeGreaterThan(0);
    expect(expectAllControlsNamed(container)).toBeGreaterThan(0);
  }, AXE_TIMEOUT);

  it("every filter control has an associated visible label (Req 14.4)", () => {
    render(<IncubatorsPage />);
    expect(screen.getByLabelText("Cluster")).toBeInTheDocument();
    expect(screen.getByLabelText("Focus")).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toBeInTheDocument();
  });

  it("announces the matching count through an aria-live=polite region (Req 14.6)", () => {
    render(<IncubatorsPage />);
    const count = screen.getByText(/\d+ incubators? match/i);
    expect(count).toHaveAttribute("aria-live", "polite");
  });

  it("with a detail panel open has zero violations and a labelled detail region (Req 14.3, 14.5)", async () => {
    const { container } = render(<IncubatorsPage />);
    await screen.findByRole("heading", { level: 1 });

    // Open the first card's detail via keyboard activation (Enter).
    const firstCard = screen.getAllByRole("button", {
      name: /— .+ in .+/i,
    })[0]!;
    fireEvent.keyDown(firstCard, { key: "Enter" });

    // The panel's accessible name comes from its heading (aria-labelledby),
    // so locate it via the unambiguous close control, then verify it is a
    // labelled region landmark.
    const close = await screen.findByRole("button", {
      name: /^Close details for /,
    });
    const detail = close.closest('[role="region"]') as HTMLElement | null;
    expect(detail).not.toBeNull();
    const detailName =
      detail!.getAttribute("aria-labelledby") ?? detail!.getAttribute("aria-label");
    expect((detailName ?? "").trim().length).toBeGreaterThan(0);

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);
});

/* -------------------------------------------------------------------------- */
/* 2. Mentor directory — axe audit + filter labels + initials-avatar alt       */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of /mentors (color-contrast disabled — enforced via tokens / visual QA)", () => {
  it("the directory has zero violations", async () => {
    const { container } = render(<MentorsPage />);
    await screen.findByRole("heading", { level: 1, name: /directory of mentors/i });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("has well-ordered headings (single h1), labelled regions, and named controls", async () => {
    const { container } = render(<MentorsPage />);
    await screen.findByRole("heading", { level: 1 });

    expectWellOrderedHeadings(container);
    expect(expectRegionsLabelled(container)).toBeGreaterThan(0);
    expect(expectAllControlsNamed(container)).toBeGreaterThan(0);
  }, AXE_TIMEOUT);

  it("every filter control has an associated visible label (Req 14.4)", () => {
    render(<MentorsPage />);
    expect(screen.getByLabelText("Sector")).toBeInTheDocument();
    expect(screen.getByLabelText("Mentor type")).toBeInTheDocument();
    expect(screen.getByLabelText("Experience level")).toBeInTheDocument();
  });

  it("announces the matching count through an aria-live=polite region (Req 14.6)", () => {
    render(<MentorsPage />);
    const count = screen.getByText(/\d+ mentors? match/i);
    expect(count).toHaveAttribute("aria-live", "polite");
  });

  it("every initials-avatar exposes a text alternative equal to the mentor name (Req 14.7)", () => {
    render(<MentorsPage />);
    // Each mentor card renders a role=img avatar whose accessible name is the
    // mentor's name; the heading shares that name, so the avatar label matches.
    const avatars = screen.getAllByRole("img");
    expect(avatars.length).toBeGreaterThan(0);
    for (const avatar of avatars) {
      const label = avatar.getAttribute("aria-label");
      expect((label ?? "").trim().length).toBeGreaterThan(0);
      // The card's name heading carries the same accessible text.
      const card = avatar.closest('[role="button"]');
      expect(card).not.toBeNull();
      expect(
        within(card as HTMLElement).getByRole("heading", { level: 2, name: label! }),
      ).toBeInTheDocument();
    }
  });

  it("with a detail panel open has zero violations (Req 14.3)", async () => {
    const { container } = render(<MentorsPage />);
    await screen.findByRole("heading", { level: 1 });

    const firstCard = screen.getAllByRole("button", { name: /—/ })[0]!;
    fireEvent.keyDown(firstCard, { key: "Enter" });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);
});

/* -------------------------------------------------------------------------- */
/* 3. KAN editorial page — axe audit + heading order + landmarks               */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of /programs/kan (color-contrast disabled — enforced via tokens / visual QA)", () => {
  it("has zero violations", async () => {
    const { container } = render(<KanProgramPage />);
    await screen.findByRole("heading", { level: 1 });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("exposes a single h1 with sequential h2 section headings and labelled regions (Req 14.1, 14.5)", async () => {
    const { container } = render(<KanProgramPage />);
    await screen.findByRole("heading", { level: 1 });

    expectWellOrderedHeadings(container);
    // The editorial composition numbers its sections as h2s beneath the h1.
    expect(
      screen.getAllByRole("heading", { level: 2 }).length,
    ).toBeGreaterThanOrEqual(2);
    expect(expectRegionsLabelled(container)).toBeGreaterThan(0);
    expect(expectAllControlsNamed(container)).toBeGreaterThan(0);
  }, AXE_TIMEOUT);
});

/* -------------------------------------------------------------------------- */
/* 4. K-Combinator editorial page — axe audit + heading order + landmarks      */
/* -------------------------------------------------------------------------- */

describe("axe-core audit of /programs/k-combinator (color-contrast disabled — enforced via tokens / visual QA)", () => {
  it("has zero violations", async () => {
    const { container } = render(<KCombinatorPage />);
    await screen.findByRole("heading", { level: 1 });

    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, AXE_TIMEOUT);

  it("exposes a single h1 with sequential h2 section headings and labelled regions (Req 14.1, 14.5)", async () => {
    const { container } = render(<KCombinatorPage />);
    await screen.findByRole("heading", { level: 1 });

    expectWellOrderedHeadings(container);
    expect(
      screen.getAllByRole("heading", { level: 2 }).length,
    ).toBeGreaterThanOrEqual(2);
    expect(expectRegionsLabelled(container)).toBeGreaterThan(0);
    expect(expectAllControlsNamed(container)).toBeGreaterThan(0);
  }, AXE_TIMEOUT);
});

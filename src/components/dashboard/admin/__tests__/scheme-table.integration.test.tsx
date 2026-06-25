/**
 * Scheme-performance table integration test (task 13.4).
 *
 * Exercises the real `SchemePerformanceSection` client component against the
 * deterministic `getSchemePerformance()` data (22 canonical rows). It proves
 * the user-visible sorting contract end to end:
 *
 *  - The table opens sorted by Disbursed descending (Req 14.6).
 *  - Clicking the active Disbursed header toggles it to ascending (Req 14.7).
 *  - Clicking another header (Applications) re-sorts the table by that column
 *    (Req 14.7).
 *  - `aria-sort` reflects the active column/direction and is "none" elsewhere
 *    (Req 14.8, 28.3).
 *  - The mobile stacked-card variant is present in the DOM (Req 14.9) even
 *    though CSS hides it at the active breakpoint.
 *
 * jsdom / Next notes (mirrors the startup gating integration test):
 *  - `next/link` → a plain anchor so the "View Details" CTAs render without an
 *    App Router provider.
 *  - `next/navigation` `useRouter`/`useSearchParams` are stubbed defensively in
 *    case any nested shared component reaches for them.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

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
  useSearchParams: () => new URLSearchParams(),
}));

// Imported AFTER the mocks so the island picks up the stubs.
import { SchemePerformanceSection } from "../SchemePerformanceSection";
import { getSchemePerformance } from "@/lib/synthetic-admin-data";
import { sortSchemeRows } from "@/lib/scheme-sort";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** The single semantic data table (md+ variant). */
function getTable(): HTMLTableElement {
  return screen.getByRole("table") as HTMLTableElement;
}

/** Read the Scheme-Name column (first cell) of every body row, top to bottom. */
function bodyRowNames(): string[] {
  const table = getTable();
  const bodyRows = within(table).getAllByRole("row").slice(1); // drop header row
  return bodyRows.map((row) => {
    const cells = within(row).getAllByRole("cell");
    return cells[0]!.textContent?.trim() ?? "";
  });
}

/** Find a sortable column header `<th>` by its accessible button label. */
function getHeaderCell(label: RegExp): HTMLTableCellElement {
  const button = screen.getByRole("button", { name: label });
  return button.closest("th") as HTMLTableCellElement;
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("SchemePerformanceSection sorting (integration)", () => {
  it("renders the 22 canonical schemes sorted by Disbursed descending by default (Req 14.6)", () => {
    render(<SchemePerformanceSection />);

    const expected = sortSchemeRows(
      getSchemePerformance(),
      "disbursed",
      "desc",
    ).map((r) => r.name);

    expect(bodyRowNames()).toEqual(expected);

    // The Disbursed header reports the active descending sort.
    expect(getHeaderCell(/Disbursed/i)).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  });

  it("toggles the Disbursed header to ascending on click (Req 14.7, 14.8)", () => {
    render(<SchemePerformanceSection />);

    fireEvent.click(screen.getByRole("button", { name: /Disbursed/i }));

    const expected = sortSchemeRows(
      getSchemePerformance(),
      "disbursed",
      "asc",
    ).map((r) => r.name);

    expect(bodyRowNames()).toEqual(expected);
    expect(getHeaderCell(/Disbursed/i)).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  it("re-sorts by Applications when its header is clicked (Req 14.7)", () => {
    render(<SchemePerformanceSection />);

    fireEvent.click(screen.getByRole("button", { name: /Applications/i }));

    // Applications defaults to descending when newly selected.
    const expected = sortSchemeRows(
      getSchemePerformance(),
      "applications",
      "desc",
    ).map((r) => r.name);

    expect(bodyRowNames()).toEqual(expected);
  });

  it("reflects the active column in aria-sort and reports 'none' elsewhere (Req 14.8, 28.3)", () => {
    render(<SchemePerformanceSection />);

    // Switch the active column to Applications.
    fireEvent.click(screen.getByRole("button", { name: /Applications/i }));

    expect(getHeaderCell(/Applications/i)).toHaveAttribute(
      "aria-sort",
      "descending",
    );

    // Every other sortable header reports "none".
    for (const label of [
      /Scheme Name/i,
      /Type/i,
      /Approved/i,
      /Disbursed/i,
      /Status/i,
    ]) {
      expect(getHeaderCell(label)).toHaveAttribute("aria-sort", "none");
    }
  });

  it("renders the mobile stacked-card variant in the DOM (Req 14.9)", () => {
    const { container } = render(<SchemePerformanceSection />);

    const cardList = container.querySelector(
      '[data-testid="scheme-cards"]',
    ) as HTMLElement | null;
    expect(cardList).not.toBeNull();

    // One card per canonical scheme.
    const cards = within(cardList!).getAllByRole("listitem");
    expect(cards).toHaveLength(getSchemePerformance().length);

    // Each card carries the labelled illustrative fields.
    const first = cards[0]!;
    expect(within(first).getByText("Applications")).toBeInTheDocument();
    expect(within(first).getByText("Approved")).toBeInTheDocument();
    expect(within(first).getByText("Disbursed")).toBeInTheDocument();
  });
});

/**
 * WomenSchemesList component test (task 10.7) — Requirement 10.
 *
 * Asserts the Women_Hub women-relevant schemes section:
 *  - renders the curated REAL schemes in the SchemeRow / `<Table>` pattern
 *    (Req 10.1);
 *  - shows a "Women Preference" badge adjacent to each flagged scheme
 *    (`elevate`, `elevate-unnati`, `kitven-fund-5`,
 *    `beyond-bengaluru-cluster-fund`) (Req 10.2, 10.6);
 *  - the "Women Preference only" checkbox filters to just the flagged schemes
 *    (Req 10.3);
 *  - the "Scheme type" select narrows the rows, and a combination matching zero
 *    schemes shows the no-results message in a `role="status"` region
 *    (Req 10.3, 10.4);
 *  - the "See All 22 Schemes" link routes to `/schemes` (Req 10.5);
 *  - only REAL scheme ids are referenced — never `rural-innovation-center`.
 *
 * jsdom / Next notes (mirrors the investor component tests): `next/link` is
 * rendered as a plain anchor so the CTAs render without an App Router provider.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so the section CTAs render without an
// App Router context provider.
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

// Imported AFTER the mocks so the component picks up the stubbed <Link>.
import { WomenSchemesList } from "@/components/women/WomenSchemesList";

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                    */
/* -------------------------------------------------------------------------- */

// The four REAL schemes flagged with a "Women Preference" badge.
const WOMEN_PREFERENCE_SCHEME_NAMES = [
  "ELEVATE (Idea2PoC)",
  "ELEVATE Unnati (SC/ST Founders)",
  "KITVEN Fund-5",
  "Beyond Bengaluru Cluster Seed Fund",
] as const;

/** The rendered `<Table>` element, or fail loudly if the rows did not render. */
function getSchemeTable(): HTMLElement {
  return screen.getByRole("table");
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("WomenSchemesList (task 10.7)", () => {
  it("renders the curated REAL schemes in the SchemeRow / table pattern (Req 10.1)", () => {
    render(<WomenSchemesList />);

    const table = getSchemeTable();

    // Every curated, broadly-relevant scheme name appears as a table row.
    for (const name of [
      ...WOMEN_PREFERENCE_SCHEME_NAMES,
      "Grand Challenge Karnataka",
      "Karnataka Acceleration Network (KAN)",
      "NAIN 2.0 (New Age Innovation Network)",
      "Grassroot Innovation Support",
    ]) {
      expect(within(table).getByText(name)).toBeInTheDocument();
    }

    // Header + 8 curated scheme body rows.
    expect(within(table).getAllByRole("row")).toHaveLength(9);
  });

  it("shows a 'Women Preference' badge on each flagged scheme (Req 10.2, 10.6)", () => {
    render(<WomenSchemesList />);

    const table = getSchemeTable();

    // Exactly the four flagged schemes carry the badge (the badge text lives
    // inside the table; the intro paragraph's mention is outside it).
    expect(within(table).getAllByText("Women Preference")).toHaveLength(4);
  });

  it("'Women Preference only' checkbox filters to just the flagged schemes (Req 10.3)", () => {
    render(<WomenSchemesList />);

    const toggle = screen.getByLabelText("Women Preference only");
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);
    expect(toggle).toBeChecked();

    const table = getSchemeTable();

    // The four flagged schemes remain...
    for (const name of WOMEN_PREFERENCE_SCHEME_NAMES) {
      expect(within(table).getByText(name)).toBeInTheDocument();
    }
    // ...and the broadly-relevant (non-flagged) schemes are filtered out.
    expect(within(table).queryByText("Grand Challenge Karnataka")).toBeNull();
    expect(
      within(table).queryByText("Grassroot Innovation Support"),
    ).toBeNull();

    // Header + exactly 4 flagged rows.
    expect(within(table).getAllByRole("row")).toHaveLength(5);
  });

  it("the 'Scheme type' select narrows rows; a zero-match combination shows the no-results status message (Req 10.3, 10.4)", () => {
    render(<WomenSchemesList />);

    // All curated women-relevant schemes are grants, so "grant" keeps them all.
    const typeSelect = screen.getByLabelText("Scheme type");
    fireEvent.change(typeSelect, { target: { value: "grant" } });
    expect(within(getSchemeTable()).getAllByRole("row")).toHaveLength(9);

    // Narrowing to "fiscal" matches zero curated schemes → no-results message.
    fireEvent.change(typeSelect, { target: { value: "fiscal" } });

    expect(screen.queryByRole("table")).toBeNull();
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/no women-relevant schemes match/i);
  });

  it("'See All 22 Schemes' links to /schemes (Req 10.5)", () => {
    render(<WomenSchemesList />);

    expect(
      screen.getByRole("link", { name: /See All 22 Schemes/i }),
    ).toHaveAttribute("href", "/schemes");
  });

  it("references only REAL scheme ids — never 'rural-innovation-center' (Req 10.6)", () => {
    const { container } = render(<WomenSchemesList />);

    expect(container.innerHTML).not.toContain("rural-innovation-center");
  });
});

/**
 * CsrAlignedPrograms component test (task 12.8) — Requirement 18.
 *
 * Renders the real `/csr` CSR-aligned programs client island
 * (`CsrAlignedPrograms`) and pins its behaviour:
 *   - the CSR-aligned schemes render via the SchemeRow `<Table>` pattern and the
 *     list includes the four documented real schemes — grassroot-innovation,
 *     elevate-unnati, nain-2, rd-project-grant — by their real names (Req 18.1,
 *     18.3, 18.4);
 *   - a "CSR-Aligned" badge appears on every visible row (Req 18.2);
 *   - the "Scheme type" select narrows the visible rows (Grants vs Fiscal change
 *     the visible count) (Req 18.5);
 *   - a zero-match selection shows the no-results message (role=status) (Req
 *     18.6);
 *   - a "See All 22 Schemes" link points at `/schemes`;
 *   - the literal `rural-innovation-center` appears nowhere (Req 18.4).
 *
 * The island is self-contained in-memory data + a native `<select>` filter; it
 * uses `next/link` only, so no router mocks are required. State changes are
 * driven through the native `<select>` via `fireEvent.change` (the repo bundles
 * no `@testing-library/user-event`), mirroring the sibling
 * `incubators/__tests__/IncubatorsIndex.test.tsx`.
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CsrAlignedPrograms } from "@/components/csr/CsrAlignedPrograms";
import { schemes } from "@/data/schemes";
import { CSR_ALIGNED_SCHEME_IDS } from "@/lib/scheme-tagging";

/** The CSR-aligned schemes resolved to their real Scheme records, in list order. */
const CSR_SCHEMES = CSR_ALIGNED_SCHEME_IDS.map((id) => {
  const scheme = schemes.find((s) => s.id === id);
  if (!scheme) throw new Error(`Unknown CSR-aligned scheme id: ${id}`);
  return scheme;
});

const GRANT_COUNT = CSR_SCHEMES.filter((s) => s.type === "grant").length;
const FISCAL_COUNT = CSR_SCHEMES.filter((s) => s.type === "fiscal").length;

describe("CsrAlignedPrograms (CSR-aligned programs island)", () => {
  it("renders one table row per CSR-aligned scheme, naming the four documented schemes", () => {
    render(<CsrAlignedPrograms />);

    // The four documented real scheme ids are all present in the list.
    expect(CSR_ALIGNED_SCHEME_IDS).toEqual(
      expect.arrayContaining([
        "grassroot-innovation",
        "elevate-unnati",
        "nain-2",
        "rd-project-grant",
      ]),
    );

    // Each scheme renders by its real name from schemes.ts.
    for (const scheme of CSR_SCHEMES) {
      expect(screen.getByText(scheme.name)).toBeInTheDocument();
    }
  });

  it("shows a 'CSR-Aligned' badge on every visible row", () => {
    render(<CsrAlignedPrograms />);

    expect(screen.getAllByText("CSR-Aligned")).toHaveLength(CSR_SCHEMES.length);
  });

  it("narrows the visible rows when the 'Scheme type' select changes", () => {
    render(<CsrAlignedPrograms />);

    const select = screen.getByLabelText("Scheme type");

    // Grants: only the grant-typed CSR-aligned schemes remain.
    fireEvent.change(select, { target: { value: "grant" } });
    expect(screen.getAllByText("CSR-Aligned")).toHaveLength(GRANT_COUNT);

    // Fiscal incentives: only the fiscal-typed schemes remain — a different count.
    fireEvent.change(select, { target: { value: "fiscal" } });
    expect(screen.getAllByText("CSR-Aligned")).toHaveLength(FISCAL_COUNT);
    expect(GRANT_COUNT).not.toBe(FISCAL_COUNT);

    // The fiscal R&D grant is visible under Fiscal; the grant-only schemes are not.
    expect(
      screen.getByText("R&D Project Grant (Triple Helix)"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Grassroot Innovation Support"),
    ).not.toBeInTheDocument();
  });

  it("shows the no-results status message for a zero-match selection", () => {
    render(<CsrAlignedPrograms />);

    const select = screen.getByLabelText("Scheme type");

    // Drive the select to a value matched by no scheme type (jsdom collapses an
    // out-of-range value to ""), exercising the empty-state branch.
    fireEvent.change(select, { target: { value: "__no-such-type__" } });

    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent(/no csr-aligned programs match/i);
    expect(screen.queryAllByText("CSR-Aligned")).toHaveLength(0);
  });

  it("links to the full schemes catalogue via 'See All 22 Schemes'", () => {
    render(<CsrAlignedPrograms />);

    const link = screen.getByRole("link", { name: /see all 22 schemes/i });
    expect(link).toHaveAttribute("href", "/schemes");
  });

  it("never references the non-existent 'rural-innovation-center' scheme id", () => {
    const { container } = render(<CsrAlignedPrograms />);

    expect(container.innerHTML).not.toContain("rural-innovation-center");
  });
});

/**
 * CsrHub page component test (task 12.7) — Requirements 16, 17, 19, 20, 21,
 * 22.1, 22.2, 23.
 *
 * Renders the real `/csr` page (`CsrPage`) and pins the composed CSR & NGO Hub
 * surface that replaces the former route stub:
 *
 *   - Replaces the stub: the hero `h1` is present and no StubPage "forthcoming"
 *     placeholder copy leaks into the route.
 *   - Hero: a single `h1` plus the two CTAs — "Partner with KITE" → `#csr-partner`
 *     and "Browse CSR-Aligned Programs" → `#csr-aligned-programs` (Req 16).
 *   - CSR landscape: 3 columns including the illustrative CSR-share range, which
 *     carries an Illustrative badge (Req 17).
 *   - Featured partnerships: 6 cards + an Illustrative badge (Req 19).
 *   - NGO partners: ≥3 cards + an Illustrative badge (Req 20).
 *   - Impact metrics: 3 stat cards + an Illustrative badge (Req 21).
 *   - How to partner: 3 steps + a `mailto:` Contact link (Req 22.1, 22.2).
 *   - Resources: 3 cards (Req 23).
 *
 * Sections that carry an accessible name (`aria-labelledby`) expose an implicit
 * `region` role; we scope assertions with `within(region)` for resilience, and
 * fall back to `closest("section")`/`closest("li")` for the hero and landscape,
 * which have no section-level accessible name.
 */

import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import CsrPage from "@/app/csr/page";
import { generateCsrPartnerships } from "@/lib/synthetic-csr-partnerships";
import { generateNgoPartners } from "@/lib/synthetic-ngo-partners";
import { generateCsrImpactMetrics } from "@/lib/synthetic-csr-impact";

/** The StubPage placeholder copy; its absence proves the stub is replaced. */
const STUB_FORTHCOMING = /content\s+is\s+forthcoming/i;

describe("CsrPage (CSR & NGO Hub)", () => {
  it("replaces the stub with the composed hub (single h1, no forthcoming copy)", () => {
    render(<CsrPage />);

    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent(/partnership channel for CSR capital/i);

    expect(screen.queryByText(STUB_FORTHCOMING)).toBeNull();
  });

  it("renders the hero h1 and two anchored CTAs (Req 16)", () => {
    render(<CsrPage />);

    const partner = screen.getByRole("link", { name: "Partner with KITE" });
    expect(partner).toHaveAttribute("href", "#csr-partner");

    const browse = screen.getByRole("link", {
      name: /Browse CSR-Aligned Programs/i,
    });
    expect(browse).toHaveAttribute("href", "#csr-aligned-programs");
  });

  it("renders the CSR landscape with 3 columns and the illustrative CSR-share range (Req 17)", () => {
    render(<CsrPage />);

    // The three landscape column titles.
    expect(screen.getByText("CSR Mandate Context")).toBeInTheDocument();
    expect(screen.getByText("Karnataka Focus Areas")).toBeInTheDocument();
    expect(screen.getByText("Partnership Pathways")).toBeInTheDocument();

    // The illustrative CSR-share range lives in the Mandate Context card and
    // sits beside an Illustrative badge.
    const mandateCard = screen
      .getByText("CSR Mandate Context")
      .closest("li") as HTMLElement;
    expect(mandateCard).not.toBeNull();
    expect(
      within(mandateCard).getByText(/illustrative 8.12% range/i),
    ).toBeInTheDocument();
    expect(within(mandateCard).getByText("Illustrative")).toBeInTheDocument();
  });

  it("renders exactly 6 featured partnership cards with an Illustrative badge (Req 19)", () => {
    render(<CsrPage />);

    const region = screen.getByRole("region", {
      name: /Active CSR Partnerships/i,
    });
    expect(within(region).getAllByRole("listitem")).toHaveLength(
      generateCsrPartnerships().length,
    );
    expect(within(region).getAllByRole("listitem")).toHaveLength(6);
    expect(within(region).getByText("Illustrative")).toBeInTheDocument();
  });

  it("renders at least 3 NGO partner cards with an Illustrative badge (Req 20)", () => {
    render(<CsrPage />);

    const region = screen.getByRole("region", {
      name: /NGO & Implementation Partners/i,
    });
    const cards = within(region).getAllByRole("listitem");
    expect(cards.length).toBe(generateNgoPartners().length);
    expect(cards.length).toBeGreaterThanOrEqual(3);
    expect(within(region).getByText("Illustrative")).toBeInTheDocument();
  });

  it("renders 3 impact stat cards with an Illustrative badge (Req 21)", () => {
    render(<CsrPage />);

    const region = screen.getByRole("region", {
      name: /Cumulative CSR Impact/i,
    });

    for (const metric of generateCsrImpactMetrics()) {
      expect(within(region).getByText(metric.label)).toBeInTheDocument();
    }
    expect(generateCsrImpactMetrics()).toHaveLength(3);
    expect(within(region).getByText("Illustrative")).toBeInTheDocument();
  });

  it("renders the 3-step how-to-partner pathway with a mailto Contact link (Req 22.1, 22.2)", () => {
    render(<CsrPage />);

    const region = screen.getByRole("region", { name: /Partner with KITE/i });
    expect(within(region).getAllByRole("listitem")).toHaveLength(3);

    const contact = within(region).getByRole("link", {
      name: /Contact KDEM Partnership Team/i,
    });
    expect(contact.getAttribute("href")).toMatch(/^mailto:/);
  });

  it("renders the 3 resource cards (Req 23)", () => {
    render(<CsrPage />);

    const region = screen.getByRole("region", { name: /^Resources$/i });

    expect(
      within(region).getByText("Karnataka CSR Framework"),
    ).toBeInTheDocument();
    expect(
      within(region).getByText("Sample MoU Templates"),
    ).toBeInTheDocument();
    expect(within(region).getByText("Contact CSR Team")).toBeInTheDocument();
  });
});

/**
 * WomenHub component test (task 10.6) — the composed Women Founders Hub page
 * (`/women`), Requirements 7, 8, 9, 11, 12, 13, 14, 15, 36.7, 38.1, 38.5.
 *
 * This is the page-level counterpart to the per-section unit tests: it renders
 * the real `WomenPage` server shell (`@/app/women/page`) and asserts the
 * user-visible contract of every one of its nine sections, plus the cross-cutting
 * Verified-vs-Illustrative labeling rules (Req 38.1, 38.5).
 *
 * jsdom notes:
 *  - The Women Hub is composed almost entirely of Server Components; the single
 *    client island is `WomenSchemesList` (its filter state). Neither needs a
 *    provider, so the page renders standalone (mirrors `inclusion.e2e.test.tsx`,
 *    which renders `<WomenPage />` directly).
 *  - Sections are scoped via `closest("section")` / `aria-labelledby` selectors
 *    and queried with `within()` so repeated tokens (₹5 crore, 51%, Illustrative)
 *    never cross-match between sections.
 */

import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import WomenPage from "@/app/women/page";

/** Resolve a section by the heading it contains. */
function sectionByHeading(name: RegExp): HTMLElement {
  const heading = screen.getByRole("heading", { name });
  const section = heading.closest("section");
  expect(section).not.toBeNull();
  return section as HTMLElement;
}

/** Resolve a section by its `aria-labelledby` id. */
function sectionByLabelledBy(
  container: HTMLElement,
  labelledById: string,
): HTMLElement {
  const section = container.querySelector(
    `section[aria-labelledby="${labelledById}"]`,
  ) as HTMLElement | null;
  expect(section).not.toBeNull();
  return section as HTMLElement;
}

describe("Women Founders Hub page (/women)", () => {
  it("replaces the route stub — no 'Coming soon' / stub placeholder copy (Req 36.1)", () => {
    render(<WomenPage />);

    expect(screen.queryByText(/coming soon/i)).toBeNull();
    expect(screen.queryByText(/under construction/i)).toBeNull();
    expect(screen.queryByText(/\bstub\b/i)).toBeNull();
  });

  it("hero names the verified 25% ELEVATE statistic and the Women-Led Accelerator, with two CTAs (Req 7, 38.1, 38.5)", () => {
    render(<WomenPage />);

    // Single page h1 lives in the hero.
    const h1 = screen.getByRole("heading", {
      level: 1,
      name: /building karnataka with women founders/i,
    });
    const hero = h1.closest("section") as HTMLElement;
    expect(hero).not.toBeNull();
    const scope = within(hero);

    // Verified 25% women-led ELEVATE figure + the Women-Led Accelerator name.
    expect(scope.getByText(/25% of elevate winners/i)).toBeInTheDocument();
    expect(
      scope.getByText(/women-led accelerator backs that momentum/i),
    ).toBeInTheDocument();

    // CTA 1 → /schemes.
    const browse = scope.getByRole("link", {
      name: /browse women-specific schemes/i,
    });
    expect(browse).toHaveAttribute("href", "/schemes");

    // CTA 2 → on-page #women-accelerator anchor.
    const explore = scope.getByRole("link", {
      name: /explore women-led accelerators/i,
    });
    expect(explore).toHaveAttribute("href", "#women-accelerator");

    // The hero carries verified figures only — no Illustrative marker.
    expect(scope.queryByText(/illustrative/i)).toBeNull();
  });

  it("renders the five verified policy stats verbatim with NO Illustrative badge and 25% emphasis (Req 8, 38.1, 38.5)", () => {
    render(<WomenPage />);

    const section = sectionByHeading(/verified policy provisions/i);
    const scope = within(section);

    // 25% — verified, emphasized (rendered at the largest/boldest weight).
    const elevateShare = scope.getByText("25%");
    expect(elevateShare).toBeInTheDocument();
    expect(elevateShare.className).toMatch(/font-bold/);
    expect(scope.getByText(/women-led elevate winners/i)).toBeInTheDocument();

    // 51% appears twice (founder-stake threshold + women-employee share).
    expect(scope.getAllByText("51%")).toHaveLength(2);
    expect(
      scope.getByText(/founder-stake threshold unlocks women-founder preferences/i),
    ).toBeInTheDocument();
    expect(
      scope.getByText(/women-employee share unlocks women-led benefits/i),
    ).toBeInTheDocument();

    // ₹5 crore over 5 years + ELEVATE Unnati track.
    expect(scope.getByText("₹5 crore")).toBeInTheDocument();
    expect(
      scope.getByText(/women-led accelerator grant over 5 years/i),
    ).toBeInTheDocument();
    expect(scope.getByText("ELEVATE Unnati")).toBeInTheDocument();

    // Verified section — the Illustrative badge must NOT appear here (Req 38.5).
    expect(scope.queryByText(/illustrative/i)).toBeNull();
  });

  it("renders the Why-Karnataka editorial as exactly three cards (Req 9)", () => {
    render(<WomenPage />);

    const section = sectionByHeading(/why karnataka for women founders/i);
    const scope = within(section);

    expect(scope.getAllByRole("listitem")).toHaveLength(3);
    expect(scope.getByText("Founder Stake Threshold")).toBeInTheDocument();
    expect(scope.getByText("Women Employee Threshold")).toBeInTheDocument();
    expect(scope.getByText("Dedicated Accelerator Capital")).toBeInTheDocument();
  });

  it("featured founders shows exactly six cards and a single Illustrative badge (Req 12, 38.1)", () => {
    const { container } = render(<WomenPage />);

    const section = sectionByLabelledBy(
      container,
      "women-featured-founders-heading",
    );
    const scope = within(section);

    expect(scope.getAllByRole("listitem")).toHaveLength(6);
    // Synthetic content → exactly one Illustrative marker.
    expect(scope.getAllByText(/^illustrative$/i)).toHaveLength(1);
  });

  it("women mentors shows three cards with the demographic-framing caveat and a See All Mentors link (Req 13)", () => {
    const { container } = render(<WomenPage />);

    const section = sectionByLabelledBy(container, "women-mentors-heading");
    const scope = within(section);

    expect(scope.getAllByRole("listitem")).toHaveLength(3);
    expect(
      scope.getByText(/not\s+a definitive demographic classification/i),
    ).toBeInTheDocument();

    const seeAll = scope.getByRole("link", { name: /see all mentors/i });
    expect(seeAll).toHaveAttribute("href", "/mentors");
  });

  it("accelerator section anchors at #women-accelerator with eligibility content, ₹5 crore, and an external https Apply CTA (Req 11, 38.5)", () => {
    const { container } = render(<WomenPage />);

    const section = container.querySelector(
      "#women-accelerator",
    ) as HTMLElement | null;
    expect(section).not.toBeNull();
    const scope = within(section as HTMLElement);

    // Eligibility content + the verified ₹5 crore over 5 years figure.
    expect(scope.getByText(/eligibility for incubators/i)).toBeInTheDocument();
    expect(scope.getAllByText(/₹5 crore over 5 years/i).length).toBeGreaterThan(0);

    // Apply CTA — external https in a new tab, opener-safe.
    const apply = scope.getByRole("link", {
      name: /apply for accelerator grant/i,
    });
    expect(apply.getAttribute("href")).toMatch(/^https:\/\//);
    expect(apply).toHaveAttribute("target", "_blank");
    expect(apply).toHaveAttribute("rel", expect.stringContaining("noopener"));

    // Verified figure → no Illustrative badge in this section.
    expect(scope.queryByText(/illustrative/i)).toBeNull();
  });

  it("renders three resource cards (Req 14)", () => {
    const { container } = render(<WomenPage />);

    const section = sectionByLabelledBy(container, "women-resources-heading");
    const scope = within(section);

    expect(scope.getAllByRole("listitem")).toHaveLength(3);
    expect(
      scope.getByText(
        /karnataka startup policy — women entrepreneurship framework/i,
      ),
    ).toBeInTheDocument();
    expect(scope.getByText(/kits women founders helpdesk/i)).toBeInTheDocument();
    expect(
      scope.getByText(/international women founder programs/i),
    ).toBeInTheDocument();
  });

  it("renders two get-involved cards (Req 15)", () => {
    const { container } = render(<WomenPage />);

    const section = sectionByLabelledBy(container, "women-get-involved-heading");
    const scope = within(section);

    expect(scope.getAllByRole("listitem")).toHaveLength(2);
    expect(scope.getByText(/i am a woman founder/i)).toBeInTheDocument();
    expect(
      scope.getByText(/i want to support women founders/i),
    ).toBeInTheDocument();
  });
});

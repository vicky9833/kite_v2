/**
 * Component tests — SchemeCard (task 3.16).
 *
 * EXAMPLE / component tests (not property-based). They render `SchemeCard`
 * directly with controlled props against a REAL scheme from
 * `src/data/schemes.ts`, asserting the card facts (name, type/status badges,
 * benefit summary, duration), the eligibility + documents expanders, the
 * "View Details" link, the Compare checkbox behaviour, and the corner
 * ConfidenceDot which is rendered iff an eligibility result is supplied
 * (registered users). References Req 15.1–15.6.
 *
 * Resilience notes for jsdom + Radix:
 *  - jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView / pointer
 *    capture) live in `src/test/setup.ts` and back the Radix Checkbox.
 *  - `next/link` is mocked to a plain anchor so the "View Details" link renders
 *    without an App Router provider (same pattern as the layout tests).
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";

import { SchemeCard } from "@/components/schemes/SchemeCard";
import { schemes } from "@/data/schemes";
import type { EligibilityResult } from "@/types";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                               */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so "View Details" renders without an
// App Router context provider (the card tests only care about href/label).
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

/* -------------------------------------------------------------------------- */
/* Fixtures — REAL schemes from src/data/schemes.ts                           */
/* -------------------------------------------------------------------------- */

// A fiscal + open scheme with multi-item eligibility/documents.
const fiscalScheme = schemes.find((s) => s.id === "sgst-reimbursement")!;
// A grant + upcoming scheme to cover the other badge labels.
const upcomingGrant = schemes.find((s) => s.id === "alternate-investment-bridge")!;

/** A representative eligibility result for the registered-user dot path. */
const eligibility: EligibilityResult = {
  schemeId: fiscalScheme.id,
  status: "likely-eligible",
  reasons: ["DPIIT recognition confirmed", "Karnataka registration confirmed"],
  estimatedBenefit: 2_500_000,
  confidence: 0.7,
};

const onToggleCompare = vi.fn();

beforeEach(() => {
  onToggleCompare.mockClear();
});

/* -------------------------------------------------------------------------- */
/* 1. Card facts                                                              */
/* -------------------------------------------------------------------------- */

describe("SchemeCard — card facts", () => {
  it("renders an <article> with the scheme name in an <h3>", () => {
    render(
      <SchemeCard
        scheme={fiscalScheme}
        selectedForCompare={false}
        onToggleCompare={onToggleCompare}
      />,
    );

    expect(screen.getByRole("article")).toBeInTheDocument();
    const heading = screen.getByRole("heading", { level: 3, name: fiscalScheme.name });
    expect(heading).toBeInTheDocument();
  });

  it("renders the Fiscal Incentive type badge and Open status badge", () => {
    render(
      <SchemeCard
        scheme={fiscalScheme}
        selectedForCompare={false}
        onToggleCompare={onToggleCompare}
      />,
    );

    expect(screen.getByText("Fiscal Incentive")).toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("renders the Grant-in-Aid type badge and Upcoming status badge", () => {
    render(
      <SchemeCard
        scheme={upcomingGrant}
        selectedForCompare={false}
        onToggleCompare={onToggleCompare}
      />,
    );

    expect(screen.getByText("Grant-in-Aid")).toBeInTheDocument();
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
  });

  it("renders the benefit summary (amount + maxBenefit) and the duration caption", () => {
    render(
      <SchemeCard
        scheme={fiscalScheme}
        selectedForCompare={false}
        onToggleCompare={onToggleCompare}
      />,
    );

    // amount is the leading text node of the benefit line…
    expect(screen.getByText(fiscalScheme.amount)).toBeInTheDocument();
    // …and maxBenefit follows in the "· up to {maxBenefit}" span.
    expect(
      screen.getByText(new RegExp(`up to ${escapeRegExp(fiscalScheme.maxBenefit)}`)),
    ).toBeInTheDocument();
    // duration caption.
    expect(screen.getByText(fiscalScheme.duration)).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* 2. Eligibility expander                                                    */
/* -------------------------------------------------------------------------- */

describe("SchemeCard — eligibility expander", () => {
  it("shows a truncated comma sentence and expands to the full list, then collapses", () => {
    render(
      <SchemeCard
        scheme={fiscalScheme}
        selectedForCompare={false}
        onToggleCompare={onToggleCompare}
      />,
    );

    // Collapsed: the full comma sentence is shown as a single paragraph.
    const sentence = fiscalScheme.eligibility.join(", ");
    expect(screen.getByText(sentence)).toBeInTheDocument();
    // No individual eligibility item is broken out yet (it's one sentence).
    expect(screen.queryByText(fiscalScheme.eligibility[0]!)).not.toBeInTheDocument();

    // Expand.
    fireEvent.click(screen.getByRole("button", { name: "See full eligibility" }));

    // Each eligibility item now appears as its own <li> list item.
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(fiscalScheme.eligibility.length);
    for (const item of fiscalScheme.eligibility) {
      const node = screen.getByText(item);
      expect(node.tagName).toBe("LI");
    }
    // The comma sentence is gone.
    expect(screen.queryByText(sentence)).not.toBeInTheDocument();

    // Toggle back.
    fireEvent.click(screen.getByRole("button", { name: "Show less" }));
    expect(screen.getByText(sentence)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "See full eligibility" }),
    ).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* 3. Documents expander                                                      */
/* -------------------------------------------------------------------------- */

describe("SchemeCard — documents expander", () => {
  it("is collapsed by default and reveals the documents list when clicked", () => {
    render(
      <SchemeCard
        scheme={fiscalScheme}
        selectedForCompare={false}
        onToggleCompare={onToggleCompare}
      />,
    );

    const toggle = screen.getByRole("button", { name: /Documents needed/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    // No document text rendered while collapsed.
    for (const doc of fiscalScheme.documents) {
      expect(screen.queryByText(doc)).not.toBeInTheDocument();
    }

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    for (const doc of fiscalScheme.documents) {
      expect(screen.getByText(doc)).toBeInTheDocument();
    }
  });
});

/* -------------------------------------------------------------------------- */
/* 4. View Details link                                                       */
/* -------------------------------------------------------------------------- */

describe("SchemeCard — View Details link", () => {
  it("points to /schemes/{id}", () => {
    render(
      <SchemeCard
        scheme={fiscalScheme}
        selectedForCompare={false}
        onToggleCompare={onToggleCompare}
      />,
    );

    const link = screen.getByRole("link", { name: "View Details" });
    expect(link).toHaveAttribute("href", `/schemes/${fiscalScheme.id}`);
  });
});

/* -------------------------------------------------------------------------- */
/* 5. Compare checkbox                                                        */
/* -------------------------------------------------------------------------- */

describe("SchemeCard — compare checkbox", () => {
  it("has the accessible name 'Compare {name}' and reflects the unselected state", () => {
    render(
      <SchemeCard
        scheme={fiscalScheme}
        selectedForCompare={false}
        onToggleCompare={onToggleCompare}
      />,
    );

    const checkbox = screen.getByRole("checkbox", {
      name: `Compare ${fiscalScheme.name}`,
    });
    expect(checkbox).not.toBeChecked();
  });

  it("reflects the selected state when selectedForCompare is true", () => {
    render(
      <SchemeCard
        scheme={fiscalScheme}
        selectedForCompare
        onToggleCompare={onToggleCompare}
      />,
    );

    expect(
      screen.getByRole("checkbox", { name: `Compare ${fiscalScheme.name}` }),
    ).toBeChecked();
  });

  it("calls onToggleCompare(scheme.id) when toggled", () => {
    render(
      <SchemeCard
        scheme={fiscalScheme}
        selectedForCompare={false}
        onToggleCompare={onToggleCompare}
      />,
    );

    fireEvent.click(
      screen.getByRole("checkbox", { name: `Compare ${fiscalScheme.name}` }),
    );
    expect(onToggleCompare).toHaveBeenCalledTimes(1);
    expect(onToggleCompare).toHaveBeenCalledWith(fiscalScheme.id);
  });
});

/* -------------------------------------------------------------------------- */
/* 6. Corner ConfidenceDot — present iff registered                          */
/* -------------------------------------------------------------------------- */

describe("SchemeCard — corner ConfidenceDot", () => {
  it("renders a corner dot exposing the reasons via title + aria-label when eligibility is provided", () => {
    render(
      <SchemeCard
        scheme={fiscalScheme}
        eligibility={eligibility}
        selectedForCompare={false}
        onToggleCompare={onToggleCompare}
      />,
    );

    const reasonsText = eligibility.reasons.join(" ");

    // The corner wrapper exposes the reasons for hover (title) and
    // programmatically (aria-label) — no Radix tooltip involved.
    const corner = screen.getByTitle(reasonsText);
    expect(corner).toHaveAttribute("aria-label", `Eligibility: ${reasonsText}`);
    expect(corner.getAttribute("aria-label")).toContain(reasonsText);

    // The ConfidenceDot primitive (role="img") sits inside the corner wrapper.
    const dot = within(corner).getByRole("img");
    expect(dot).toHaveAttribute("aria-label", "Likely eligible");
  });

  it("renders NO dot when eligibility is null", () => {
    render(
      <SchemeCard
        scheme={fiscalScheme}
        eligibility={null}
        selectedForCompare={false}
        onToggleCompare={onToggleCompare}
      />,
    );

    // No ConfidenceDot image and no eligibility status label anywhere.
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByText("Likely eligible")).not.toBeInTheDocument();
  });

  it("renders NO dot when eligibility is omitted (unregistered)", () => {
    render(
      <SchemeCard
        scheme={fiscalScheme}
        selectedForCompare={false}
        onToggleCompare={onToggleCompare}
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Escape a string for safe interpolation into a RegExp. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

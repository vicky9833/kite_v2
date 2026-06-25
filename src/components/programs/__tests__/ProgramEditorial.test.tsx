// src/components/programs/__tests__/ProgramEditorial.test.tsx
//
// Component test for the shared <ProgramEditorial /> editorial composition
// (Task 8.6 — Requirements 4, 5, 11.5). Renders the component with both the
// verified KAN program data and the verified K-Combinator program data and
// asserts:
//   - all seven Editorial_Section_Set sections render, in fixed order
//     (overview, provides, cohort structure, application process, success
//     stories, partner incubators, apply CTA);
//   - KAN's verified figures ("6-month acceleration cohorts", "306 startups");
//   - K-Combinator's full verified constant set (KDEM/TiE, wrkwrk Silicon Beach
//     Mangaluru, 4–6 per cohort, 3 cohorts/year, 90 startups over 5 years,
//     5 soonicorns by 2034, the exact nine sectors, ₹10 lakh @ 0% equity,
//     ₹9.5 crore + ₹50 lakh);
//   - the SYNTHETIC success-stories section carries the IllustrativeBadge while
//     every VERIFIED section is badge-free (Req 4.6/5.12, 11.5);
//   - the Apply CTA is an external https anchor opening in a new tab with
//     rel="noopener noreferrer" (Req 4.7/5.13).
//
// Note: SuccessStoriesSection is wrapped in LazySection. In jsdom
// IntersectionObserver is unavailable, so LazySection renders its children
// eagerly (see LazySection's SSR/no-IO fallback), making the success-stories
// content reachable without scroll simulation.
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgramEditorial } from "@/components/programs/ProgramEditorial";
import { kanProgram } from "@/data/kan-program";
import { kCombinatorProgram } from "@/data/k-combinator-program";

// The seven sections, in their fixed render order. Each is a region landmark
// whose accessible name comes from its aria-label.
const ORDERED_SECTION_LABELS = [
  "Program overview",
  "What the program provides",
  "Cohort structure",
  "Application process",
  "Illustrative success stories",
  "Partner incubators and accelerators",
  "Apply",
];

// Verified sections (everything except the synthetic success-stories section)
// must never render an IllustrativeBadge.
const VERIFIED_SECTION_LABELS = ORDERED_SECTION_LABELS.filter(
  (label) => label !== "Illustrative success stories",
);

describe("ProgramEditorial — shared structure", () => {
  it("renders all seven sections in the fixed order for KAN", () => {
    render(<ProgramEditorial data={kanProgram} />);

    const regions = screen.getAllByRole("region");
    const names = regions.map((region) => region.getAttribute("aria-label"));

    expect(names).toEqual(ORDERED_SECTION_LABELS);
  });

  it("renders all seven sections in the fixed order for K-Combinator", () => {
    render(<ProgramEditorial data={kCombinatorProgram} />);

    const regions = screen.getAllByRole("region");
    const names = regions.map((region) => region.getAttribute("aria-label"));

    expect(names).toEqual(ORDERED_SECTION_LABELS);
  });
});

describe("ProgramEditorial — KAN verified figures", () => {
  it("renders the verified KAN figures", () => {
    const { container } = render(<ProgramEditorial data={kanProgram} />);
    const text = container.textContent ?? "";

    expect(text).toContain("6-month acceleration cohorts");
    expect(text).toContain("306 startups");
  });

  it("renders the KAN program name as the page h1", () => {
    render(<ProgramEditorial data={kanProgram} />);

    expect(
      screen.getByRole("heading", { level: 1, name: kanProgram.name }),
    ).toBeInTheDocument();
  });
});

describe("ProgramEditorial — K-Combinator verified constant set", () => {
  // Every figure here traces to the verified K-Combinator spec (Req 5.3–5.10).
  const expectedFigures = [
    "KDEM",
    "TiE",
    "wrkwrk",
    "Silicon Beach Mangaluru",
    "4–6 startups per cohort",
    "3 cohorts per year",
    "90 startups over 5 years",
    "5 soonicorns by 2034",
    "₹10 lakh per qualifying startup at 0% equity",
    "₹9.5 crore",
    "₹50 lakh",
  ];

  it.each(expectedFigures)("renders verified figure: %s", (figure) => {
    const { container } = render(<ProgramEditorial data={kCombinatorProgram} />);
    expect(container.textContent ?? "").toContain(figure);
  });

  it("renders the exact nine verified sectors", () => {
    const { container } = render(<ProgramEditorial data={kCombinatorProgram} />);
    const text = container.textContent ?? "";

    const nineSectors = [
      "Deep Tech",
      "Space",
      "Drone",
      "AI",
      "Robotics",
      "HealthTech",
      "AgriTech",
      "FinTech",
      "MarineTech",
    ];

    for (const sector of nineSectors) {
      expect(text).toContain(sector);
    }
  });
});

describe("ProgramEditorial — illustrative badge placement (Req 11.5)", () => {
  it("marks only the synthetic success-stories section as illustrative (KAN)", () => {
    render(<ProgramEditorial data={kanProgram} />);

    const successRegion = screen.getByRole("region", {
      name: "Illustrative success stories",
    });
    // The IllustrativeBadge renders an element whose text is exactly "Illustrative".
    expect(
      within(successRegion).getByText("Illustrative", { exact: true }),
    ).toBeInTheDocument();

    for (const label of VERIFIED_SECTION_LABELS) {
      const region = screen.getByRole("region", { name: label });
      expect(
        within(region).queryByText("Illustrative", { exact: true }),
      ).toBeNull();
    }
  });

  it("marks only the synthetic success-stories section as illustrative (K-Combinator)", () => {
    render(<ProgramEditorial data={kCombinatorProgram} />);

    const successRegion = screen.getByRole("region", {
      name: "Illustrative success stories",
    });
    expect(
      within(successRegion).getByText("Illustrative", { exact: true }),
    ).toBeInTheDocument();

    for (const label of VERIFIED_SECTION_LABELS) {
      const region = screen.getByRole("region", { name: label });
      expect(
        within(region).queryByText("Illustrative", { exact: true }),
      ).toBeNull();
    }
  });
});

describe("ProgramEditorial — Apply CTA (Req 4.7/5.13)", () => {
  it("renders the KAN apply CTA as an external https anchor opening in a new tab", () => {
    render(<ProgramEditorial data={kanProgram} />);

    const applyRegion = screen.getByRole("region", { name: "Apply" });
    const cta = within(applyRegion).getByRole("link", {
      name: kanProgram.applyCta.label,
    });

    expect(cta).toHaveAttribute("href", kanProgram.applyCta.href);
    expect(cta.getAttribute("href")).toMatch(/^https:\/\//);
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the K-Combinator apply CTA as an external https anchor opening in a new tab", () => {
    render(<ProgramEditorial data={kCombinatorProgram} />);

    const applyRegion = screen.getByRole("region", { name: "Apply" });
    const cta = within(applyRegion).getByRole("link", {
      name: kCombinatorProgram.applyCta.label,
    });

    expect(cta).toHaveAttribute("href", kCombinatorProgram.applyCta.href);
    expect(cta.getAttribute("href")).toMatch(/^https:\/\//);
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });
});

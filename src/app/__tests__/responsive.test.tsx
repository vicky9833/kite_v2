/**
 * Responsive structural tests — Home page (task 5.4 / founder directive
 * "5.5 responsive polish").
 *
 * jsdom does NOT perform real layout, so these tests cannot measure pixel
 * overflow or computed widths. Instead they assert the STRUCTURAL responsive
 * CONTRACTS that ARE observable in jsdom via className inspection — the same
 * mobile-first Tailwind class patterns that drive the audited breakpoints
 * (320px / 768px / 1280px):
 *
 *   - Each Home section's grid container declares a mobile base column count
 *     and scales up through the documented `sm:` / `md:` / `lg:` steps.
 *   - Sections stack single-column (or 2-col density for GIA) at the base
 *     width — i.e. the layout is authored mobile-first.
 *   - Every section container uses `max-w-7xl` + responsive horizontal padding
 *     (`px-4 sm:px-6 lg:px-8`).
 *   - There are no hard-coded pixel widths (`w-[<n>px]`) in the rendered Home
 *     DOM that would overflow a 320px viewport.
 *   - The Header gates its desktop nav vs the hamburger via responsive
 *     visibility classes (`hidden lg:flex` / `lg:hidden`).
 *
 * Mocks mirror the layout/sections test pattern: `next/link` → plain anchor,
 * `next/navigation` → stub router. The composed Home page renders all ten
 * sections eagerly because `LazySection` renders its children immediately when
 * `IntersectionObserver` is unavailable (the jsdom case), so no extra LazySection
 * mock is required.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

import Home from "@/app/page";
import { Header } from "@/components/layout/Header";
import { LanguageProvider } from "@/context/LanguageContext";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                               */
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

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

beforeEach(() => {
  pushMock.mockClear();
});

/* -------------------------------------------------------------------------- */
/* Helpers — robust class-substring inspection over the rendered DOM          */
/* -------------------------------------------------------------------------- */

/** All elements in the tree that carry a string `class` attribute. */
function allClassedElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[class]")).filter(
    (el) => typeof el.className === "string",
  );
}

/**
 * True when SOME element's className contains EVERY token in `tokens`
 * (substring match) — i.e. the responsive signature appears on a single
 * element, as Tailwind requires for the modifiers to coexist.
 */
function hasElementWithAll(container: HTMLElement, tokens: string[]): boolean {
  return allClassedElements(container).some((el) =>
    tokens.every((t) => el.className.includes(t)),
  );
}

/* -------------------------------------------------------------------------- */
/* 1. Home page — responsive grid signatures                                  */
/* -------------------------------------------------------------------------- */

describe("Home page responsive grids", () => {
  /**
   * Each section's documented mobile-first grid signature. The base column
   * count is always declared (mobile-first); the `sm:`/`md:`/`lg:` steps scale
   * it up at the audited breakpoints.
   */
  const GRID_SIGNATURES: ReadonlyArray<{ section: string; tokens: string[] }> = [
    {
      section: "LiveMetrics (1 → 2 → 3)",
      tokens: ["grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3"],
    },
    {
      section: "QuickActions (1 → 2 → 4)",
      tokens: ["grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-4"],
    },
    {
      section: "FlagshipPrograms (1 → 2 → 3)",
      tokens: ["grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3"],
    },
    {
      section: "Clusters (1 → 2 → 3)",
      tokens: ["grid-cols-1", "md:grid-cols-2", "lg:grid-cols-3"],
    },
    {
      section: "GIA dense grid (2 → 3 → 4 → 6)",
      tokens: [
        "grid-cols-2",
        "sm:grid-cols-3",
        "md:grid-cols-4",
        "lg:grid-cols-6",
      ],
    },
  ];

  it.each(GRID_SIGNATURES)(
    "renders the $section responsive grid signature",
    ({ tokens }) => {
      const { container } = render(<Home />);
      expect(hasElementWithAll(container, tokens)).toBe(true);
    },
  );

  it("authors every multi-column grid mobile-first (a base grid-cols-* is always declared)", () => {
    const { container } = render(<Home />);

    // Collect every element that opts into a responsive column step.
    const responsiveGrids = allClassedElements(container).filter((el) =>
      /(sm|md|lg):grid-cols-\d/.test(el.className),
    );
    expect(responsiveGrids.length).toBeGreaterThanOrEqual(5);

    // Each one must also declare an unprefixed base column count so it stacks
    // (or stays at its dense base) at 320px rather than inheriting a wide grid.
    for (const el of responsiveGrids) {
      expect(/(^|\s)grid-cols-\d/.test(el.className)).toBe(true);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* 2. Home page — container + horizontal padding contract                     */
/* -------------------------------------------------------------------------- */

describe("Home page container and padding", () => {
  it("uses max-w-7xl with responsive horizontal padding on section containers", () => {
    const { container } = render(<Home />);
    expect(
      hasElementWithAll(container, [
        "max-w-7xl",
        "px-4",
        "sm:px-6",
        "lg:px-8",
      ]),
    ).toBe(true);
  });

  it("applies the max-w-7xl + responsive padding container to every section", () => {
    const { container } = render(<Home />);

    // One constrained container per section (10 sections). Allow >= to stay
    // robust if a section ever nests an extra constrained wrapper.
    const constrained = allClassedElements(container).filter(
      (el) =>
        el.className.includes("max-w-7xl") &&
        el.className.includes("px-4") &&
        el.className.includes("sm:px-6") &&
        el.className.includes("lg:px-8"),
    );
    expect(constrained.length).toBeGreaterThanOrEqual(10);
  });
});

/* -------------------------------------------------------------------------- */
/* 3. Home page — no fixed-pixel-width overflow culprits                      */
/* -------------------------------------------------------------------------- */

describe("Home page overflow safety", () => {
  it("renders no hard-coded pixel widths (w-[<n>px]) that could overflow 320px", () => {
    const { container } = render(<Home />);

    const offenders = allClassedElements(container).filter((el) =>
      /\bw-\[\d+px\]/.test(el.className),
    );

    expect(
      offenders.map((el) => el.className),
      "found hard-coded pixel width(s) in the Home DOM",
    ).toEqual([]);
  });

  it("does not pin long-content blocks with whitespace-nowrap in the section bodies", () => {
    const { container } = render(<Home />);

    // whitespace-nowrap is fine on short button/tab labels, but a paragraph or
    // heading that can't wrap is an overflow risk at 320px. Assert no <p>/<h*>
    // in the Home tree forces nowrap.
    const noWrapProse = allClassedElements(container).filter(
      (el) =>
        /^(P|H1|H2|H3|H4)$/.test(el.tagName) &&
        el.className.includes("whitespace-nowrap"),
    );
    expect(noWrapProse).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/* 4. Header — desktop nav vs hamburger visibility gating                     */
/* -------------------------------------------------------------------------- */

describe("Header responsive nav gating", () => {
  it("gates the desktop nav (hidden lg:flex) and the hamburger (lg:hidden)", () => {
    const { container } = render(
      <LanguageProvider>
        <Header />
      </LanguageProvider>,
    );

    // Desktop center navigation is hidden on small screens, shown at lg.
    expect(hasElementWithAll(container, ["hidden", "lg:flex"])).toBe(true);

    // The hamburger ("Open menu") is shown on small screens, hidden at lg.
    const hamburger = container.querySelector<HTMLElement>(
      '[aria-label="Open menu"]',
    );
    expect(hamburger).not.toBeNull();
    expect(hamburger?.className).toContain("lg:hidden");
  });
});

/**
 * Ecosystem Enablement Layer responsive audit (task 12.5) — Requirements 13.1,
 * 15.1, 15.2, 15.3 (and the responsive contracts woven through the four
 * enablement routes).
 *
 * jsdom does NOT perform real layout, so — exactly like the investor suite's
 * `investor-responsive.test.tsx`, the dashboards' `dashboards-responsive.test.tsx`,
 * and the foundation's `responsive.test.tsx` — these tests cannot measure pixel
 * overflow or computed widths. Instead they assert the mobile-first responsive
 * CONTRACTS that ARE observable in jsdom via className inspection: the Tailwind
 * class patterns that drive the Viewport_Mobile (375px) → Viewport_Tablet
 * (768px) → Viewport_Desktop (1280px) behaviour. We reuse the same helper style
 * as the sibling tests (`allClassedElements` + `hasElementWithAll`).
 *
 * To exercise the three widths concretely, each surface is rendered once per
 * viewport via `setViewport` (which sets `window.innerWidth` and a
 * width-aware `matchMedia` stub, then dispatches `resize`). jsdom does not
 * re-layout in response, but rendering at each width proves every surface
 * mounts without error at mobile / tablet / desktop, and the responsive class
 * signatures (which encode all three breakpoints on a single element) are
 * asserted via substring inspection.
 *
 * Surfaces covered, per the four enablement routes:
 *
 *   /incubators
 *     - IncubatorsHeaderStrip  — max-w-7xl container, py-8 / md:py-12 strip.
 *     - IncubatorFilterBar     — stacked on mobile, rowed at sm/lg
 *                                (flex-col → sm:flex-row, lg:flex-row).
 *     - IncubatorCardGrid      — grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3.
 *     - IncubatorDetailPanel   — renders; md:p-8; snapshot dl grid-cols-1 sm:grid-cols-2.
 *     - Full page              — renders; max-w-7xl container.
 *
 *   /mentors
 *     - MentorDirectoryHeaderStrip — max-w-7xl container, py-8 / md:py-12 strip.
 *     - MentorFilterBar            — flex-col → sm:flex-row, lg:flex-row.
 *     - MentorCardGrid             — grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3.
 *     - MentorDetailPanel          — renders; md:p-8; snapshot dl grid-cols-1 sm:grid-cols-3.
 *     - Full page                  — renders; max-w-7xl container.
 *
 *   /programs/kan and /programs/k-combinator (editorial)
 *     - Overview section       — max-w-7xl container, py-16 / md:py-24 section.
 *     - Provides section       — grid-cols-1 → md:grid-cols-2.
 *     - Application process    — grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-4.
 *     - Success stories        — grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3.
 *     - Partner incubators     — grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3.
 *
 * Rendering notes:
 *  - `next/link` is mocked to a plain anchor and `next/navigation` is stubbed so
 *    the client islands render without an App Router provider (same defensive
 *    pattern as the sibling responsive tests), even though the enablement
 *    surfaces do not currently reach for them.
 *  - The enablement routes ship no charts, and `SuccessStoriesSection`'s
 *    `LazySection` renders its children eagerly in jsdom (no
 *    `IntersectionObserver`), so the success-stories grid is present in the DOM.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

import { incubators } from "@/data/incubators";
import { EMPTY_INCUBATOR_FILTERS } from "@/lib/incubator-filters";
import { EMPTY_MENTOR_FILTERS } from "@/lib/mentor-filters";
import { generateMentors } from "@/lib/synthetic-mentors";

import { IncubatorsHeaderStrip } from "@/components/incubators/IncubatorsHeaderStrip";
import { IncubatorFilterBar } from "@/components/incubators/IncubatorFilterBar";
import { IncubatorCardGrid } from "@/components/incubators/IncubatorCardGrid";
import { IncubatorDetailPanel } from "@/components/incubators/IncubatorDetailPanel";
import IncubatorsPage from "@/app/incubators/page";

import { MentorDirectoryHeaderStrip } from "@/components/mentors/MentorDirectoryHeaderStrip";
import { MentorFilterBar } from "@/components/mentors/MentorFilterBar";
import { MentorCardGrid } from "@/components/mentors/MentorCardGrid";
import { MentorDetailPanel } from "@/components/mentors/MentorDetailPanel";
import MentorsPage from "@/app/mentors/page";

import KanProgramPage from "@/app/programs/kan/page";
import KCombinatorPage from "@/app/programs/k-combinator/page";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor (no App Router context needed).
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

// Stub the App Router hooks in case any nested client surface reaches for them.
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
  usePathname: () => "/",
}));

/* -------------------------------------------------------------------------- */
/* Viewport simulation                                                         */
/* -------------------------------------------------------------------------- */

const VIEWPORTS = [
  { name: "mobile", width: 375 },
  { name: "tablet", width: 768 },
  { name: "desktop", width: 1280 },
] as const;

/**
 * Point `window.innerWidth` and a width-aware `matchMedia` stub at a target
 * width, then fire a `resize`. jsdom will not re-layout, but this proves the
 * surface mounts at each width and lets any width-reading code observe it.
 */
function setViewport(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: 800,
  });
  window.matchMedia = (query: string): MediaQueryList => {
    const minWidth = /min-width:\s*(\d+)/.exec(query);
    const maxWidth = /max-width:\s*(\d+)/.exec(query);
    let matches = false;
    if (minWidth) matches = width >= Number(minWidth[1]);
    else if (maxWidth) matches = width <= Number(maxWidth[1]);
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as MediaQueryList;
  };
  window.dispatchEvent(new Event("resize"));
}

/* -------------------------------------------------------------------------- */
/* Helpers — robust class-substring inspection over the rendered DOM           */
/* (identical in spirit to investor-responsive.test.tsx)                       */
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
/* /incubators                                                                 */
/* -------------------------------------------------------------------------- */

describe.each(VIEWPORTS)(
  "Incubators route responsive contracts — $name ($width px)",
  ({ width }) => {
    it("header strip renders within a max-w-7xl container at py-8 / md:py-12", () => {
      setViewport(width);
      const { container } = render(
        <IncubatorsHeaderStrip listedCount={incubators.length} />,
      );

      expect(hasElementWithAll(container, ["max-w-7xl"])).toBe(true);
      expect(hasElementWithAll(container, ["py-8", "md:py-12"])).toBe(true);
    });

    it("filter bar stacks on mobile and rows at sm / lg without error", () => {
      setViewport(width);
      const { container } = render(
        <IncubatorFilterBar
          data={incubators}
          filters={EMPTY_INCUBATOR_FILTERS}
          resultCount={incubators.length}
          onChange={vi.fn()}
          onClear={vi.fn()}
        />,
      );

      expect(hasElementWithAll(container, ["flex-col", "sm:flex-row"])).toBe(true);
      expect(hasElementWithAll(container, ["lg:flex-row"])).toBe(true);
    });

    it("card grid steps grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3", () => {
      setViewport(width);
      const { container } = render(
        <IncubatorCardGrid incubators={incubators} onActivate={vi.fn()} />,
      );

      expect(
        hasElementWithAll(container, [
          "grid-cols-1",
          "sm:grid-cols-2",
          "lg:grid-cols-3",
        ]),
      ).toBe(true);
    });

    it("detail panel renders without error and steps its snapshot grid (grid-cols-1 sm:grid-cols-2)", () => {
      setViewport(width);
      const { container } = render(
        <IncubatorDetailPanel incubator={incubators[0]!} onClose={vi.fn()} />,
      );

      // Panel padding scales up at md+.
      expect(hasElementWithAll(container, ["md:p-8"])).toBe(true);
      // Program-snapshot definition list stacks on mobile, pairs at sm+.
      expect(hasElementWithAll(container, ["grid-cols-1", "sm:grid-cols-2"])).toBe(
        true,
      );
    });

    it("full /incubators page mounts and constrains content to max-w-7xl", () => {
      setViewport(width);
      const { container } = render(<IncubatorsPage />);

      expect(hasElementWithAll(container, ["max-w-7xl"])).toBe(true);
      expect(
        hasElementWithAll(container, [
          "grid-cols-1",
          "sm:grid-cols-2",
          "lg:grid-cols-3",
        ]),
      ).toBe(true);
    });
  },
);

/* -------------------------------------------------------------------------- */
/* /mentors                                                                    */
/* -------------------------------------------------------------------------- */

describe.each(VIEWPORTS)(
  "Mentors route responsive contracts — $name ($width px)",
  ({ width }) => {
    const mentors = generateMentors();

    it("header strip renders within a max-w-7xl container at py-8 / md:py-12", () => {
      setViewport(width);
      const { container } = render(<MentorDirectoryHeaderStrip />);

      expect(hasElementWithAll(container, ["max-w-7xl"])).toBe(true);
      expect(hasElementWithAll(container, ["py-8", "md:py-12"])).toBe(true);
    });

    it("filter bar stacks on mobile and rows at sm / lg without error", () => {
      setViewport(width);
      const { container } = render(
        <MentorFilterBar
          filters={EMPTY_MENTOR_FILTERS}
          resultCount={mentors.length}
          onChange={vi.fn()}
          onClear={vi.fn()}
        />,
      );

      expect(hasElementWithAll(container, ["flex-col", "sm:flex-row"])).toBe(true);
      expect(hasElementWithAll(container, ["lg:flex-row"])).toBe(true);
    });

    it("card grid steps grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3", () => {
      setViewport(width);
      const { container } = render(
        <MentorCardGrid mentors={mentors} onActivate={vi.fn()} />,
      );

      expect(
        hasElementWithAll(container, [
          "grid-cols-1",
          "sm:grid-cols-2",
          "lg:grid-cols-3",
        ]),
      ).toBe(true);
    });

    it("detail panel renders without error and steps its snapshot grid (grid-cols-1 sm:grid-cols-3)", () => {
      setViewport(width);
      const { container } = render(
        <MentorDetailPanel mentor={mentors[0]!} onClose={vi.fn()} />,
      );

      expect(hasElementWithAll(container, ["md:p-8"])).toBe(true);
      expect(hasElementWithAll(container, ["grid-cols-1", "sm:grid-cols-3"])).toBe(
        true,
      );
    });

    it("full /mentors page mounts and constrains content to max-w-7xl", () => {
      setViewport(width);
      const { container } = render(<MentorsPage />);

      expect(hasElementWithAll(container, ["max-w-7xl"])).toBe(true);
      expect(
        hasElementWithAll(container, [
          "grid-cols-1",
          "sm:grid-cols-2",
          "lg:grid-cols-3",
        ]),
      ).toBe(true);
    });
  },
);

/* -------------------------------------------------------------------------- */
/* /programs/kan and /programs/k-combinator (editorial)                        */
/* -------------------------------------------------------------------------- */

const EDITORIAL_PAGES = [
  { label: "KAN", Page: KanProgramPage },
  { label: "K-Combinator", Page: KCombinatorPage },
] as const;

describe.each(EDITORIAL_PAGES)(
  "$label editorial page responsive contracts",
  ({ Page }) => {
    it.each(VIEWPORTS)(
      "mounts and applies editorial responsive contracts at $name ($width px)",
      ({ width }) => {
        setViewport(width);
        const { container } = render(<Page />);

        // Every editorial section constrains content to max-w-7xl …
        expect(hasElementWithAll(container, ["max-w-7xl"])).toBe(true);
        // … and the overview/closing sections use py-16 / md:py-24 padding.
        expect(hasElementWithAll(container, ["py-16", "md:py-24"])).toBe(true);

        // "What the program provides" — single column on mobile, two at md+.
        expect(hasElementWithAll(container, ["grid-cols-1", "md:grid-cols-2"])).toBe(
          true,
        );

        // Application process — grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-4.
        expect(
          hasElementWithAll(container, [
            "grid-cols-1",
            "sm:grid-cols-2",
            "lg:grid-cols-4",
          ]),
        ).toBe(true);

        // Success stories (lazy → eager in jsdom) and partner network grids —
        // grid-cols-1 → sm/md → lg:grid-cols-3.
        expect(
          hasElementWithAll(container, ["grid-cols-1", "lg:grid-cols-3"]),
        ).toBe(true);
      },
    );
  },
);

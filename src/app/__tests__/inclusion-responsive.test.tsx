/**
 * Inclusion & Grassroots responsive audit (task 17.5) — Requirements 36.1,
 * 36.2, 36.3, 36.4, 36.5 (the mobile-first responsive contracts woven through
 * the three inclusion routes: /women, /csr, /ideas).
 *
 * jsdom does NOT perform real layout, so — exactly like the enablement suite's
 * `enablement-responsive.test.tsx`, the investor suite's
 * `investor-responsive.test.tsx`, and the dashboards' `dashboards-responsive`
 * tests — these tests cannot measure pixel overflow or computed widths.
 * Instead they assert the mobile-first responsive CONTRACTS that ARE observable
 * in jsdom via className inspection: the Tailwind class patterns that drive the
 * Viewport_Mobile (375px) → Viewport_Tablet (768px) → Viewport_Desktop
 * (1280px) behaviour. We reuse the same helper style as the sibling tests
 * (`allClassedElements` + `hasElementWithAll`).
 *
 * To exercise the three widths concretely, each route is rendered once per
 * viewport via `setViewport` (which sets `window.innerWidth` and a
 * width-aware `matchMedia` stub, then dispatches `resize`). jsdom does not
 * re-layout in response, but rendering at each width proves every surface
 * mounts without error at mobile / tablet / desktop, and the responsive class
 * signatures (which encode all breakpoints on a single element) are asserted
 * via substring inspection.
 *
 * Surfaces covered, per the three inclusion routes:
 *
 *   /women (WomenPage)
 *     - Hero strip            — bg-dark py-12, max-w-7xl inner container.
 *     - Editorial sections    — py-16 / md:py-24 rhythm, max-w-7xl containers.
 *     - 3-up card grids       — grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3
 *                               (featured founders, mentors).
 *     - max-w-3xl lede columns.
 *
 *   /csr (CsrPage)
 *     - Hero strip            — bg-dark py-12, max-w-7xl inner container.
 *     - Editorial sections    — max-w-7xl containers.
 *     - 3-up card grids       — grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3
 *                               (featured partnerships, NGO partners, metrics).
 *     - max-w-3xl lede columns.
 *
 *   /ideas (IdeasPage, wrapped in IdeaBankProvider)
 *     - Hero strip            — bg-dark py-12, max-w-7xl inner container.
 *     - Category 4×2 grid     — grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-4.
 *     - Submission form        — single column, max-w-3xl card.
 *     - Public ideas board    — grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3.
 *     - max-w-7xl containers.
 *
 * Rendering notes:
 *  - `/ideas` reaches for `useIdeaBank()` (wired globally via `IdeaBankProvider`
 *    in `layout.tsx`). Rendering the page component directly does NOT include
 *    the layout, so the `/ideas` render is wrapped in `IdeaBankProvider` — the
 *    same defensive pattern as `inclusion-a11y.test.tsx`.
 *  - The shared jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView /
 *    pointer capture) live in `src/test/setup.ts`; the inclusion routes render
 *    without an App Router provider (as the sibling a11y suite already proves).
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

import WomenPage from "@/app/women/page";
import CsrPage from "@/app/csr/page";
import IdeasPage from "@/app/ideas/page";
import { IdeaBankProvider } from "@/context/IdeaBankContext";

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
/* (identical in spirit to enablement-responsive.test.tsx)                     */
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
/* /women                                                                      */
/* -------------------------------------------------------------------------- */

describe.each(VIEWPORTS)(
  "Women route responsive contracts — $name ($width px)",
  ({ width }) => {
    it("mounts without error at this viewport", () => {
      setViewport(width);
      expect(() => render(<WomenPage />)).not.toThrow();
    });

    it("hero strip is a bg-dark py-12 band with a max-w-7xl inner container", () => {
      setViewport(width);
      const { container } = render(<WomenPage />);

      expect(hasElementWithAll(container, ["bg-dark", "py-12"])).toBe(true);
      expect(hasElementWithAll(container, ["max-w-7xl"])).toBe(true);
    });

    it("editorial sections use the py-16 / md:py-24 rhythm", () => {
      setViewport(width);
      const { container } = render(<WomenPage />);

      expect(hasElementWithAll(container, ["py-16", "md:py-24"])).toBe(true);
    });

    it("card grids step grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3", () => {
      setViewport(width);
      const { container } = render(<WomenPage />);

      expect(
        hasElementWithAll(container, [
          "grid-cols-1",
          "sm:grid-cols-2",
          "lg:grid-cols-3",
        ]),
      ).toBe(true);
    });

    it("lede columns are constrained to max-w-3xl", () => {
      setViewport(width);
      const { container } = render(<WomenPage />);

      expect(hasElementWithAll(container, ["max-w-3xl"])).toBe(true);
    });
  },
);

/* -------------------------------------------------------------------------- */
/* /csr                                                                        */
/* -------------------------------------------------------------------------- */

describe.each(VIEWPORTS)(
  "CSR route responsive contracts — $name ($width px)",
  ({ width }) => {
    it("mounts without error at this viewport", () => {
      setViewport(width);
      expect(() => render(<CsrPage />)).not.toThrow();
    });

    it("hero strip is a bg-dark py-12 band with a max-w-7xl inner container", () => {
      setViewport(width);
      const { container } = render(<CsrPage />);

      expect(hasElementWithAll(container, ["bg-dark", "py-12"])).toBe(true);
      expect(hasElementWithAll(container, ["max-w-7xl"])).toBe(true);
    });

    it("editorial sections use the py-16 / md:py-24 rhythm", () => {
      setViewport(width);
      const { container } = render(<CsrPage />);

      expect(hasElementWithAll(container, ["py-16", "md:py-24"])).toBe(true);
    });

    it("card grids step grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3", () => {
      setViewport(width);
      const { container } = render(<CsrPage />);

      expect(
        hasElementWithAll(container, [
          "grid-cols-1",
          "sm:grid-cols-2",
          "lg:grid-cols-3",
        ]),
      ).toBe(true);
    });

    it("lede columns are constrained to max-w-3xl", () => {
      setViewport(width);
      const { container } = render(<CsrPage />);

      expect(hasElementWithAll(container, ["max-w-3xl"])).toBe(true);
    });
  },
);

/* -------------------------------------------------------------------------- */
/* /ideas (wrapped in IdeaBankProvider)                                        */
/* -------------------------------------------------------------------------- */

/** Render `/ideas` wrapped in the session-only IdeaBankProvider (Req 3.9). */
function renderIdeasPage() {
  return render(
    <IdeaBankProvider>
      <IdeasPage />
    </IdeaBankProvider>,
  );
}

describe.each(VIEWPORTS)(
  "Ideas route responsive contracts — $name ($width px)",
  ({ width }) => {
    it("mounts without error at this viewport", () => {
      setViewport(width);
      expect(() => renderIdeasPage()).not.toThrow();
    });

    it("hero strip is a bg-dark py-12 band with a max-w-7xl inner container", () => {
      setViewport(width);
      const { container } = renderIdeasPage();

      expect(hasElementWithAll(container, ["bg-dark", "py-12"])).toBe(true);
      expect(hasElementWithAll(container, ["max-w-7xl"])).toBe(true);
    });

    it("category spotlight steps a 4×2 grid: grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-4", () => {
      setViewport(width);
      const { container } = renderIdeasPage();

      expect(
        hasElementWithAll(container, [
          "grid-cols-1",
          "sm:grid-cols-2",
          "lg:grid-cols-4",
        ]),
      ).toBe(true);
    });

    it("submission form is a single-column max-w-3xl card", () => {
      setViewport(width);
      const { container } = renderIdeasPage();

      expect(hasElementWithAll(container, ["max-w-3xl"])).toBe(true);
    });

    it("public ideas board steps grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3", () => {
      setViewport(width);
      const { container } = renderIdeasPage();

      expect(
        hasElementWithAll(container, [
          "grid-cols-1",
          "md:grid-cols-2",
          "lg:grid-cols-3",
        ]),
      ).toBe(true);
    });
  },
);

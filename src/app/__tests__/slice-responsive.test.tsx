/**
 * Slice responsive structural tests — Registration / Schemes / Calculator
 * (task 5.5).
 *
 * jsdom does NOT perform real layout, so — exactly like the foundation slice's
 * `responsive.test.tsx` — these tests cannot measure pixel overflow or computed
 * widths. Instead they assert the STRUCTURAL responsive CONTRACTS that ARE
 * observable in jsdom via className inspection: the mobile-first Tailwind class
 * patterns that drive the audited Viewport_Mobile (320px) vs Viewport_Desktop
 * (≥1024px) behaviour. We reuse the same helper style as the foundation test
 * (`allClassedElements` + `hasElementWithAll`).
 *
 * The four surfaces covered (per the task) and the contracts asserted:
 *
 *   1. Registration wizard — the narrower `max-w-3xl` container (Req 26.4
 *      exception) with mobile-first horizontal padding (`px-4 sm:px-6`).
 *   2. Schemes hub grid — the compact `py-12` dark hero, the `max-w-7xl` +
 *      `px-4 sm:px-6 lg:px-8` content container with `py-16 md:py-24` vertical
 *      rhythm (Req 26.3), and the mobile-first card grid that steps
 *      `grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3`.
 *   3. Scheme detail — the two-column / sticky-sidebar Viewport_Desktop layout
 *      collapsing to a single column with a sticky bottom action bar on
 *      Viewport_Mobile (Req 16.1): base `grid-cols-1` + `lg:grid-cols-[…]`,
 *      `lg:sticky` sidebar, and a `sticky bottom-0 … lg:hidden` action bar.
 *   4. Calculator — the same compact-hero + `max-w-7xl` `py-16 md:py-24`
 *      content contract, plus the entry card's mobile-first option grid
 *      (`grid … sm:grid-cols-2`).
 *
 * Lazy children: several of these surfaces code-split their inner views via
 * `next/dynamic({ ssr: false })` (the wizard steps, the hub's filters/compare
 * bar, the calculator's entry/results). Those chunks resolve asynchronously and
 * are NOT in the DOM on the initial synchronous render, so their classes are not
 * inspectable through the parent. Where a contract lives inside such a lazy
 * child (the calculator's option grid) we render the inner content component
 * DIRECTLY so its responsive signature is observable. Where the contract lives
 * on the eagerly-rendered shell (the wizard container, the hub grid, the detail
 * page layout, the calculator section shells) we inspect the shell directly.
 *
 * Mocks mirror `responsive.test.tsx` / `a11y.test.tsx`: `next/link` → plain
 * anchor, `next/navigation` → stub router (+ `notFound`/`useSearchParams` so the
 * server detail page and any compare helpers import cleanly). Real scheme data
 * from `src/data/schemes.ts` drives the scheme-detail cases.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import fc from "fast-check";

import { RegistrationProvider } from "@/context/RegistrationContext";
import { RegistrationWizard } from "@/components/registration/RegistrationWizard";
import { SchemesHub } from "@/components/schemes/SchemesHub";
import { Calculator } from "@/components/calculator/Calculator";
import { CalculatorEntry } from "@/components/calculator/CalculatorEntry";
import SchemeDetailPage from "@/app/schemes/[id]/page";
import { schemes } from "@/data/schemes";

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
  // The server detail page imports `notFound`; provide a throwing stub so any
  // accidental unresolved id surfaces loudly rather than silently passing.
  notFound: () => {
    throw new Error("notFound() called");
  },
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

beforeEach(() => {
  pushMock.mockClear();
});

/* -------------------------------------------------------------------------- */
/* Helpers — robust class-substring inspection over the rendered DOM          */
/* (identical in spirit to responsive.test.tsx)                               */
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

/* Render helpers — every slice surface reads RegistrationContext, so each is
 * wrapped in a fresh RegistrationProvider (Unregistered_State by default). */

function renderWithProvider(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<RegistrationProvider>{ui}</RegistrationProvider>);
}

/* -------------------------------------------------------------------------- */
/* 1. Registration wizard — narrow container + mobile-first padding           */
/* -------------------------------------------------------------------------- */

describe("Registration wizard responsive container", () => {
  it("uses the narrower max-w-3xl container with mobile-first horizontal padding (Req 26.4)", () => {
    const { container } = renderWithProvider(<RegistrationWizard />);

    // Req 26.4: the wizard is the documented exception to the max-w-7xl rule —
    // it constrains to max-w-3xl. Req 27/responsive: padding steps up px-4 →
    // sm:px-6 so it never crowds a 320px viewport.
    expect(
      hasElementWithAll(container, ["max-w-3xl", "px-4", "sm:px-6"]),
    ).toBe(true);
  });

  it("does not widen the wizard shell to the max-w-7xl content width", () => {
    const { container } = renderWithProvider(<RegistrationWizard />);

    // The centered wizard column must NOT use the wide content container; that
    // would defeat the readable-form width contract.
    const widened = allClassedElements(container).filter(
      (el) =>
        el.className.includes("max-w-7xl") && el.className.includes("mx-auto"),
    );
    expect(widened).toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/* 2. Schemes hub — hero, content container, and mobile-first card grid       */
/* -------------------------------------------------------------------------- */

describe("Schemes hub responsive layout", () => {
  it("renders the compact py-12 dark hero inside a max-w-7xl padded container", () => {
    const { container } = renderWithProvider(<SchemesHub />);

    // Req 26.3 exception: the compact hero uses py-12 (not py-16/md:py-24).
    expect(hasElementWithAll(container, ["bg-dark", "py-12"])).toBe(true);
    // Req 26.4: max-w-7xl content width with the mobile-first padding ladder.
    expect(
      hasElementWithAll(container, ["max-w-7xl", "px-4", "sm:px-6", "lg:px-8"]),
    ).toBe(true);
  });

  it("applies the py-16 → md:py-24 vertical rhythm to the content section (Req 26.3)", () => {
    const { container } = renderWithProvider(<SchemesHub />);
    expect(hasElementWithAll(container, ["py-16", "md:py-24"])).toBe(true);
  });

  it("authors the card grid mobile-first: grid-cols-1 → md:grid-cols-2 → lg:grid-cols-3", () => {
    const { container } = renderWithProvider(<SchemesHub />);

    // The grid renders eagerly (SchemeCard is a static import; only the filter
    // bar / compare bar are lazy), so its signature is directly inspectable.
    expect(
      hasElementWithAll(container, [
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3",
      ]),
    ).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* 3. Scheme detail — two-column / sticky sidebar vs single-column + sticky    */
/*    bottom bar (Req 16.1)                                                    */
/* -------------------------------------------------------------------------- */
//
// The detail layout is identical across schemes, but we quantify the contract
// over a representative set of REAL scheme ids (a fiscal scheme, a grant scheme,
// and a documented legacy alias) using fast-check to prove the layout resolves
// for every type. Renders are expensive, so each container is precomputed once
// and the property quantifies over the precomputed set ({ numRuns: 25 }).

interface DetailLayout {
  readonly id: string;
  readonly twoColumn: boolean; // base single column + lg two-column grid
  readonly stickySidebar: boolean; // lg:sticky sidebar (Viewport_Desktop)
  readonly mobileStickyBar: boolean; // sticky bottom-0 … lg:hidden bar
  readonly paddedContainer: boolean; // max-w-7xl + mobile-first padding
}

/** The route ids we exercise: a fiscal scheme, a grant scheme, and an alias. */
const DETAIL_IDS = ["sgst-reimbursement", "elevate", "kitven"] as const;

function collectDetailLayout(id: string): DetailLayout {
  const { container } = renderWithProvider(<SchemeDetailPage params={{ id }} />);

  const layout: DetailLayout = {
    id,
    // Single column on mobile, two columns on Viewport_Desktop. The desktop
    // track uses an explicit `lg:grid-cols-[…]` template, so we assert the
    // mobile base + the lg step-up co-exist on one element.
    twoColumn: allClassedElements(container).some(
      (el) =>
        el.className.includes("grid-cols-1") &&
        /lg:grid-cols-\[/.test(el.className),
    ),
    stickySidebar: hasElementWithAll(container, ["lg:sticky"]),
    // The mobile action bar is pinned to the bottom and hidden at lg (where the
    // sticky sidebar already carries Apply).
    mobileStickyBar: allClassedElements(container).some(
      (el) =>
        el.className.includes("sticky") &&
        el.className.includes("bottom-0") &&
        el.className.includes("lg:hidden"),
    ),
    paddedContainer: hasElementWithAll(container, [
      "max-w-7xl",
      "px-4",
      "sm:px-6",
      "lg:px-8",
    ]),
  };

  cleanup();
  return layout;
}

describe("Scheme detail responsive layout (Req 16.1)", () => {
  it("collapses two-column/sticky-sidebar desktop to single-column + sticky bottom bar mobile for every scheme type", () => {
    const layouts = DETAIL_IDS.map(collectDetailLayout);

    fc.assert(
      fc.property(fc.constantFrom(...layouts), (layout) => {
        expect(layout.twoColumn, `${layout.id}: two-column lg grid`).toBe(true);
        expect(layout.stickySidebar, `${layout.id}: lg:sticky sidebar`).toBe(
          true,
        );
        expect(
          layout.mobileStickyBar,
          `${layout.id}: sticky bottom-0 lg:hidden action bar`,
        ).toBe(true);
        expect(
          layout.paddedContainer,
          `${layout.id}: max-w-7xl padded container`,
        ).toBe(true);
      }),
      { numRuns: 25 },
    );
  });

  it("renders only ONE column track at the base (mobile) width", () => {
    const { container } = renderWithProvider(
      <SchemeDetailPage params={{ id: "elevate" }} />,
    );

    // The layout grid declares an unprefixed `grid-cols-1` so the editorial
    // column and sidebar stack vertically on Viewport_Mobile.
    const layoutGrid = allClassedElements(container).find((el) =>
      /lg:grid-cols-\[/.test(el.className),
    );
    expect(layoutGrid).toBeDefined();
    expect(layoutGrid?.className).toContain("grid-cols-1");
  });
});

/* -------------------------------------------------------------------------- */
/* 4. Calculator — compact hero + content rhythm, and the entry option grid    */
/* -------------------------------------------------------------------------- */

describe("Calculator responsive layout", () => {
  it("renders the compact py-12 hero and the max-w-7xl padded content section", () => {
    const { container } = renderWithProvider(<Calculator />);

    expect(hasElementWithAll(container, ["bg-dark", "py-12"])).toBe(true);
    expect(
      hasElementWithAll(container, ["max-w-7xl", "px-4", "sm:px-6", "lg:px-8"]),
    ).toBe(true);
  });

  it("applies the py-16 → md:py-24 vertical rhythm to the content section (Req 26.3)", () => {
    const { container } = renderWithProvider(<Calculator />);
    expect(hasElementWithAll(container, ["py-16", "md:py-24"])).toBe(true);
  });

  it("authors the entry option grid mobile-first (single column → sm:grid-cols-2)", () => {
    // CalculatorEntry is lazy-loaded (ssr:false) inside <Calculator/>, so its
    // option grid is not in the DOM on the synchronous render. We render the
    // inner content component DIRECTLY to inspect its responsive signature.
    const { container } = renderWithProvider(<CalculatorEntry />);

    // The two start-paths stack on mobile and sit side-by-side at sm+.
    expect(hasElementWithAll(container, ["grid", "sm:grid-cols-2"])).toBe(true);
    // The entry card itself uses the narrower centered max-w-2xl shell.
    expect(hasElementWithAll(container, ["mx-auto", "max-w-2xl"])).toBe(true);
  });
});

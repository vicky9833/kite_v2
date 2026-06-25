/**
 * Accessibility audit + property tests (task 5.5).
 *
 * This file runs an automated `axe-core` audit over a realistic render harness
 * that mirrors `RootLayout`'s body — `<SiteChrome /> + <main id="main"> +
 * <Footer />` — for three representative pages (the composed Home page, a
 * static stub page, and a dynamic cluster-detail page), and then encodes the
 * three accessibility correctness properties from the design (Properties 18–20).
 *
 * jsdom + axe notes:
 *  - The shared jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView /
 *    pointer capture) live in `src/test/setup.ts` and are reused here.
 *  - `next/link` is mocked to a plain anchor and `next/navigation`'s `useRouter`
 *    is mocked, following `src/components/layout/__tests__/layout.test.tsx`, so
 *    the client chrome (Header / CommandPalette) and the home sections that call
 *    `safeNavigate` render without an App Router provider.
 *  - The `color-contrast` axe rule is DISABLED: jsdom does not perform layout or
 *    resolve Tailwind/token colors, so it cannot compute contrast ratios.
 *    Contrast is instead guaranteed by the canonical design tokens (light text
 *    on `bg-dark`, dark text on `surface`/`card`) and verified separately in the
 *    visual QA pass. This is the only rule disabled.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, within, cleanup } from "@testing-library/react";
import fc from "fast-check";
import axe from "axe-core";

import { LanguageProvider } from "@/context/LanguageContext";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Footer } from "@/components/layout/Footer";
import Home from "@/app/page";
import AboutPage from "@/app/about/page";
import ClusterDetailPage from "@/app/clusters/[id]/page";

/* -------------------------------------------------------------------------- */
/* Module mocks (mirror layout.test.tsx)                                      */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so the harness renders without an App
// Router context provider (the audit only cares about hrefs / accessible names).
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

// Mock the App Router so the client sections that call `safeNavigate(useRouter())`
// render and never crash during the audit.
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

/* -------------------------------------------------------------------------- */
/* Render harness — mirrors RootLayout's body without <html>/<body>           */
/* -------------------------------------------------------------------------- */

/**
 * Mirrors the RootLayout body: the shared client chrome (single banner + the
 * one PRIMARY navigation), the single MAIN landmark wrapping the page content,
 * and the single CONTENTINFO footer. The floating AIAssistantButton is omitted
 * (it is not part of the landmark structure and is audited via the layout
 * tests). Wrapped in `LanguageProvider` for the Header/MobileNav toggle.
 */
function PageHarness({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <LanguageProvider>
      <SiteChrome />
      <main id="main">{children}</main>
      <Footer />
    </LanguageProvider>
  );
}

/** The composed Home page (all ten sections) inside the realistic harness. */
function renderHome(): ReturnType<typeof render> {
  return render(
    <PageHarness>
      <Home />
    </PageHarness>,
  );
}

/** A static stub page (About KITE) inside the harness. */
function renderStub(): ReturnType<typeof render> {
  return render(
    <PageHarness>
      <AboutPage />
    </PageHarness>,
  );
}

/** A dynamic detail page (clusters/[id] with id 'mysuru') inside the harness. */
function renderClusterDetail(): ReturnType<typeof render> {
  return render(
    <PageHarness>
      <ClusterDetailPage params={{ id: "mysuru" }} />
    </PageHarness>,
  );
}

/* -------------------------------------------------------------------------- */
/* axe configuration + helpers                                                */
/* -------------------------------------------------------------------------- */

// Only `color-contrast` is disabled — jsdom cannot compute layout/colors, so
// contrast is enforced via design tokens and verified in the visual QA pass.
const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    "color-contrast": { enabled: false },
  },
};

/** Run axe against a container and return a readable summary of any violations. */
async function auditViolations(container: HTMLElement): Promise<string[]> {
  const results = await axe.run(container, AXE_OPTIONS);
  return results.violations.map(
    (v) =>
      `${v.id} (${v.impact ?? "n/a"}): ${v.help} — ${v.nodes.length} node(s): ` +
      v.nodes.map((n) => n.target.join(" ")).join("; "),
  );
}

/**
 * Compute an element's accessible name following the (simplified) accessible
 * name algorithm precedence used by our controls: aria-labelledby → aria-label
 * → text content → title. Sufficient for the icon-only buttons, CTA links, and
 * role="link" cards in this slice (icons are all `aria-hidden`, contributing no
 * text).
 */
function accessibleName(el: Element): string {
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => el.ownerDocument?.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
    if (text) return text;
  }
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();
  const text = (el.textContent ?? "").trim();
  if (text) return text;
  const title = el.getAttribute("title");
  if (title && title.trim()) return title.trim();
  return "";
}

/** True when the element is hidden from assistive tech (self or ancestor). */
function isAriaHidden(el: Element): boolean {
  return el.closest('[aria-hidden="true"]') !== null;
}

/* -------------------------------------------------------------------------- */
/* 1. Automated axe audit per page                                            */
/* -------------------------------------------------------------------------- */

describe("axe-core audit (color-contrast disabled — enforced via tokens / visual QA)", () => {
  it("the composed Home page has zero violations", async () => {
    const { container } = renderHome();
    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, 30000);

  it("a static stub page (About KITE) has zero violations", async () => {
    const { container } = renderStub();
    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, 20000);

  it("a dynamic detail page (clusters/mysuru) has zero violations", async () => {
    const { container } = renderClusterDetail();
    const violations = await auditViolations(container);
    expect(violations).toEqual([]);
  }, 20000);
});

/* -------------------------------------------------------------------------- */
/* 2. Property 18 — Landmark uniqueness per page                              */
/* -------------------------------------------------------------------------- */
// Feature: kite-foundation-home, Property 18
//
// For any page harness, exactly one banner, one contentinfo, one main, and
// exactly one PRIMARY navigation landmark are exposed. We quantify over the set
// of available page harnesses (Home + a stub), precomputing each harness's
// landmark counts once (renders are expensive) and then asserting over them.

interface LandmarkCounts {
  readonly name: string;
  readonly banner: number;
  readonly contentinfo: number;
  readonly main: number;
  readonly primaryNav: number;
}

function collectLandmarkCounts(
  name: string,
  renderFn: () => ReturnType<typeof render>,
): LandmarkCounts {
  const { container } = renderFn();
  const scope = within(container);
  const counts: LandmarkCounts = {
    name,
    banner: scope.queryAllByRole("banner").length,
    contentinfo: scope.queryAllByRole("contentinfo").length,
    main: scope.queryAllByRole("main").length,
    // The PRIMARY navigation is the Header's `<nav aria-label="Primary">`.
    // (Radix NavigationMenu renders a nested, differently-identified nav; the
    // MobileNav's `<nav aria-label="Mobile">` is not in the tree while closed.)
    primaryNav: scope.queryAllByRole("navigation", { name: "Primary" }).length,
  };
  cleanup();
  return counts;
}

describe("Property 18: Landmark uniqueness per page", () => {
  it("exposes exactly one banner / contentinfo / main / primary navigation per page", () => {
    const harnessCounts: LandmarkCounts[] = [
      collectLandmarkCounts("home", renderHome),
      collectLandmarkCounts("stub", renderStub),
    ];

    fc.assert(
      fc.property(fc.constantFrom(...harnessCounts), (counts) => {
        expect(counts.banner, `${counts.name}: banner`).toBe(1);
        expect(counts.contentinfo, `${counts.name}: contentinfo`).toBe(1);
        expect(counts.main, `${counts.name}: main`).toBe(1);
        expect(counts.primaryNav, `${counts.name}: primary navigation`).toBe(1);
      }),
      { numRuns: 25 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* 3. Property 19 — Accessible names for label-less controls                  */
/* -------------------------------------------------------------------------- */
// Feature: kite-foundation-home, Property 19
//
// Every interactive control (button, link, icon-only control, role="link"/
// role="button" card) in the rendered Home harness exposes a non-empty
// accessible name. We collect the interactive elements once and quantify over
// that set.

interface ControlName {
  readonly description: string;
  readonly name: string;
}

function collectInteractiveControls(): ControlName[] {
  const { container } = renderHome();
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button, [role="link"], [role="button"]',
    ),
  );

  const controls: ControlName[] = [];
  const seen = new Set<HTMLElement>();
  for (const el of nodes) {
    if (seen.has(el)) continue;
    seen.add(el);
    // Controls hidden from assistive tech do not require an accessible name.
    if (isAriaHidden(el)) continue;
    const role = el.getAttribute("role") ?? el.tagName.toLowerCase();
    controls.push({
      description: `${role}#${controls.length}`,
      name: accessibleName(el),
    });
  }

  cleanup();
  return controls;
}

describe("Property 19: Accessible names for label-less controls", () => {
  it("every interactive control in the Home harness has a non-empty accessible name", () => {
    const controls = collectInteractiveControls();

    // Sanity: the harness really did render a meaningful set of controls.
    expect(controls.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...controls), (control) => {
        expect(
          control.name.length,
          `${control.description} is missing an accessible name`,
        ).toBeGreaterThan(0);
      }),
      { numRuns: 25 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* 4. Property 20 — Text alternatives and decorative marking                  */
/* -------------------------------------------------------------------------- */
// Feature: kite-foundation-home, Property 20
//
// Decorative flag spans (`.fi` from flag-icons) are marked `aria-hidden` AND
// have an adjacent visible text label (the country name); any meaningful
// non-text element has a non-empty alternative (no <img> without alt; every
// decorative <svg> icon is `aria-hidden` or carries an accessible name). We
// quantify the per-tile assertion over the rendered GIA tiles.

interface FlagTile {
  readonly code: string;
  readonly ariaHidden: boolean;
  readonly hasAdjacentLabel: boolean;
}

interface TextAltCollection {
  readonly tiles: FlagTile[];
  readonly imagesMissingAlt: number;
  readonly meaningfulSvgsWithoutName: number;
}

function collectTextAlternatives(): TextAltCollection {
  const { container } = renderHome();

  // Decorative flag spans (flag-icons) live one per GIA tile.
  const tiles: FlagTile[] = Array.from(
    container.querySelectorAll<HTMLElement>("span.fi"),
  ).map((flag, index) => {
    // The country name is a sibling element within the same tile wrapper.
    const wrapper = flag.parentElement;
    const labelText = wrapper
      ? // textContent of the wrapper excludes the (empty) flag span text.
        (wrapper.textContent ?? "").trim()
      : "";
    return {
      code: `flag#${index}`,
      ariaHidden: flag.getAttribute("aria-hidden") === "true",
      hasAdjacentLabel: labelText.length > 0,
    };
  });

  // No <img> may lack an alt attribute (meaningful images need a text alt;
  // decorative ones need alt="").
  const imagesMissingAlt = Array.from(
    container.querySelectorAll<HTMLImageElement>("img"),
  ).filter((img) => !img.hasAttribute("alt")).length;

  // Every <svg> icon must either be decorative (aria-hidden) or expose a name.
  const meaningfulSvgsWithoutName = Array.from(
    container.querySelectorAll<SVGElement>("svg"),
  ).filter((svg) => {
    if (isAriaHidden(svg)) return false;
    const hasName =
      (svg.getAttribute("aria-label") ?? "").trim().length > 0 ||
      (svg.getAttribute("aria-labelledby") ?? "").trim().length > 0 ||
      svg.querySelector("title") !== null;
    return !hasName;
  }).length;

  cleanup();
  return { tiles, imagesMissingAlt, meaningfulSvgsWithoutName };
}

describe("Property 20: Text alternatives and decorative marking", () => {
  it("decorative flags are aria-hidden with an adjacent text label; meaningful non-text elements have alternatives", () => {
    const { tiles, imagesMissingAlt, meaningfulSvgsWithoutName } =
      collectTextAlternatives();

    // The GIA density grid renders a tile (and therefore a flag) per country.
    expect(tiles.length).toBeGreaterThan(0);

    // No meaningful non-text element is left without an alternative.
    expect(imagesMissingAlt).toBe(0);
    expect(meaningfulSvgsWithoutName).toBe(0);

    fc.assert(
      fc.property(fc.constantFrom(...tiles), (tile) => {
        expect(
          tile.ariaHidden,
          `${tile.code}: decorative flag must be aria-hidden`,
        ).toBe(true);
        expect(
          tile.hasAdjacentLabel,
          `${tile.code}: flag must have an adjacent visible text label`,
        ).toBe(true);
      }),
      { numRuns: 25 },
    );
  });
});

/**
 * Performance polish tests — reduced-motion + lazy-load / CLS integration
 * (task 5.6, founder directive "5.6 performance polish").
 *
 * These are integration/component tests (not property-based). They cover the
 * three performance-relevant behaviours that ARE observable in jsdom:
 *
 *   1. LazySection's SSR / no-IntersectionObserver fallback — children render
 *      immediately so nothing is trapped behind a skeleton that never resolves
 *      (Req 22.4).
 *   2. LazySection's deferred path WITH an IntersectionObserver — it shows a
 *      `Skeleton` placeholder that reserves the configured `minHeight` (no CLS,
 *      Req 22.5), then swaps in the real children once the section intersects.
 *   3. Reduced-motion: StatCard is STATIC (count-up superseded), so it surfaces
 *      its final `displayValue` immediately regardless of motion preference;
 *      and the AI button's pulse is a CSS class whose disabling under
 *      `prefers-reduced-motion` lives entirely in globals.css (Req 6.2, 21.7,
 *      22.1).
 *
 * jsdom has NO real layout and NO `IntersectionObserver`; the polyfills
 * (matchMedia / ResizeObserver / scrollIntoView / pointer capture) live in
 * `src/test/setup.ts`. The `next/link` + `next/navigation` mocks mirror the
 * layout/sections test pattern.
 */

import * as React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";

import { LazySection } from "@/components/shared/LazySection";
import { StatCard } from "@/components/shared/StatCard";
import { AIAssistantButton } from "@/components/layout/AIAssistantButton";
import type { Stat } from "@/types";

/* -------------------------------------------------------------------------- */
/* Module mocks (mirror the layout/sections tests)                            */
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

/* -------------------------------------------------------------------------- */
/* A mock IntersectionObserver whose callback can be fired manually           */
/* -------------------------------------------------------------------------- */

type IntersectionEntryLike = { isIntersecting: boolean };
type IntersectionCallbackLike = (entries: IntersectionEntryLike[]) => void;

/**
 * Installs a mock `IntersectionObserver` on the global scope and returns a
 * handle that lets the test fire the captured observer callback manually. The
 * real LazySection captures this callback in its `useEffect`; firing it with
 * `isIntersecting: true` simulates the section scrolling into view.
 */
function installMockIntersectionObserver(): {
  trigger: (isIntersecting: boolean) => void;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
} {
  let captured: IntersectionCallbackLike | null = null;
  const observe = vi.fn();
  const unobserve = vi.fn();
  const disconnect = vi.fn();

  class MockIntersectionObserver {
    root = null;
    rootMargin = "";
    thresholds: number[] = [];
    constructor(cb: IntersectionCallbackLike) {
      captured = cb;
    }
    observe = observe;
    unobserve = unobserve;
    disconnect = disconnect;
    takeRecords = (): IntersectionEntryLike[] => [];
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

  return {
    observe,
    disconnect,
    trigger: (isIntersecting: boolean) => {
      if (!captured) {
        throw new Error("IntersectionObserver callback was never registered");
      }
      // State updates fired from outside React must be wrapped in act().
      act(() => {
        captured!([{ isIntersecting }]);
      });
    },
  };
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  pushMock.mockClear();
});

/* -------------------------------------------------------------------------- */
/* 1. LazySection — SSR / no-IntersectionObserver fallback                     */
/* -------------------------------------------------------------------------- */

describe("LazySection — no IntersectionObserver (jsdom default)", () => {
  it("renders children immediately when IntersectionObserver is unavailable", () => {
    // jsdom does not implement IntersectionObserver, and setup.ts does not
    // polyfill it — this is the documented SSR/no-IO fallback path.
    expect(typeof IntersectionObserver).toBe("undefined");

    render(
      <LazySection minHeight={560}>
        <div data-testid="eager-child">below-the-fold content</div>
      </LazySection>,
    );

    // Children are present without any intersection event.
    expect(screen.getByTestId("eager-child")).toBeInTheDocument();
    expect(screen.getByText("below-the-fold content")).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* 2. LazySection — deferred path WITH a (mock) IntersectionObserver           */
/* -------------------------------------------------------------------------- */

describe("LazySection — with IntersectionObserver", () => {
  it("defers children behind a minHeight skeleton, then swaps them in on intersect", () => {
    const io = installMockIntersectionObserver();
    expect(typeof IntersectionObserver).not.toBe("undefined");

    const { container } = render(
      <LazySection minHeight={560}>
        <div data-testid="deferred-child">flagship programs</div>
      </LazySection>,
    );

    // Initially the real children are NOT rendered — a skeleton stands in.
    expect(screen.queryByTestId("deferred-child")).not.toBeInTheDocument();

    // The wrapper reserves the configured minHeight so there is no layout shift
    // (CLS) when the children later swap in.
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.style.minHeight).toBe("560px");

    // The skeleton placeholder itself also carries the reserved minHeight.
    const skeleton = wrapper.querySelector(".animate-pulse") as HTMLElement;
    expect(skeleton).not.toBeNull();
    expect(skeleton.style.minHeight).toBe("560px");

    // The observer was wired up to the wrapper node.
    expect(io.observe).toHaveBeenCalledTimes(1);

    // Simulate the section scrolling into view → real children swap in.
    io.trigger(true);

    expect(screen.getByTestId("deferred-child")).toBeInTheDocument();
    expect(screen.getByText("flagship programs")).toBeInTheDocument();
    // Once visible, the observer is disconnected (no further work).
    expect(io.disconnect).toHaveBeenCalled();
  });

  it("keeps showing the skeleton until the section actually intersects", () => {
    installMockIntersectionObserver();

    render(
      <LazySection minHeight={480}>
        <div data-testid="still-deferred">social proof</div>
      </LazySection>,
    );

    // A non-intersecting callback must NOT reveal the children.
    // (No trigger fired — children remain deferred.)
    expect(screen.queryByTestId("still-deferred")).not.toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* 3. Reduced motion — StatCard is static; AI pulse is CSS-gated               */
/* -------------------------------------------------------------------------- */

describe("Reduced motion", () => {
  const sampleStat: Stat = {
    id: "dpiit-startups",
    label: "DPIIT-recognized startups",
    value: 21000,
    displayValue: "21,000+",
    source: "DPIIT",
    asOf: "2026",
  };

  it("StatCard shows its final displayValue immediately (no count-up animation)", () => {
    // StatCard is a static Server Component — the count-up was superseded, so
    // the final figure is on screen on first render regardless of any motion
    // preference (there is no intermediate animation state to settle).
    render(<StatCard stat={sampleStat} />);

    expect(screen.getByText("21,000+")).toBeInTheDocument();
    expect(screen.getByText(sampleStat.label)).toBeInTheDocument();
  });

  it("the AI button carries the CSS pulse class (disabled via globals.css under reduced motion)", () => {
    render(<AIAssistantButton />);

    const button = screen.getByRole("button", { name: "Ask KITE AI" });
    // The pulse/glow is applied purely as a CSS class. The actual disabling
    // under `prefers-reduced-motion` is a CSS-only rule in globals.css (a
    // `@media (prefers-reduced-motion: reduce)` block), which jsdom does not
    // evaluate — so asserting the class is present (and documenting that the
    // suppression is CSS-only) is the robust, non-brittle contract here.
    expect(button).toHaveClass("animate-ai-pulse");
  });
});

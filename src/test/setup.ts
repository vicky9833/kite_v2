// Vitest global setup.
// Makes @testing-library/jest-dom matchers (toBeInTheDocument, etc.) available
// to all tests and registers automatic React Testing Library cleanup.
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

/* -------------------------------------------------------------------------- */
/* jsdom polyfills for Radix UI + cmdk                                        */
/* -------------------------------------------------------------------------- */
// jsdom does not implement several DOM APIs that Radix primitives (Dialog,
// Sheet, NavigationMenu, Accordion) and cmdk rely on. Without these, opening an
// overlay, measuring a menu, or scrolling a highlighted command item throws and
// makes the interaction tests flaky. We install minimal, deterministic stubs.

// matchMedia — consulted by some Radix/animation code paths (e.g. reduced-motion).
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  });
}

// ResizeObserver — used by Radix NavigationMenu/ScrollArea to measure nodes.
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}

// Element.prototype.scrollIntoView — cmdk scrolls the highlighted item into view.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// Pointer capture APIs — Radix Dialog/Sheet call these during open/close.
if (typeof Element !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = vi.fn(() => false);
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = vi.fn();
  }
}

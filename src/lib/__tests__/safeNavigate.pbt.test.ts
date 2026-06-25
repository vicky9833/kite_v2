import { describe, expect, it, vi } from "vitest";
import fc from "fast-check";

// Mock sonner so the "unreachable destination" indication can be asserted
// without rendering a real toast. The mocked `toast` is a spy.
vi.mock("sonner", () => ({ toast: vi.fn() }));

import { toast } from "sonner";
import { isValidRoute, safeNavigate } from "@/lib/utils";

// Feature: kite-foundation-home, Property 1: Safe navigation rejects invalid destinations

/**
 * Arbitrary producing a wide variety of href inputs so the biconditional is
 * exercised across both the valid (internal route) and invalid (missing/empty/
 * malformed/external) halves of the input space.
 */
const hrefArbitrary: fc.Arbitrary<string | undefined | null> = fc.oneof(
  // Valid internal absolute paths: "/" + a single non-slash segment.
  fc
    .string({ minLength: 1 })
    .filter((s) => !s.includes("/"))
    .map((segment) => `/${segment}`),
  // Empty and whitespace-only strings.
  fc.constantFrom("", " ", "   ", "\t", "\n", "  \t \n "),
  // External URLs (http/https and arbitrary schemes).
  fc
    .tuple(
      fc.constantFrom("http", "https", "ftp", "mailto", "javascript"),
      fc.webSegment(),
    )
    .map(([scheme, rest]) => `${scheme}://${rest || "host"}`),
  // Protocol-relative URLs.
  fc.webSegment().map((host) => `//${host || "host"}`),
  // Relative paths that do not start with a leading slash.
  fc
    .string({ minLength: 1 })
    .filter((s) => !s.startsWith("/") && s.trim().length > 0),
  // Missing values.
  fc.constant(undefined),
  fc.constant(null),
);

describe("safeNavigate (Property 1: safe navigation rejects invalid destinations)", () => {
  it("navigates iff the href is a valid internal route, otherwise stays put and indicates unreachable", () => {
    fc.assert(
      fc.property(hrefArbitrary, (href) => {
        // Reset mocks between runs so call counts reflect this run only.
        const push = vi.fn();
        const router = { push };
        vi.mocked(toast).mockClear();

        const navigated = safeNavigate(router, href);

        const valid = typeof href === "string" && isValidRoute(href);

        if (valid) {
          // Valid route: navigated, pushed exactly once with the href,
          // and no "unreachable" indication surfaced.
          expect(navigated).toBe(true);
          expect(push).toHaveBeenCalledTimes(1);
          expect(push).toHaveBeenCalledWith(href);
          expect(toast).not.toHaveBeenCalled();
        } else {
          // Invalid/missing/empty href: did not navigate, stayed on the
          // current page (no push), and surfaced exactly one indication.
          expect(navigated).toBe(false);
          expect(push).not.toHaveBeenCalled();
          expect(toast).toHaveBeenCalledTimes(1);
        }
      }),
      { numRuns: 25 },
    );
  });
});

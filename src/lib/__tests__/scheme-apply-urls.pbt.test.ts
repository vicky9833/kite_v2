import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  DEFAULT_APPLY_URL,
  resolveApplyUrl,
} from "@/lib/scheme-apply-urls";
import { schemes } from "@/data/schemes";

// Feature: kite-registration-schemes-calculator, Property 2
//
// Property 2: Apply URL is always a valid external destination.
// For ANY scheme id — every real id from `src/data/schemes.ts` plus arbitrary
// strings — `resolveApplyUrl` returns a non-empty absolute https URL that is
// parseable by the WHATWG URL constructor. Mapped ids resolve to their
// documented portal; every unmapped id falls back to the default startup
// portal (Req 23.1–23.5).

const schemeIdArbitrary: fc.Arbitrary<string> = fc.oneof(
  fc.constantFrom(...schemes.map((s) => s.id)),
  fc.string(),
);

describe("resolveApplyUrl (Property 2: apply URL is always a valid external destination)", () => {
  it("always returns a non-empty https URL parseable by new URL(...)", () => {
    fc.assert(
      fc.property(schemeIdArbitrary, (id) => {
        const url = resolveApplyUrl(id);

        // Non-empty string.
        expect(typeof url).toBe("string");
        expect(url.length).toBeGreaterThan(0);

        // Absolute https destination.
        expect(url.startsWith("https://")).toBe(true);

        // Parseable as a real URL with an https protocol.
        const parsed = new URL(url);
        expect(parsed.protocol).toBe("https:");
        expect(parsed.hostname.length).toBeGreaterThan(0);
      }),
      { numRuns: 25 },
    );
  });

  // Documented mappings (Req 23.2–23.5) as concrete examples.
  it("maps the KITVEN id to its official portal", () => {
    expect(resolveApplyUrl("kitven-fund-5")).toBe("https://kitven.in");
  });

  it("maps the KAN id to its official portal", () => {
    expect(resolveApplyUrl("kan")).toBe(
      "https://karnatakadigital.in/acceleration-network",
    );
  });

  it("maps the ELEVATE id(s) to the ELEVATE portal", () => {
    expect(resolveApplyUrl("elevate")).toBe(
      "https://eitbt.karnataka.gov.in/elevate",
    );
    expect(resolveApplyUrl("elevate-unnati")).toBe(
      "https://eitbt.karnataka.gov.in/elevate",
    );
  });

  it("falls back to the default startup portal for an arbitrary unknown id", () => {
    expect(resolveApplyUrl("this-id-does-not-exist")).toBe(
      "https://eitbt.karnataka.gov.in/startup",
    );
    expect(resolveApplyUrl("this-id-does-not-exist")).toBe(DEFAULT_APPLY_URL);
  });
});

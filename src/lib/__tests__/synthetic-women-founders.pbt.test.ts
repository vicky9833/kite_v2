// src/lib/__tests__/synthetic-women-founders.pbt.test.ts
//
// Property-based tests for the synthetic women-founder showcase module.

import { afterEach, describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import {
  generateWomenFounder,
  generateWomenFounders,
} from "@/lib/synthetic-women-founders";

describe("synthetic-women-founders", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Feature: kite-inclusion-grassroots, Property 6
  // generateWomenFounders() returns EXACTLY 6 cards, and every editorial field
  // (name, company, sector, stage, pitch, initials avatar) is non-empty.
  it("Property 6: exactly 6 well-formed founder cards", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const founders = generateWomenFounders();

        // Exactly 6 cards (Req 5.1).
        expect(founders).toHaveLength(6);

        for (const founder of founders) {
          // Every field non-empty.
          expect(founder.id.trim().length).toBeGreaterThan(0);
          expect(founder.name.trim().length).toBeGreaterThan(0);
          expect(founder.company.trim().length).toBeGreaterThan(0);
          expect(founder.sector.trim().length).toBeGreaterThan(0);
          expect(founder.stage.trim().length).toBeGreaterThan(0);
          expect(founder.pitch.trim().length).toBeGreaterThan(0);

          // initials avatar: 1–2 uppercase letters, never a photo.
          expect(founder.initialsAvatar).toMatch(/^[A-Z]{1,2}$/);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-inclusion-grassroots, Property 7
  // Deterministic & ambient-free: repeated calls deep-equal, and the generator
  // never consults Math.random or the system clock (time-independence).
  it("Property 7: deterministic & ambient-free", () => {
    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not be used by synthetic women founders");
    });

    // Byte-stable across repeated calls, regardless of the system clock.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const showcaseEarly = generateWomenFounders();
    vi.setSystemTime(new Date("2099-12-31T23:59:59Z"));
    const showcaseLate = generateWomenFounders();
    vi.useRealTimers();
    expect(showcaseLate).toEqual(showcaseEarly);
    expect(generateWomenFounders()).toEqual(generateWomenFounders());

    // Determinism for arbitrary keys: same key -> deep-equal card, independent
    // of call order.
    fc.assert(
      fc.property(fc.string(), (key) => {
        expect(generateWomenFounder(key)).toEqual(generateWomenFounder(key));
      }),
      { numRuns: 100 },
    );

    expect(randomSpy).not.toHaveBeenCalled();
  });
});

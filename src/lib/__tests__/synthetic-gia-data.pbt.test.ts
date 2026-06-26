// src/lib/__tests__/synthetic-gia-data.pbt.test.ts
//
// Property-based tests for the synthetic GIA per-country module.
// Feature: kite-events-gia-assistant-support, Property 3

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  generateBilateralPrograms,
  generateCountryStartupEngagements,
  generateCountrySuccessStories,
  generateRecentEngagements,
} from "@/lib/synthetic-gia-data";
import { giaCountries } from "@/data/gia-countries";

describe("synthetic-gia-data", () => {
  afterEach(() => vi.restoreAllMocks());

  // Property 3: per-country counts and determinism for every verified code
  it("Property 3: per-country synthetic counts & determinism", () => {
    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not be used");
    });

    for (const country of giaCountries) {
      const code = country.countryCode;

      const programs = generateBilateralPrograms(code);
      expect(programs.length).toBeGreaterThanOrEqual(3);
      expect(programs.length).toBeLessThanOrEqual(5);
      expect(generateBilateralPrograms(code)).toEqual(programs);

      const stories = generateCountrySuccessStories(code);
      expect(stories.length).toBeGreaterThanOrEqual(2);
      expect(stories.length).toBeLessThanOrEqual(3);
      expect(generateCountrySuccessStories(code)).toEqual(stories);

      const engagements = generateCountryStartupEngagements(code);
      expect(engagements.length).toBe(6);
      expect(generateCountryStartupEngagements(code)).toEqual(engagements);

      // well-formedness
      for (const p of programs) {
        expect(p.name.trim().length).toBeGreaterThan(0);
        expect(p.focusArea.trim().length).toBeGreaterThan(0);
        expect(Number.isInteger(p.sinceYear)).toBe(true);
      }
    }

    expect(randomSpy).not.toHaveBeenCalled();
  });

  it("recent engagements: 12–15, deterministic, valid codes", () => {
    const recent = generateRecentEngagements();
    expect(recent.length).toBeGreaterThanOrEqual(12);
    expect(recent.length).toBeLessThanOrEqual(15);
    expect(generateRecentEngagements()).toEqual(recent);
    const validCodes = new Set(giaCountries.map((c) => c.countryCode.toLowerCase()));
    for (const r of recent) {
      expect(validCodes.has(r.countryCode)).toBe(true);
      expect(r.title.trim().length).toBeGreaterThan(0);
    }
  });
});

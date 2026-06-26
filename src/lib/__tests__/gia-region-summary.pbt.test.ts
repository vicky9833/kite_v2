// src/lib/__tests__/gia-region-summary.pbt.test.ts
// Feature: kite-events-gia-assistant-support, Property 4

import { describe, it, expect } from "vitest";
import { buildRegionSummaries } from "@/lib/gia-region-summary";
import { giaCountries } from "@/data/gia-countries";

describe("gia-region-summary", () => {
  // Property 4: region summary conservation
  it("Property 4: counts sum to input length; each region appears once", () => {
    const summaries = buildRegionSummaries(giaCountries);
    const total = summaries.reduce((sum, s) => sum + s.countryCount, 0);
    expect(total).toBe(giaCountries.length);

    const regions = summaries.map((s) => s.region);
    expect(new Set(regions).size).toBe(regions.length);

    // Every region present in the data appears in the summary.
    const dataRegions = new Set(giaCountries.map((c) => c.region));
    for (const region of dataRegions) {
      expect(regions).toContain(region);
    }

    for (const s of summaries) {
      expect(s.countryCount).toBeGreaterThan(0);
      expect(Array.isArray(s.focusAreas)).toBe(true);
    }
  });
});

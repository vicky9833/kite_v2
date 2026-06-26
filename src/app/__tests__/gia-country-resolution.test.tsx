// src/app/__tests__/gia-country-resolution.test.tsx
//
// Feature: kite-events-gia-assistant-support
// Verifies the GIA country dynamic route resolves all 32 verified codes and
// that generateStaticParams pre-renders every code.

import { describe, it, expect } from "vitest";
import { generateStaticParams } from "@/app/gia/[country]/page";
import { giaCountries } from "@/data/gia-countries";

describe("/gia/[country] resolution", () => {
  it("generateStaticParams returns all 32 verified codes (lowercase)", () => {
    const params = generateStaticParams();
    expect(params.length).toBe(giaCountries.length);
    expect(params.length).toBe(32);

    const codes = new Set(params.map((p) => p.country));
    for (const country of giaCountries) {
      expect(codes.has(country.countryCode.toLowerCase())).toBe(true);
    }
    // all params are lowercase
    for (const p of params) {
      expect(p.country).toBe(p.country.toLowerCase());
    }
  });

  it("every code is unique", () => {
    const params = generateStaticParams();
    const codes = params.map((p) => p.country);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

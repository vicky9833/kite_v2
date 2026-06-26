// src/lib/__tests__/kite-assistant-rules.pbt.test.ts
// Feature: kite-events-gia-assistant-support, Property 5

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  extractRouteSuggestions,
  generateRuleResponse,
} from "@/lib/kite-assistant-rules";

describe("kite-assistant-rules", () => {
  // Property 5: totality & determinism
  it("Property 5: always returns non-empty text deterministically", () => {
    fc.assert(
      fc.property(fc.string(), (message) => {
        const a = generateRuleResponse(message);
        const b = generateRuleResponse(message);
        expect(a).toEqual(b);
        expect(a.text.trim().length).toBeGreaterThan(0);
        expect(Array.isArray(a.suggestions)).toBe(true);
        for (const s of a.suggestions) {
          expect(s.href.startsWith("/")).toBe(true);
          expect(s.label.trim().length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("routes families to the correct surfaces", () => {
    expect(generateRuleResponse("How do I register?").suggestions.map((s) => s.href)).toContain(
      "/register",
    );
    expect(generateRuleResponse("am I eligible").suggestions.map((s) => s.href)).toContain(
      "/calculator",
    );
    expect(generateRuleResponse("tell me about ELEVATE").suggestions.map((s) => s.href)).toContain(
      "/schemes/elevate",
    );
    expect(generateRuleResponse("KITVEN fund").suggestions.map((s) => s.href)).toContain(
      "/schemes/kitven",
    );
    expect(generateRuleResponse("Mangaluru cluster").suggestions.map((s) => s.href)).toContain(
      "/clusters",
    );
    expect(generateRuleResponse("women founders").suggestions.map((s) => s.href)).toContain(
      "/women",
    );
    expect(generateRuleResponse("international markets gia").suggestions.map((s) => s.href)).toContain(
      "/gia",
    );
  });

  it("unmatched message returns the default with /schemes, /register, /support", () => {
    const res = generateRuleResponse("zzzz qqqq nonsense");
    const hrefs = res.suggestions.map((s) => s.href);
    expect(hrefs).toEqual(["/schemes", "/register", "/support"]);
  });

  it("extractRouteSuggestions finds known routes in free text", () => {
    const chips = extractRouteSuggestions("See /register and then /schemes for details.");
    const hrefs = chips.map((c) => c.href);
    expect(hrefs).toContain("/register");
    expect(hrefs).toContain("/schemes");
  });
});

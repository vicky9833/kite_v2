// src/lib/__tests__/ai-assistant-system-prompt.test.ts
// Feature: kite-events-gia-assistant-support, Property 6

import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/ai-assistant-system-prompt";
import { schemes } from "@/data/schemes";
import { clusters } from "@/data/clusters";

describe("ai-assistant-system-prompt", () => {
  // Property 6: system prompt completeness + purity
  it("Property 6: contains every canonical headline figure", () => {
    const prompt = buildSystemPrompt();
    expect(buildSystemPrompt()).toBe(prompt); // pure / stable

    for (const fragment of [
      "21,000+",
      "183 soonicorns",
      "$79B",
      "730+",
      "22 schemes",
      "6 Beyond Bengaluru clusters",
      "32 Global Innovation Alliance",
      "16 Centres of Excellence",
      "eitbt.karnataka.gov.in/startup",
    ]) {
      expect(prompt).toContain(fragment);
    }
  });

  it("lists all 22 schemes and all 6 clusters", () => {
    const prompt = buildSystemPrompt();
    for (const s of schemes) {
      expect(prompt).toContain(s.name);
    }
    for (const c of clusters) {
      expect(prompt).toContain(c.name);
    }
  });
});

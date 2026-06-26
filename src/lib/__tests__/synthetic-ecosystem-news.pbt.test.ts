// src/lib/__tests__/synthetic-ecosystem-news.pbt.test.ts
// v1.0.1 polish patch — ecosystem news carousel data

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  ECOSYSTEM_NEWS_COUNT,
  generateEcosystemNews,
} from "@/lib/synthetic-ecosystem-news";

const CATEGORIES = ["Funding", "Policy", "Partnership", "Achievement", "Event", "Recognition"];

describe("synthetic-ecosystem-news", () => {
  afterEach(() => vi.restoreAllMocks());

  it("returns exactly ECOSYSTEM_NEWS_COUNT items, deterministically", () => {
    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not be used");
    });
    const a = generateEcosystemNews();
    const b = generateEcosystemNews();
    expect(a).toEqual(b);
    expect(a.length).toBe(ECOSYSTEM_NEWS_COUNT);
    expect(a.length).toBe(8);
    expect(randomSpy).not.toHaveBeenCalled();
  });

  it("every item is well-formed with a valid category and internal href", () => {
    for (const item of generateEcosystemNews()) {
      expect(item.headline.trim().length).toBeGreaterThan(0);
      expect(item.summary.trim().length).toBeGreaterThan(0);
      expect(item.dateRelative.trim().length).toBeGreaterThan(0);
      expect(CATEGORIES).toContain(item.category);
      expect(item.href.startsWith("/")).toBe(true);
    }
  });

  it("has unique ids", () => {
    const ids = generateEcosystemNews().map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

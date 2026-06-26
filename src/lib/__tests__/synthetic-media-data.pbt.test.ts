// src/lib/__tests__/synthetic-media-data.pbt.test.ts
//
// Property-based tests for the synthetic media & announcements module.
// Feature: kite-events-gia-assistant-support, Properties 1 & 2

import { afterEach, describe, it, expect, vi } from "vitest";
import {
  generateAnnouncements,
  generatePressMentions,
} from "@/lib/synthetic-media-data";

describe("synthetic-media-data", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Property 1: press mentions well-formed + deterministic + ambient-free
  it("Property 1: press mentions 12–18, well-formed, deterministic", () => {
    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not be used");
    });

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const early = generatePressMentions();
    vi.setSystemTime(new Date("2099-12-31T23:59:59Z"));
    const late = generatePressMentions();
    vi.useRealTimers();

    expect(late).toEqual(early);
    expect(generatePressMentions()).toEqual(generatePressMentions());

    const mentions = generatePressMentions();
    expect(mentions.length).toBeGreaterThanOrEqual(12);
    expect(mentions.length).toBeLessThanOrEqual(18);
    const ids = new Set(mentions.map((m) => m.id));
    expect(ids.size).toBe(mentions.length);
    for (const m of mentions) {
      expect(m.publication.trim().length).toBeGreaterThan(0);
      expect(m.headline.trim().length).toBeGreaterThan(0);
      expect(m.excerpt.trim().length).toBeGreaterThan(0);
      expect(m.dateLabel.trim().length).toBeGreaterThan(0);
      expect(["major-press", "business-press", "tech-press", "international-press"]).toContain(
        m.publicationType,
      );
    }
    expect(randomSpy).not.toHaveBeenCalled();
  });

  // Property 2: announcements well-formed + deterministic
  it("Property 2: announcements 8–12, well-formed, deterministic", () => {
    expect(generateAnnouncements()).toEqual(generateAnnouncements());
    const announcements = generateAnnouncements();
    expect(announcements.length).toBeGreaterThanOrEqual(8);
    expect(announcements.length).toBeLessThanOrEqual(12);
    for (const a of announcements) {
      expect(a.title.trim().length).toBeGreaterThan(0);
      expect(a.department.trim().length).toBeGreaterThan(0);
      expect(a.summary.trim().length).toBeGreaterThan(0);
      expect(a.sourceHref).toContain("eitbt.karnataka.gov.in");
    }
  });
});

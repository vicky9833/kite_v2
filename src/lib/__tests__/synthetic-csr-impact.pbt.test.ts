// src/lib/__tests__/synthetic-csr-impact.pbt.test.ts
//
// Property-based tests for the synthetic CSR impact metrics module.

import { afterEach, describe, it, expect, vi } from "vitest";
import fc from "fast-check";
import { generateCsrImpactMetrics } from "@/lib/synthetic-csr-impact";

describe("synthetic-csr-impact", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Feature: kite-inclusion-grassroots, Property 7
  // generateCsrImpactMetrics() returns EXACTLY 3 CsrImpactMetric records; each
  // has a non-empty id, a non-empty label, a finite numeric value, and a
  // non-empty unit.
  it("Property 7: exactly 3 well-formed CSR impact metrics", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const metrics = generateCsrImpactMetrics();

        // Exactly 3 records (Req 5.5).
        expect(metrics).toHaveLength(3);

        for (const metric of metrics) {
          expect(metric.id.trim().length).toBeGreaterThan(0);
          expect(metric.label.trim().length).toBeGreaterThan(0);

          // value is a finite number.
          expect(typeof metric.value).toBe("number");
          expect(Number.isFinite(metric.value)).toBe(true);

          expect(String(metric.unit).trim().length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-inclusion-grassroots, Property 7
  // Deterministic & ambient-free: repeated calls deep-equal, even across a faked
  // system clock and after a Math.random perturbation. The generator never
  // consults Math.random or the system clock.
  it("Property 7: deterministic & ambient-free", () => {
    const randomSpy = vi.spyOn(Math, "random").mockImplementation(() => {
      throw new Error("Math.random must not be used by synthetic CSR impact metrics");
    });

    // Byte-stable across repeated calls, regardless of the system clock.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const metricsEarly = generateCsrImpactMetrics();
    vi.setSystemTime(new Date("2099-12-31T23:59:59Z"));
    const metricsLate = generateCsrImpactMetrics();
    vi.useRealTimers();

    expect(metricsLate).toEqual(metricsEarly);
    expect(generateCsrImpactMetrics()).toEqual(generateCsrImpactMetrics());

    // Determinism across arbitrary call counts / interleavings.
    fc.assert(
      fc.property(fc.nat({ max: 5 }), () => {
        expect(generateCsrImpactMetrics()).toEqual(generateCsrImpactMetrics());
      }),
      { numRuns: 100 },
    );

    expect(randomSpy).not.toHaveBeenCalled();
  });
});

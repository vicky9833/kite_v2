// Feature: kite-dashboards, Property 1
//
// Property 1: PRNG determinism and range bounds.
// For any string key and any integer bounds min <= max: seededRng(key) produces
// an identical sequence on every call; every value of mulberry32(seed)() lies in
// [0, 1); seededInt(rng, min, max) lies in [min, max]; and seededPick / seededShuffle
// return only elements of (and a permutation of) the input.
//
// Validates: Requirements 24.3, 24.4

import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  mulberry32,
  seededInt,
  seededPick,
  seededRng,
  seededShuffle,
} from "@/lib/synthetic-prng";

const RUNS = { numRuns: 100 } as const;

/** Draw N consecutive values from a generator into an array. */
function draw(rng: () => number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(rng());
  return out;
}

/** Multiset equality (sorted comparison) — used to assert permutations. */
function sameMultiset<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

describe("Property 1: PRNG determinism and range bounds", () => {
  it("seededRng(key) is deterministic: same key -> identical sequence", () => {
    fc.assert(
      fc.property(fc.string(), fc.integer({ min: 1, max: 64 }), (key, n) => {
        const seqA = draw(seededRng(key), n);
        const seqB = draw(seededRng(key), n);
        expect(seqA).toEqual(seqB);
      }),
      RUNS,
    );
  });

  it("mulberry32 outputs lie in [0, 1)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0xffffffff }),
        fc.integer({ min: 1, max: 64 }),
        (seed, n) => {
          const values = draw(mulberry32(seed), n);
          for (const v of values) {
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThan(1);
          }
        },
      ),
      RUNS,
    );
  });

  it("seededInt(rng, min, max) lies in [min, max] for min <= max", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer({ min: -1000, max: 1000 }),
        fc.integer({ min: 0, max: 2000 }),
        fc.integer({ min: 1, max: 32 }),
        (key, min, span, draws) => {
          const max = min + span; // guarantees min <= max
          const rng = seededRng(key);
          for (let i = 0; i < draws; i++) {
            const v = seededInt(rng, min, max);
            expect(Number.isInteger(v)).toBe(true);
            expect(v).toBeGreaterThanOrEqual(min);
            expect(v).toBeLessThanOrEqual(max);
          }
        },
      ),
      RUNS,
    );
  });

  it("seededPick returns an element of the input", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.array(fc.integer(), { minLength: 1, maxLength: 50 }),
        (key, items) => {
          const rng = seededRng(key);
          const picked = seededPick(rng, items);
          expect(items).toContain(picked);
        },
      ),
      RUNS,
    );
  });

  it("seededShuffle returns a permutation and a NEW array (no mutation)", () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.array(fc.integer(), { minLength: 0, maxLength: 50 }),
        (key, items) => {
          const original = [...items];
          const rng = seededRng(key);
          const shuffled = seededShuffle(rng, items);
          // permutation of the input
          expect(sameMultiset(shuffled, original)).toBe(true);
          // input was not mutated
          expect(items).toEqual(original);
          // a new array instance is returned
          expect(shuffled).not.toBe(items);
        },
      ),
      RUNS,
    );
  });
});

// src/lib/synthetic-prng.ts
//
// Shared pure pseudo-random number generator for KITE dashboards.
//
// ===========================================================================
// Determinism contract (Req 24.3, 24.4, 24.7)
// ---------------------------------------------------------------------------
//  - Output depends ONLY on the input string key (and the explicit arguments
//    passed to the derived helpers).
//  - The same key produces an identical sequence on every call, in every
//    process, on every reload — the synthetic dashboard preview is byte-stable.
//  - There is NO use of `Math.random`, `Date`, `Date.now`, `performance.now`,
//    locale, environment, or any other ambient/time-dependent input.
//  - Every derived helper guarantees its stated output range for any `rng()`
//    value in `[0, 1)`.
//
// `xmur3` hashes a string into a 32-bit seed; `mulberry32` turns a seed into a
// deterministic `() => number` generator producing values in `[0, 1)`.
// ===========================================================================

/**
 * xmur3 string hash. Returns a function that, when called, advances and yields
 * a 32-bit unsigned integer derived solely from `str`. Used to seed
 * {@link mulberry32}.
 */
export function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/**
 * mulberry32 PRNG. Given a 32-bit seed, returns a deterministic generator
 * producing numbers in `[0, 1)`.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; // [0,1)
  };
}

/**
 * Build a seeded RNG from a string key. The same key always yields the same
 * sequence (see the module's determinism contract).
 */
export function seededRng(key: string): () => number {
  return mulberry32(xmur3(key)());
}

/**
 * Seeded integer in the inclusive range `[min, max]`. The result is clamped to
 * `[min, max]` so even a (theoretical) `rng()` of exactly `1` cannot overflow
 * the upper bound. Assumes `min <= max`.
 */
export function seededInt(rng: () => number, min: number, max: number): number {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  const value = lo + Math.floor(rng() * (hi - lo + 1));
  return Math.max(lo, Math.min(hi, value));
}

/** Seeded float in the range `[min, max)` (or `[min, max]` only at `min === max`). */
export function seededFloat(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

/**
 * Pick one element from `items` deterministically. `items` must be non-empty;
 * the returned element is always a member of `items`.
 */
export function seededPick<T>(rng: () => number, items: readonly T[]): T {
  const index = seededInt(rng, 0, items.length - 1);
  // `index` is guaranteed in [0, length-1] by seededInt, so this access is safe.
  return items[index] as T;
}

/**
 * Fisher–Yates shuffle. Returns a NEW array that is a permutation of `items`
 * (the input is never mutated).
 */
export function seededShuffle<T>(rng: () => number, items: readonly T[]): T[] {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = seededInt(rng, 0, i);
    // i and j are both in [0, result.length-1], so these accesses are safe.
    const tmp = result[i] as T;
    result[i] = result[j] as T;
    result[j] = tmp;
  }
  return result;
}

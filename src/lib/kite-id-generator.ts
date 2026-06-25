/**
 * Pure KITE ID generator.
 *
 * Generates session-scoped startup identifiers of the form `KITE-YYYY-XXXXXX`,
 * where `YYYY` is the calendar year and `XXXXXX` is a six-character suffix drawn
 * from an unambiguous alphabet (look-alike characters O, 0, I, and 1 are
 * excluded so IDs are easy to read aloud and transcribe).
 *
 * This module is pure: no React, no side effects, no async, no external
 * dependencies. The same `rng`/`year` inputs always produce the same output.
 */

/** Unambiguous alphabet: A–Z + 2–9, EXCLUDING look-alikes O, 0, I, 1. (32 chars) */
export const KITE_ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Matches a well-formed KITE ID: `KITE-YYYY-XXXXXX`. */
export const KITE_ID_PATTERN =
  /^KITE-\d{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

/** Random number generator returning a float in the half-open interval [0, 1). */
export type Rng = () => number;

/**
 * Generate a KITE ID.
 *
 * Deterministic given an injected `rng` and `year`, which makes it fully
 * testable. Defaults to `Math.random` and the current calendar year.
 *
 * @param rng  Source of randomness returning [0, 1). Defaults to `Math.random`.
 * @param year Four-digit calendar year. Defaults to the current year.
 * @returns A string of the form `KITE-YYYY-XXXXXX`.
 */
export function generateKiteId(
  rng: Rng = Math.random,
  year: number = new Date().getFullYear(),
): string {
  const length = KITE_ID_ALPHABET.length;
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    // Map rng() in [0, 1) to a valid index, clamped defensively against
    // out-of-range rng implementations (e.g. returning exactly 1 or NaN).
    const raw = Math.floor(rng() * length);
    const index = Math.min(Math.max(raw, 0), length - 1);
    suffix += KITE_ID_ALPHABET[index];
  }
  return `KITE-${year}-${suffix}`;
}

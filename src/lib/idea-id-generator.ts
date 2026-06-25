/**
 * Pure idea ID generator.
 *
 * Generates session-scoped idea identifiers of the form `IDEA-YYYY-XXXXXX`,
 * where `YYYY` is the calendar year and `XXXXXX` is a six-character suffix drawn
 * from an unambiguous alphabet (look-alike characters O, 0, I, and 1 are
 * excluded so IDs are easy to read aloud and transcribe).
 *
 * A near-copy of `investor-id-generator.ts`, swapping the `INV` prefix for
 * `IDEA` and reusing the same unambiguous 32-char alphabet.
 *
 * This module is pure: no React, no side effects, no async, no external
 * dependencies. The same `rng`/`year` inputs always produce the same output.
 */

/** Unambiguous alphabet: A–Z + 2–9, EXCLUDING look-alikes O, 0, I, 1. (32 chars) */
export const IDEA_ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Matches a well-formed idea id: `IDEA-YYYY-XXXXXX`. */
export const IDEA_ID_PATTERN =
  /^IDEA-\d{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

/** Random number generator returning a float in the half-open interval [0, 1). */
export type Rng = () => number;

/**
 * Generate an idea ID.
 *
 * Deterministic given an injected `rng` and `year`, which makes it fully
 * testable. Defaults to `Math.random` and the current calendar year. Each
 * suffix char maps `rng()` in [0, 1) to a clamped alphabet index, so an
 * out-of-range rng (e.g. exactly 1, negative, or NaN) cannot overflow.
 *
 * @param rng  Source of randomness returning [0, 1). Defaults to `Math.random`.
 * @param year Four-digit calendar year. Defaults to the current year.
 * @returns A string of the form `IDEA-YYYY-XXXXXX`.
 */
export function generateIdeaId(
  rng: Rng = Math.random,
  year: number = new Date().getFullYear(),
): string {
  const length = IDEA_ID_ALPHABET.length;
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    // Map rng() in [0, 1) to a valid index, clamped defensively against
    // out-of-range rng implementations (e.g. returning exactly 1 or NaN).
    const raw = Math.floor(rng() * length);
    // Coerce non-finite results (NaN from `NaN`/Infinity rng values) to 0 before
    // clamping, so the suffix is always a valid alphabet character.
    const index = Number.isFinite(raw)
      ? Math.min(Math.max(raw, 0), length - 1)
      : 0;
    suffix += IDEA_ID_ALPHABET[index];
  }
  return `IDEA-${year}-${suffix}`;
}

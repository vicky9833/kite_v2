// Feature: kite-ecosystem-enablement, Property 4: Initials-avatar derivation and text alternative
//
// Property-based test for `deriveInitials` (src/lib/mentor-filters.ts).
// For any non-empty name (1+ whitespace-separated tokens), `deriveInitials`
// returns 1–2 uppercase letters equal to the uppercased first letters of the
// first up-to-two whitespace-separated tokens, contains no image reference
// (just letters), and is suitable as the avatar's text alternative — a
// non-empty string of letters (Req 8.2, 14.7).

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import { deriveInitials } from '@/lib/mentor-filters';

// A single name token built from ASCII letters only (no whitespace), so that
// `deriveInitials`' `\s+` split reproduces exactly these tokens and every
// derived initial is guaranteed to be a letter.
const LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const letterArb: fc.Arbitrary<string> = fc.constantFrom(...LETTERS);
const tokenArb: fc.Arbitrary<string> = fc
  .array(letterArb, { minLength: 1, maxLength: 10 })
  .map((chars) => chars.join(''));

// Runs of whitespace used to join (and optionally pad) the tokens, exercising
// the "extra whitespace" edge case.
const whitespaceArb: fc.Arbitrary<string> = fc
  .array(fc.constantFrom(' ', '\t', '\n', '  '), { minLength: 1, maxLength: 3 })
  .map((parts) => parts.join(''));

// A name assembled from 1+ letter-only tokens joined by arbitrary whitespace
// runs, with optional leading/trailing whitespace. We keep the original token
// list alongside so the expected initials are known independently.
const nameArb = fc
  .record({
    tokens: fc.array(tokenArb, { minLength: 1, maxLength: 5 }),
    separators: fc.array(whitespaceArb, { minLength: 0, maxLength: 5 }),
    lead: fc.constantFrom('', ' ', '   ', '\t'),
    trail: fc.constantFrom('', ' ', '   ', '\n'),
  })
  .map(({ tokens, separators, lead, trail }) => {
    let name = lead + (tokens[0] ?? '');
    for (let i = 1; i < tokens.length; i += 1) {
      const sep = separators[i - 1] ?? ' ';
      name += sep + tokens[i];
    }
    name += trail;
    return { tokens, name };
  });

function expectedInitials(tokens: readonly string[]): string {
  return tokens
    .slice(0, 2)
    .map((token) => token.charAt(0).toUpperCase())
    .join('');
}

describe('Property 4: initials-avatar derivation and text alternative', () => {
  it('returns 1–2 uppercase letters from the first up-to-two tokens', () => {
    fc.assert(
      fc.property(nameArb, ({ tokens, name }) => {
        const initials = deriveInitials(name);

        // Equals the uppercased first letters of the first up-to-two tokens.
        expect(initials).toBe(expectedInitials(tokens));

        // 1–2 characters, bounded by the token count.
        expect(initials.length).toBeGreaterThanOrEqual(1);
        expect(initials.length).toBeLessThanOrEqual(2);
        expect(initials.length).toBe(Math.min(tokens.length, 2));

        // Suitable as a text alternative: a non-empty string of letters only,
        // with no image reference of any kind.
        expect(initials.length).toBeGreaterThan(0);
        expect(initials).toMatch(/^[A-Z]+$/);

        // Already uppercased.
        expect(initials).toBe(initials.toUpperCase());
      }),
      { numRuns: 100 },
    );
  });

  it('handles a single token (one initial)', () => {
    expect(deriveInitials('Ravi')).toBe('R');
    expect(deriveInitials('asha')).toBe('A');
  });

  it('handles multiple tokens (first two initials only)', () => {
    expect(deriveInitials('Asha Nair')).toBe('AN');
    expect(deriveInitials('John Quincy Adams')).toBe('JQ');
  });

  it('handles extra and surrounding whitespace', () => {
    expect(deriveInitials('  Asha   Nair  ')).toBe('AN');
    expect(deriveInitials('\tRavi\nKumar')).toBe('RK');
    expect(deriveInitials('   Solo   ')).toBe('S');
  });
});

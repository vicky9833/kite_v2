// Feature: kite-investor-suite, Property 22: Signal badge style is never danger
//
// Property-based test for `matchSignalBadgeStyle` (src/lib/investor-match-display.ts).
// For any MatchSignal the resolver maps strong → 'success', possible → 'warning',
// and out-of-thesis → 'muted', and NEVER returns a 'danger' style for any signal
// (Req 39.4). An out-of-thesis startup is a poor fit, not an error, so it is
// rendered muted rather than in an alarming danger style.

import { describe, expect, it } from 'vitest';
import fc from 'fast-check';

import {
  matchSignalBadgeStyle,
  type MatchSignalBadgeStyle,
} from '@/lib/investor-match-display';
import type { MatchSignal } from '@/types';

const MATCH_SIGNALS: readonly MatchSignal[] = [
  'strong',
  'possible',
  'out-of-thesis',
];

const ALLOWED_STYLES: readonly MatchSignalBadgeStyle[] = [
  'success',
  'warning',
  'muted',
];

const signalArb: fc.Arbitrary<MatchSignal> = fc.constantFrom(...MATCH_SIGNALS);

describe('Property 22: signal badge style is never danger', () => {
  it('maps each signal to an allowed style and never returns danger', () => {
    fc.assert(
      fc.property(signalArb, (signal) => {
        const style = matchSignalBadgeStyle(signal);

        // The style is always one of the three allowed, non-alarming styles.
        expect(ALLOWED_STYLES).toContain(style);
        // It is never the danger style for any signal.
        expect(style).not.toBe('danger');

        // And the exact mapping holds.
        if (signal === 'strong') expect(style).toBe('success');
        if (signal === 'possible') expect(style).toBe('warning');
        if (signal === 'out-of-thesis') expect(style).toBe('muted');
      }),
      { numRuns: 100 },
    );
  });
});

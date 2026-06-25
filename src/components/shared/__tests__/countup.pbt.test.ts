/* -------------------------------------------------------------------------- */
/* REPURPOSING NOTICE                                                          */
/* -------------------------------------------------------------------------- */
// Properties 3 & 4 (count-up: "reaches its target" / "runs at most once per
// session") are SUPERSEDED — StatCard was deliberately built as a STATIC Server
// Component with NO count-up animation, per founder direction. There is no
// animation to test, so the original animation properties do not apply.
//
// This file instead asserts StatCard RENDERING COMPLETENESS: for any valid
// `Stat` record, rendering `<StatCard stat={...} />` must surface every
// presented field — `displayValue`, `label`, `source`, and `asOf` — in the
// output. The filename is intentionally kept as `countup.pbt.test.ts` so the
// task tracker / path mapping for task 4.2 continues to match.

import { describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import fc from "fast-check";

import { StatCard } from "@/components/shared/StatCard";
import type { Stat } from "@/types";

// Feature: kite-foundation-home, Property: StatCard rendering completeness

/**
 * Generator for a short alphanumeric token. We use a constrained alphabet (no
 * spaces, no regex-special characters, no `·` separator) so the generated
 * strings are safe to feed to Testing Library text matchers and cannot collide
 * with StatCard's literal `source · asOf` separator.
 */
const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("");

const token: fc.Arbitrary<string> = fc
  .array(fc.constantFrom(...ALPHABET), { minLength: 3, maxLength: 10 })
  .map((chars) => chars.join(""));

/**
 * A fully VALID `Stat` record. Each presented string carries a DISTINCT prefix
 * (`dv-`, `lb-`, `src-`, `as-`) so that, regardless of the random suffix, the
 * four rendered fields never collide and each can be asserted independently.
 * `value` is a finite, non-negative number (it is not rendered, but the record
 * must still be valid per the `Stat` contract).
 */
const validStatArbitrary: fc.Arbitrary<Stat> = fc.record({
  id: token.map((t) => `id-${t}`),
  label: token.map((t) => `lb-${t}`),
  value: fc.double({ min: 0, max: Number.MAX_SAFE_INTEGER, noNaN: true }),
  displayValue: token.map((t) => `dv-${t}`),
  source: token.map((t) => `src-${t}`),
  asOf: token.map((t) => `as-${t}`),
});

describe("StatCard (rendering completeness — supersedes count-up Properties 3 & 4)", () => {
  it("surfaces displayValue, label, source, and asOf for any valid Stat", () => {
    fc.assert(
      fc.property(validStatArbitrary, (stat) => {
        // Render the static Server Component output into jsdom.
        render(createElement(StatCard, { stat }));

        try {
          // Each presented field must appear in the document. `source` and
          // `asOf` render together in a single `<p>` as `source · asOf`, so a
          // substring match (exact: false) surfaces that combined caption for
          // both fields. displayValue and label sit alone in their own `<p>`.
          expect(screen.getByText(stat.displayValue, { exact: false })).toBeInTheDocument();
          expect(screen.getByText(stat.label, { exact: false })).toBeInTheDocument();
          expect(screen.getByText(stat.source, { exact: false })).toBeInTheDocument();
          expect(screen.getByText(stat.asOf, { exact: false })).toBeInTheDocument();
        } finally {
          // Tear down between property runs so each iteration asserts against a
          // clean DOM (the global afterEach cleanup only fires once per `it`).
          cleanup();
        }
      }),
      { numRuns: 25 },
    );
  });
});

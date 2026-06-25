// src/lib/__tests__/ideas-board-filters.pbt.test.ts
//
// Property-based tests for the pure public-board filter / sort / truncation
// helpers (`src/lib/ideas-board-filters.ts`).

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  EMPTY_IDEA_BOARD_FILTERS,
  filterIdeas,
  orderBoardIdeas,
  sortByMostRecent,
  truncateSummary,
} from "@/lib/ideas-board-filters";
import {
  IDEA_CATEGORIES,
  INNOVATOR_TYPES,
  type IdeaBoardFilters,
  type IdeaCategory,
  type IdeaSubmission,
  type InnovatorType,
  type LocationKarnataka,
} from "@/types";

const RUNS = { numRuns: 100 } as const;
const MAX_SUMMARY_LENGTH = 150;

const LOCATIONS: readonly LocationKarnataka[] = [
  "Bengaluru Urban",
  "Bengaluru Rural",
  "Mysuru",
  "Mangaluru",
  "Hubballi-Dharwad-Belagavi",
  "Kalaburagi",
  "Shivamogga",
  "Tumakuru",
  "Other Karnataka",
];

/**
 * Arbitrary `IdeaSubmission`. Categorical fields are drawn from small canonical
 * pools (so filters realistically match), `submittedAt` is an ISO 8601 string
 * (compared lexicographically by the implementation), and `ideaId` is unique
 * within a collection via the generated array index (see ideasArb).
 */
function ideaArb(): fc.Arbitrary<IdeaSubmission> {
  return fc.record({
    id: fc.string(),
    innovatorName: fc.string(),
    innovatorEmail: fc.string(),
    innovatorAge: fc.integer({ min: 16, max: 90 }),
    innovatorType: fc.constantFrom<InnovatorType>(...INNOVATOR_TYPES),
    ideaTitle: fc.string(),
    ideaCategory: fc.constantFrom<IdeaCategory>(...IDEA_CATEGORIES),
    ideaSummary: fc.string(),
    problemStatement: fc.string(),
    proposedSolution: fc.string(),
    location: fc.constantFrom<LocationKarnataka>(...LOCATIONS),
    // ISO 8601 timestamps within a wide range so ties and orderings both occur.
    submittedAt: fc
      .date({
        min: new Date("2000-01-01T00:00:00.000Z"),
        max: new Date("2030-12-31T23:59:59.999Z"),
      })
      .map((d) => d.toISOString()),
    status: fc.constant("submitted" as const),
    matchedSchemeIds: fc.array(fc.string(), { maxLength: 5 }),
    ideaId: fc.string(),
  });
}

/** A collection of ideas with unique `ideaId`s (board ordering keys on ideaId). */
function ideasArb(): fc.Arbitrary<IdeaSubmission[]> {
  return fc
    .array(ideaArb(), { maxLength: 30 })
    .map((arr) =>
      arr.map((idea, index) => ({ ...idea, ideaId: `IDEA-2024-${index}` })),
    );
}

function filtersArb(): fc.Arbitrary<IdeaBoardFilters> {
  return fc.record({
    category: fc.option(fc.constantFrom<IdeaCategory>(...IDEA_CATEGORIES), {
      nil: null,
    }),
    innovatorType: fc.option(
      fc.constantFrom<InnovatorType>(...INNOVATOR_TYPES),
      { nil: null },
    ),
    location: fc.option(fc.constantFrom<LocationKarnataka>(...LOCATIONS), {
      nil: null,
    }),
  });
}

/** Reference predicate: does an idea satisfy every active filter? */
function matchesAll(idea: IdeaSubmission, f: IdeaBoardFilters): boolean {
  return (
    (f.category === null || idea.ideaCategory === f.category) &&
    (f.innovatorType === null || idea.innovatorType === f.innovatorType) &&
    (f.location === null || idea.location === f.location)
  );
}

/** Verify a list is sorted most-recent-first and is a stable permutation. */
function isMostRecentStable(
  output: readonly IdeaSubmission[],
  input: readonly IdeaSubmission[],
): boolean {
  // Pairwise non-increasing on submittedAt.
  for (let i = 1; i < output.length; i += 1) {
    if (output[i - 1]!.submittedAt < output[i]!.submittedAt) return false;
  }
  // Permutation of the input (same multiset of ideaIds).
  const a = input.map((x) => x.ideaId).sort();
  const b = output.map((x) => x.ideaId).sort();
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  // Stability: equal-timestamp groups keep original relative order.
  const inputOrder = new Map(input.map((x, idx) => [x.ideaId, idx]));
  for (let i = 1; i < output.length; i += 1) {
    if (output[i - 1]!.submittedAt === output[i]!.submittedAt) {
      if (inputOrder.get(output[i - 1]!.ideaId)! > inputOrder.get(output[i]!.ideaId)!) {
        return false;
      }
    }
  }
  return true;
}

describe("ideas-board-filters", () => {
  // Feature: kite-inclusion-grassroots, Property 13
  // filterIdeas is sound (every result satisfies every active filter),
  // AND-composed, subset-preserving (no fabricated/duplicated records), and
  // EMPTY_IDEA_BOARD_FILTERS returns the full input.
  // Validates: Requirements 29.6, 10.3, 18.5
  it("Property 13: filtering is sound, AND-composed, and subset-preserving", () => {
    fc.assert(
      fc.property(ideasArb(), filtersArb(), (ideas, f) => {
        const result = filterIdeas(ideas, f);

        // Soundness + AND-composition: every result satisfies ALL active filters.
        for (const idea of result) {
          expect(matchesAll(idea, f)).toBe(true);
        }

        // Completeness against the reference predicate (exact AND of all filters).
        const expected = ideas.filter((idea) => matchesAll(idea, f));
        expect(result).toEqual(expected);

        // Subset-preserving: result is a subset of input, no duplicates added,
        // original relative order retained.
        expect(result.length).toBeLessThanOrEqual(ideas.length);
        for (const idea of result) {
          expect(ideas).toContain(idea);
        }

        // Empty filters return the full input unchanged.
        expect(filterIdeas(ideas, EMPTY_IDEA_BOARD_FILTERS)).toEqual(ideas);
      }),
      RUNS,
    );
  });

  // Feature: kite-inclusion-grassroots, Property 14
  // orderBoardIdeas pins session ids first, most-recent within each group;
  // an empty session set yields the whole collection most-recent-first
  // (equivalent to sortByMostRecent).
  // Validates: Requirements 29.5, 29.8
  it("Property 14: ordering pins session ideas first, most-recent within groups", () => {
    fc.assert(
      fc.property(
        ideasArb(),
        fc.array(fc.string(), { maxLength: 30 }),
        (ideas, rawSessionIds) => {
          // Mix real ideaIds with arbitrary noise ids so the session set is
          // realistic but never assumed to be a subset.
          const sessionIds = [
            ...rawSessionIds,
            ...ideas
              .filter((_, i) => i % 2 === 0)
              .map((idea) => idea.ideaId),
          ];
          const sessionSet = new Set(sessionIds);

          const ordered = orderBoardIdeas(sessionIds, ideas);

          // Permutation of the input.
          expect(ordered.length).toBe(ideas.length);
          expect(ordered.map((x) => x.ideaId).sort()).toEqual(
            ideas.map((x) => x.ideaId).sort(),
          );

          // Every session idea precedes every non-session idea.
          const lastSessionIndex = ordered.reduce(
            (acc, idea, idx) =>
              sessionSet.has(idea.ideaId) ? idx : acc,
            -1,
          );
          const firstNonSessionIndex = ordered.findIndex(
            (idea) => !sessionSet.has(idea.ideaId),
          );
          if (lastSessionIndex !== -1 && firstNonSessionIndex !== -1) {
            expect(lastSessionIndex).toBeLessThan(firstNonSessionIndex);
          }

          // Within each group: most-recent-first, stable.
          const sessionGroupInput = ideas.filter((idea) =>
            sessionSet.has(idea.ideaId),
          );
          const restGroupInput = ideas.filter(
            (idea) => !sessionSet.has(idea.ideaId),
          );
          const sessionGroupOut = ordered.filter((idea) =>
            sessionSet.has(idea.ideaId),
          );
          const restGroupOut = ordered.filter(
            (idea) => !sessionSet.has(idea.ideaId),
          );
          expect(isMostRecentStable(sessionGroupOut, sessionGroupInput)).toBe(
            true,
          );
          expect(isMostRecentStable(restGroupOut, restGroupInput)).toBe(true);

          // Empty session set → whole collection most-recent-first.
          expect(orderBoardIdeas([], ideas)).toEqual(sortByMostRecent(ideas));
        },
      ),
      RUNS,
    );
  });

  // Feature: kite-inclusion-grassroots, Property 15
  // truncateSummary: ≤150 visible chars; identity when ≤150; otherwise a
  // prefix of the original followed by an ellipsis indicator.
  // Validates: Requirements 29.2
  it("Property 15: summary truncation never exceeds the display bound", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 400 }), (summary) => {
        const result = truncateSummary(summary);

        // Never exceeds the bound.
        expect(result.length).toBeLessThanOrEqual(MAX_SUMMARY_LENGTH);

        if (summary.length <= MAX_SUMMARY_LENGTH) {
          // Identity for short-enough summaries.
          expect(result).toBe(summary);
        } else {
          // Otherwise: a prefix of the original + a single-char ellipsis.
          const ellipsis = result.slice(-1);
          const prefix = result.slice(0, -1);
          expect(ellipsis).toBe("\u2026");
          expect(summary.startsWith(prefix)).toBe(true);
          expect(result.length).toBe(MAX_SUMMARY_LENGTH);
        }
      }),
      RUNS,
    );
  });
});

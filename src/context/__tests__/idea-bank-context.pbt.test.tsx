/**
 * Context property tests — IdeaBankProvider mutators (task 6.3).
 *
 * Property-based tests (fast-check, { numRuns: 100 }) for the session-only
 * Idea Bank context's mutation/derivation logic. Each property drives the real
 * provider via `renderHook` + `act` and a `useIdeaBank` consumer, so the tests
 * exercise the exact functional-setState code path used in production (no
 * extracted reducer, no mocks).
 *
 * Properties (from design "Correctness Properties"):
 *  - Property 9  — submitIdea appends one completed, matched, stamped record.
 *  - Property 10 — updateIdeaStatus changes only the targeted idea.
 *  - Property 11 — removeIdea removes only the targeted idea.
 *  - Property 12 — getMatchedIdeas returns exactly the non-empty-match subset.
 */

import * as React from "react";
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import fc from "fast-check";

import { IdeaBankProvider, useIdeaBank } from "@/context/IdeaBankContext";
import { IDEA_ID_PATTERN } from "@/lib/idea-id-generator";
import { matchIdeaToSchemes } from "@/lib/idea-scheme-matching";
import {
  INNOVATOR_TYPES,
  IDEA_CATEGORIES,
} from "@/types";
import type {
  IdeaCategory,
  IdeaStatus,
  IdeaSubmission,
  IdeaSubmissionDraft,
  InnovatorType,
  LocationKarnataka,
} from "@/types";

/* ------------------------------------------------------------------------ */
/* Test harness                                                             */
/* ------------------------------------------------------------------------ */

function wrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return <IdeaBankProvider>{children}</IdeaBankProvider>;
}

/** Mount a fresh provider + `useIdeaBank` consumer for one property run. */
function renderIdeaBank() {
  return renderHook(() => useIdeaBank(), { wrapper });
}

/* ------------------------------------------------------------------------ */
/* Arbitraries                                                              */
/* ------------------------------------------------------------------------ */

const innovatorTypeArb = fc.constantFrom<InnovatorType>(
  ...(INNOVATOR_TYPES as readonly InnovatorType[]),
);

const ideaCategoryArb = fc.constantFrom<IdeaCategory>(
  ...(IDEA_CATEGORIES as readonly IdeaCategory[]),
);

const locationArb = fc.constantFrom<LocationKarnataka>(
  "Bengaluru Urban",
  "Bengaluru Rural",
  "Mysuru",
  "Mangaluru",
  "Hubballi-Dharwad-Belagavi",
  "Kalaburagi",
  "Shivamogga",
  "Tumakuru",
  "Other Karnataka",
);

const ideaStatusArb = fc.constantFrom<IdeaStatus>(
  "submitted",
  "matched",
  "archived",
);

/** A full, well-formed IdeaSubmissionDraft (the context fills the rest). */
const draftArb: fc.Arbitrary<IdeaSubmissionDraft> = fc.record({
  innovatorName: fc.string(),
  innovatorEmail: fc.string(),
  innovatorAge: fc.integer({ min: 16, max: 90 }),
  innovatorType: innovatorTypeArb,
  ideaTitle: fc.string(),
  ideaCategory: ideaCategoryArb,
  ideaSummary: fc.string(),
  problemStatement: fc.string(),
  proposedSolution: fc.string(),
  location: locationArb,
});

/* ------------------------------------------------------------------------ */
/* Helpers                                                                  */
/* ------------------------------------------------------------------------ */

/** Submit a list of drafts in order, returning the completed records. */
function submitAll(
  result: { current: ReturnType<typeof useIdeaBank> },
  drafts: readonly IdeaSubmissionDraft[],
): IdeaSubmission[] {
  const submitted: IdeaSubmission[] = [];
  for (const draft of drafts) {
    act(() => {
      submitted.push(result.current.submitIdea(draft));
    });
  }
  return submitted;
}

describe("IdeaBankContext PBT — Property 9/10/11/12", () => {
  /* ---------------------------------------------------------------------- */
  /* Property 9                                                             */
  /* ---------------------------------------------------------------------- */

  // Feature: kite-inclusion-grassroots, Property 9
  it("Property 9: submitIdea appends one completed, matched, stamped record", () => {
    fc.assert(
      fc.property(
        fc.array(draftArb, { maxLength: 5 }),
        draftArb,
        (seedDrafts, newDraft) => {
          const { result, unmount } = renderIdeaBank();
          try {
            // Seed prior ideas.
            submitAll(result, seedDrafts);
            const before = result.current.ideas;
            const beforeLen = before.length;
            // Snapshot the prior ideas to assert they are preserved.
            const priorSnapshot = before.map((i) => ({ ...i }));

            // Submit one more.
            let returned!: IdeaSubmission;
            act(() => {
              returned = result.current.submitIdea(newDraft);
            });

            const after = result.current.ideas;

            // Length grows by exactly one.
            expect(after.length).toBe(beforeLen + 1);

            // The returned record is the appended (last) record.
            const appended = after[after.length - 1]!;
            expect(appended).toEqual(returned);

            // Well-formed ideaId.
            expect(appended.ideaId).toMatch(IDEA_ID_PATTERN);
            // id mirrors ideaId (session record key).
            expect(appended.id).toBe(appended.ideaId);
            // Status 'submitted'.
            expect(appended.status).toBe("submitted");
            // submittedAt is a valid ISO 8601 string round-tripping to itself.
            expect(typeof appended.submittedAt).toBe("string");
            expect(new Date(appended.submittedAt).toISOString()).toBe(
              appended.submittedAt,
            );
            // matchedSchemeIds equals the matching engine's output.
            expect(appended.matchedSchemeIds).toEqual(
              matchIdeaToSchemes(appended),
            );
            // Draft fields are carried through verbatim.
            expect(appended.innovatorName).toBe(newDraft.innovatorName);
            expect(appended.innovatorType).toBe(newDraft.innovatorType);
            expect(appended.ideaCategory).toBe(newDraft.ideaCategory);
            expect(appended.location).toBe(newDraft.location);

            // Every pre-existing idea is preserved unchanged, in order.
            for (let i = 0; i < priorSnapshot.length; i++) {
              expect(after[i]).toEqual(priorSnapshot[i]);
            }
          } finally {
            unmount();
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /* ---------------------------------------------------------------------- */
  /* Property 10                                                            */
  /* ---------------------------------------------------------------------- */

  // Feature: kite-inclusion-grassroots, Property 10
  it("Property 10: updateIdeaStatus changes only the targeted idea", () => {
    fc.assert(
      fc.property(
        fc.array(draftArb, { minLength: 1, maxLength: 6 }),
        ideaStatusArb,
        fc.nat(),
        (drafts, newStatus, rawIndex) => {
          const { result, unmount } = renderIdeaBank();
          try {
            const submitted = submitAll(result, drafts);
            const index = rawIndex % submitted.length;
            const targetId = submitted[index]!.ideaId;

            const before = result.current.ideas.map((i) => ({ ...i }));

            act(() => {
              result.current.updateIdeaStatus(targetId, newStatus);
            });

            const after = result.current.ideas;
            // Length unchanged.
            expect(after.length).toBe(before.length);

            for (const original of before) {
              const updated = after.find((i) => i.ideaId === original.ideaId);
              expect(updated).toBeDefined();
              if (original.ideaId === targetId) {
                // Targeted idea has the new status; everything else unchanged.
                expect(updated!.status).toBe(newStatus);
                expect({ ...updated!, status: original.status }).toEqual(
                  original,
                );
              } else {
                // Every other idea is fully unchanged.
                expect(updated!).toEqual(original);
              }
            }
          } finally {
            unmount();
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /* ---------------------------------------------------------------------- */
  /* Property 11                                                            */
  /* ---------------------------------------------------------------------- */

  // Feature: kite-inclusion-grassroots, Property 11
  it("Property 11: removeIdea removes only the targeted idea", () => {
    fc.assert(
      fc.property(
        fc.array(draftArb, { minLength: 1, maxLength: 6 }),
        fc.nat(),
        (drafts, rawIndex) => {
          const { result, unmount } = renderIdeaBank();
          try {
            const submitted = submitAll(result, drafts);
            const index = rawIndex % submitted.length;
            const targetId = submitted[index]!.ideaId;

            const before = result.current.ideas.map((i) => ({ ...i }));

            act(() => {
              result.current.removeIdea(targetId);
            });

            const after = result.current.ideas;
            // Length decreases by exactly one.
            expect(after.length).toBe(before.length - 1);
            // The removed id is absent.
            expect(after.some((i) => i.ideaId === targetId)).toBe(false);
            // Every other idea remains unchanged.
            for (const original of before) {
              if (original.ideaId !== targetId) {
                const kept = after.find((i) => i.ideaId === original.ideaId);
                expect(kept).toBeDefined();
                expect(kept!).toEqual(original);
              }
            }
          } finally {
            unmount();
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /* ---------------------------------------------------------------------- */
  /* Property 12                                                            */
  /* ---------------------------------------------------------------------- */

  // Feature: kite-inclusion-grassroots, Property 12
  it("Property 12: getMatchedIdeas returns exactly the non-empty-match subset, order preserved", () => {
    fc.assert(
      fc.property(
        fc.array(draftArb, { maxLength: 8 }),
        ideaStatusArb,
        (drafts, statusToArchive) => {
          const { result, unmount } = renderIdeaBank();
          try {
            const submitted = submitAll(result, drafts);

            // Optionally mutate some statuses to exercise that getMatchedIdeas
            // keys off matchedSchemeIds, not status.
            for (const idea of submitted) {
              if (idea.ideaId.length % 2 === 0) {
                act(() => {
                  result.current.updateIdeaStatus(idea.ideaId, statusToArchive);
                });
              }
            }

            const all = result.current.ideas;
            const expected = all.filter((i) => i.matchedSchemeIds.length >= 1);

            const matched = result.current.getMatchedIdeas();

            // Exactly the non-empty-match subset, in the same order.
            expect(matched).toEqual(expected);
            // Every returned idea genuinely has at least one match.
            for (const idea of matched) {
              expect(idea.matchedSchemeIds.length).toBeGreaterThanOrEqual(1);
            }
          } finally {
            unmount();
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// src/lib/__tests__/idea-scheme-matching.pbt.test.ts
//
// Property-based tests for the pure idea->scheme matching engine.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import {
  isBengaluru,
  matchIdeaToSchemes,
  matchIdeaToSchemesDetailed,
} from "@/lib/idea-scheme-matching";
import { schemes } from "@/data/schemes";
import {
  IDEA_CATEGORIES,
  INNOVATOR_TYPES,
  type IdeaSubmission,
  type LocationKarnataka,
} from "@/types";

const REAL_SCHEME_IDS = new Set(schemes.map((s) => s.id));

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

// Ages span a realistic range but explicitly probe the ≤30 / >30 boundary
// (29, 30, 31, 32) so the RGEP age rule (Req 4.9) is exercised at the edge.
const ageArb = fc.oneof(
  fc.integer({ min: 16, max: 70 }),
  fc.constantFrom(29, 30, 31, 32),
);

// A fully-populated IdeaSubmission with valid unions. The matching engine reads
// only innovatorType / innovatorAge / ideaCategory / location, but the record is
// built complete so it is a faithful input.
const ideaArb: fc.Arbitrary<IdeaSubmission> = fc
  .record({
    innovatorName: fc.string({ minLength: 1 }),
    innovatorEmail: fc.emailAddress(),
    innovatorAge: ageArb,
    innovatorType: fc.constantFrom(...INNOVATOR_TYPES),
    ideaTitle: fc.string({ minLength: 1 }),
    ideaCategory: fc.constantFrom(...IDEA_CATEGORIES),
    ideaSummary: fc.string({ minLength: 1 }),
    problemStatement: fc.string({ minLength: 1 }),
    proposedSolution: fc.string({ minLength: 1 }),
    location: fc.constantFrom(...LOCATIONS),
  })
  .map((draft) => ({
    ...draft,
    id: "IDEA-2025-ABCDEF",
    ideaId: "IDEA-2025-ABCDEF",
    submittedAt: "2025-01-01T00:00:00.000Z",
    status: "submitted" as const,
    matchedSchemeIds: [],
  }));

describe("idea-scheme-matching", () => {
  // Feature: kite-inclusion-grassroots, Property 3
  // matchIdeaToSchemes returns ≤5 real ids with no duplicates; every detailed
  // entry carries a non-empty reason.
  it("Property 3: returns a valid, deduped, ≤5 id set with reasons", () => {
    fc.assert(
      fc.property(ideaArb, (idea) => {
        const ids = matchIdeaToSchemes(idea);

        // At most 5 (Req 4.3).
        expect(ids.length).toBeLessThanOrEqual(5);

        // All real (Req 4.2).
        for (const id of ids) {
          expect(REAL_SCHEME_IDS.has(id)).toBe(true);
        }

        // No duplicates (Req 4.1).
        expect(new Set(ids).size).toBe(ids.length);

        // Detailed mirrors the id projection and every entry has a non-empty
        // reason (Req 28.3) and a real id.
        const detailed = matchIdeaToSchemesDetailed(idea);
        expect(detailed.map((m) => m.schemeId)).toEqual(ids);
        for (const match of detailed) {
          expect(REAL_SCHEME_IDS.has(match.schemeId)).toBe(true);
          expect(match.reason.trim().length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-inclusion-grassroots, Property 4
  // Documented relevance rules hold, and stronger matches order ahead of weaker
  // ones. Age 30/31 and Bengaluru/non-Bengaluru boundaries are exercised.
  it("Property 4: rule coverage and stronger-ahead-of-weaker ordering", () => {
    fc.assert(
      fc.property(ideaArb, (idea) => {
        const detailed = matchIdeaToSchemesDetailed(idea);
        const ids = detailed.map((m) => m.schemeId);
        const indexOf = (id: string): number => ids.indexOf(id);

        // Global ordering invariant: weights are non-increasing, so stronger
        // matches always sit ahead of weaker ones (Req 4.8, 4.10).
        for (let i = 1; i < detailed.length; i++) {
          expect(detailed[i - 1]!.weight).toBeGreaterThanOrEqual(
            detailed[i]!.weight,
          );
        }

        const inBengaluru = isBengaluru(idea.location);

        // Req 4.4 — AgriTech includes both grassroot-innovation and rd-project-grant.
        if (idea.ideaCategory === "AgriTech") {
          expect(ids).toContain("grassroot-innovation");
          expect(ids).toContain("rd-project-grant");
        }

        if (idea.ideaCategory === "Rural Development") {
          // Req 4.5 — Rural Development outside Bengaluru includes the cluster fund.
          if (!inBengaluru) {
            expect(ids).toContain("beyond-bengaluru-cluster-fund");
          }
          // Req 4.6 — Rural Development + Student includes nain-2.
          if (idea.innovatorType === "Student") {
            expect(ids).toContain("nain-2");
          }
          // Req 4.7 — Rural Development that is neither outside-Bengaluru nor a
          // Student includes grassroot-innovation.
          if (inBengaluru && idea.innovatorType !== "Student") {
            expect(ids).toContain("grassroot-innovation");
          }
        }

        // Req 4.8 — Student includes nain-2 ahead of any weaker match.
        if (idea.innovatorType === "Student") {
          expect(ids).toContain("nain-2");
          const nainMatch = detailed.find((m) => m.schemeId === "nain-2")!;
          for (const m of detailed) {
            if (m.weight < nainMatch.weight) {
              expect(indexOf("nain-2")).toBeLessThan(indexOf(m.schemeId));
            }
          }
          // Req 4.9 — Student with age ≤ 30 includes rgep.
          if (idea.innovatorAge <= 30) {
            expect(ids).toContain("rgep");
          }
        }

        // Req 4.10 — Rural Innovator includes grassroot-innovation ahead of weaker.
        if (idea.innovatorType === "Rural Innovator") {
          expect(ids).toContain("grassroot-innovation");
          const grMatch = detailed.find(
            (m) => m.schemeId === "grassroot-innovation",
          )!;
          for (const m of detailed) {
            if (m.weight < grMatch.weight) {
              expect(indexOf("grassroot-innovation")).toBeLessThan(
                indexOf(m.schemeId),
              );
            }
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: kite-inclusion-grassroots, Property 5
  // Deep-equal inputs produce identical ordered arrays (determinism, Req 4.11).
  it("Property 5: deterministic for deep-equal inputs", () => {
    fc.assert(
      fc.property(ideaArb, (idea) => {
        const clone: IdeaSubmission = JSON.parse(JSON.stringify(idea));
        expect(idea).toEqual(clone);

        // Same input twice and an independent deep clone all agree.
        expect(matchIdeaToSchemes(idea)).toEqual(matchIdeaToSchemes(idea));
        expect(matchIdeaToSchemes(clone)).toEqual(matchIdeaToSchemes(idea));
        expect(matchIdeaToSchemesDetailed(clone)).toEqual(
          matchIdeaToSchemesDetailed(idea),
        );
      }),
      { numRuns: 100 },
    );
  });
});

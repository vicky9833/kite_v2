/**
 * Context unit tests — IdeaBankProvider / useIdeaBank / useOptionalIdeaBank
 * (task 6.4).
 *
 * EXAMPLE / unit tests (not property-based) for the session-only Idea Bank
 * context defined in `src/context/IdeaBankContext.tsx`. They mirror the
 * structure of `InvestorContext.test.tsx` (throw assertion + provider harness)
 * and exercise the public contract (Req 3.1, 3.2, 3.3, 3.8):
 *  - initial empty `ideas` under a fresh provider (Req 3.1),
 *  - "refresh reset": a freshly mounted provider yields empty `ideas` because
 *    the state is in-memory only and never persisted (Req 3.2, 3.3),
 *  - the non-throwing `useOptionalIdeaBank` fallback outside a provider returns
 *    empty `ideas`, no-op mutators, and `getMatchedIdeas() === []` (Req 3.8),
 *  - the descriptive error thrown when `useIdeaBank` is used outside a provider
 *    (Req 3.8).
 *
 * The hook is exercised with @testing-library/react's `renderHook` (+ `act`
 * for state-mutating callbacks). jsdom global cleanup lives in
 * `src/test/setup.ts`.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import {
  IdeaBankProvider,
  useIdeaBank,
  useOptionalIdeaBank,
} from "@/context/IdeaBankContext";
import type { IdeaSubmissionDraft } from "@/types";

/** A well-formed draft used to populate `ideas` in the session-only tests. */
const SAMPLE_DRAFT: IdeaSubmissionDraft = {
  innovatorName: "Asha",
  innovatorEmail: "asha@example.com",
  innovatorAge: 24,
  innovatorType: "Student",
  ideaTitle: "Solar dryer",
  ideaCategory: "AgriTech",
  ideaSummary: "A low-cost solar crop dryer for smallholder farmers.",
  problemStatement: "Post-harvest losses are high for smallholder farmers.",
  proposedSolution: "An affordable solar dryer that reduces spoilage.",
  location: "Mysuru",
};

/** Wrapper that mounts the hook under a fresh IdeaBankProvider. */
function wrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return <IdeaBankProvider>{children}</IdeaBankProvider>;
}

/** Render `useIdeaBank` inside a fresh provider (one mount per call). */
function renderIdeaBank() {
  return renderHook(() => useIdeaBank(), { wrapper });
}

describe("IdeaBankProvider / useIdeaBank", () => {
  /* ---------------------------------------------------------------------- */
  /* Initial state (Req 3.1)                                                */
  /* ---------------------------------------------------------------------- */

  it("starts with empty ideas under a fresh provider", () => {
    const { result } = renderIdeaBank();

    expect(result.current.ideas).toEqual([]);
    expect(result.current.getMatchedIdeas()).toEqual([]);
  });

  /* ---------------------------------------------------------------------- */
  /* Refresh reset — state does not survive a remount (Req 3.2, 3.3)        */
  /* ---------------------------------------------------------------------- */

  it("does not persist ideas across a fresh provider mount (models a page refresh)", () => {
    // First "session": submit an idea so `ideas` is non-empty.
    const first = renderIdeaBank();
    act(() => {
      first.result.current.submitIdea(SAMPLE_DRAFT);
    });
    expect(first.result.current.ideas.length).toBe(1);
    first.unmount();

    // A refresh remounts a brand-new provider — no persistence layer exists,
    // so the new instance must read back as the pristine empty state.
    const second = renderIdeaBank();
    expect(second.result.current.ideas).toEqual([]);
    expect(second.result.current.getMatchedIdeas()).toEqual([]);
  });

  /* ---------------------------------------------------------------------- */
  /* Outside-provider usage error (Req 3.8)                                 */
  /* ---------------------------------------------------------------------- */

  it("throws a descriptive error when used outside an IdeaBankProvider", () => {
    // React logs the thrown render error to console.error; silence it so the
    // expected-failure path does not pollute the test output.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => renderHook(() => useIdeaBank())).toThrow(
      "useIdeaBank must be used within an IdeaBankProvider",
    );

    consoleError.mockRestore();
  });

  /* ---------------------------------------------------------------------- */
  /* Non-throwing fallback (Req 3.8)                                        */
  /* ---------------------------------------------------------------------- */

  it("useOptionalIdeaBank returns the empty fallback outside a provider", () => {
    const { result } = renderHook(() => useOptionalIdeaBank());

    expect(result.current.ideas).toEqual([]);
    expect(result.current.getMatchedIdeas()).toEqual([]);

    // Every mutator is a safe no-op — calling them must not throw.
    expect(() => {
      act(() => {
        result.current.submitIdea(SAMPLE_DRAFT);
        result.current.updateIdeaStatus("IDEA-2024-ABCDEF", "matched");
        result.current.removeIdea("IDEA-2024-ABCDEF");
      });
    }).not.toThrow();

    // State is unaffected by the no-op mutators.
    expect(result.current.ideas).toEqual([]);
    expect(result.current.getMatchedIdeas()).toEqual([]);
  });
});

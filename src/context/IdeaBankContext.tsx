"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  IdeaBankContextValue,
  IdeaStatus,
  IdeaSubmission,
  IdeaSubmissionDraft,
} from "@/types";
import { generateIdeaId } from "@/lib/idea-id-generator";
import { matchIdeaToSchemes } from "@/lib/idea-scheme-matching";

/**
 * Session-only Idea Bank state for the KITE Inclusion & Grassroots Layer
 * (Req 3.1–3.9).
 *
 * ABSOLUTE CONSTRAINT — frontend-only, session-only:
 * This provider holds its state in **in-memory React state ONLY**. It performs
 * NO persistence of any kind: no `localStorage`, no `sessionStorage`, no
 * cookies, no IndexedDB, no `fetch`/network, no I/O whatsoever. Because the
 * state lives only in React, it initializes to `{ ideas: [] }` and **resets to
 * that initial state on every page refresh** — a refresh remounts the provider
 * (Req 3.1–3.3).
 *
 * A direct structural mirror of `InvestorContext`: same functional-setState
 * discipline, same throwing + non-throwing hook pair, same NOT-wired fallback.
 */

/** Internal in-memory state shape. Submissions live in `ideas`. */
interface IdeaBankState {
  ideas: IdeaSubmission[];
}

const INITIAL_STATE: IdeaBankState = {
  ideas: [],
};

const IdeaBankContext = createContext<IdeaBankContextValue | undefined>(
  undefined,
);

export interface IdeaBankProviderProps {
  children: ReactNode;
}

export function IdeaBankProvider({
  children,
}: IdeaBankProviderProps): JSX.Element {
  // In-memory React state ONLY — no persistence, no I/O (Req 3.1–3.3).
  const [state, setState] = useState<IdeaBankState>(INITIAL_STATE);

  /**
   * Build the completed submission from a draft (Req 3.4): generate the
   * `IDEA-YYYY-XXXXXX` identifier (used as both the session record key and
   * `ideaId`), stamp `submittedAt` (ISO 8601 — a status stamp, not synthetic
   * data, mirroring how `InvestorContext.completeOnboarding` stamps
   * `onboardedAt`), set `status: 'submitted'`, populate `matchedSchemeIds` via
   * the pure matching engine, append, and return the completed record so the
   * island can render the success state immediately.
   */
  const submitIdea = useCallback(
    (draft: IdeaSubmissionDraft): IdeaSubmission => {
      const ideaId = generateIdeaId();
      const base: IdeaSubmission = {
        ...draft,
        id: ideaId, // session record key == ideaId
        ideaId,
        status: "submitted",
        submittedAt: new Date().toISOString(),
        matchedSchemeIds: [],
      };
      const matchedSchemeIds = matchIdeaToSchemes(base);
      const completed: IdeaSubmission = { ...base, matchedSchemeIds };
      setState((current) => ({ ideas: [...current.ideas, completed] }));
      return completed;
    },
    [],
  );

  /**
   * Change ONLY the matching idea's status; every other idea is referentially
   * preserved (Req 3.5).
   */
  const updateIdeaStatus = useCallback(
    (ideaId: string, status: IdeaStatus): void => {
      setState((current) => ({
        ideas: current.ideas.map((idea) =>
          idea.ideaId === ideaId ? { ...idea, status } : idea,
        ),
      }));
    },
    [],
  );

  /** Remove ONLY the matching idea by `ideaId` (Req 3.6). */
  const removeIdea = useCallback((ideaId: string): void => {
    setState((current) => ({
      ideas: current.ideas.filter((idea) => idea.ideaId !== ideaId),
    }));
  }, []);

  /**
   * Derived subset: session ideas with at least one matched scheme id, order
   * preserved (Req 3.7).
   */
  const getMatchedIdeas = useCallback(
    (): IdeaSubmission[] =>
      state.ideas.filter((idea) => idea.matchedSchemeIds.length >= 1),
    [state.ideas],
  );

  const value = useMemo<IdeaBankContextValue>(
    () => ({
      ideas: state.ideas,
      submitIdea,
      updateIdeaStatus,
      removeIdea,
      getMatchedIdeas,
    }),
    [state.ideas, submitIdea, updateIdeaStatus, removeIdea, getMatchedIdeas],
  );

  return (
    <IdeaBankContext.Provider value={value}>
      {children}
    </IdeaBankContext.Provider>
  );
}

/**
 * Access the session Idea Bank context. Throws a descriptive error when called
 * outside an `IdeaBankProvider` rather than returning `undefined` silently
 * (Req 3.8).
 */
export function useIdeaBank(): IdeaBankContextValue {
  const context = useContext(IdeaBankContext);
  if (context === undefined) {
    throw new Error("useIdeaBank must be used within an IdeaBankProvider");
  }
  return context;
}

/**
 * Default, empty context value used as a graceful fallback by
 * {@link useOptionalIdeaBank} when no `IdeaBankProvider` is present. Every
 * mutator is a no-op, so a consumer rendered in isolation behaves exactly like
 * the empty-state Idea Bank (Req 3.8). `getMatchedIdeas` returns `[]`.
 */
const EMPTY_IDEA_BANK: IdeaBankContextValue = {
  ideas: [],
  submitIdea: (draft: IdeaSubmissionDraft): IdeaSubmission => ({
    ...draft,
    id: "",
    ideaId: "",
    status: "submitted",
    submittedAt: "",
    matchedSchemeIds: [],
  }),
  updateIdeaStatus: () => {},
  removeIdea: () => {},
  getMatchedIdeas: () => [],
};

/**
 * Non-throwing variant of {@link useIdeaBank} for **additive, optional**
 * personalization islands that may be rendered in isolation — such as the
 * board/form in component tests — without a surrounding `IdeaBankProvider`.
 *
 * Inside the real application the provider always wraps the tree (locked in
 * `app/layout.tsx`), so this returns the live session value. When mounted with
 * no provider it returns {@link EMPTY_IDEA_BANK} instead of throwing. This does
 * NOT relax the Req 3.8 contract: `useIdeaBank` still throws; this accessor
 * exists solely for islands whose empty output must equal the pristine state.
 */
export function useOptionalIdeaBank(): IdeaBankContextValue {
  return useContext(IdeaBankContext) ?? EMPTY_IDEA_BANK;
}

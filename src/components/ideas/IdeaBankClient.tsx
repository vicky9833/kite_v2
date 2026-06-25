"use client";

// IdeaBankClient — the single client island that orchestrates the interactive
// Idea Bank experience on `/ideas` (Req 27, 28, 30). It is the one place the
// server/client boundary is crossed: the surrounding page is a server shell,
// and everything that needs session state, view transitions, or in-page
// scrolling lives here so no extra boundaries are introduced.
//
// Responsibilities:
//  - Consumes the session-only `useIdeaBank()` context for `ideas` (surfaced on
//    the public board) and `submitIdea` (Req 27.2, 27.3).
//  - Holds the view state ('form' vs 'success'), the just-submitted
//    `IdeaSubmission`, and the spotlight-selected `IdeaCategory` used to
//    pre-fill the form (Req 27.1, 30.3).
//  - Composes, in order, the categories spotlight, the submission form, the
//    success state, and the public ideas board.
//  - A "Submit in This Category" click pre-fills the chosen category and scrolls
//    to the form anchor (`#idea-form`) — handled entirely within this component
//    via a ref / `getElementById(...).scrollIntoView` (Req 30.3, 28.6).
//
// Bundle discipline (Req 34.1) — bundle housekeeping (task 17.9): every piece
// the island composes is below the page's hero + "How It Works" sections, so
// none of it is needed for the route's first paint. Now that the submission
// form uses lightweight NATIVE form controls (no Radix Select/RadioGroup), the
// heavy vendor weight that previously justified `next/dynamic` is gone, so all
// pieces are imported STATICALLY:
//  - The submission form renders synchronously inside the EAGER `#idea-form`
//    anchor wrapper (which owns the id + scroll ref) so the spotlight pre-fill
//    scroll and any `#idea-form` deep-link always have a stable target.
//  - The categories spotlight (runs the scheme matcher 8×) and the public
//    ideas board (12–18 seed ideas + filters) stay wrapped in `LazySection`,
//    which renders children eagerly under jsdom (no IntersectionObserver) so
//    synchronous tests pass, while still deferring render in the browser until
//    each section nears the viewport.
//  - The success state renders when a submission completes.
// Static imports render synchronously (no async placeholder), so synchronous
// render tests see the real components on first paint.
//
// Session-only: all state is in-memory React state; no storage, no network.

import * as React from "react";

import { LazySection } from "@/components/shared/LazySection";
import { IdeaSubmissionForm } from "@/components/ideas/IdeaSubmissionForm";
import { IdeaCategoriesSpotlight } from "@/components/ideas/IdeaCategoriesSpotlight";
import { IdeaSuccessState } from "@/components/ideas/IdeaSuccessState";
import { PublicIdeasBoard } from "@/components/ideas/PublicIdeasBoard";
import { useIdeaBank } from "@/context/IdeaBankContext";
import type {
  IdeaCategory,
  IdeaSubmission,
  IdeaSubmissionDraft,
} from "@/types";

/** Which surface the upper region of the island is showing. */
type IdeaBankView = "form" | "success";

/**
 * The shared anchor id for the submission form. The eager wrapper owns this id
 * (and the scroll ref), so the spotlight pre-fill scroll and `#idea-form`
 * deep-links resolve even before the lazily-loaded form chunk mounts.
 */
const FORM_ANCHOR_ID = "idea-form";

export function IdeaBankClient() {
  const { ideas, submitIdea } = useIdeaBank();

  // View state, the just-submitted record, and the spotlight-selected category.
  const [view, setView] = React.useState<IdeaBankView>("form");
  const [submittedIdea, setSubmittedIdea] =
    React.useState<IdeaSubmission | null>(null);
  const [selectedCategory, setSelectedCategory] =
    React.useState<IdeaCategory | undefined>(undefined);

  // Ref to the form anchor so "Submit in This Category" can scroll to it
  // without crossing a server/client boundary (Req 30.3).
  const formAnchorRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToForm = React.useCallback(() => {
    const node =
      formAnchorRef.current ?? document.getElementById(FORM_ANCHOR_ID);
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Spotlight → pre-fill the category and bring the form into view. If the
  // visitor is on the success view, return them to the form first (Req 30.3).
  const handleSelectCategory = React.useCallback(
    (category: IdeaCategory) => {
      setSelectedCategory(category);
      setView("form");
      // Defer the scroll until after the form is rendered in the DOM.
      requestAnimationFrame(scrollToForm);
    },
    [scrollToForm],
  );

  // Valid submit → record the idea in the session context, capture the
  // completed record, and switch to the success view (Req 27.2, 27.3).
  const handleSubmit = React.useCallback(
    (draft: IdeaSubmissionDraft) => {
      const completed = submitIdea(draft);
      setSubmittedIdea(completed);
      setView("success");
    },
    [submitIdea],
  );

  // "Submit Another Idea" → back to the form view (Req 28.6).
  const handleSubmitAnother = React.useCallback(() => {
    setSubmittedIdea(null);
    setView("form");
    requestAnimationFrame(scrollToForm);
  }, [scrollToForm]);

  return (
    <>
      {view === "form" ? (
        <>
          <LazySection minHeight={560}>
            <IdeaCategoriesSpotlight onSelectCategory={handleSelectCategory} />
          </LazySection>
          {/* Eager anchor wrapper: owns `#idea-form` + the scroll ref so the
              spotlight pre-fill scroll and deep-links resolve even before the
              lazily-loaded form chunk mounts. */}
          <div
            ref={formAnchorRef}
            id={FORM_ANCHOR_ID}
            className="scroll-mt-24 px-4 sm:px-6 lg:px-8 py-16 md:py-24"
          >
            <IdeaSubmissionForm
              initialCategory={selectedCategory}
              onSubmit={handleSubmit}
              formId="idea-submission-form"
            />
          </div>
        </>
      ) : submittedIdea ? (
        <div className="px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <IdeaSuccessState
            idea={submittedIdea}
            onSubmitAnother={handleSubmitAnother}
          />
        </div>
      ) : null}

      <LazySection minHeight={720}>
        <PublicIdeasBoard sessionIdeas={ideas} />
      </LazySection>
    </>
  );
}

export default IdeaBankClient;

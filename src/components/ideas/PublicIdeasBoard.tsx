"use client";

// PublicIdeasBoard — section of the Idea Bank that lets visitors browse the
// union of their own session-submitted ideas and the 12–18 illustrative seed
// ideas, with category / innovator-type / location filters and a most-recent
// default sort (Req 29, 35.5/35.6).
//
//  - The board content is the union of `sessionIdeas` (the visitor's own
//    submissions, passed down from the island) and `generateSeedIdeas()`.
//  - Ordering is delegated to the pure `orderBoardIdeas` helper, which pins the
//    visitor's session submissions to the top and sorts each group
//    most-recent-first (Req 29.5, 29.8). Filtering uses the pure `filterIdeas`
//    helper, AND-composed and subset-preserving (Req 29.6).
//  - Each card renders the idea title, an Idea_Category badge, an Innovator_Type
//    badge, the location, a deterministic relative timestamp, the summary
//    truncated to 150 characters, and a "Read More" expand control (Req 29.2).
//  - Session submissions carry a "Yours" badge; seed ideas carry an
//    IllustrativeBadge marking them synthetic preview content (Req 29.3, 29.8).
//  - When the active filters match zero ideas, a no-results message is shown
//    while the default sort is retained (Req 29.7).
//
// Accessibility: the ideas render as a semantic `<ul>`/`<li>` list (Req 35.5);
// every filter control has a programmatic `<label>` and is keyboard operable
// (Req 35.6).
//
// Visual discipline (Req 36): `rounded-xl shadow-sm border` cards, `max-w-7xl`,
// `py-16 md:py-24`, Lucide icons only, no gradients/blobs/emoji/glow.
//
// Session-only: no storage, no network — `generateSeedIdeas()` is pure and the
// relative timestamps are computed deterministically (no `Date.now`).

import * as React from "react";
import { ChevronDown, ChevronUp, Inbox, MapPin } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import {
  EMPTY_IDEA_BOARD_FILTERS,
  filterIdeas,
  orderBoardIdeas,
  truncateSummary,
} from "@/lib/ideas-board-filters";
import { generateSeedIdeas } from "@/lib/synthetic-ideas";
import {
  IDEA_CATEGORIES,
  INNOVATOR_TYPES,
  type IdeaBoardFilters,
  type IdeaCategory,
  type IdeaSubmission,
  type InnovatorType,
  type LocationKarnataka,
} from "@/types";

// The Karnataka locations offered in the location filter, in the same order as
// the `LocationKarnataka` union.
const LOCATION_OPTIONS: readonly LocationKarnataka[] = [
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

const MS_PER_DAY = 86_400_000;

/**
 * Deterministic relative-time label derived purely from two ISO 8601 strings —
 * no `Date.now`, no ambient clock. `fromISO` is the idea's `submittedAt` and
 * `nowISO` is the board's reference instant (the most-recent idea on the
 * board), so the newest idea reads "Just now" and the rest are relative to it.
 * `Date.parse` is a pure string→number conversion (not a clock read).
 */
function relativeTimeLabel(fromISO: string, nowISO: string): string {
  const from = Date.parse(fromISO);
  const now = Date.parse(nowISO);
  if (Number.isNaN(from) || Number.isNaN(now)) return "Recently";

  const days = Math.floor(Math.max(0, now - from) / MS_PER_DAY);
  if (days <= 0) return "Just now";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;

  const months = Math.floor(days / 30);
  return months <= 1 ? "1 month ago" : `${months} months ago`;
}

export interface PublicIdeasBoardProps {
  /** The visitor's own session submissions, surfaced and pinned on top. */
  sessionIdeas: IdeaSubmission[];
}

export function PublicIdeasBoard({ sessionIdeas }: PublicIdeasBoardProps) {
  // Filter state lives in-memory only — no URL params, no storage (Req 29.4).
  const [filters, setFilters] =
    React.useState<IdeaBoardFilters>(EMPTY_IDEA_BOARD_FILTERS);

  // Per-card "Read More" expansion, keyed by ideaId.
  const [expanded, setExpanded] = React.useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );

  // Seed ideas are pure + byte-stable; compute once.
  const seedIdeas = React.useMemo(() => generateSeedIdeas(), []);

  // The set of the visitor's own session idea ids — pinned on top + "Yours".
  const sessionIds = React.useMemo(
    () => sessionIdeas.map((idea) => idea.ideaId),
    [sessionIdeas],
  );
  const sessionIdSet = React.useMemo(() => new Set(sessionIds), [sessionIds]);

  // Board = union of session submissions + seed ideas, ordered (session pinned,
  // each group most-recent-first), then filtered (subset-preserving).
  const orderedIdeas = React.useMemo(
    () => orderBoardIdeas(sessionIds, [...sessionIdeas, ...seedIdeas]),
    [sessionIds, sessionIdeas, seedIdeas],
  );
  const visibleIdeas = React.useMemo(
    () => filterIdeas(orderedIdeas, filters),
    [orderedIdeas, filters],
  );

  // Reference instant for relative labels: the most-recent submittedAt across
  // the whole board, so the newest idea reads "Just now" (deterministic).
  const referenceInstant = React.useMemo(() => {
    return orderedIdeas.reduce(
      (latest, idea) => (idea.submittedAt > latest ? idea.submittedAt : latest),
      "",
    );
  }, [orderedIdeas]);

  const toggleExpanded = React.useCallback((ideaId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(ideaId)) {
        next.delete(ideaId);
      } else {
        next.add(ideaId);
      }
      return next;
    });
  }, []);

  const selectClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

  return (
    <section id="ideas-board" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <SectionHeading
              eyebrow="Public ideas board"
              title="Recent Ideas from Karnataka Innovators"
            />
            <IllustrativeBadge variant="inline" />
          </div>
          <p className="max-w-2xl text-body text-muted">
            Browse ideas submitted across Karnataka. The seeded examples below
            are illustrative preview content; your own submissions appear at the
            top, marked &ldquo;Yours&rdquo;.
          </p>
        </div>

        {/* --- Filter controls (keyboard operable, labelled) (Req 29.4, 35.6) --- */}
        <div className="mt-8 grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="board-filter-category"
              className="text-sm font-medium text-foreground"
            >
              Category
            </label>
            <select
              id="board-filter-category"
              className={selectClass}
              value={filters.category ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  category: (e.target.value || null) as IdeaCategory | null,
                }))
              }
            >
              <option value="">All categories</option>
              {IDEA_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="board-filter-innovator-type"
              className="text-sm font-medium text-foreground"
            >
              Innovator type
            </label>
            <select
              id="board-filter-innovator-type"
              className={selectClass}
              value={filters.innovatorType ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  innovatorType: (e.target.value || null) as InnovatorType | null,
                }))
              }
            >
              <option value="">All innovator types</option>
              {INNOVATOR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="board-filter-location"
              className="text-sm font-medium text-foreground"
            >
              Location
            </label>
            <select
              id="board-filter-location"
              className={selectClass}
              value={filters.location ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  location: (e.target.value || null) as LocationKarnataka | null,
                }))
              }
            >
              <option value="">All locations</option>
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- Ideas list (semantic list) (Req 35.5) --- */}
        {visibleIdeas.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-border bg-background px-6 py-16 text-center shadow-sm">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface text-muted">
              <Inbox aria-hidden="true" />
            </span>
            <p className="text-body font-medium text-foreground">
              No ideas match your filters
            </p>
            <p className="max-w-md text-sm text-muted">
              Try clearing a filter to see more ideas. The board stays sorted by
              most recent.
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleIdeas.map((idea) => {
              const isYours = sessionIdSet.has(idea.ideaId);
              const isExpanded = expanded.has(idea.ideaId);
              const summaryId = `idea-summary-${idea.ideaId}`;
              const isTruncated =
                truncateSummary(idea.ideaSummary) !== idea.ideaSummary;

              return (
                <li
                  key={idea.ideaId}
                  className="flex flex-col rounded-xl border border-border bg-background p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="default">{idea.ideaCategory}</Badge>
                      <Badge variant="outline">{idea.innovatorType}</Badge>
                    </div>
                    {isYours ? (
                      <Badge variant="accent">Yours</Badge>
                    ) : (
                      <span className="text-caption uppercase tracking-wide text-muted">
                        Illustrative
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 font-heading text-lg font-semibold text-foreground">
                    {idea.ideaTitle}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted">
                    <span className="inline-flex items-center gap-1">
                      <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                      {idea.location}
                    </span>
                    <span>{relativeTimeLabel(idea.submittedAt, referenceInstant)}</span>
                  </div>

                  <p id={summaryId} className="mt-3 text-sm text-muted-foreground">
                    {isExpanded ? idea.ideaSummary : truncateSummary(idea.ideaSummary)}
                  </p>

                  {isTruncated ? (
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1 self-start text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                      aria-expanded={isExpanded}
                      aria-controls={summaryId}
                      onClick={() => toggleExpanded(idea.ideaId)}
                    >
                      {isExpanded ? (
                        <>
                          Show Less
                          <ChevronUp aria-hidden="true" className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Read More
                          <ChevronDown aria-hidden="true" className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export default PublicIdeasBoard;

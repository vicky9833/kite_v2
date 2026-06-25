/**
 * Pure public-board filter / sort / truncation helpers for the Idea Bank board.
 *
 * Pure module: no React, no I/O, no network, no `Math.random`, no `Date`.
 * Every function is deterministic given its arguments and never mutates its
 * inputs (it returns fresh arrays / strings).
 *
 * Requirements: 29.1, 29.2, 29.5, 29.6, 29.8 (+ filter reuse for 10.3, 18.5).
 */
import type { IdeaSubmission, IdeaBoardFilters } from '@/types';

/** All filters inactive — the board's default state (Req 29.4). */
export const EMPTY_IDEA_BOARD_FILTERS: IdeaBoardFilters = {
  category: null,
  innovatorType: null,
  location: null,
};

/** Max visible characters for a board-rendered summary (Req 29 / Property 15). */
const MAX_SUMMARY_LENGTH = 150;

/** Single-character ellipsis indicator appended to truncated summaries. */
const ELLIPSIS = '\u2026';

/**
 * Sound, AND-composed, subset-preserving filter (Req 29.6). A `null` field is
 * inactive (matches everything); active fields must match by equality. The
 * result is a subset of the input in its original relative order.
 */
export function filterIdeas(
  ideas: readonly IdeaSubmission[],
  f: IdeaBoardFilters,
): IdeaSubmission[] {
  return ideas.filter(
    (it) =>
      (f.category === null || it.ideaCategory === f.category) &&
      (f.innovatorType === null || it.innovatorType === f.innovatorType) &&
      (f.location === null || it.location === f.location),
  );
}

/**
 * Most-recent-first by `submittedAt` (ISO 8601 string compare, Req 29.5).
 * Stable: ideas with equal timestamps retain their original relative order.
 * Pure — operates on a copy, never mutating the input.
 */
export function sortByMostRecent(
  ideas: readonly IdeaSubmission[],
): IdeaSubmission[] {
  return ideas
    .map((idea, index) => ({ idea, index }))
    .sort((a, b) => {
      if (a.idea.submittedAt < b.idea.submittedAt) return 1;
      if (a.idea.submittedAt > b.idea.submittedAt) return -1;
      return a.index - b.index; // stable tie-break preserves input order
    })
    .map((entry) => entry.idea);
}

/**
 * Board ordering: session submissions pinned to the top (each marked "Yours"
 * by the consumer), then the rest, with each group sorted most-recent-first
 * (Req 29.8). Returns a permutation of the input. When `sessionIds` is empty,
 * the whole collection is simply most-recent-first.
 */
export function orderBoardIdeas(
  sessionIds: readonly string[],
  ideas: readonly IdeaSubmission[],
): IdeaSubmission[] {
  const sessionIdSet = new Set(sessionIds);
  const sessionGroup: IdeaSubmission[] = [];
  const restGroup: IdeaSubmission[] = [];

  for (const idea of ideas) {
    if (sessionIdSet.has(idea.ideaId)) {
      sessionGroup.push(idea);
    } else {
      restGroup.push(idea);
    }
  }

  return [...sortByMostRecent(sessionGroup), ...sortByMostRecent(restGroup)];
}

/**
 * Truncate a summary to at most {@link MAX_SUMMARY_LENGTH} visible characters
 * (Req 29 / Property 15). Identity when the summary is already short enough;
 * otherwise a prefix of the original followed by a single-character ellipsis
 * indicator, with the total visible length never exceeding the bound.
 */
export function truncateSummary(summary: string): string {
  if (summary.length <= MAX_SUMMARY_LENGTH) return summary;
  const prefix = summary.slice(0, MAX_SUMMARY_LENGTH - ELLIPSIS.length);
  return `${prefix}${ELLIPSIS}`;
}

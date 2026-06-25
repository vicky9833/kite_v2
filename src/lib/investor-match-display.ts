// src/lib/investor-match-display.ts
//
// Pure presentation helpers for the Investor Dashboard "Matched startups"
// section (Req 20, 39.3, 39.4). This module has NO React, NO I/O, and NO
// randomness — every export is a pure function so the matching-driven selection
// and the signal→badge mapping can be exercised without a DOM (the subjects of
// Correctness Properties 17 and 22).
//
// It exposes:
//   - matchSignalBadgeStyle(signal): the logical badge style for a MatchSignal.
//       strong → 'success', possible → 'warning', out-of-thesis → 'muted'.
//       The 'danger' style is NEVER returned for a match signal (Property 22).
//   - matchSignalLabel(signal): the human-readable label for a MatchSignal.
//   - selectTopMatches(investor, candidates, limit): the candidate pool scored
//       via `evaluateMatch`, sorted by score desc (tie-break startupId asc), and
//       sliced to `limit` (default 6) — the subject of Property 17.

import { evaluateMatch } from '@/lib/investor-matching';
import type {
  InvestorProfile,
  MatchResult,
  MatchSignal,
  StartupCandidate,
} from '@/types';

/* -------------------------------------------------------------------------- */
/* Signal → badge style (Property 22)                                         */
/* -------------------------------------------------------------------------- */

/**
 * The logical badge styles a match signal may resolve to. Deliberately a closed
 * set that EXCLUDES `'danger'`: an out-of-thesis startup is a poor fit, not an
 * error, so it is rendered muted rather than in an alarming danger style
 * (Req 39.4, Property 22).
 */
export type MatchSignalBadgeStyle = 'success' | 'warning' | 'muted';

/**
 * Resolve a {@link MatchSignal} to its logical badge style:
 *   - `strong`        → `success`
 *   - `possible`      → `warning`
 *   - `out-of-thesis` → `muted`
 *
 * Total over the finite `MatchSignal` union and never returns `'danger'`.
 */
export function matchSignalBadgeStyle(signal: MatchSignal): MatchSignalBadgeStyle {
  switch (signal) {
    case 'strong':
      return 'success';
    case 'possible':
      return 'warning';
    case 'out-of-thesis':
      return 'muted';
  }
}

/**
 * Resolve a {@link MatchSignal} to its human-readable label used on a MatchCard
 * badge: "Strong Match" / "Possible Match" / "Out of Thesis".
 */
export function matchSignalLabel(signal: MatchSignal): string {
  switch (signal) {
    case 'strong':
      return 'Strong Match';
    case 'possible':
      return 'Possible Match';
    case 'out-of-thesis':
      return 'Out of Thesis';
  }
}

/* -------------------------------------------------------------------------- */
/* Top-match selection (Property 17)                                          */
/* -------------------------------------------------------------------------- */

/** A startup candidate paired with its evaluated match result. */
export interface MatchedStartup {
  candidate: StartupCandidate;
  match: MatchResult;
}

/**
 * Score every candidate against the investor thesis, then return the strongest
 * matches: sorted by `score` descending with a stable `startupId`-ascending
 * tie-break, and sliced to at most `limit` results (default 6).
 *
 * Pure and deterministic: `evaluateMatch` is pure and the sort comparator is
 * total, so identical inputs always yield identical output. Because the result
 * is the head of a fully-sorted list, every excluded candidate has a score that
 * is less than or equal to every included candidate's score (Property 17).
 */
export function selectTopMatches(
  investor: InvestorProfile,
  candidates: readonly StartupCandidate[],
  limit = 6,
): MatchedStartup[] {
  const evaluated: MatchedStartup[] = candidates.map((candidate) => ({
    candidate,
    match: evaluateMatch(investor, candidate),
  }));

  evaluated.sort((a, b) => {
    if (b.match.score !== a.match.score) {
      return b.match.score - a.match.score;
    }
    // Tie-break: ascending startupId for a stable, deterministic order.
    if (a.match.startupId < b.match.startupId) return -1;
    if (a.match.startupId > b.match.startupId) return 1;
    return 0;
  });

  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 0;
  return evaluated.slice(0, safeLimit);
}

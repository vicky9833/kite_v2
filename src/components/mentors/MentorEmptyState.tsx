// ===========================================================================
// KITE Ecosystem Enablement (Prompt 5) — Mentors Index empty state.
//
// Rendered in No_Results_State (the active filter combination matches zero
// mentors). It names each active filter's dimension and selected value using
// the pure `describeActiveMentorFilters` helper, so visitors understand exactly
// which selections produced the empty result (Req 9.9) rather than seeing a
// blank grid.
//
// Pure presentation only: no I/O, no network, no storage. Visual discipline:
// institutional, Lucide icons only, no gradients/emoji.
//
// Requirements: 9.9
// ===========================================================================

import { SearchX } from "lucide-react";

import type { MentorFilters } from "@/types";
import { describeActiveMentorFilters } from "@/lib/mentor-filters";
import { cn } from "@/lib/utils";

export interface MentorEmptyStateProps {
  /** The active filter state that produced zero matches. */
  readonly filters: MentorFilters;
  readonly className?: string;
}

/**
 * Empty-state panel shown when no mentor matches the active filters. Lists one
 * line per active filter dimension via `describeActiveMentorFilters`.
 */
export function MentorEmptyState({
  filters,
  className,
}: MentorEmptyStateProps) {
  const activeFilters = describeActiveMentorFilters(filters);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-12 text-center shadow-sm",
        className,
      )}
    >
      <SearchX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1.5">
        <p className="text-base font-semibold text-dark">
          No mentors match the selected filters
        </p>
        <p className="text-sm text-muted-foreground">
          Adjust or clear the filters below to see more results.
        </p>
      </div>

      {activeFilters.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Active filters
          </p>
          <ul className="flex flex-col items-center gap-1.5">
            {activeFilters.map((line) => (
              <li
                key={line}
                className="rounded-lg border border-border bg-surface px-3 py-1 text-sm text-dark"
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MentorEmptyState;

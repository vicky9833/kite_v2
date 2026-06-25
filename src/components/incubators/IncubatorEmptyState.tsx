// ===========================================================================
// KITE Ecosystem Enablement (Prompt 5) — Incubators Index empty state.
//
// Rendered in No_Results_State (the active filter combination matches zero
// incubators). It names each active filter's dimension and selected value using
// the pure `describeActiveFilters` helper, so visitors understand exactly which
// selections produced the empty result (Req 2.10) rather than seeing a blank
// grid.
//
// Pure presentation only: no I/O, no network, no storage. Visual discipline:
// institutional, Lucide icons only, no gradients/emoji.
//
// Requirements: 2.10
// ===========================================================================

import { SearchX } from "lucide-react";

import type { IncubatorFilters } from "@/types";
import { describeActiveFilters } from "@/lib/incubator-filters";
import { cn } from "@/lib/utils";

export interface IncubatorEmptyStateProps {
  /** The active filter state that produced zero matches. */
  readonly filters: IncubatorFilters;
  readonly className?: string;
}

/**
 * Empty-state panel shown when no incubator matches the active filters. Lists
 * one line per active filter dimension via `describeActiveFilters`.
 */
export function IncubatorEmptyState({
  filters,
  className,
}: IncubatorEmptyStateProps) {
  const activeFilters = describeActiveFilters(filters);

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
          No incubators match the selected filters
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

export default IncubatorEmptyState;

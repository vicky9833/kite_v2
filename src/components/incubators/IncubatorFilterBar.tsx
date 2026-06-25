// ===========================================================================
// KITE Ecosystem Enablement (Prompt 5) — Incubators Index filter bar.
//
// A controlled component for the three filter dimensions (cluster, focus, type)
// plus a clear-all control. Each control carries a visible <label> associated to
// its <select> via htmlFor/id, giving every control an accessible name
// (Req 14.2, 14.4). The matching count is announced through an
// aria-live="polite" region whenever it changes (Req 2.11, 14.6).
//
// Pure presentation + callbacks only: no I/O, no network, no storage. Option
// lists are derived from the verified Incubator_Data via the pure helpers in
// `@/lib/incubator-filters`, so the cluster/focus options always equal the
// distinct values present in the data (Req 2.1, 2.2).
//
// Visual discipline: institutional, Lucide icons only, no gradients/emoji.
//
// Requirements: 2.1, 2.2, 2.3, 2.8, 2.11, 14.2, 14.4, 14.6
// ===========================================================================

"use client";

import * as React from "react";
import { X } from "lucide-react";

import type { Incubator, IncubatorFilters, IncubatorType } from "@/types";
import {
  deriveClusterOptions,
  deriveFocusOptions,
  EMPTY_INCUBATOR_FILTERS,
} from "@/lib/incubator-filters";
import { cn } from "@/lib/utils";

/** The three incubator type values, in the order required by Req 2.3. */
const TYPE_OPTIONS: readonly IncubatorType[] = [
  "Incubator",
  "Accelerator",
  "Research Park",
];

const FIELD_CLASS =
  "rounded-lg border border-border bg-card px-3 py-2 text-sm text-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const LABEL_CLASS = "text-xs font-medium text-muted-foreground";

export interface IncubatorFilterBarProps {
  /** Verified incubator records — source for the cluster/focus option lists. */
  readonly data: readonly Incubator[];
  /** Current controlled filter state. */
  readonly filters: IncubatorFilters;
  /** Number of incubators matching the current filters (0–24 inclusive). */
  readonly resultCount: number;
  /** Called with the next filter state whenever a control changes. */
  readonly onChange: (filters: IncubatorFilters) => void;
  /** Called when the clear-all control is activated. */
  readonly onClear: () => void;
  readonly className?: string;
}

/**
 * Controlled filter bar for the Incubators Index. A native `<select>` value of
 * "" represents the inactive ("All") state and maps to `null` in the filter
 * model.
 */
export function IncubatorFilterBar({
  data,
  filters,
  resultCount,
  onChange,
  onClear,
  className,
}: IncubatorFilterBarProps) {
  const clusterOptions = React.useMemo(
    () => deriveClusterOptions(data),
    [data],
  );
  const focusOptions = React.useMemo(() => deriveFocusOptions(data), [data]);

  const hasActiveFilter =
    filters.cluster !== null || filters.focus !== null || filters.type !== null;

  const handleCluster = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange({ ...filters, cluster: value === "" ? null : value });
  };

  const handleFocus = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange({ ...filters, focus: value === "" ? null : value });
  };

  const handleType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange({
      ...filters,
      type: value === "" ? null : (value as IncubatorType),
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        {/* Cluster */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="incubator-filter-cluster" className={LABEL_CLASS}>
            Cluster
          </label>
          <select
            id="incubator-filter-cluster"
            value={filters.cluster ?? ""}
            onChange={handleCluster}
            className={cn(FIELD_CLASS, "min-w-[12rem]")}
          >
            <option value="">All clusters</option>
            {clusterOptions.map((cluster) => (
              <option key={cluster} value={cluster}>
                {cluster}
              </option>
            ))}
          </select>
        </div>

        {/* Focus / sector */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="incubator-filter-focus" className={LABEL_CLASS}>
            Focus
          </label>
          <select
            id="incubator-filter-focus"
            value={filters.focus ?? ""}
            onChange={handleFocus}
            className={cn(FIELD_CLASS, "min-w-[12rem]")}
          >
            <option value="">All focus areas</option>
            {focusOptions.map((focus) => (
              <option key={focus} value={focus}>
                {focus}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="incubator-filter-type" className={LABEL_CLASS}>
            Type
          </label>
          <select
            id="incubator-filter-type"
            value={filters.type ?? ""}
            onChange={handleType}
            className={cn(FIELD_CLASS, "min-w-[10rem]")}
          >
            <option value="">All types</option>
            {TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Clear all */}
        <button
          type="button"
          onClick={onClear}
          disabled={!hasActiveFilter}
          className={cn(
            "inline-flex h-[2.625rem] items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-dark shadow-sm transition-colors",
            "hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear all
        </button>
      </div>

      {/* Matching count — announced on change (Req 2.11, 14.6). */}
      <p
        aria-live="polite"
        className="text-sm font-medium text-muted-foreground lg:self-end lg:pb-2.5"
      >
        {resultCount} {resultCount === 1 ? "incubator" : "incubators"} match
      </p>
    </div>
  );
}

/** Re-exported so callers can reset to the inactive state without re-deriving. */
export { EMPTY_INCUBATOR_FILTERS };

export default IncubatorFilterBar;

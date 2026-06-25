// ===========================================================================
// KITE Ecosystem Enablement (Prompt 5) — Mentors Index filter bar.
//
// A controlled component for the three mentor filter dimensions (sector,
// mentor type, experience level) plus a clear-all control. Each control carries
// a visible <label> associated to its <select> via htmlFor/id, giving every
// control an accessible name (Req 14.2, 14.4). The matching count is announced
// through an aria-live="polite" region whenever it changes (Req 9.10, 14.6).
//
// Pure presentation + callbacks only: no I/O, no network, no storage. Sector
// options are the 20 canonical sectors from `@/data/sectors` (display = name,
// value = id); mentor types come from MENTOR_TYPES; experience options come
// from EXPERIENCE_BANDS in `@/lib/mentor-filters`.
//
// Visual discipline: institutional, Lucide icons only, no gradients/emoji.
//
// Requirements: 9.6, 9.10, 14.2, 14.4, 14.6
// ===========================================================================

"use client";

import * as React from "react";
import { X } from "lucide-react";

import type { ExperienceLevel, MentorFilters, MentorType } from "@/types";
import { MENTOR_TYPES } from "@/types";
import { sectors } from "@/data/sectors";
import { EMPTY_MENTOR_FILTERS, EXPERIENCE_BANDS } from "@/lib/mentor-filters";
import { cn } from "@/lib/utils";

const FIELD_CLASS =
  "rounded-lg border border-border bg-card px-3 py-2 text-sm text-dark shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const LABEL_CLASS = "text-xs font-medium text-muted-foreground";

export interface MentorFilterBarProps {
  /** Current controlled filter state. */
  readonly filters: MentorFilters;
  /** Number of mentors matching the current filters. */
  readonly resultCount: number;
  /** Called with the next filter state whenever a control changes. */
  readonly onChange: (filters: MentorFilters) => void;
  /** Called when the clear-all control is activated. */
  readonly onClear: () => void;
  readonly className?: string;
}

/**
 * Controlled filter bar for the Mentors Index. A native `<select>` value of ""
 * represents the inactive ("All") state and maps to `null` in the filter model.
 */
export function MentorFilterBar({
  filters,
  resultCount,
  onChange,
  onClear,
  className,
}: MentorFilterBarProps) {
  const hasActiveFilter =
    filters.sector !== null ||
    filters.mentorType !== null ||
    filters.experienceLevel !== null;

  const handleSector = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange({ ...filters, sector: value === "" ? null : value });
  };

  const handleMentorType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange({
      ...filters,
      mentorType: value === "" ? null : (value as MentorType),
    });
  };

  const handleExperience = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange({
      ...filters,
      experienceLevel: value === "" ? null : (value as ExperienceLevel),
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
        {/* Sector */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mentor-filter-sector" className={LABEL_CLASS}>
            Sector
          </label>
          <select
            id="mentor-filter-sector"
            value={filters.sector ?? ""}
            onChange={handleSector}
            className={cn(FIELD_CLASS, "min-w-[12rem]")}
          >
            <option value="">All sectors</option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mentor type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mentor-filter-type" className={LABEL_CLASS}>
            Mentor type
          </label>
          <select
            id="mentor-filter-type"
            value={filters.mentorType ?? ""}
            onChange={handleMentorType}
            className={cn(FIELD_CLASS, "min-w-[12rem]")}
          >
            <option value="">All mentor types</option>
            {MENTOR_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Experience level */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="mentor-filter-experience" className={LABEL_CLASS}>
            Experience level
          </label>
          <select
            id="mentor-filter-experience"
            value={filters.experienceLevel ?? ""}
            onChange={handleExperience}
            className={cn(FIELD_CLASS, "min-w-[12rem]")}
          >
            <option value="">All experience levels</option>
            {EXPERIENCE_BANDS.map((band) => (
              <option key={band.id} value={band.id}>
                {band.label}
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

      {/* Matching count — announced on change (Req 9.10, 14.6). */}
      <p
        aria-live="polite"
        className="text-sm font-medium text-muted-foreground lg:self-end lg:pb-2.5"
      >
        {resultCount} {resultCount === 1 ? "mentor" : "mentors"} match
      </p>
    </div>
  );
}

/** Re-exported so callers can reset to the inactive state without re-deriving. */
export { EMPTY_MENTOR_FILTERS };

export default MentorFilterBar;

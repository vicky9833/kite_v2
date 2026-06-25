"use client";

// src/app/mentors/page.tsx
//
// `/mentors` — the Mentors Index + illustrative Detail (Req 6, 9, 10, 12, 13).
// A `"use client"` island: all state is in-memory and session-only — no URL
// params, no storage (Req 12.3, 12.4).
//
// Composition:
//   - `MentorDirectoryHeaderStrip` introduces the directory and labels it as
//     illustrative synthetic preview content (Req 6, 13).
//   - The synthetic directory is generated ONCE via `generateMentors()` and
//     memoized so it is a stable reference for the component lifetime — the
//     same byte-stable `MentorProfile[]` backs both filtering and detail
//     resolution.
//   - `MentorFilterBar` is a controlled three-dimension filter (sector,
//     mentor type, experience level) + clear-all; it owns the `aria-live`
//     matching-count region, driven by `resultCount` (Req 9.10).
//   - The filtered list is computed by the pure `filterMentors` via `useMemo`
//     keyed on the filter state and the once-generated directory, so it is a
//     subset of the data in original order (Req 9.4–9.8).
//   - When the filtered list is empty, `MentorEmptyState` names the active
//     filters (Req 9.9); otherwise `MentorCardGrid` renders one card per record.
//   - `MentorDetailPanel` renders at most one open detail. A card's
//     `onActivate` sets `openDetailId`; the panel's `onClose` clears ONLY
//     `openDetailId`, preserving the filter state (Req 10.4).

import { useMemo, useState } from "react";

import { MentorCardGrid } from "@/components/mentors/MentorCardGrid";
import { MentorDetailPanel } from "@/components/mentors/MentorDetailPanel";
import { MentorDirectoryHeaderStrip } from "@/components/mentors/MentorDirectoryHeaderStrip";
import { MentorEmptyState } from "@/components/mentors/MentorEmptyState";
import { MentorFilterBar } from "@/components/mentors/MentorFilterBar";
import { EMPTY_MENTOR_FILTERS, filterMentors } from "@/lib/mentor-filters";
import { generateMentors } from "@/lib/synthetic-mentors";
import type { MentorFilters } from "@/types";

export default function MentorsPage() {
  // Generate the synthetic directory ONCE — stable for the component lifetime.
  const mentors = useMemo(() => generateMentors(), []);

  // Session-only filter state — no URL/storage (Req 12.3, 12.4).
  const [filters, setFilters] = useState<MentorFilters>(EMPTY_MENTOR_FILTERS);

  // At-most-one-open detail selection, independent of the filter state.
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);

  // Pure, subset-preserving filtering recomputed only when inputs change.
  const filtered = useMemo(
    () => filterMentors(mentors, filters),
    [mentors, filters],
  );

  // Resolve the open detail id to its record (or null for unknown/none).
  const openMentor = useMemo(
    () =>
      openDetailId === null
        ? null
        : mentors.find((mentor) => mentor.id === openDetailId) ?? null,
    [mentors, openDetailId],
  );

  const isEmpty = filtered.length === 0;

  return (
    <main>
      <MentorDirectoryHeaderStrip />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="flex flex-col gap-8">
          <MentorFilterBar
            filters={filters}
            resultCount={filtered.length}
            onChange={setFilters}
            onClear={() => setFilters(EMPTY_MENTOR_FILTERS)}
          />

          {openMentor !== null && (
            <MentorDetailPanel
              mentor={openMentor}
              onClose={() => setOpenDetailId(null)}
            />
          )}

          {isEmpty ? (
            <MentorEmptyState filters={filters} />
          ) : (
            <MentorCardGrid mentors={filtered} onActivate={setOpenDetailId} />
          )}
        </div>
      </div>
    </main>
  );
}

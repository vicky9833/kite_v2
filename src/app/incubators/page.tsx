"use client";

// src/app/incubators/page.tsx
//
// `/incubators` — the Incubators & Accelerators Index + illustrative Detail
// (Req 1, 2, 3, 12, 13). A `"use client"` island: all state is in-memory and
// session-only — no URL params, no storage (Req 12.3, 12.4).
//
// Composition:
//   - `IncubatorsHeaderStrip` states the verified canonical figure (Karnataka
//     hosts 164+ incubators/accelerators) and labels the listed 24 as a
//     representative verified subset (Req 1.4, 1.5).
//   - `IncubatorFilterBar` is a controlled three-dimension filter (cluster,
//     focus, type) + clear-all; it owns the `aria-live` matching-count region
//     (Req 2.11), driven by `resultCount`.
//   - The filtered list is computed by the pure `filterIncubators` via `useMemo`
//     keyed on the filter state, so it is a subset of the verified data in the
//     original order (Req 2.7).
//   - When the filtered list is empty, `IncubatorEmptyState` names the active
//     filters (Req 2.10); otherwise `IncubatorCardGrid` renders one card per
//     record (Req 1.6).
//   - `IncubatorDetailPanel` renders at most one open detail. A card's
//     `onActivate` sets `openDetailId`; the panel's `onClose` clears ONLY
//     `openDetailId`, preserving the filter state (Req 3.7).

import { useMemo, useState } from "react";

import { IncubatorCardGrid } from "@/components/incubators/IncubatorCardGrid";
import { IncubatorDetailPanel } from "@/components/incubators/IncubatorDetailPanel";
import { IncubatorEmptyState } from "@/components/incubators/IncubatorEmptyState";
import { IncubatorFilterBar } from "@/components/incubators/IncubatorFilterBar";
import { IncubatorsHeaderStrip } from "@/components/incubators/IncubatorsHeaderStrip";
import { incubators } from "@/data/incubators";
import {
  EMPTY_INCUBATOR_FILTERS,
  filterIncubators,
} from "@/lib/incubator-filters";
import type { IncubatorFilters } from "@/types";

export default function IncubatorsPage() {
  // Session-only filter state — no URL/storage (Req 12.3, 12.4).
  const [filters, setFilters] = useState<IncubatorFilters>(
    EMPTY_INCUBATOR_FILTERS,
  );

  // At-most-one-open detail selection, independent of the filter state.
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);

  // Pure, subset-preserving filtering recomputed only when filters change.
  const filtered = useMemo(
    () => filterIncubators(incubators, filters),
    [filters],
  );

  // Resolve the open detail id to its record (or null for unknown/none).
  const openIncubator = useMemo(
    () =>
      openDetailId === null
        ? null
        : incubators.find((incubator) => incubator.id === openDetailId) ?? null,
    [openDetailId],
  );

  const isEmpty = filtered.length === 0;

  return (
    <main>
      <IncubatorsHeaderStrip listedCount={incubators.length} />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="flex flex-col gap-8">
          <IncubatorFilterBar
            data={incubators}
            filters={filters}
            resultCount={filtered.length}
            onChange={setFilters}
            onClear={() => setFilters(EMPTY_INCUBATOR_FILTERS)}
          />

          {openIncubator !== null && (
            <IncubatorDetailPanel
              incubator={openIncubator}
              onClose={() => setOpenDetailId(null)}
            />
          )}

          {isEmpty ? (
            <IncubatorEmptyState filters={filters} />
          ) : (
            <IncubatorCardGrid
              incubators={filtered}
              onActivate={setOpenDetailId}
            />
          )}
        </div>
      </div>
    </main>
  );
}

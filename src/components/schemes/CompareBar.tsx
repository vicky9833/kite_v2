"use client";

import * as React from "react";
import { X, GitCompareArrows } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { schemes } from "@/data/schemes";

const MAX_COMPARE = 3;

export interface CompareBarProps {
  /** Ids of schemes currently selected for comparison (expected 0–3). */
  selectedIds: string[];
  /** Empties the Compare_Selection and hides the bar (Req 14.4). */
  onClear: () => void;
  /** Navigates to the side-by-side compare view (Req 14.5). */
  onCompare: () => void;
  className?: string;
}

/**
 * Fixed bottom compare bar for the Schemes Hub (Req 14.2, 14.4, 14.5, 14.6, 14.7).
 *
 * Renders nothing while the selection is empty. When 1–3 schemes are selected it
 * shows the selected scheme names as chips, a polite live-region count, and
 * Compare / Clear controls. Standard buttons keep it fully keyboard operable.
 */
export function CompareBar({
  selectedIds,
  onClear,
  onCompare,
  className,
}: CompareBarProps) {
  // Req 14.6 — no bar while the selection is empty.
  if (selectedIds.length === 0) {
    return null;
  }

  // Resolve names from canonical data, preserving selection order and skipping
  // any unknown id defensively.
  const selected = selectedIds
    .map((id) => schemes.find((scheme) => scheme.id === id))
    .filter((scheme): scheme is (typeof schemes)[number] => Boolean(scheme));

  const count = selected.length;
  const noun = count === 1 ? "scheme" : "schemes";
  const announcement = `${count} of ${MAX_COMPARE} ${noun} selected for comparison`;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card shadow-sm",
        "animate-in fade-in slide-in-from-bottom-4 duration-300",
        className,
      )}
      role="region"
      aria-label="Scheme comparison selection"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Polite live region announcing the selected count. */}
          <p aria-live="polite" className="text-caption font-medium text-foreground">
            {announcement}
          </p>
          <ul className="flex flex-wrap gap-2">
            {selected.map((scheme) => (
              <li
                key={scheme.id}
                className="inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-caption text-muted-foreground"
              >
                {scheme.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X aria-hidden="true" />
            Clear
          </Button>
          <Button variant="accent" size="sm" onClick={onCompare}>
            <GitCompareArrows aria-hidden="true" />
            Compare
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CompareBar;

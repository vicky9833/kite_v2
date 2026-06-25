"use client";

import * as React from "react";

import { sectors } from "@/data/sectors";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SectorChip } from "@/components/shared/SectorChip";

export interface SectorExplorerSectionProps {
  /** Extra classes merged onto the section root. */
  className?: string;
}

/**
 * SectorExplorerSection — the Home page's "Explore by Sector" band (Req 14).
 *
 * Renders a wrapping tag-cloud of clickable sector chips sourced from
 * `src/data/sectors.ts`, in source order. A single chip may be selected at a
 * time (most-recent wins); selection is held in local state and is purely
 * VISUAL — it does not alter, filter, reorder, or remove any data elsewhere on
 * the page (Req 14.6/14.7). When the sector list is empty, the section renders
 * its heading with no chips and no broken/empty chip element (Req 14.8).
 *
 * Client Component: owns the single-select `useState`.
 */
export function SectorExplorerSection({ className }: SectorExplorerSectionProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const handleSelect = React.useCallback((id: string): void => {
    // Single-select, most-recent wins. Selection is visual-only.
    setSelectedId(id);
  }, []);

  return (
    <section className={cn("bg-surface py-16 md:py-24", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Explore by Sector"
          title="Twenty Sectors Driving Karnataka"
          description="Browse the industries shaping Karnataka's innovation economy, from deep tech and AI to mobility, manufacturing, and beyond."
        />

        {sectors.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-3">
            {sectors.map((sector) => (
              <SectorChip
                key={sector.id}
                sector={sector}
                selected={sector.id === selectedId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default SectorExplorerSection;

"use client";

import { IncubatorCard } from "@/components/incubators/IncubatorCard";
import { cn } from "@/lib/utils";
import type { Incubator } from "@/types";

/**
 * IncubatorCardGrid — renders one {@link IncubatorCard} per incubator record
 * in a responsive grid (Req 1.2, 1.6): three columns on desktop, two on
 * tablet, one on mobile. The `max-w-7xl` container and section padding are
 * applied by the page (Req 15.3).
 *
 * Client Component (forwards card activation).
 */
export interface IncubatorCardGridProps {
  /** The incubator records to render — one card each. */
  incubators: readonly Incubator[];
  /** Invoked with the incubator id when a card is activated. */
  onActivate: (incubatorId: string) => void;
  /** Extra classes merged onto the grid root. */
  className?: string;
}

export function IncubatorCardGrid({
  incubators,
  onActivate,
  className,
}: IncubatorCardGridProps) {
  return (
    <ul
      className={cn(
        "grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {incubators.map((incubator) => (
        <li key={incubator.id} className="h-full">
          <IncubatorCard incubator={incubator} onActivate={onActivate} />
        </li>
      ))}
    </ul>
  );
}

export default IncubatorCardGrid;

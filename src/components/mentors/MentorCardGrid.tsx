"use client";

import { MentorCard } from "@/components/mentors/MentorCard";
import { cn } from "@/lib/utils";
import type { MentorProfile } from "@/types";

/**
 * MentorCardGrid — renders one {@link MentorCard} per {@link MentorProfile} in
 * a responsive grid (Req 6.2, 6.4): three columns on desktop, two on tablet,
 * one on mobile. The `max-w-7xl` container and section padding are applied by
 * the page (Req 15.3).
 *
 * Client Component (forwards card activation).
 */
export interface MentorCardGridProps {
  /** The mentor records to render — one card each. */
  mentors: readonly MentorProfile[];
  /** Invoked with the mentor id when a card is activated. */
  onActivate: (mentorId: string) => void;
  /** Extra classes merged onto the grid root. */
  className?: string;
}

export function MentorCardGrid({ mentors, onActivate, className }: MentorCardGridProps) {
  return (
    <ul
      className={cn(
        "grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {mentors.map((mentor) => (
        <li key={mentor.id} className="h-full">
          <MentorCard mentor={mentor} onActivate={onActivate} />
        </li>
      ))}
    </ul>
  );
}

export default MentorCardGrid;

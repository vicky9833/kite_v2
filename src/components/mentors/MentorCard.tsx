"use client";

import * as React from "react";
import { Briefcase, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { sectors } from "@/data/sectors";
import { cn } from "@/lib/utils";
import type { MentorProfile } from "@/types";

/** Resolve a sector id → its canonical display label, falling back to the id. */
function resolveSectorLabel(sectorId: string): string {
  return sectors.find((s) => s.id === sectorId)?.name ?? sectorId;
}

/**
 * MentorCard — a single synthetic mentor card for the Mentor Connect directory
 * (Req 6.2, 8.9). It renders the {@link MentorProfile}'s `name`, an
 * initials-avatar placeholder (a circle with the mentor's initials and NO
 * photograph; Req 8.2) whose text alternative equals the mentor's name
 * (Req 14.7), `title`, `firm`, sectors of expertise (sector ids mapped to
 * canonical names; Req 8.4), `yearsExperience`, `mentorType`, and
 * `availability`.
 *
 * The whole card is a single activation target: rendered with `role="button"`,
 * focusable, and activated on pointer click or keyboard (Enter / Space),
 * invoking `onActivate` with the mentor id (Req 10.1). It carries an accessible
 * name including the mentor name and type (Req 14.2) and the institutional
 * visual treatment — `rounded-xl shadow-sm border` (Req 15.1).
 *
 * Client Component (keyboard/pointer activation).
 */
export interface MentorCardProps {
  /** The synthetic mentor record to render. */
  mentor: MentorProfile;
  /** Invoked with the mentor id on pointer or keyboard activation. */
  onActivate: (mentorId: string) => void;
  /** Extra classes merged onto the card root. */
  className?: string;
}

export function MentorCard({ mentor, onActivate, className }: MentorCardProps) {
  const {
    id,
    name,
    initialsAvatar,
    title,
    firm,
    sectors: sectorIds,
    yearsExperience,
    mentorType,
    availability,
  } = mentor;

  const activate = React.useCallback((): void => {
    onActivate(id);
  }, [onActivate, id]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        activate();
      }
    },
    [activate],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${name} — ${mentorType}`}
      onClick={activate}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm outline-none transition-colors",
        "hover:border-primary/30 hover:shadow",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          role="img"
          aria-label={name}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-surface font-heading text-lg font-semibold text-primary"
        >
          <span aria-hidden>{initialsAvatar}</span>
        </span>

        <div className="flex flex-col">
          <h2 className="font-heading text-lg font-semibold text-dark">{name}</h2>
          <p className="text-caption text-muted">{title}</p>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-caption text-muted">
        <Briefcase aria-hidden className="h-3.5 w-3.5" />
        {firm}
      </p>

      <Badge variant="outline" className="w-fit">
        {mentorType}
      </Badge>

      <div className="flex flex-wrap gap-2 pt-1">
        {sectorIds.map((sectorId) => (
          <Badge key={`${id}-sector-${sectorId}`} variant="accent">
            {resolveSectorLabel(sectorId)}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 text-caption text-muted">
        <span>
          {yearsExperience} {yearsExperience === 1 ? "year" : "years"} of experience
        </span>
        <span className="flex items-center gap-1.5">
          <Clock aria-hidden className="h-3.5 w-3.5" />
          {availability}
        </span>
      </div>
    </div>
  );
}

export default MentorCard;

"use client";

import { useEffect, useId, useRef } from "react";
import { Briefcase, Building2, Clock, Layers, X } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { sectors } from "@/data/sectors";
import { cn } from "@/lib/utils";
import type { MentorProfile } from "@/types";

/** Resolve a sector id → its canonical display label, falling back to the id. */
function resolveSectorLabel(sectorId: string): string {
  return sectors.find((s) => s.id === sectorId)?.name ?? sectorId;
}

/**
 * MentorDetailPanel — the inline, at-most-one-open detail surface for a single
 * synthetic mentor (Req 10).
 *
 * Displays the selected {@link MentorProfile}: name, an initials-avatar
 * placeholder (a circle with the mentor's initials and NO photograph; Req 8.2)
 * whose text alternative equals the mentor's name (Req 14.7), professional
 * `title`, `firm`, sectors of expertise (sector ids mapped to canonical names;
 * Req 8.4), `yearsExperience`, `mentorType`, `availability`, and the
 * one-paragraph illustrative `bio` (Req 10.2).
 *
 * ALL mentor content is synthetic, so the panel carries a single
 * {@link IllustrativeBadge} marking the whole surface (Req 10.3).
 *
 * Accessibility: the panel is a labelled region landmark (Req 14.5), receives
 * focus on open, and is dismissable by a visible close control or the Escape
 * key (Req 10.4, 14.3), returning the caller to its prior state (the parent
 * owns filter/selection state).
 *
 * No-op guard: when `mentor` is `null` (no selection), the panel renders
 * nothing and never enters the open state.
 */
export interface MentorDetailPanelProps {
  /** The selected synthetic mentor, or `null` for no selection. */
  mentor: MentorProfile | null;
  /** Invoked when the visitor dismisses the panel (close control or Escape). */
  onClose: () => void;
  /** Extra classes merged onto the region landmark. */
  className?: string;
}

export function MentorDetailPanel({
  mentor,
  onClose,
  className,
}: MentorDetailPanelProps) {
  const headingId = useId();
  const regionRef = useRef<HTMLElement>(null);

  // Escape closes the panel and returns to the prior state (Req 10.4).
  useEffect(() => {
    if (!mentor) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mentor, onClose]);

  // Move focus into the panel on open so keyboard users land on the detail.
  useEffect(() => {
    if (mentor) regionRef.current?.focus();
  }, [mentor]);

  // No-op guard: no selection → render nothing, never open.
  if (!mentor) return null;

  const {
    name,
    initialsAvatar,
    title,
    firm,
    sectors: sectorIds,
    yearsExperience,
    mentorType,
    availability,
    bio,
  } = mentor;

  return (
    <section
      ref={regionRef}
      tabIndex={-1}
      role="region"
      aria-labelledby={headingId}
      aria-label={`Details for ${name}`}
      className={cn(
        "relative rounded-xl border border-border bg-card p-6 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:p-8",
        className,
      )}
    >
      {/* All mentor content is synthetic — one badge marks the whole panel (Req 10.3). */}
      <IllustrativeBadge />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Initials-avatar placeholder; text alternative = name (Req 8.2, 14.7). */}
          <span
            role="img"
            aria-label={name}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-surface font-heading text-xl font-semibold text-primary"
          >
            <span aria-hidden>{initialsAvatar}</span>
          </span>

          <div className="space-y-1">
            <h2 id={headingId} className="font-heading text-h3 text-dark">
              {name}
            </h2>
            <p className="text-body text-muted">{title}</p>
            <p className="flex items-center gap-1.5 text-body text-muted">
              <Building2 aria-hidden className="h-4 w-4" />
              {firm}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={`Close details for ${name}`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "shrink-0",
          )}
        >
          <X aria-hidden className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {/* Practice snapshot: mentor type, experience, availability. */}
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="flex items-center gap-1.5 text-caption text-muted">
              <Briefcase aria-hidden className="h-4 w-4" />
              Mentor type
            </dt>
            <dd className="mt-1 text-body text-dark">{mentorType}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-caption text-muted">
              <Layers aria-hidden className="h-4 w-4" />
              Experience
            </dt>
            <dd className="mt-1 text-body text-dark">
              {yearsExperience} {yearsExperience === 1 ? "year" : "years"}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-caption text-muted">
              <Clock aria-hidden className="h-4 w-4" />
              Availability
            </dt>
            <dd className="mt-1 text-body text-dark">{availability}</dd>
          </div>
        </dl>

        {/* Sectors of expertise (ids → canonical names; Req 8.4). */}
        <div>
          <h3 className="font-heading text-base font-semibold text-dark">
            Sectors of expertise
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Sectors of expertise">
            {sectorIds.map((sectorId) => (
              <li key={`sector-${sectorId}`}>
                <Badge variant="accent">{resolveSectorLabel(sectorId)}</Badge>
              </li>
            ))}
          </ul>
        </div>

        {/* One-paragraph illustrative bio (Req 10.2). */}
        <div>
          <h3 className="font-heading text-base font-semibold text-dark">
            About
          </h3>
          <p className="mt-2 text-body text-muted">{bio}</p>
        </div>
      </div>
    </section>
  );
}

export default MentorDetailPanel;

"use client";

import { useEffect, useId, useRef } from "react";
import { Building2, Layers, MapPin, Tag, Users, X } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { generateIncubatorDetail } from "@/lib/synthetic-incubator-detail";
import { cn } from "@/lib/utils";
import type { Incubator } from "@/types";

/**
 * IncubatorDetailPanel — the inline, at-most-one-open detail surface for a
 * single incubator (Req 3).
 *
 * Two content tiers, kept strictly separate:
 *  - VERIFIED fields (name, cluster, type, focus tags) are read straight from
 *    the `Incubator` record and rendered verbatim — no characters altered, tag
 *    order preserved — and carry NO {@link IllustrativeBadge} (Req 3.2, 3.5).
 *  - SYNTHETIC sections come from {@link generateIncubatorDetail}, which is pure
 *    and hash-seeded by the incubator id (Req 3.3, 3.6). Each synthetic section
 *    is wrapped with exactly one {@link IllustrativeBadge} (Req 3.4).
 *
 * Accessibility: the panel is a labelled region landmark (Req 14.5), receives
 * focus on open, and is dismissable by a visible close control or the Escape
 * key (Req 3.7, 14.3), returning the caller to its prior state with filters
 * preserved (the parent owns filter/selection state).
 *
 * No-op guard: when `incubator` is `null` (an unknown/absent id resolved no
 * record), the panel renders nothing and never enters the open state (Req 3.8).
 */
export interface IncubatorDetailPanelProps {
  /** The selected, already-resolved incubator, or `null` for no/unknown id. */
  incubator: Incubator | null;
  /** Invoked when the visitor dismisses the panel (close control or Escape). */
  onClose: () => void;
  /** Extra classes merged onto the region landmark. */
  className?: string;
}

export function IncubatorDetailPanel({
  incubator,
  onClose,
  className,
}: IncubatorDetailPanelProps) {
  const headingId = useId();
  const regionRef = useRef<HTMLElement>(null);

  // Escape closes the panel and returns to the prior state (Req 3.7).
  useEffect(() => {
    if (!incubator) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [incubator, onClose]);

  // Move focus into the panel on open so keyboard users land on the detail.
  useEffect(() => {
    if (incubator) regionRef.current?.focus();
  }, [incubator]);

  // No-op guard: unknown/absent id → render nothing, never open (Req 3.8).
  if (!incubator) return null;

  const { name, cluster, type, focus } = incubator;
  const detail = generateIncubatorDetail(incubator.id);

  return (
    <section
      ref={regionRef}
      tabIndex={-1}
      role="region"
      aria-labelledby={headingId}
      aria-label={`Details for ${name}`}
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:p-8",
        className,
      )}
    >
      {/* --- VERIFIED header (no IllustrativeBadge — Req 3.2, 3.5) --- */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <h2
            id={headingId}
            className="font-heading text-h3 text-dark"
          >
            {name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-body text-muted">
            <span className="flex items-center gap-1.5">
              <MapPin aria-hidden className="h-4 w-4" />
              {cluster}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 aria-hidden className="h-4 w-4" />
              {type}
            </span>
          </div>
          {focus.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Focus areas">
              {focus.map((tag, index) => (
                <li key={`${tag}-${index}`}>
                  <Badge variant="outline">{tag}</Badge>
                </li>
              ))}
            </ul>
          )}
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

      {/* --- SYNTHETIC sections (each wrapped in exactly one badge — Req 3.4) --- */}
      <div className="mt-8 space-y-6">
        {/* About — illustrative */}
        <div className="relative rounded-xl border border-border bg-surface p-5">
          <IllustrativeBadge />
          <h3 className="pr-20 font-heading text-base font-semibold text-dark">
            About
          </h3>
          <p className="mt-2 text-body text-muted">{detail.aboutParagraph}</p>
        </div>

        {/* Program snapshot — illustrative */}
        <div className="relative rounded-xl border border-border bg-surface p-5">
          <IllustrativeBadge />
          <h3 className="pr-20 font-heading text-base font-semibold text-dark">
            Program snapshot
          </h3>
          <dl className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-1.5 text-caption text-muted">
                <Layers aria-hidden className="h-4 w-4" />
                Cohorts per year
              </dt>
              <dd className="mt-1 font-heading text-h3 text-primary">
                {detail.cohortsPerYear}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-caption text-muted">
                <Users aria-hidden className="h-4 w-4" />
                Startups supported
              </dt>
              <dd className="mt-1 font-heading text-h3 text-primary">
                {detail.startupsSupported}
              </dd>
            </div>
          </dl>
        </div>

        {/* Offerings — illustrative */}
        <div className="relative rounded-xl border border-border bg-surface p-5">
          <IllustrativeBadge />
          <h3 className="pr-20 font-heading text-base font-semibold text-dark">
            Illustrative offerings
          </h3>
          <ul className="mt-3 space-y-2">
            {detail.illustrativeOfferings.map((offering, index) => (
              <li
                key={`${offering}-${index}`}
                className="flex items-start gap-2 text-body text-muted"
              >
                <Tag aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0" />
                {offering}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact — illustrative */}
        <div className="relative rounded-xl border border-border bg-surface p-5">
          <IllustrativeBadge />
          <h3 className="pr-20 font-heading text-base font-semibold text-dark">
            Contact
          </h3>
          <p className="mt-2 text-body text-muted">
            {detail.illustrativeContactLabel}
          </p>
        </div>
      </div>
    </section>
  );
}

export default IncubatorDetailPanel;

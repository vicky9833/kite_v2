"use client";

import { useEffect, useRef } from "react";
import { CalendarDays, MapPin, Share2, X } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { categoryLabel, formatDateRange } from "@/lib/events-format";
import { cn } from "@/lib/utils";
import type { EcosystemEvent } from "@/types";

/**
 * EventDetailPanel — inline detail panel for an event (Req 6.3), mirroring the
 * incubators/mentors detail-panel pattern. Shows the full editorial, what to
 * expect, who attends, a registration link, share options, and related events.
 * Escape closes the panel and focus returns to the panel container on open.
 */
export interface EventDetailPanelProps {
  event: EcosystemEvent;
  relatedEvents: EcosystemEvent[];
  onClose: () => void;
  onSelectRelated: (id: string) => void;
}

export function EventDetailPanel({
  event,
  relatedEvents,
  onClose,
  onSelectRelated,
}: EventDetailPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [event.id]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="region"
      aria-label={`${event.name} details`}
      className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md border border-border bg-surface px-2.5 py-1 text-caption font-medium text-muted">
              {categoryLabel(event.category)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-caption text-muted">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              {formatDateRange(event.startDate, event.endDate)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-caption text-muted">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {event.location}
            </span>
          </div>
          <h3
            ref={headingRef}
            tabIndex={-1}
            className="font-heading text-h2 text-dark outline-none"
          >
            {event.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close event details"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <p className="mt-4 max-w-3xl text-body text-muted">{event.description}</p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h4 className="font-heading text-h3 text-dark">What to expect</h4>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-body text-muted">
            <li>Keynotes and sessions from ecosystem leaders</li>
            <li>Networking with founders, investors, and government</li>
            <li>Showcases of Karnataka startups and programs</li>
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h4 className="font-heading text-h3 text-dark">Who attends</h4>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-body text-muted">
            <li>Founders and startup teams across stages</li>
            <li>Investors, incubators, and accelerators</li>
            <li>Government, academia, and ecosystem partners</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href="https://eitbt.karnataka.gov.in/startup"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "accent" }))}
        >
          Registration &amp; details
        </a>
        <span className="inline-flex items-center gap-1.5 text-caption text-muted">
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share this event
        </span>
      </div>

      {relatedEvents.length > 0 && (
        <div className="mt-8 border-t border-border pt-6">
          <h4 className="font-heading text-h3 text-dark">Related events</h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {relatedEvents.map((related) => (
              <li key={related.id}>
                <button
                  type="button"
                  onClick={() => onSelectRelated(related.id)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-caption text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {related.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default EventDetailPanel;

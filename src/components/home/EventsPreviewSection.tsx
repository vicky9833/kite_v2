import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { EventCard } from "@/components/shared/EventCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { events } from "@/data/events";
import { cn, selectPreview } from "@/lib/utils";

/**
 * EventsPreviewSection — the "Events & Convenings" Home section (Req 15).
 *
 * Government-grade editorial, NOT SaaS marketing: a flat white background
 * (`bg-card`) with restrained typography and the Karnataka palette. There are
 * NO gradients, blobs, glow, glassmorphism, or emoji.
 *
 * The preview list is sourced from `src/data/events.ts` via `selectPreview`,
 * which sorts ascending by `startDate` and bounds the result to 4–6 events
 * (Req 15.2). The Home section then caps the display to the first four rows
 * (founder judgment — a focused, chronological stack reads cleaner on the
 * landing page than the full six). Each event is rendered as a full-width
 * horizontal {@link EventCard} in a vertical stack.
 *
 * Unavailable-data guard (Req 15.6): if the events source is empty (or resolves
 * to nothing), the cards are suppressed and a restrained "No upcoming events at
 * this time." message is shown instead.
 *
 * Server Component — no interactivity; the "View All Events" and per-card links
 * are internal `next/link` navigations.
 */
export interface EventsPreviewSectionProps {
  /** Extra classes merged onto the section wrapper. */
  className?: string;
}

/** Maximum number of event rows shown in the Home preview. */
const HOME_PREVIEW_LIMIT = 4;

/** Sorted (ascending), bounded preview, capped to the Home display limit. */
const previewEvents = selectPreview(events).slice(0, HOME_PREVIEW_LIMIT);

export function EventsPreviewSection({ className }: EventsPreviewSectionProps) {
  const hasEvents = previewEvents.length > 0;

  return (
    <section className={cn("bg-card py-16 md:py-24", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Upcoming"
          title="Events & Convenings"
          description="Summits, demo days, and convenings across Karnataka's startup ecosystem — plan ahead and take part."
        />

        {hasEvents ? (
          <>
            <div className="mt-12 flex flex-col gap-5">
              {previewEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            <div className="mt-8">
              <Link
                href="/events"
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm",
                  "text-sm font-semibold text-primary",
                  "transition-colors hover:text-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                )}
              >
                View All Events
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-12 text-body text-muted">
            No upcoming events at this time.
          </p>
        )}
      </div>
    </section>
  );
}

export default EventsPreviewSection;

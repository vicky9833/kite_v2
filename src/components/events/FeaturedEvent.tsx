import { CalendarDays, MapPin } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { categoryLabel, formatDateRange } from "@/lib/events-format";
import { cn } from "@/lib/utils";
import type { EcosystemEvent } from "@/types";

/**
 * FeaturedEvent — large single-card editorial treatment of the most important
 * upcoming event (the flagship Bengaluru Tech Summit 2026) (Req 6.2). Shows the
 * event name, date range, location, full description, a registration CTA, and a
 * "See All Events" link to the grid.
 *
 * Server Component.
 */
export interface FeaturedEventProps {
  event: EcosystemEvent;
}

export function FeaturedEvent({ event }: FeaturedEventProps) {
  return (
    <section aria-labelledby="featured-event-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
          Featured event
        </span>
        <h2 id="featured-event-heading" className="mt-3 font-heading text-h2 text-dark">
          Featured Event
        </h2>

        <article className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-6 p-8 md:p-10">
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

            <h3 className="font-heading text-h1 text-dark">{event.name}</h3>
            <p className="max-w-3xl text-body text-muted">{event.description}</p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="https://eitbt.karnataka.gov.in/startup"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
              >
                Register Interest
              </a>
              <a
                href="#upcoming-events"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
              >
                See All Events
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default FeaturedEvent;

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * EventsHeroStrip — compact dark hero for the Events & Media Hub (Req 6.1).
 * Carries the page's single `h1`, an institutional subhead naming the count of
 * upcoming events and recent media coverage, and two CTAs anchoring to the
 * events grid and the media section.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface EventsHeroStripProps {
  upcomingCount: number;
  mediaCount: number;
}

export function EventsHeroStrip({ upcomingCount, mediaCount }: EventsHeroStripProps) {
  return (
    <section className="bg-dark py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
              Events &amp; Media
            </span>
            <h1 className="font-heading text-h1 text-white">
              The Karnataka startup calendar, in one place
            </h1>
            <p className="text-body text-slate-300">
              Track {upcomingCount} upcoming summits, demo days, and convenings,
              and follow {mediaCount}+ recent media mentions and government
              announcements shaping Karnataka&rsquo;s innovation ecosystem.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#upcoming-events"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
            >
              Browse Upcoming Events
            </a>
            <a
              href="#media-coverage"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              View Media Coverage
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventsHeroStrip;

"use client";

import { useMemo, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";

import { EventDetailPanel } from "@/components/events/EventDetailPanel";
import {
  categoryLabel,
  sortEventsChronologically,
  toDateBlock,
} from "@/lib/events-format";
import type { EcosystemEvent, EventCategory } from "@/types";

/**
 * UpcomingEventsGrid — client island rendering all verified events
 * chronologically in a filterable card grid, with an inline detail panel
 * (Req 6.3). Category filter is session-only `useState`; an empty filter result
 * renders an explicit no-results message.
 */
export interface UpcomingEventsGridProps {
  events: EcosystemEvent[];
}

const CATEGORIES: { value: EventCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "summit", label: "Summit" },
  { value: "demo-day", label: "Demo Day" },
  { value: "hackathon", label: "Hackathon" },
  { value: "convening", label: "Convening" },
  { value: "masterclass", label: "Masterclass" },
];

export function UpcomingEventsGrid({ events }: UpcomingEventsGridProps) {
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const sorted = useMemo(() => sortEventsChronologically(events), [events]);
  const filtered = useMemo(
    () => (category === "all" ? sorted : sorted.filter((e) => e.category === category)),
    [sorted, category],
  );

  const openEvent = useMemo(
    () => (openId === null ? null : sorted.find((e) => e.id === openId) ?? null),
    [openId, sorted],
  );

  const relatedEvents = useMemo(() => {
    if (!openEvent) return [];
    return sorted.filter((e) => e.category === openEvent.category && e.id !== openEvent.id).slice(0, 3);
  }, [openEvent, sorted]);

  return (
    <section id="upcoming-events" aria-labelledby="upcoming-events-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="upcoming-events-heading" className="font-heading text-h2 text-dark">
          Upcoming Events
        </h2>

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter events by category">
          {CATEGORIES.map((c) => {
            const active = category === c.value;
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c.value)}
                className={`rounded-full border px-3 py-1.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-surface"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-caption text-muted" aria-live="polite">
          Showing {filtered.length} {filtered.length === 1 ? "event" : "events"}
        </p>

        {openEvent && (
          <div className="mt-8">
            <EventDetailPanel
              event={openEvent}
              relatedEvents={relatedEvents}
              onClose={() => setOpenId(null)}
              onSelectRelated={(id) => setOpenId(id)}
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="mt-10 rounded-xl border border-border bg-surface p-6 text-body text-muted">
            No events match the selected category. Try a different category.
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => {
              const block = toDateBlock(event.startDate);
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(event.id)}
                    aria-expanded={openId === event.id}
                    className="flex h-full w-full flex-col gap-4 rounded-xl border border-border bg-card p-6 text-left shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-surface">
                        <span className="font-heading text-h2 leading-none text-dark">{block.day}</span>
                        <span className="text-caption uppercase text-muted">{block.month}</span>
                      </span>
                      <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted">
                        {categoryLabel(event.category)}
                      </span>
                    </div>
                    <h3 className="font-heading text-h3 text-dark">{event.name}</h3>
                    <span className="inline-flex items-center gap-1.5 text-caption text-muted">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      {event.location}
                    </span>
                    <p className="text-body text-muted">{event.description}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-body text-primary">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                      Learn More
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export default UpcomingEventsGrid;

// src/components/dashboard/investor/InvestorEventsSection.tsx
//
// Investor Dashboard — "Investor Events" (Req 25.1).
//
// Renders three ecosystem events relevant to investors by filtering the
// canonical `events` list to the investor categories (summit, demo-day,
// masterclass) and reusing the shared `EventCard`.
//
// Server Component (no interactivity / no `"use client"`).

import { EventCard } from "@/components/shared/EventCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { events } from "@/data/events";
import type { EventCategory } from "@/types";

/** Event categories surfaced to investors on the dashboard (Req 25.1). */
const INVESTOR_EVENT_CATEGORIES: readonly EventCategory[] = [
  "summit",
  "demo-day",
  "masterclass",
];

export function InvestorEventsSection() {
  const investorEvents = events
    .filter((event) => INVESTOR_EVENT_CATEGORIES.includes(event.category))
    .slice(0, 3);

  return (
    <section
      aria-labelledby="investor-events-heading"
      className="bg-background py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="investor-events-heading"
          eyebrow="Calendar"
          title="Investor Events"
          description="Summits, demo days, and masterclasses curated for the investor community."
        />

        <ul className="mt-8 flex flex-col gap-4">
          {investorEvents.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default InvestorEventsSection;

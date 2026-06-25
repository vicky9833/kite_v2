// src/components/dashboard/startup/DashboardEventsSection.tsx
//
// "Events for You" (Req 8). Surfaces three ecosystem events from the canonical
// `events.ts`, prioritising those that match the founder's primary sector (a
// name/description keyword heuristic, since events carry no explicit sector
// field), then filling the remaining slots with the soonest upcoming events by
// ascending `startDate` — the same ordering convention as `selectPreview`.
//
// Pure and deterministic: selection depends only on the canonical data and the
// session profile (no `Date`, no I/O), so server and client render identically.

import { SectionHeading } from "@/components/shared/SectionHeading";
import { EventCard } from "@/components/shared/EventCard";
import { events as ALL_EVENTS } from "@/data/events";
import { sectors } from "@/data/sectors";
import type { EcosystemEvent, RegistrationProfile } from "@/types";

export interface DashboardEventsSectionProps {
  /** The founder's session profile; its `primarySector` drives matching. */
  profile: RegistrationProfile;
}

/** How many event cards the section renders. */
const EVENT_COUNT = 3;

/** Resolve a sector id to its display name, falling back to the id. */
function resolveSectorName(sectorId: string): string {
  return sectors.find((s) => s.id === sectorId)?.name ?? sectorId;
}

/** Ascending sort by ISO `startDate` (string compare is chronological for ISO). */
function byStartDateAsc(a: EcosystemEvent, b: EcosystemEvent): number {
  if (a.startDate < b.startDate) return -1;
  if (a.startDate > b.startDate) return 1;
  return 0;
}

/**
 * Select up to three events for the founder: profile-matched events first
 * (sector name appears in the event name or description, case-insensitive),
 * then the soonest remaining events by `startDate`, preserving chronological
 * order within each group and never duplicating an event.
 */
export function selectDashboardEvents(
  source: EcosystemEvent[],
  sectorName: string,
): EcosystemEvent[] {
  const needle = sectorName.trim().toLowerCase();
  const sorted = source.slice().sort(byStartDateAsc);

  const matched = sorted.filter((event) => {
    if (needle.length === 0) return false;
    const haystack = `${event.name} ${event.description}`.toLowerCase();
    return haystack.includes(needle);
  });

  const seen = new Set(matched.map((event) => event.id));
  const filler = sorted.filter((event) => !seen.has(event.id));

  return [...matched, ...filler].slice(0, EVENT_COUNT);
}

/**
 * DashboardEventsSection — a vertical stack of three event cards tailored to the
 * founder's sector, each rendered via the shared {@link EventCard} (date block,
 * name, location, category badge, "Learn More" link).
 */
export function DashboardEventsSection({ profile }: DashboardEventsSectionProps) {
  const sectorName = resolveSectorName(profile.primarySector);
  const selected = selectDashboardEvents(ALL_EVENTS, sectorName);

  return (
    <section aria-labelledby="dashboard-events-heading" className="flex flex-col gap-8">
      <SectionHeading id="dashboard-events-heading" title="Events for You" />

      {selected.length > 0 ? (
        <div className="flex flex-col gap-5">
          {selected.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-body text-muted">
          No upcoming events are available right now. Check back soon.
        </p>
      )}
    </section>
  );
}

export default DashboardEventsSection;

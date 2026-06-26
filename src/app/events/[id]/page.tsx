// src/app/events/[id]/page.tsx
//
// `/events/[id]` — verified event detail. Each event's slug is the last segment
// of its `href`. Resolves all canonical events from `events.ts`; unknown slugs
// render a graceful event page (never a bare stub).

import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin, Users } from "lucide-react";

import { PageHero } from "@/components/shared/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { categoryLabel, formatDateRange } from "@/lib/events-format";
import { events } from "@/data/events";
import { cn } from "@/lib/utils";

function humanize(segment: string): string {
  return decodeURIComponent(segment)
    .split(/[-_]/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function slugFromHref(href: string): string {
  const parts = href.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export function generateStaticParams() {
  return events.map((e) => ({ id: slugFromHref(e.href) }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const event = events.find((e) => slugFromHref(e.href) === params.id);
  return {
    title: event ? `${event.name} — KITE` : "Event — KITE",
    description: event?.description,
  };
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const event = events.find((e) => slugFromHref(e.href) === params.id);

  if (!event) {
    return (
      <PageHero
        eyebrow="Events & Media"
        title={humanize(params.id)}
        subtitle="Explore the Karnataka startup events calendar."
        actions={[{ label: "All events", href: "/events" }]}
      />
    );
  }

  const related = events.filter((e) => e.category === event.category && e.id !== event.id).slice(0, 3);

  return (
    <>
      <nav aria-label="Breadcrumb" className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-caption text-muted sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <Link href="/events" className="hover:text-primary">Events</Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="text-foreground">{event.name}</span>
        </div>
      </nav>

      <PageHero
        eyebrow={`${categoryLabel(event.category)} · ${formatDateRange(event.startDate, event.endDate)}`}
        title={event.name}
        subtitle={event.description}
        actions={[
          { label: "Registration & details", href: "https://eitbt.karnataka.gov.in/startup", external: true },
          { label: "All Events", href: "/events", variant: "outline" },
        ]}
      />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
              <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-heading text-h3 text-dark">When</h2>
              <p className="text-body text-muted">{formatDateRange(event.startDate, event.endDate)}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-heading text-h3 text-dark">Where</h2>
              <p className="text-body text-muted">{event.location}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm">
              <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-heading text-h3 text-dark">Who attends</h2>
              <p className="text-body text-muted">
                Founders, investors, incubators, government, and ecosystem partners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="bg-surface py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-h2 text-dark">Related events</h2>
            <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((e) => (
                <li key={e.id}>
                  <Link
                    href={e.href}
                    className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <span className="text-caption text-muted">
                      {formatDateRange(e.startDate, e.endDate)}
                    </span>
                    <span className="font-heading text-h3 text-dark">{e.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/events" className={cn(buttonVariants({ variant: "outline" }))}>
            Back to Events &amp; Media
          </Link>
        </div>
      </section>
    </>
  );
}

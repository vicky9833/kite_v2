import { CalendarPlus, Mail, Archive } from "lucide-react";

/**
 * EventsResources — closing resources row for the Events Hub (Req 6.1): event
 * calendar subscription (iCal, visual-only), media inquiries (contact email
 * from footer data), and a past events archive link.
 *
 * Server Component.
 */
const RESOURCES = [
  {
    id: "ical",
    title: "Event Calendar Subscription",
    description: "Subscribe to the KITE events calendar (iCal). Calendar feed opens in Phase 2.",
    icon: CalendarPlus,
    href: "#stay-updated",
    external: false,
    cta: "Get the feed",
  },
  {
    id: "media-inquiries",
    title: "Media Inquiries",
    description: "For press and media queries, write to the Karnataka startup cell.",
    icon: Mail,
    href: "mailto:startupcell@karnataka.gov.in",
    external: true,
    cta: "startupcell@karnataka.gov.in",
  },
  {
    id: "archive",
    title: "Past Events Archive",
    description: "Browse highlights from previous summits, demo days, and convenings.",
    icon: Archive,
    href: "#upcoming-events",
    external: false,
    cta: "View archive",
  },
] as const;

export function EventsResources() {
  return (
    <section aria-labelledby="events-resources-heading" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="events-resources-heading" className="font-heading text-h2 text-dark">
          Resources
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {RESOURCES.map(({ id, title, description, icon: Icon, href, external, cta }) => (
            <div
              key={id}
              className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-h3 text-dark">{title}</h3>
              <p className="flex-1 text-body text-muted">{description}</p>
              {external ? (
                <a
                  href={href}
                  className="inline-flex items-center text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {cta}
                </a>
              ) : (
                <a
                  href={href}
                  className="inline-flex items-center text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {cta}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EventsResources;

import { CalendarClock } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { generateRecentEngagements } from "@/lib/synthetic-gia-data";

/**
 * RecentEngagements — "Recent International Engagements" (Req 7.1). 12–15
 * synthetic, deterministically generated engagement entries, marked
 * illustrative (Req 7.4).
 *
 * Server Component.
 */
export function RecentEngagements() {
  const engagements = generateRecentEngagements();

  return (
    <section aria-labelledby="recent-engagements-heading" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <h2 id="recent-engagements-heading" className="font-heading text-h2 text-dark">
            Recent International Engagements
          </h2>
          <IllustrativeBadge variant="inline" />
        </div>
        <p className="mt-3 max-w-2xl text-body text-muted">
          Illustrative examples of the bilateral activity the alliance enables —
          delegations, MoUs, and exchanges across partner countries.
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {engagements.map((e) => (
            <li
              key={e.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-caption text-muted">
                  <span className={`fi fi-${e.countryCode}`} aria-hidden />
                  <CalendarClock className="h-4 w-4" aria-hidden="true" />
                  {e.dateLabel}
                </span>
              </div>
              <h3 className="font-heading text-h3 text-dark">{e.title}</h3>
              <p className="text-body text-muted">{e.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default RecentEngagements;

import { ExternalLink, Building2 } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { generateAnnouncements } from "@/lib/synthetic-media-data";

/**
 * GovAnnouncementsSection — "Karnataka Government Announcements" (Req 6.1). A
 * card list of 8–12 synthetic, deterministically generated official
 * announcements written as government press releases. Each links to the EITBT
 * portal. The section is clearly marked illustrative (Req 6.4).
 *
 * Server Component.
 */
export function GovAnnouncementsSection() {
  const announcements = generateAnnouncements();

  return (
    <section aria-labelledby="announcements-heading" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
              Official announcements
            </span>
            <IllustrativeBadge variant="inline" />
          </div>
          <h2 id="announcements-heading" className="font-heading text-h2 text-dark">
            Karnataka Government Announcements
          </h2>
          <p className="text-body text-muted">
            Illustrative examples of the kinds of notifications and circulars the
            department issues. For official orders, follow the EITBT startup
            portal.
          </p>
        </div>

        <ul className="mt-12 flex flex-col gap-4">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-caption text-muted">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                  {a.department}
                </span>
                <span className="text-caption text-muted">{a.dateLabel}</span>
              </div>
              <h3 className="font-heading text-h3 text-dark">{a.title}</h3>
              <p className="text-body text-muted">{a.summary}</p>
              <a
                href={a.sourceHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Official source
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default GovAnnouncementsSection;

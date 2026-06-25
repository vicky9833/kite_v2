// src/components/dashboard/admin/ActivityFeedSection.tsx
//
// "Recent Ecosystem Activity" (Req 20). A scrollable vertical feed of the 15–20
// deterministic activity entries from `getActivityFeed()`. Each entry carries a
// fixed relative timestamp, an activity-type icon (Lucide, mapped from `type`),
// a description, and a link to the related canonical entity. The page
// composition (task 15.1) wraps this section in `LazySection`. All entries are
// illustrative and labelled as such.

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  Trophy,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { getActivityFeed } from "@/lib/synthetic-admin-data";
import type { ActivityType } from "@/types";

/** Lucide icon mapped from each fixed activity type. */
const ACTIVITY_ICON: Record<ActivityType, LucideIcon> = {
  registration: UserPlus,
  approval: CheckCircle2,
  disbursement: IndianRupee,
  event: CalendarDays,
  milestone: Trophy,
};

/**
 * ActivityFeedSection — a single card holding a scrollable vertical list
 * (`max-h-[600px] overflow-y-auto`) of recent ecosystem activity. Each row
 * leads with a type icon, then the description and entity link, with the
 * timestamp aligned to the right.
 */
export function ActivityFeedSection() {
  const entries = getActivityFeed();

  return (
    <section
      aria-labelledby="activity-feed-heading"
      className="flex flex-col gap-8"
    >
      <SectionHeading
        id="activity-feed-heading"
        title="Recent Ecosystem Activity"
      />

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <ul className="max-h-[600px] divide-y divide-border overflow-y-auto">
          {entries.map((entry) => {
            const Icon = ACTIVITY_ICON[entry.type];
            return (
              <li
                key={entry.id}
                className="flex items-start gap-4 p-4 sm:px-6"
              >
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="text-body text-dark">{entry.description}</p>
                  <Link
                    href={entry.href}
                    className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-accent rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    {entry.entityLabel}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>

                <time className="shrink-0 text-caption text-muted">
                  {entry.timestampLabel}
                </time>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-caption text-muted">
        Illustrative data for preview purposes only.
      </p>
    </section>
  );
}

export default ActivityFeedSection;

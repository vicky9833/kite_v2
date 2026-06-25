"use client";

// src/components/dashboard/investor/pipeline/RecentActivityList.tsx
//
// Deal Pipeline — "Recent Activity" list (Req 30.2, 30.5).
//
// A semantic `<ul>` of synthetic activity entries (stage transitions, deal
// additions, and notes) derived DETERMINISTICALLY from the current deals: each
// deal seeds exactly one entry via the shared hash-seeded PRNG (`synthetic-prng`),
// so the feed is byte-stable across reloads with no `Math.random`/clock use.
//
// Each entry carries a synthetic timestamp label, a Lucide type icon, a
// human-readable description, and an optional entity link back to the board.
// The figures are illustrative and labelled as such. No charts / recharts — the
// PAGE dynamic-imports this component to protect First Load JS (Req 30.5).

import Link from "next/link";
import { ArrowRightLeft, PlusCircle, StickyNote, type LucideIcon } from "lucide-react";

import { seededRng, seededInt, seededPick } from "@/lib/synthetic-prng";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { TrackedDeal } from "@/types";

export interface RecentActivityListProps {
  /** The deals currently displayed on the board (already filtered upstream). */
  deals: TrackedDeal[];
}

type ActivityType = "transition" | "addition" | "note";

interface ActivityEntry {
  id: string;
  type: ActivityType;
  /** Fixed relative recency label (NOT clock-derived). */
  timestampLabel: string;
  /** Sort key: lower = more recent. */
  recencyIndex: number;
  description: string;
  companyName: string;
  /** Optional deep link to the deal on the board. */
  href?: string;
}

/**
 * Fixed relative timestamp labels, ordered most-recent first. The seeded index
 * into this array doubles as the recency sort key, so the feed reads like a
 * descending activity log without any reliance on the clock.
 */
const TIMESTAMP_LABELS = [
  "Just now",
  "20 minutes ago",
  "1 hour ago",
  "3 hours ago",
  "Earlier today",
  "Yesterday",
  "2 days ago",
  "Last week",
] as const;

const ACTIVITY_TYPES: readonly ActivityType[] = ["transition", "addition", "note"];

const TYPE_ICON: Record<ActivityType, LucideIcon> = {
  transition: ArrowRightLeft,
  addition: PlusCircle,
  note: StickyNote,
};

/** Build a deterministic one-line description for an activity entry. */
function describe(type: ActivityType, deal: TrackedDeal): string {
  switch (type) {
    case "transition":
      return `Moved ${deal.companyName} to ${deal.currentStage}`;
    case "addition":
      return `Added ${deal.companyName} to the pipeline`;
    case "note":
      return `Added a note on ${deal.companyName}`;
    default:
      return deal.companyName;
  }
}

/**
 * Derive exactly one synthetic activity entry per deal, seeded by the deal id,
 * then order by the synthetic recency index (most recent first).
 */
function deriveActivity(deals: TrackedDeal[]): ActivityEntry[] {
  return deals
    .map((deal) => {
      const rng = seededRng(`pipeline-activity::${deal.id}`);
      const type = seededPick(rng, ACTIVITY_TYPES);
      const recencyIndex = seededInt(rng, 0, TIMESTAMP_LABELS.length - 1);
      const timestampLabel = TIMESTAMP_LABELS[recencyIndex] as string;
      return {
        id: deal.id,
        type,
        timestampLabel,
        recencyIndex,
        description: describe(type, deal),
        companyName: deal.companyName,
        // Additions and transitions link back to the board; notes do not.
        href:
          type === "note"
            ? undefined
            : `/dashboard/investor/pipeline#deal-${deal.id}`,
      } satisfies ActivityEntry;
    })
    .sort((a, b) =>
      a.recencyIndex === b.recencyIndex
        ? a.id.localeCompare(b.id)
        : a.recencyIndex - b.recencyIndex,
    );
}

export function RecentActivityList({ deals }: RecentActivityListProps) {
  const entries = deriveActivity(deals);

  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="bg-card py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="recent-activity-heading"
          eyebrow="Pipeline activity"
          title="Recent Activity"
          description="A running log of stage transitions, deal additions, and notes across your pipeline."
        />

        <div className="mt-8 rounded-xl border border-border bg-surface p-6 shadow-sm">
          {entries.length === 0 ? (
            <p className="text-sm text-muted">
              No activity yet — add deals to start building your pipeline log.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {entries.map((entry) => {
                const Icon = TYPE_ICON[entry.type];
                return (
                  <li
                    key={entry.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                    </span>
                    <div className="flex flex-1 flex-col gap-0.5">
                      <p className="text-sm text-dark">
                        {entry.href ? (
                          <Link
                            href={entry.href}
                            className="rounded-sm font-medium text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                          >
                            {entry.description}
                          </Link>
                        ) : (
                          entry.description
                        )}
                      </p>
                      <span className="text-caption text-muted">
                        {entry.timestampLabel}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <p className="mt-6 text-caption text-muted">
          Illustrative data for preview purposes only.
        </p>
      </div>
    </section>
  );
}

export default RecentActivityList;

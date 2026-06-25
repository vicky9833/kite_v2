import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { EcosystemEvent } from "@/types";

/**
 * EventCard — a single ecosystem Event rendered as a horizontal, full-width row
 * (Req 15.4). Government-grade editorial, NOT a SaaS marketing card: a flat
 * white surface (`bg-card`) with a hairline `border` and a modest `shadow-sm`.
 * There are NO gradients, blobs, glow, glassmorphism, emoji, or decorative
 * imagery — the hierarchy comes from typography, the Karnataka palette, and the
 * verified event data.
 *
 * Layout: a compact bordered date block on the left (stacked on top on mobile)
 * and the event detail column on the right. The single call-to-action is an
 * internal `next/link` navigation to the event's own route (`event.href`), so
 * this is a Server Component (no `"use client"`, no client router).
 *
 * Date formatting is deterministic and timezone-safe: the ISO `startDate`
 * (`YYYY-MM-DD`) is split into its calendar parts and formatted directly, so
 * server and client render identical text (no `Date` parsing / no UTC drift /
 * no hydration mismatch).
 */
export interface EventCardProps {
  /** The event record to render. */
  event: EcosystemEvent;
  /** Extra classes merged onto the card wrapper. */
  className?: string;
}

/** Uppercase three-letter month labels indexed by 1-based month number. */
const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

interface DateParts {
  day: string;
  month: string;
  year: string;
}

/**
 * Derive `{ day, month, year }` from an ISO `YYYY-MM-DD` string by reading the
 * calendar parts directly. Pure & deterministic — avoids `new Date(...)` so the
 * result never shifts with the runtime timezone. Falls back to the raw string
 * if the input is not in the expected shape.
 */
function getDateParts(isoDate: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate);
  if (!match) {
    return { day: isoDate, month: "", year: "" };
  }
  const year = match[1] ?? "";
  const month = match[2] ?? "";
  const day = match[3] ?? "";
  const monthIndex = Number(month) - 1;
  const monthLabel = MONTH_LABELS[monthIndex] ?? "";
  return {
    day: String(Number(day)),
    month: monthLabel,
    year,
  };
}

export function EventCard({ event, className }: EventCardProps) {
  const { name, startDate, location, category, description, href } = event;
  const { day, month, year } = getDateParts(startDate);

  return (
    <article
      className={cn(
        "flex flex-col gap-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:gap-6 sm:p-6",
        className,
      )}
    >
      {/* Date block — compact, bordered, surface-filled (no color fills). */}
      <div className="flex shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-surface px-4 py-3 text-center sm:w-24">
        <span className="font-heading text-2xl font-bold leading-none text-dark">
          {day}
        </span>
        <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-dark">
          {month}
        </span>
        <span className="mt-0.5 text-xs text-muted">{year}</span>
      </div>

      {/* Detail column */}
      <div className="flex min-w-0 flex-col">
        {/* Caption row — category label + location */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">
            {category}
          </span>
          <span className="text-sm text-muted">{location}</span>
        </div>

        <h3 className="mt-2 font-heading text-lg font-bold text-dark md:text-xl">
          {name}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          {description}
        </p>

        <Link
          href={href}
          aria-label={`Learn more about ${name}`}
          className={cn(
            "mt-4 inline-flex items-center gap-1",
            "text-sm font-semibold text-primary",
            "transition-colors hover:text-accent",
            "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
          )}
        >
          Learn More
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default EventCard;

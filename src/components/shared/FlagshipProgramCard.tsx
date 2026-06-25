import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FlagshipProgram, ProgramPerformance } from "@/types";

/**
 * FlagshipProgramCard — the editorial card used by the Home page's Flagship
 * Programs section. Each card presents one {@link FlagshipProgram}: the program
 * name as a heading, a status Badge in the top-right, an accent tagline, a
 * restrained key-metric callout, body copy, and a CTA linking to the program's
 * internal route.
 *
 * Server Component (no `"use client"`). The CTA is a Next.js `<Link>` to the
 * program's internal `href`; navigation is handled by the router, not a client
 * handler.
 *
 * Status → Badge mapping (kept subtle, government-grade — no neon/glow):
 *  - `active`   → affirmative success-tinted outline ("Active")
 *  - `upcoming` → muted/secondary outline ("Upcoming")
 */
export interface FlagshipProgramCardProps {
  /** The flagship program record to render. */
  program: FlagshipProgram;
  /**
   * ADDITIVE (Req 18.4, 18.5): optional synthetic performance figures. When
   * present, the admin dashboard renders disbursed value, enrolled count, a
   * completion progress bar, and a status indicator. When absent, the card
   * behaves exactly as it does on the Home page today.
   */
  performance?: ProgramPerformance;
  /** Extra classes merged onto the card wrapper. */
  className?: string;
}

/** Human-readable status labels for the fixed `ProgramStatus` set. */
const STATUS_LABEL: Record<FlagshipProgram["status"], string> = {
  active: "Active",
  upcoming: "Upcoming",
};

/**
 * Status-specific Badge tinting. Both use the `outline` variant for a calm,
 * bordered chip; `active` carries an affirmative (success) tint while
 * `upcoming` stays muted/secondary.
 */
const STATUS_BADGE_CLASS: Record<FlagshipProgram["status"], string> = {
  active: "border-success/30 bg-success/10 text-success",
  upcoming: "border-border bg-surface text-muted",
};

export function FlagshipProgramCard({
  program,
  performance,
  className,
}: FlagshipProgramCardProps) {
  const {
    name,
    tagline,
    description,
    keyMetric,
    status,
    ctaLabel,
    href,
  } = program;

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm md:p-8",
        className,
      )}
    >
      {/* Top row: program name + status badge */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-heading text-xl font-bold text-dark">{name}</h3>
        <Badge
          variant="outline"
          className={cn("shrink-0", STATUS_BADGE_CLASS[status])}
        >
          {STATUS_LABEL[status]}
        </Badge>
      </div>

      {/* Accent tagline */}
      <p className="mt-3 font-medium text-accent">{tagline}</p>

      {/* Key-metric callout — restrained bordered block */}
      <div className="mt-5 inline-flex w-fit items-baseline gap-2 rounded-md border border-border bg-surface px-3 py-1.5">
        <span className="font-heading text-lg font-bold text-dark">
          {keyMetric}
        </span>
        <span className="text-caption uppercase tracking-wide text-muted">
          Key metric
        </span>
      </div>

      {/* ADDITIVE (Req 18.4, 18.5, 30.5): synthetic performance panel. Rendered
          ONLY when the admin dashboard passes `performance`; on the Home page
          the prop is omitted and nothing below changes. Shows disbursed value,
          enrolled startup count, a completion progress bar, and a status
          indicator, captioned as illustrative. */}
      {performance ? (
        <div className="mt-5 flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-caption font-semibold uppercase tracking-wide text-muted">
              Program performance
            </span>
            {/* Status indicator — small dot + label, tinted by status */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-caption font-medium",
                STATUS_BADGE_CLASS[performance.status],
              )}
            >
              <span
                className="h-1.5 w-1.5 rounded-full bg-current"
                aria-hidden="true"
              />
              {STATUS_LABEL[performance.status]}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-heading text-lg font-bold text-dark">
                ₹{performance.disbursed} Cr
              </p>
              <p className="text-caption text-muted">Disbursed</p>
            </div>
            <div>
              <p className="font-heading text-lg font-bold text-dark">
                {performance.enrolled}
              </p>
              <p className="text-caption text-muted">Startups enrolled</p>
            </div>
          </div>

          {/* Completion progress bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-caption text-muted">
              <span>Completion</span>
              <span>{performance.completionPct}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={performance.completionPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${name} completion`}
              className="h-2 w-full overflow-hidden rounded-full bg-border"
            >
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${performance.completionPct}%` }}
              />
            </div>
          </div>

          <p className="text-caption text-muted">Illustrative figures.</p>
        </div>
      ) : null}

      {/* Body copy — grows to push the CTA to the bottom */}
      <p className="mt-5 flex-grow text-body text-slate-700">{description}</p>

      {/* CTA — internal navigation via Next Link */}
      <Link
        href={href}
        aria-label={`${ctaLabel}: ${name}`}
        className={cn(
          buttonVariants({ variant: "outline" }),
          // min-h-11 (44px) floor so the card's primary CTA is a comfortable
          // touch target on mobile (the shadcn default size is h-9 / 36px).
          "mt-6 w-fit min-h-11 rounded-lg",
        )}
      >
        {ctaLabel}
      </Link>
    </article>
  );
}

export default FlagshipProgramCard;

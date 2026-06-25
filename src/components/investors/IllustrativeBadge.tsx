import { cn } from "@/lib/utils";

/**
 * IllustrativeBadge — the single, consistent "Illustrative" marker used across
 * every SYNTHETIC investor surface (featured opportunities, the deal-flow
 * ticker, cluster framing counts, sector charts). Verified/canonical surfaces
 * (hero stats, Why Karnataka, KITVEN terms) never render it.
 *
 * Two presentations share one component (Req 6.6, 40.4):
 *  - `variant="corner"` (default) — a small absolutely-positioned chip suited to
 *    the top-right of a card. The parent must be `relative`.
 *  - `variant="inline"` — a muted caption for use beneath a section/heading.
 *
 * Government-grade restraint: muted tokens only, no color shout, no glow.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface IllustrativeBadgeProps {
  /** Presentation: a card corner chip or an inline caption. */
  variant?: "corner" | "inline";
  /** Extra classes merged onto the element. */
  className?: string;
}

export function IllustrativeBadge({
  variant = "corner",
  className,
}: IllustrativeBadgeProps) {
  if (variant === "inline") {
    return (
      <span
        className={cn(
          "text-caption uppercase tracking-wide text-muted",
          className,
        )}
      >
        Illustrative
      </span>
    );
  }

  return (
    <span
      className={cn(
        "absolute right-3 top-3 rounded-md border border-border bg-surface px-2 py-0.5",
        "text-[0.625rem] font-medium uppercase tracking-wide text-muted",
        className,
      )}
    >
      Illustrative
    </span>
  );
}

export default IllustrativeBadge;

import { cn } from "@/lib/utils";
import type { Stat } from "@/types";

/**
 * StatCard — government-grade editorial stat tile. Presents a single ecosystem
 * metric as a large headline figure (`stat.displayValue`) with a muted label
 * and a small provenance caption (`source · asOf`).
 *
 * Visual direction is restrained and editorial (NOT SaaS): a plain white card
 * with a hairline border and a subtle shadow. The number does the talking —
 * there is no icon, no gradient, no glow, and no transform/scale on hover. The
 * only motion is a barely-perceptible border tint toward the primary color.
 *
 * Server Component: no `"use client"`, no interactivity, no count-up animation.
 * Reusable beyond the Home page via the optional `className`.
 */
export interface StatCardProps {
  /** The stat to render. */
  stat: Stat;
  /** Extra classes merged onto the card wrapper (for layout flexibility). */
  className?: string;
}

export function StatCard({ stat, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 shadow-sm",
        "transition-colors hover:border-primary/30",
        className,
      )}
    >
      <p className="font-heading text-h1 font-bold text-dark">
        {stat.displayValue}
      </p>
      <p className="mt-2 text-body text-muted">{stat.label}</p>
      <p className="mt-4 text-xs text-muted/70">
        {stat.source} · {stat.asOf}
      </p>
    </div>
  );
}

export default StatCard;

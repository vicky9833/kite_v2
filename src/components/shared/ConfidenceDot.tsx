import { cn } from "@/lib/utils";
import type { EligibilityStatus } from "@/types";

/**
 * ConfidenceDot — a small, shared presentational primitive that renders a 10px
 * circular status dot for an {@link EligibilityStatus} (Req 22.1, 22.2). Used
 * identically in Schemes Hub card corners, the detail eligibility card,
 * calculator rows, and compare cells (Req 22.4).
 *
 * Accessibility (Req 22.3, 27.8): meaning is NEVER conveyed by color alone. The
 * dot always carries a non-empty, human-readable accessible name describing the
 * status via `aria-label`. When `showLabel` is true, the dot is followed by the
 * same status text rendered visibly inline.
 *
 * Government-grade and restrained: a flat solid-color disc using canonical
 * semantic tokens — no glow, no gradient, no transform.
 *
 * Pure presentational component: no state, no effects, no `"use client"`
 * directive — usable inside both server and client parents.
 */

/** Single source of truth: each status maps to exactly one color + one label. */
const STATUS_MAP: Record<
  EligibilityStatus,
  { color: string; label: string }
> = {
  "definitely-eligible": { color: "bg-success", label: "Definitely eligible" },
  "likely-eligible": { color: "bg-warning", label: "Likely eligible" },
  "check-requirements": { color: "bg-muted", label: "Check requirements" },
  "not-eligible": { color: "bg-danger", label: "Not eligible" },
};

export interface ConfidenceDotProps {
  /** The eligibility status that selects the dot color and accessible name. */
  status: EligibilityStatus;
  /** When true, render the visible inline status text after the dot. */
  showLabel?: boolean;
  /** Extra classes merged onto the wrapper (for layout flexibility). */
  className?: string;
}

export function ConfidenceDot({
  status,
  showLabel = false,
  className,
}: ConfidenceDotProps) {
  const { color, label } = STATUS_MAP[status];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn("h-2.5 w-2.5 shrink-0 rounded-full", color)}
        role="img"
        aria-label={label}
      />
      {showLabel ? (
        <span className="text-sm text-dark">{label}</span>
      ) : null}
    </span>
  );
}

export default ConfidenceDot;

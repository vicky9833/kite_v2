"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { ConfidenceDot } from "@/components/shared/ConfidenceDot";
import { cn, formatNumber } from "@/lib/utils";
import type { EligibilityResult, Scheme } from "@/types";

/**
 * CalculatorBreakdownRow — one Scheme row inside the Policy Calculator's
 * status-grouped breakdown (Req 21.5). The Calculator groups rows by
 * Eligibility_Status (Definitely / Likely expanded, Check Requirements / Not
 * Eligible collapsed), so the group heading already conveys the status. Each
 * row therefore renders, compactly:
 *
 *  - the Scheme name,
 *  - a {@link ConfidenceDot} for `result.status` WITHOUT its inline label — the
 *    surrounding group already names the status, so a bare dot keeps the row
 *    quiet while still carrying a non-color-only accessible name (founder
 *    judgment, Req 22.3 / 27.8),
 *  - the estimated benefit in Indian rupees (or a plain "No monetary benefit"
 *    sentence when the benefit is 0 / non-monetary — consistent with the
 *    detail page's PersonalizedEligibilityCard rather than a misleading "₹0"),
 *  - a small expand control that reveals `result.reasons`.
 *
 * The expander is local UI state (`useState`); the reasons region is wired to
 * the toggle via `aria-expanded` / `aria-controls` so assistive tech announces
 * the relationship. Government-grade and restrained: a flat row, a thin border,
 * a single caret that rotates — no fills, no glow, no motion beyond the caret.
 */

export interface CalculatorBreakdownRowProps {
  /** The Scheme this row represents (canonical content from `schemes.ts`). */
  scheme: Scheme;
  /** The precomputed eligibility result for this Scheme. */
  result: EligibilityResult;
  /** Extra classes merged onto the row wrapper (for layout flexibility). */
  className?: string;
}

/**
 * Render the estimated benefit in Indian rupees. When the benefit is 0 (or not
 * a positive finite number — e.g. a non-monetary / acceleration scheme), show a
 * clear sentence rather than a misleading "₹0". Mirrors the detail page's
 * benefit formatting for consistency across surfaces.
 */
function renderEstimatedBenefit(estimatedBenefit: number): string {
  if (!Number.isFinite(estimatedBenefit) || estimatedBenefit <= 0) {
    return "No monetary benefit";
  }
  return `₹${formatNumber(estimatedBenefit)}`;
}

export function CalculatorBreakdownRow({
  scheme,
  result,
  className,
}: CalculatorBreakdownRowProps) {
  const [expanded, setExpanded] = useState(false);
  const reactId = useId();
  const reasonsRegionId = `breakdown-reasons-${reactId}`;
  const hasReasons = result.reasons.length > 0;

  return (
    <div
      className={cn(
        "border-b border-border last:border-b-0",
        className,
      )}
    >
      <div className="flex items-center gap-3 py-3">
        <ConfidenceDot status={result.status} className="shrink-0" />

        <span className="min-w-0 flex-1 truncate text-sm font-medium text-dark">
          {scheme.name}
        </span>

        <span className="shrink-0 text-sm tabular-nums text-dark">
          {renderEstimatedBenefit(result.estimatedBenefit)}
        </span>

        {hasReasons ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-controls={reasonsRegionId}
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted transition-colors hover:text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span>{expanded ? "Hide reasons" : "Why?"}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                expanded && "rotate-180",
              )}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>

      {hasReasons ? (
        <div id={reasonsRegionId} hidden={!expanded}>
          {result.reasons.length === 1 ? (
            <p className="pb-3 pl-[1.625rem] pr-2 text-sm leading-relaxed text-muted">
              {result.reasons[0]}
            </p>
          ) : (
            <ul className="list-disc space-y-1 pb-3 pl-9 pr-2 text-sm leading-relaxed text-muted">
              {result.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default CalculatorBreakdownRow;

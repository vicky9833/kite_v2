"use client";

// src/components/schemes/SchemeCard.tsx
//
// CLIENT (React.memo). A single scheme card for the Schemes Hub (Req 15).
//
// Shows the scheme name, a type badge + status badge, a benefit summary line
// combining `amount` + `maxBenefit`, and a duration caption — all sourced
// verbatim from `src/data/schemes.ts`. Eligibility renders as a comma sentence
// truncated to two lines (CSS line-clamp-2) with a "See full eligibility"
// toggle that expands the full bulleted list; documents are revealed by a
// collapsed-by-default "Documents needed" expander. Footer actions: a
// "View Details" link to `/schemes/[id]`, the `ApplyButton` island, and a
// Compare checkbox bound to the selection (Req 15.1–15.4).
//
// When an `eligibility` result is provided (registered users), a corner
// `ConfidenceDot` colored by status is shown in the TOP-RIGHT of the card. The
// dot wrapper exposes the eligibility reasons for hover via a native `title`
// attribute and programmatically via `aria-label` (no Radix dependency). When
// `eligibility` is null/undefined (unregistered), no dot is rendered (Req 15.5,
// 15.6).
//
// Wrapped in `React.memo` so the 22 cards don't re-render when unrelated Hub
// filter state changes (Req 28).

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ApplyButton } from "@/components/schemes/ApplyButton";
import { ConfidenceDot } from "@/components/shared/ConfidenceDot";
import { cn } from "@/lib/utils";
import type { EligibilityResult, Scheme, SchemeStatus, SchemeType } from "@/types";

export interface SchemeCardProps {
  /** The scheme to render, sourced from `src/data/schemes.ts`. */
  scheme: Scheme;
  /**
   * Precomputed eligibility result for the active profile. When present
   * (registered), the corner ConfidenceDot + reasons tooltip are shown; when
   * null/undefined (unregistered), no dot is rendered.
   */
  eligibility?: EligibilityResult | null;
  /** Whether this scheme is currently in the compare selection. */
  selectedForCompare: boolean;
  /** Toggles this scheme's membership in the compare selection. */
  onToggleCompare: (id: string) => void;
  /** Extra classes merged onto the card wrapper (for layout flexibility). */
  className?: string;
}

/** Human-readable type-badge labels. */
const TYPE_LABEL: Record<SchemeType, string> = {
  fiscal: "Fiscal Incentive",
  grant: "Grant-in-Aid",
};

/** Human-readable status-badge labels. */
const STATUS_LABEL: Record<SchemeStatus, string> = {
  open: "Open",
  upcoming: "Upcoming",
};

function SchemeCardComponent({
  scheme,
  eligibility,
  selectedForCompare,
  onToggleCompare,
  className,
}: SchemeCardProps) {
  const [eligibilityExpanded, setEligibilityExpanded] = React.useState(false);
  const [documentsExpanded, setDocumentsExpanded] = React.useState(false);

  // Stable, collision-free ids for ARIA wiring across the 22 cards.
  const reactId = React.useId();
  const eligibilityRegionId = `${reactId}-eligibility`;
  const documentsRegionId = `${reactId}-documents`;
  const compareId = `${reactId}-compare`;

  const eligibilitySentence = scheme.eligibility.join(", ");
  const showDot = eligibility != null;
  const reasonsText = showDot ? eligibility.reasons.join(" ") : "";

  return (
    <article
      className={cn(
        // Government-grade restraint: flat surface, rounded-xl, soft border.
        "relative flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm",
        className,
      )}
    >
      {/* Corner ConfidenceDot (registered only). The reasons are exposed for
          hover via the native `title` tooltip and programmatically via
          `aria-label`, avoiding a Radix dependency in the 22-card render. */}
      {showDot ? (
        <div
          className="absolute right-4 top-4 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          tabIndex={0}
          title={reasonsText}
          aria-label={`Eligibility: ${reasonsText}`}
        >
          <ConfidenceDot status={eligibility.status} />
        </div>
      ) : null}

      {/* Header: name + badges. Right padding leaves room for the corner dot. */}
      <header className={cn("space-y-3", showDot && "pr-8")}>
        <h3 className="font-heading text-lg font-semibold leading-snug text-foreground">
          {scheme.name}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{TYPE_LABEL[scheme.type]}</Badge>
          <Badge variant="outline">{STATUS_LABEL[scheme.status]}</Badge>
        </div>
      </header>

      {/* Prominent benefit summary + duration caption. */}
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">
          {scheme.amount}
          <span className="text-muted-foreground"> · up to {scheme.maxBenefit}</span>
        </p>
        <p className="text-xs text-muted-foreground">{scheme.duration}</p>
      </div>

      {/* Eligibility: comma sentence truncated to two lines, with expand. */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Eligibility
        </p>
        {eligibilityExpanded ? (
          <ul
            id={eligibilityRegionId}
            className="list-disc space-y-1 pl-5 text-sm text-dark"
          >
            {scheme.eligibility.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p
            id={eligibilityRegionId}
            className="line-clamp-2 text-sm text-dark"
          >
            {eligibilitySentence}
          </p>
        )}
        <button
          type="button"
          onClick={() => setEligibilityExpanded((prev) => !prev)}
          aria-expanded={eligibilityExpanded}
          aria-controls={eligibilityRegionId}
          className="text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {eligibilityExpanded ? "Show less" : "See full eligibility"}
        </button>
      </div>

      {/* Documents expander — collapsed by default. */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => setDocumentsExpanded((prev) => !prev)}
          aria-expanded={documentsExpanded}
          aria-controls={documentsRegionId}
          className="flex w-full items-center justify-between gap-2 text-sm font-medium text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span>Documents needed</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              documentsExpanded && "rotate-180",
            )}
          />
        </button>
        {documentsExpanded ? (
          <ul
            id={documentsRegionId}
            className="list-disc space-y-1 pl-5 text-sm text-dark"
          >
            {scheme.documents.map((doc) => (
              <li key={doc}>{doc}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* Footer actions: View Details, Apply, Compare. */}
      <footer className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/schemes/${scheme.id}`}>View Details</Link>
          </Button>
          <ApplyButton schemeId={scheme.id} />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id={compareId}
            checked={selectedForCompare}
            onCheckedChange={() => onToggleCompare(scheme.id)}
            aria-label={`Compare ${scheme.name}`}
          />
          <label
            htmlFor={compareId}
            className="cursor-pointer text-sm font-medium text-dark"
          >
            Compare
          </label>
        </div>
      </footer>
    </article>
  );
}

/**
 * Memoized so cards don't re-render when unrelated Hub filter/search state
 * changes — only when this card's own props change (Req 28).
 */
export const SchemeCard = React.memo(SchemeCardComponent);

export default SchemeCard;

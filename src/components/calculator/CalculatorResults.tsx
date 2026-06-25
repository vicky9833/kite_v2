"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CalculatorBreakdownRow } from "@/components/calculator/CalculatorBreakdownRow";
import {
  evaluateAllSchemes,
  isWomenLed,
  totalEstimatedBenefit,
  weightedAverageConfidence,
} from "@/lib/eligibility-engine";
import { cn, formatNumber } from "@/lib/utils";
import { useRegistration } from "@/context/RegistrationContext";
import { schemes } from "@/data/schemes";
import { sectors } from "@/data/sectors";
import type { EligibilityResult, EligibilityStatus, Scheme } from "@/types";

/**
 * CalculatorResults — the Policy Calculator results view (Req 21). Rendered once
 * a Registration_Profile exists (Profile_Set_State or Registered_State). It:
 *
 *  1. Profile summary (Req 21.1): a compact horizontal card of key engine fields
 *     with an "Edit Profile" control that returns to profile entry.
 *  2. Total benefits (Req 21.2): a very large bold Plus Jakarta Sans rupee figure
 *     (the summed estimated benefit over qualifying schemes), a "Across X schemes
 *     you qualify for" caption, and a thin weighted-average confidence meter
 *     labelled via {@link confidenceLabel} (Req 21.3). The total + confidence
 *     label live inside an `aria-live="polite"` region (Req 27.6).
 *  3. Status-grouped breakdown (Req 21.4, 21.5): Definitely / Likely expanded by
 *     default, Check Requirements / Not Eligible collapsed, each listing its
 *     schemes via {@link CalculatorBreakdownRow}.
 *  4. Bottom actions (Req 21.6): "Update Profile" + "Apply to Eligible Schemes"
 *     (→ `/schemes`). No PDF, no multi-year projections (Req 21.7).
 *
 * Eligibility is evaluated ONCE per profile change via `useMemo` (Req 28.6).
 */

/**
 * Pure confidence-label classifier (Req 21.3):
 *   - High   when value > 0.8
 *   - Medium when value > 0.5 and ≤ 0.8
 *   - Low    when value ≤ 0.5
 *
 * Exported so the calculator PBT (Property 15) can drive it directly.
 */
export function confidenceLabel(value: number): "High" | "Medium" | "Low" {
  if (value > 0.8) return "High";
  if (value > 0.5) return "Medium";
  return "Low";
}

/** Format the headline total in Indian rupees (crore/lakh en-IN grouping). */
function formatRupees(value: number): string {
  return `₹${formatNumber(value)}`;
}

/** Resolve a sector id to its display name, falling back to the raw id. */
function sectorDisplayName(sectorId: string): string {
  return sectors.find((s) => s.id === sectorId)?.name ?? sectorId;
}

const yesNo = (value: boolean): string => (value ? "Yes" : "No");

/** One compact label/value pair in the profile summary card. */
function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-caption text-muted">{label}</dt>
      <dd className="text-body font-medium text-dark">{value}</dd>
    </div>
  );
}

/** Definition of each breakdown group, in display order. */
interface GroupConfig {
  status: EligibilityStatus;
  title: string;
  /** Tailwind text-color token for the group heading swatch + title. */
  titleClass: string;
  /** Whether the group is expanded by default (Req 21.4). */
  defaultOpen: boolean;
  /** Optional helper sentence shown under the heading. */
  helper?: string;
}

const GROUP_CONFIG: readonly GroupConfig[] = [
  {
    status: "definitely-eligible",
    title: "Definitely Eligible",
    titleClass: "text-success",
    defaultOpen: true,
  },
  {
    status: "likely-eligible",
    title: "Likely Eligible",
    titleClass: "text-warning",
    defaultOpen: true,
  },
  {
    status: "check-requirements",
    title: "Check Requirements",
    titleClass: "text-muted",
    defaultOpen: false,
    helper: "Some criteria depend on details you have not provided.",
  },
  {
    status: "not-eligible",
    title: "Not Eligible",
    titleClass: "text-danger",
    defaultOpen: false,
    helper: "These schemes do not match your current profile.",
  },
];

/** A scheme paired with its precomputed eligibility result. */
interface ScoredScheme {
  scheme: Scheme;
  result: EligibilityResult;
}

export interface CalculatorResultsProps {
  /** Returns the visitor to profile entry (registration / quick profile). */
  onEditProfile: () => void;
  className?: string;
}

export function CalculatorResults({
  onEditProfile,
  className,
}: CalculatorResultsProps) {
  const { registrationProfile } = useRegistration();

  // Evaluate every scheme ONCE per profile change (Req 28.6). Keyed on the
  // profile object identity, which only changes when the profile is updated.
  const results = useMemo<Record<string, EligibilityResult>>(
    () =>
      registrationProfile ? evaluateAllSchemes(registrationProfile) : {},
    [registrationProfile],
  );

  // Defensive guard: the page only mounts this once a profile exists, but the
  // context type permits null.
  if (!registrationProfile) {
    return null;
  }

  const profile = registrationProfile;

  const total = totalEstimatedBenefit(results);
  const confidence = weightedAverageConfidence(results);
  const label = confidenceLabel(confidence);
  const meterPercent = Math.round(
    Math.min(1, Math.max(0, confidence)) * 100,
  );

  // Group schemes by status, preserving the canonical `schemes.ts` order.
  const grouped = new Map<EligibilityStatus, ScoredScheme[]>();
  for (const scheme of schemes) {
    const result = results[scheme.id];
    if (!result) continue;
    const bucket = grouped.get(result.status) ?? [];
    bucket.push({ scheme, result });
    grouped.set(result.status, bucket);
  }

  const qualifyingCount =
    (grouped.get("definitely-eligible")?.length ?? 0) +
    (grouped.get("likely-eligible")?.length ?? 0);

  // Confidence meter fill color tracks the label, staying within the semantic
  // palette (Req 26.1).
  const meterFillClass =
    label === "High"
      ? "bg-success"
      : label === "Medium"
        ? "bg-warning"
        : "bg-muted";

  return (
    <div className={cn("space-y-8", className)}>
      {/* Section 1 — Profile summary (Req 21.1) */}
      <section
        aria-label="Your profile summary"
        className="rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
            <SummaryItem label="DPIIT recognised" value={yesNo(profile.dpiitRecognized)} />
            <SummaryItem label="GST registered" value={yesNo(profile.gstRegistered)} />
            <SummaryItem label="Stage" value={profile.currentStage} />
            <SummaryItem label="Sector" value={sectorDisplayName(profile.primarySector)} />
            <SummaryItem label="Location" value={profile.location} />
            {typeof profile.teamSize === "number" &&
            Number.isFinite(profile.teamSize) ? (
              <SummaryItem label="Team size" value={String(profile.teamSize)} />
            ) : null}
            <SummaryItem label="Women-led" value={yesNo(isWomenLed(profile))} />
            <SummaryItem label="SC/ST founder" value={yesNo(profile.scStFounder)} />
          </dl>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEditProfile}
            className="shrink-0"
          >
            <Pencil aria-hidden="true" />
            Edit Profile
          </Button>
        </div>
      </section>

      {/* Section 2 — Total benefits (Req 21.2, 21.3, 27.6) */}
      <section
        aria-label="Estimated total benefits"
        className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <p className="text-caption font-medium uppercase tracking-wide text-muted">
          Estimated total benefits
        </p>

        {/* The total + confidence label are announced together (Req 27.6). */}
        <div aria-live="polite">
          <p className="mt-2 font-heading text-5xl font-bold leading-tight text-primary sm:text-6xl">
            {formatRupees(total)}
          </p>
          <p className="mt-2 text-body text-muted">
            Across {qualifyingCount}{" "}
            {qualifyingCount === 1 ? "scheme" : "schemes"} you qualify for
          </p>

          {/* Thin, understated confidence meter (Req 21.3). */}
          <div className="mt-5 max-w-md">
            <div className="flex items-center justify-between">
              <span className="text-caption text-muted">Confidence</span>
              <span className="text-caption font-semibold text-dark">
                {label} Confidence
              </span>
            </div>
            <div
              className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border"
              role="progressbar"
              aria-valuenow={meterPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Weighted-average confidence: ${label}`}
            >
              <div
                className={cn("h-full rounded-full", meterFillClass)}
                style={{ width: `${meterPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Status-grouped breakdown (Req 21.4, 21.5) */}
      <section aria-label="Scheme-by-scheme breakdown" className="space-y-4">
        <h2 className="font-heading text-lg font-semibold text-dark">
          Scheme breakdown
        </h2>

        {GROUP_CONFIG.map((group) => {
          const items = grouped.get(group.status) ?? [];
          if (items.length === 0) return null;

          return (
            <details
              key={group.status}
              open={group.defaultOpen}
              className="rounded-xl border border-border bg-card shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-body font-semibold",
                      group.titleClass,
                    )}
                  >
                    {group.title}
                  </span>
                  <span className="text-caption text-muted">
                    ({items.length})
                  </span>
                </span>
              </summary>

              <div className="border-t border-border px-5 pb-1 pt-1">
                {group.helper ? (
                  <p className="pb-1 pt-2 text-caption text-muted">
                    {group.helper}
                  </p>
                ) : null}
                {items.map(({ scheme, result }) => (
                  <CalculatorBreakdownRow
                    key={scheme.id}
                    scheme={scheme}
                    result={result}
                  />
                ))}
              </div>
            </details>
          );
        })}
      </section>

      {/* Bottom actions (Req 21.6) */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={onEditProfile}>
          Update Profile
        </Button>
        <Button asChild variant="accent">
          <Link href="/schemes?eligible=1">Apply to Eligible Schemes</Link>
        </Button>
      </div>
    </div>
  );
}

export default CalculatorResults;

"use client";

// src/components/schemes/CompareView.tsx
//
// Compare View (`/schemes/compare`). Reads the selected scheme ids from the URL
// search parameters, resolves them to canonical `Scheme` objects, and renders a
// semantic, accessible side-by-side comparison `<table>` (Req 17, 27.5).
//
// Column removal rewrites the URL search params (Req 17.4); reducing the
// selection below two valid ids naturally surfaces the "select schemes" prompt
// (Req 17.8). When the session is in Registered_State, an extra "Your
// Eligibility" row shows a per-column `ConfidenceDot` + reasons computed once
// via `evaluateScheme` (Req 17.6).
//
// This component intentionally uses `useSearchParams()` directly; the route
// page (`app/schemes/compare/page.tsx`, task 3.14) wraps it in `<Suspense>`.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, X } from "lucide-react";

import { ApplyButton } from "@/components/schemes/ApplyButton";
import { CompareRow } from "@/components/schemes/CompareRow";
import { ConfidenceDot } from "@/components/shared/ConfidenceDot";
import { Button } from "@/components/ui/button";
import { schemes } from "@/data/schemes";
import { evaluateScheme } from "@/lib/eligibility-engine";
import { useRegistration } from "@/context/RegistrationContext";
import type { EligibilityResult, Scheme, SchemeStatus, SchemeType } from "@/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The search-param key carrying the comma-separated scheme ids. */
const IDS_PARAM = "ids";

/** Maximum number of schemes that can be compared side by side. */
const MAX_COMPARE = 3;

/** The canonical set of valid scheme ids (from `src/data/schemes.ts`). */
const VALID_IDS = new Set(schemes.map((scheme) => scheme.id));

/** Human-readable labels for the `Scheme.type` union. */
const TYPE_LABELS: Record<SchemeType, string> = {
  fiscal: "Fiscal Incentive",
  grant: "Grant-in-Aid",
};

/** Human-readable labels for the `Scheme.status` union. */
const STATUS_LABELS: Record<SchemeStatus, string> = {
  open: "Open",
  upcoming: "Upcoming",
};

// ---------------------------------------------------------------------------
// Pure URL helpers (exported for reuse + unit testing)
// ---------------------------------------------------------------------------

/**
 * Serialize an ordered list of scheme ids into a single comma-separated string
 * for the `ids` search param. Pure: no trimming/validation beyond joining — the
 * caller is expected to pass already-resolved ids.
 */
export function serializeCompareIds(ids: string[]): string {
  return ids.join(",");
}

/**
 * Parse the raw `ids` search-param value into a clean, ordered list of valid
 * scheme ids. Pure and total:
 *   - splits on commas
 *   - trims surrounding whitespace
 *   - drops empty entries
 *   - de-duplicates (first occurrence wins, order preserved)
 *   - keeps only ids that exist in `src/data/schemes.ts`
 *   - caps the result at the first {@link MAX_COMPARE} ids
 * Returns an empty array for `null`/empty input.
 */
export function parseCompareIds(param: string | null): string[] {
  if (!param) return [];

  const result: string[] = [];
  const seen = new Set<string>();

  for (const raw of param.split(",")) {
    const id = raw.trim();
    if (id.length === 0) continue;
    if (seen.has(id)) continue;
    if (!VALID_IDS.has(id)) continue;
    seen.add(id);
    result.push(id);
    if (result.length === MAX_COMPARE) break;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const BACK_TO_SCHEMES_HREF = "/schemes";

export function CompareView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isRegistered, registrationProfile } = useRegistration();

  // Resolve the URL ids → real Scheme objects, preserving the URL order.
  const selectedSchemes = useMemo<Scheme[]>(() => {
    const ids = parseCompareIds(searchParams.get(IDS_PARAM));
    return ids
      .map((id) => schemes.find((scheme) => scheme.id === id))
      .filter((scheme): scheme is Scheme => scheme !== undefined);
  }, [searchParams]);

  // Registered eligibility, computed once per selection / profile change. Guard
  // the null-profile case (registered flag can flip before a profile exists).
  const eligibilityByScheme = useMemo<Record<string, EligibilityResult>>(() => {
    if (!isRegistered || !registrationProfile) return {};
    const map: Record<string, EligibilityResult> = {};
    for (const scheme of selectedSchemes) {
      map[scheme.id] = evaluateScheme(registrationProfile, scheme);
    }
    return map;
  }, [isRegistered, registrationProfile, selectedSchemes]);

  /**
   * Remove a column: rewrite the URL to the remaining ids (Req 17.4). Dropping
   * below two valid ids naturally renders the prompt on the next render.
   */
  const handleRemove = (schemeId: string) => {
    const remaining = selectedSchemes
      .map((scheme) => scheme.id)
      .filter((id) => id !== schemeId);
    router.replace(
      `${BACK_TO_SCHEMES_HREF}/compare?${IDS_PARAM}=${serializeCompareIds(remaining)}`,
    );
  };

  const backLink = (
    <Link
      href={BACK_TO_SCHEMES_HREF}
      className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back to Schemes
    </Link>
  );

  // Req 17.8 — fewer than two valid ids: prompt + link back.
  if (selectedSchemes.length < 2) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="font-heading text-h3 font-semibold text-dark">
            Compare schemes
          </h1>
          <p className="mt-3 text-body text-muted">
            Select at least two schemes to compare.
          </p>
          <div className="mt-6 flex justify-center">{backLink}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6">{backLink}</div>

      <h1 className="mb-6 font-heading text-h2 font-semibold text-dark">
        Compare schemes
      </h1>

      <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Side-by-side comparison of the selected Karnataka startup schemes.
          </caption>
          <thead>
            <tr className="bg-card">
              {/* Leading empty corner cell aligned above the row headers. */}
              <th scope="col" className="w-44 px-4 py-4">
                <span className="sr-only">Attribute</span>
              </th>
              {selectedSchemes.map((scheme) => (
                <th
                  key={scheme.id}
                  scope="col"
                  className="px-4 py-4 align-top"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-heading text-body font-semibold text-dark">
                      {scheme.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted hover:text-danger"
                      onClick={() => handleRemove(scheme.id)}
                      aria-label={`Remove ${scheme.name} from the comparison`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <CompareRow
              label="Type"
              cells={selectedSchemes.map((scheme) => TYPE_LABELS[scheme.type])}
            />
            <CompareRow
              label="Status"
              cells={selectedSchemes.map(
                (scheme) => STATUS_LABELS[scheme.status],
              )}
            />
            <CompareRow
              label="Amount"
              cells={selectedSchemes.map((scheme) => scheme.amount)}
            />
            <CompareRow
              label="Max Benefit"
              cells={selectedSchemes.map((scheme) => scheme.maxBenefit)}
            />
            <CompareRow
              label="Duration"
              cells={selectedSchemes.map((scheme) => scheme.duration)}
            />
            <CompareRow
              label="Eligibility"
              cells={selectedSchemes.map((scheme) => (
                <ul key={scheme.id} className="list-disc space-y-1 pl-5">
                  {scheme.eligibility.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ))}
            />
            <CompareRow
              label="Documents"
              cells={selectedSchemes.map((scheme) => (
                <ol key={scheme.id} className="list-decimal space-y-1 pl-5">
                  {scheme.documents.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ol>
              ))}
            />

            {isRegistered ? (
              <CompareRow
                label="Your Eligibility"
                className="bg-surface"
                cells={selectedSchemes.map((scheme) => {
                  const result = eligibilityByScheme[scheme.id];
                  if (!result) {
                    return (
                      <span key={scheme.id} className="text-sm text-muted">
                        Not available
                      </span>
                    );
                  }
                  return (
                    <div key={scheme.id} className="space-y-2">
                      <ConfidenceDot status={result.status} showLabel />
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                        {result.reasons.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              />
            ) : null}

            {/* Per-column Apply control row (Req 17.7). */}
            <CompareRow
              label="Apply"
              cells={selectedSchemes.map((scheme) => (
                <ApplyButton key={scheme.id} schemeId={scheme.id} />
              ))}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CompareView;

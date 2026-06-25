"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useRegistration } from "@/context/RegistrationContext";
import { cn } from "@/lib/utils";

/**
 * PersonalizationBanner — the Schemes Hub header banner that reflects whether a
 * session profile exists (Req 12.2–12.6).
 *
 * - REGISTERED (`isRegistered` true): an accent-bordered banner announcing
 *   "Personalized for {kiteId}", the qualifying-scheme count, a Reset control
 *   that clears the session profile (`resetRegistration`), and three quick-filter
 *   chips ("Show Only Eligible", "Show All", "Compare Selected"). The Hub owns
 *   the quick-filter state; this component renders the active chip and reports
 *   activations back via `onQuickFilter`.
 * - UNREGISTERED: a muted banner inviting the visitor to register, with a
 *   "Register Now" control targeting `/register`.
 *
 * Government-grade restraint: flat tokens, rounded-xl, border — no glow, no
 * gradient. Every control carries an accessible name; the chips expose their
 * active state via `aria-pressed`.
 */

export type QuickFilter = "all" | "eligible" | "compare";

export interface PersonalizationBannerProps {
  /** Number of schemes the profile qualifies for (definitely/likely eligible). */
  qualifyingCount: number;
  /** The active quick-filter, owned by the Schemes Hub. */
  activeQuickFilter: QuickFilter;
  /** Reports a quick-filter chip activation back to the Hub. */
  onQuickFilter: (filter: QuickFilter) => void;
  /** Extra classes merged onto the banner wrapper (for layout flexibility). */
  className?: string;
}

/** Single source of truth for the three quick-filter chips and their labels. */
const QUICK_FILTERS: ReadonlyArray<{ value: QuickFilter; label: string }> = [
  { value: "eligible", label: "Show Only Eligible" },
  { value: "all", label: "Show All" },
  { value: "compare", label: "Compare Selected" },
];

export function PersonalizationBanner({
  qualifyingCount,
  activeQuickFilter,
  onQuickFilter,
  className,
}: PersonalizationBannerProps) {
  const { isRegistered, registrationProfile, resetRegistration } =
    useRegistration();

  if (!isRegistered) {
    return (
      <section
        className={cn(
          "flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
        aria-label="Registration prompt"
      >
        <p className="text-sm text-dark">
          Register your startup to see schemes you qualify for
        </p>
        <Button asChild variant="accent" className="shrink-0">
          <Link href="/register">Register Now</Link>
        </Button>
      </section>
    );
  }

  const kiteId = registrationProfile?.kiteId ?? "";

  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-accent/40 bg-accent/5 p-5",
        className,
      )}
      aria-label="Personalized for your profile"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="mt-0.5 h-5 w-5 shrink-0 text-accent"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              Personalized for {kiteId}
            </p>
            <p className="text-sm text-dark">
              You qualify for {qualifyingCount} of 22 schemes based on your
              profile
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 self-start"
          onClick={resetRegistration}
        >
          Reset Personalization
        </Button>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Quick filters"
      >
        {QUICK_FILTERS.map(({ value, label }) => {
          const isActive = activeQuickFilter === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onQuickFilter(value)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-background text-dark hover:bg-surface",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default PersonalizationBanner;

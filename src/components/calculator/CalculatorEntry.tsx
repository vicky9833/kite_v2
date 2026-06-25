"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ClipboardCheck, FileText, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// The QuickProfileForm pulls in Radix Select/Slider/RadioGroup/Checkbox, but it
// is only revealed when the visitor clicks "Use Quick Profile". Code-split it via
// `next/dynamic` so those primitives stay out of the `/calculator` First Load and
// only load on demand. A height-reserving fallback holds layout while it hydrates.
const QuickProfileForm = dynamic(
  () => import("@/components/calculator/QuickProfileForm").then((m) => m.QuickProfileForm),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[20rem]" /> },
);

export interface CalculatorEntryProps {
  /**
   * Invoked once a Registration_Profile becomes available — i.e. after the
   * inline `QuickProfileForm` writes its captured fields via `updateProfile`
   * (entering Profile_Set_State). The parent `/calculator` page uses this to
   * swap the entry card for the results view.
   */
  onProfileReady?: () => void;
  className?: string;
}

/**
 * CalculatorEntry — the State-1 entry card for the Policy Calculator (Req 20.2).
 *
 * WHILE no Registration_Profile exists, the calculator shows this centered card
 * offering two paths:
 *  - "Use My Registration" — a Link to `/register` to start or complete the full
 *    six-step wizard.
 *  - "Use Quick Profile" — a button that reveals the compressed `QuickProfileForm`
 *    inline (toggled with local state). On save the form calls `updateProfile`
 *    and `onSaved`, which we forward to `onProfileReady`.
 *
 * Restrained, government-grade styling: a single `rounded-xl` + `shadow-sm` +
 * `border` card, no gradients/blobs/emoji. Fully keyboard accessible — both
 * options are native interactive controls with discernible names, and the
 * reveal toggle exposes its expanded state via `aria-expanded`/`aria-controls`.
 */
export function CalculatorEntry({
  onProfileReady,
  className,
}: CalculatorEntryProps) {
  const [showQuickProfile, setShowQuickProfile] = useState(false);

  return (
    <Card className={cn("mx-auto w-full max-w-2xl", className)}>
      <CardContent className="space-y-8 p-6 sm:p-8">
        <div className="space-y-2 text-center">
          <h2 className="font-heading text-h3 text-dark">
            Estimate your benefits
          </h2>
          <p className="mx-auto max-w-md text-body text-muted">
            Choose how you would like to begin. Use an existing registration for
            the most accurate estimate, or fill a quick profile to calculate
            without registering.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Option 1 — Use My Registration → /register */}
          <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <ClipboardCheck className="h-5 w-5 text-accent" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h3 className="font-heading text-body font-semibold text-dark">
                Use My Registration
              </h3>
              <p className="text-caption text-muted">
                Start or complete your registration for a profile-driven estimate.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-auto w-full">
              <Link href="/register">
                Go to registration
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {/* Option 2 — Use Quick Profile → reveal QuickProfileForm inline */}
          <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <FileText className="h-5 w-5 text-accent" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h3 className="font-heading text-body font-semibold text-dark">
                Use Quick Profile
              </h3>
              <p className="text-caption text-muted">
                Answer a short, single-screen form — no full registration needed.
              </p>
            </div>
            <Button
              type="button"
              variant={showQuickProfile ? "default" : "accent"}
              className="mt-auto w-full"
              aria-expanded={showQuickProfile}
              aria-controls="quick-profile-panel"
              onClick={() => setShowQuickProfile((open) => !open)}
            >
              {showQuickProfile ? "Hide quick profile" : "Use quick profile"}
            </Button>
          </div>
        </div>

        {/* Inline reveal — rendered only when toggled open (Req 20.2). */}
        {showQuickProfile ? (
          <div
            id="quick-profile-panel"
            className="border-t border-border pt-8"
          >
            <QuickProfileForm onSaved={onProfileReady} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default CalculatorEntry;

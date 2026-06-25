"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Rocket } from "lucide-react";

import type { QuickAction } from "@/types";
import { cn } from "@/lib/utils";
import { useOptionalRegistration } from "@/context/RegistrationContext";
import { QuickActionCard } from "@/components/shared/QuickActionCard";

export interface RegisterQuickActionCardProps {
  /** The "Register Your Startup" quick action this card represents. */
  action: QuickAction;
  /** Extra classes merged onto the card root. */
  className?: string;
}

/**
 * RegisterQuickActionCard — the home Quick Actions "Register Your Startup"
 * card, with a registered/completed treatment (Req 24.3, 24.4, 24.5).
 *
 * This is a small `"use client"` island that reads `isRegistered` from the
 * session `RegistrationContext` via the non-throwing
 * {@link useOptionalRegistration} accessor (so it degrades to the unregistered
 * branch when rendered in isolation without a provider, e.g. foundation tests):
 *
 *   - WHILE Unregistered_State (the default): renders the standard
 *     {@link QuickActionCard} for this action — byte-for-byte the foundation
 *     slice behavior (Req 24.4, 24.5).
 *   - WHILE Registered_State: renders the SAME card slot in a completed state —
 *     a Lucide `CheckCircle2` checkmark badge marking registration done — and
 *     surfaces a secondary "See Your Schemes" → `/schemes` affordance WITHIN
 *     this one card. The card stays in place so the eight-action grid
 *     cardinality is preserved (Req 24.3; design Reconciliation Note 1).
 *
 * Note this is a single grid cell in both states — the grid count is never
 * changed by this island.
 */
export function RegisterQuickActionCard({
  action,
  className,
}: RegisterQuickActionCardProps) {
  const { isRegistered } = useOptionalRegistration();

  // Unregistered_State: delegate to the standard card so output matches the
  // foundation slice exactly (same role="link" entry point).
  if (!isRegistered) {
    return <QuickActionCard action={action} className={className} />;
  }

  // Registered_State: completed treatment in the same card slot.
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-success/40 bg-card p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <Rocket className="h-6 w-6 text-primary" aria-hidden="true" />
        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Registered
        </span>
      </div>

      <h3 className="font-heading text-lg font-semibold text-dark">
        {action.label}
      </h3>

      <p className="text-sm text-muted">
        Your startup is registered. Explore the schemes you qualify for.
      </p>

      <Link
        href="/dashboard/startup"
        className={cn(
          "mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary outline-none",
          "hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        )}
      >
        Go to Dashboard
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>

      <Link
        href="/schemes"
        className={cn(
          "inline-flex items-center gap-1 text-sm font-semibold text-primary outline-none",
          "hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        )}
      >
        See Your Schemes
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}

export default RegisterQuickActionCard;

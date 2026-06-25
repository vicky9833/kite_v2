"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Calculator,
  Calendar,
  ChevronRight,
  MapPin,
  Rocket,
  Search,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { QuickAction } from "@/types";
import { cn, safeNavigate } from "@/lib/utils";

/**
 * Maps the `icon` name stored on each {@link QuickAction} to its concrete
 * `lucide-react` component. Keeping the map local to the card keeps the data
 * layer free of React/runtime imports — the data only carries icon *names*.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Rocket,
  Search,
  Calculator,
  Building2,
  Users,
  TrendingUp,
  MapPin,
  Calendar,
};

export interface QuickActionCardProps {
  /** The action this card represents. */
  action: QuickAction;
  /** Extra classes merged onto the card root. */
  className?: string;
}

/**
 * QuickActionCard — a fully clickable entry-point card (Req 10.5, 10.6).
 *
 * The entire card acts as a single link target: it is rendered with
 * `role="link"`, is focusable, and activates on pointer click or keyboard
 * (Enter / Space). Navigation goes through {@link safeNavigate}, so an invalid
 * or unavailable route surfaces a non-blocking indication and keeps the visitor
 * on the current page rather than navigating away (Req 10.6).
 *
 * Editorial restraint: white surface, hairline border, a small shadow lift and
 * a faint border tint on hover — no transform/scale on the card. Only the
 * trailing chevron nudges a few pixels to the right on hover.
 */
export function QuickActionCard({ action, className }: QuickActionCardProps) {
  const router = useRouter();
  const Icon = ICON_MAP[action.icon];

  const navigate = React.useCallback((): void => {
    safeNavigate(router, action.href);
  }, [router, action.href]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        navigate();
      }
    },
    [navigate],
  );

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={action.label}
      onClick={navigate}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm outline-none transition-colors",
        "hover:border-primary/30 hover:shadow",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      {Icon ? (
        <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
      ) : null}

      <h3 className="font-heading text-lg font-semibold text-dark">
        {action.label}
      </h3>

      <p className="text-sm text-muted">{action.description}</p>

      <ChevronRight
        className="mt-auto ml-auto h-5 w-5 text-muted transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      />
    </div>
  );
}

export default QuickActionCard;

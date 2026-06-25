"use client";

import * as React from "react";
import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Incubator } from "@/types";

/**
 * IncubatorCard — a single verified incubator card for the Incubators Index
 * (Req 1.3, 1.7). It renders the record's `name`, `cluster`, incubator `type`,
 * and exactly one tag per `focus[]` entry, drawn VERBATIM and in stored order
 * from the verified {@link Incubator} record (Req 1.3 / Property 10) — no
 * alteration or reordering.
 *
 * The whole card is a single activation target: it is rendered with
 * `role="button"`, is focusable, and activates on pointer click or keyboard
 * (Enter / Space), invoking `onActivate` with the incubator id (Req 3.1). It
 * carries an accessible name (Req 14.2) and the institutional visual treatment
 * — `rounded-xl shadow-sm border` (Req 15.1).
 *
 * Client Component (keyboard/pointer activation).
 */
export interface IncubatorCardProps {
  /** The verified incubator record to render. */
  incubator: Incubator;
  /** Invoked with the incubator id on pointer or keyboard activation. */
  onActivate: (incubatorId: string) => void;
  /** Extra classes merged onto the card root. */
  className?: string;
}

export function IncubatorCard({ incubator, onActivate, className }: IncubatorCardProps) {
  const { id, name, cluster, focus, type } = incubator;

  const activate = React.useCallback((): void => {
    onActivate(id);
  }, [onActivate, id]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
        event.preventDefault();
        activate();
      }
    },
    [activate],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${name} — ${type} in ${cluster}`}
      onClick={activate}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm outline-none transition-colors",
        "hover:border-primary/30 hover:shadow",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      <h2 className="font-heading text-lg font-semibold text-dark">{name}</h2>

      <p className="flex items-center gap-1.5 text-caption text-muted">
        <MapPin aria-hidden className="h-3.5 w-3.5" />
        {cluster}
      </p>

      <Badge variant="outline" className="w-fit">
        {type}
      </Badge>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {focus.map((tag, index) => (
          <Badge key={`${id}-focus-${index}`} variant="accent">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default IncubatorCard;

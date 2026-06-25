import Link from "next/link";
import { MapPin } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { sectors } from "@/data/sectors";
import { cn } from "@/lib/utils";
import type { OpportunityCardData } from "@/types";

/**
 * OpportunityCard — a single synthetic featured-opportunity card (Req 9.2–9.4).
 * Surfaces the company name, sector badge (label resolved from the canonical
 * `sectors` taxonomy), stage badge, formatted ask, a one-sentence pitch, the
 * Karnataka location, and a "Connect" CTA. A corner {@link IllustrativeBadge}
 * marks the card's data as synthetic.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface OpportunityCardProps {
  opportunity: OpportunityCardData;
  className?: string;
}

/** Resolve a sector id → its canonical display label, falling back to the id. */
function resolveSectorLabel(sectorId: string): string {
  return sectors.find((s) => s.id === sectorId)?.name ?? sectorId;
}

/**
 * Format an ask expressed in lakhs into a clean ₹ label, promoting to crore at
 * or above 100 lakhs (1 crore). Pure & deterministic.
 */
function formatAsk(askLakhs: number): string {
  if (!Number.isFinite(askLakhs) || askLakhs <= 0) return "₹0 L";
  if (askLakhs >= 100) {
    const crore = askLakhs / 100;
    const rounded = Math.round(crore * 10) / 10;
    return `₹${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} Cr`;
  }
  return `₹${Math.round(askLakhs)} L`;
}

export function OpportunityCard({ opportunity, className }: OpportunityCardProps) {
  const { companyName, sector, stage, askLakhs, pitch, location } = opportunity;

  return (
    <article
      className={cn(
        "relative flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      <IllustrativeBadge />

      <h3 className="pr-20 font-heading text-lg text-dark">{companyName}</h3>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{resolveSectorLabel(sector)}</Badge>
        <Badge variant="accent">{stage}</Badge>
      </div>

      <p className="font-heading text-h3 text-primary">{formatAsk(askLakhs)}</p>

      <p className="text-body text-muted">{pitch}</p>

      <p className="flex items-center gap-1.5 text-caption text-muted">
        <MapPin aria-hidden className="h-3.5 w-3.5" />
        {location}
      </p>

      <div className="mt-auto pt-2">
        <Link
          href="/investors/onboard"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          aria-label={`Connect with ${companyName}`}
        >
          Connect
        </Link>
      </div>
    </article>
  );
}

export default OpportunityCard;

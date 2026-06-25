import { ArrowUpRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProgramEditorialData } from "@/types";

/**
 * ApplyCtaSection — section §7 (closing) of the Editorial_Section_Set
 * (Req 4.2/5.2). Renders the single permitted call-to-action from
 * `data.applyCta`. The link points at the official external `https` Karnataka
 * portal and opens in a new tab with `rel="noopener noreferrer"`
 * (Req 4.7/5.13). This is the ONLY call-to-action on the page; the copy is
 * declarative and free of urgency/scarcity phrasing (Req 4.8/5.14). The content
 * is VERIFIED, so no IllustrativeBadge appears (Req 4.6/5.12).
 *
 * The `<section>` is a region landmark with an `aria-label` (Req 14.5) and uses
 * an `h2` heading (Req 14.1).
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface ApplyCtaSectionProps {
  data: ProgramEditorialData;
}

export function ApplyCtaSection({ data }: ApplyCtaSectionProps) {
  const { applyCta, name } = data;

  return (
    <section aria-label="Apply" className="bg-dark py-16 text-white md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            Apply
          </span>
          <h2 className="font-heading text-h2 text-white">Apply to {name}</h2>
          <p className="text-body text-slate-300">
            Applications are reviewed through the official Karnataka portal.
          </p>
          <div className="mt-2">
            <a
              href={applyCta.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
            >
              {applyCta.label}
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ApplyCtaSection;

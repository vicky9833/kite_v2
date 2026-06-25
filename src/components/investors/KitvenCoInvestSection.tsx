import { Landmark, Percent, PieChart, type LucideIcon } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * KitvenCoInvestSection — section 5 of Investor Connect (Req 11). Surfaces the
 * VERIFIED KITVEN co-investment terms (₹100 crore corpus, 2–10% of corpus per
 * investment, max 30% stake) — canonical figures, so no illustrative label.
 *
 *  - A visual-only "Submit Co-investment Proposal" ghost CTA references the
 *    official EITBT startup portal (`rel="noopener noreferrer"`, Req 11.2).
 *  - "View Active Co-investments" is an in-page anchor → `#kitven-portfolio`.
 *
 * The section itself carries `id="kitven-portfolio"` so the anchor resolves.
 *
 * Server Component (no interactivity / no `"use client"`).
 */

interface KitvenTerm {
  icon: LucideIcon;
  value: string;
  label: string;
}

const KITVEN_TERMS: ReadonlyArray<KitvenTerm> = [
  { icon: Landmark, value: "₹100 crore", label: "Fund corpus" },
  { icon: Percent, value: "2–10%", label: "Of corpus per investment" },
  { icon: PieChart, value: "Max 30%", label: "Stake per company" },
];

const EITBT_STARTUP_PORTAL = "https://eitbt.karnataka.gov.in/startup";

export function KitvenCoInvestSection() {
  return (
    <section id="kitven-portfolio" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Government co-investment"
          title="Co-invest with KITVEN"
          description="Partner with Karnataka's state venture fund on qualifying deals under transparent, published terms."
        />

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {KITVEN_TERMS.map((term) => {
            const Icon = term.icon;
            return (
              <li
                key={term.label}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <p className="font-heading text-h3 text-primary">{term.value}</p>
                <p className="text-body text-muted">{term.label}</p>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={EITBT_STARTUP_PORTAL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
          >
            Submit Co-investment Proposal
          </a>
          <a
            href="#kitven-portfolio"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            View Active Co-investments
          </a>
        </div>
      </div>
    </section>
  );
}

export default KitvenCoInvestSection;

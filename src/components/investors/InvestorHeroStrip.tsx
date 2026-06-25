import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * InvestorHeroStrip — section 1 of Investor Connect (Req 7). A restrained,
 * government-grade dark hero (`py-12`, `bg-dark`) with the page headline, a
 * one-line subhead, two CTAs, and a thin row of VERIFIED ecosystem stats.
 *
 *  - "Get Investor Access" → `/investors/onboard` (Req 7.4).
 *  - "View Live Deal Flow" → in-page `#deals` anchor (Req 7.3).
 *  - The four headline stats are CANONICAL / verified figures (Req 7.2, 7.5),
 *    so they carry no illustrative label.
 *
 * Server Component (no interactivity / no `"use client"`).
 */

/** Verified, canonical headline stats — NOT synthetic (Req 7.2, 7.5). */
const VERIFIED_STATS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "183", label: "Soonicorns" },
  { value: "$79B", label: "Raised since 2010" },
  { value: "21,000", label: "DPIIT-recognised startups" },
  { value: "46%", label: "of India's VC since 2016" },
];

export function InvestorHeroStrip() {
  return (
    <section className="bg-dark py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            Investor Connect
          </span>
          <h1 className="font-heading text-h1 text-white">Investor Connect</h1>
          <p className="text-body text-slate-300">
            Discover the Karnataka startup ecosystem from an investor&rsquo;s lens.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/investors/onboard"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
            >
              Get Investor Access
            </Link>
            <a
              href="#deals"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              View Live Deal Flow
            </a>
          </div>
        </div>

        {/* Verified stats row — canonical figures, no illustrative label. */}
        <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/10 pt-8 md:grid-cols-4">
          {VERIFIED_STATS.map((stat) => (
            // `flex-col-reverse` keeps the DOM order valid for a definition list
            // (a `<div>` wrapping exactly one `<dt>`/`<dd>` pair) while showing
            // the value above its label.
            <div key={stat.label} className="flex flex-col-reverse gap-1">
              <dt className="text-caption text-slate-400">{stat.label}</dt>
              <dd className="font-heading text-h3 text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default InvestorHeroStrip;

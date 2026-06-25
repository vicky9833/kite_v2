import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * CsrHeroStrip — section 1 of the CSR & NGO Hub (Req 16). A restrained,
 * government-grade dark hero (`py-12`, `bg-dark`) carrying the page's single
 * `h1`, an institutional subhead, and two CTAs. The copy reads as a KDEM
 * partnership memo extended to CSR teams, NGO partners, and government
 * coordinators — an invitation to deploy corporate capital through the
 * Karnataka startup ecosystem, NOT marketing brochure copy (Req 16.2).
 *
 *  - The subhead frames the CSR opportunity: matching corporate CSR capital to
 *    vetted ecosystem programs through KDEM's NGO partnership framework.
 *  - "Partner with KITE" → the on-page `#csr-partner` partnership anchor
 *    (the CsrHowToPartner section) (Req 16.3).
 *  - "Browse CSR-Aligned Programs" → the on-page `#csr-aligned-programs` anchor
 *    (the filtered CSR-aligned programs list) (Req 16.4).
 *
 * Institutional visual discipline (Req 36): no gradients/blobs/emoji/glow,
 * Lucide icons only, `max-w-7xl`, Plus Jakarta Sans headings via `font-heading`.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export function CsrHeroStrip() {
  return (
    <section className="bg-dark py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            CSR &amp; NGO Hub
          </span>
          <h1 className="font-heading text-h1 text-white">
            A partnership channel for CSR capital in Karnataka&rsquo;s startup ecosystem
          </h1>
          <p className="text-body text-slate-300">
            KDEM invites corporate CSR teams, family offices, public sector
            undertakings, and NGO partners to direct mandated CSR capital into
            vetted Karnataka ecosystem programs. Through a structured NGO
            partnership framework, we match your focus areas to grassroots,
            women-led, and rural innovation programs already operating across the
            state.
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#csr-partner"
              className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
            >
              Partner with KITE
            </a>
            <a
              href="#csr-aligned-programs"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Browse CSR-Aligned Programs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CsrHeroStrip;

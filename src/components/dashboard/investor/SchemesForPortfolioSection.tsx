"use client";

// src/components/dashboard/investor/SchemesForPortfolioSection.tsx
//
// Investor Dashboard — "Government Schemes for Your Portfolio" (Req 24).
//
// Ranks ALL canonical schemes by `evaluateSchemeRelevance(profile, scheme)`
// (relevant schemes first, original order preserved within each group) and
// shows the top six. Each card surfaces the scheme name, the why-it-matters
// reason from the relevance result, the scheme's max benefit, and a
// visual-only "Share with Portfolio" action (Req 24.1–24.3).
//
// Reads session state via `useInvestor`. Pure ranking via `useMemo`.

import { useMemo } from "react";
import { Share2 } from "lucide-react";

import { useInvestor } from "@/context/InvestorContext";
import { evaluateSchemeRelevance } from "@/lib/investor-matching";
import { schemes } from "@/data/schemes";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { cn } from "@/lib/utils";
import type { Scheme } from "@/types";

interface RankedScheme {
  scheme: Scheme;
  isRelevant: boolean;
  reason: string;
}

export function SchemesForPortfolioSection() {
  const { investorProfile } = useInvestor();

  const ranked = useMemo<RankedScheme[]>(() => {
    if (!investorProfile) return [];
    return schemes
      .map((scheme) => {
        const result = evaluateSchemeRelevance(investorProfile, scheme);
        return {
          scheme,
          isRelevant: result.isRelevant,
          reason: result.reason,
        };
      })
      // Relevant first; stable within each group (preserves canonical order).
      .sort((a, b) => Number(b.isRelevant) - Number(a.isRelevant))
      .slice(0, 6);
  }, [investorProfile]);

  return (
    <section
      aria-labelledby="schemes-portfolio-heading"
      className="bg-surface py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="schemes-portfolio-heading"
          eyebrow="Schemes"
          title="Government Schemes for Your Portfolio"
          description="The Karnataka schemes most relevant to your thesis, ranked for your portfolio companies."
        />

        <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ranked.map(({ scheme, isRelevant, reason }) => (
            <li key={scheme.id} className="h-full">
              <article className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-lg font-bold text-dark">
                    {scheme.name}
                  </h3>
                  <span
                    className={cn(
                      "shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold",
                      isRelevant
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border bg-surface text-muted",
                    )}
                  >
                    {isRelevant ? "Relevant" : "Explore"}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-700">
                  {reason}
                </p>

                <dl className="mt-4">
                  <dt className="text-xs uppercase tracking-wide text-muted">
                    Max benefit
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-dark">
                    {scheme.maxBenefit}
                  </dd>
                </dl>

                <div className="mt-auto pt-5">
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-primary shadow-sm",
                      "transition-colors hover:border-primary/30 hover:text-accent",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    )}
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    Share with Portfolio
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default SchemesForPortfolioSection;

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ecosystemStats,
  homeStatsStripIds,
} from "@/data/ecosystem-stats";
import type { Stat } from "@/types";

/**
 * HeroSection — the first section of the Home page (Req 8).
 *
 * Government-grade editorial, NOT a startup landing page. Restraint is the brief:
 * the only "decoration" is the CSS-only `.hero-grid-pattern` (faint 4%-white grid
 * authored in globals.css) layered on the flat `bg-dark` surface. There are NO
 * gradients, blobs, waves, glassmorphism, glow, animated backgrounds, emoji, or
 * stock imagery anywhere here — the visual interest comes from typography, the
 * Karnataka palette, and verified ecosystem data.
 *
 * Server Component: the two CTAs are internal `next/link` navigations to real
 * routes (`/register`, `/schemes`), so no client-side router / `safeNavigate` is
 * needed and no `"use client"` directive is required (Req 8.5, 8.6).
 *
 * All foreground copy is white / `slate-300` on `bg-dark` (#0F1B2D) and clears
 * WCAG AA; the grid pattern sits at ~4% white and does not erode that contrast
 * (Req 8.1).
 */

/** Resolve the curated home strip stats, in the order declared by `homeStatsStripIds`. */
const heroStats: Stat[] = homeStatsStripIds
  .map((id) => ecosystemStats.find((stat) => stat.id === id))
  .filter((stat): stat is Stat => stat !== undefined);

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        "relative w-full bg-dark hero-grid-pattern",
        "flex items-center",
        "min-h-[600px] md:min-h-[720px]",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8">
        {/* Kicker */}
        <p className="text-caption font-heading font-semibold uppercase tracking-[0.18em] text-accent">
          One Portal. One Login. One Ecosystem.
        </p>

        {/* Headline */}
        <h1
          id="hero-heading"
          className="mt-5 max-w-4xl font-heading text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-display"
        >
          Karnataka&rsquo;s Innovation &amp; Technology Ecosystem
        </h1>

        {/* Supporting line — verified scale */}
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
          21,000+ DPIIT startups &middot; 183 soonicorns &middot; 730+ GCCs
          &middot; 25,000 target by 2030.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/register"
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3",
              "text-base font-semibold text-white",
              "transition-colors hover:bg-accent/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark",
            )}
          >
            Register Your Startup
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>

          <Link
            href="/schemes"
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-transparent px-6 py-3",
              "text-base font-semibold text-white",
              "transition-colors hover:border-white hover:bg-white/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark",
            )}
          >
            Explore Schemes &amp; Benefits
          </Link>
        </div>

        {/* Thin data strip — verified headline numbers (no cards). Each group
            is a <div> containing only <dt>/<dd> so the <dl> stays valid: the
            source line is a secondary <dd> rather than a <p> (Req 21.1). */}
        {heroStats.length > 0 ? (
          <dl className="mt-16 flex flex-wrap gap-x-10 gap-y-8 border-t border-white/10 pt-10">
            {heroStats.map((stat) => (
              <div key={stat.id} className="flex max-w-[12rem] flex-col gap-1">
                <dd className="font-heading text-2xl font-bold leading-none text-white md:text-3xl">
                  {stat.displayValue}
                </dd>
                <dt className="text-caption font-medium text-slate-300">
                  {stat.label}
                </dt>
                <dd className="text-xs text-slate-500">
                  {stat.source}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        {/* Trust badges (Req 8.8) — government credibility signals rendered as a
            thin, understated text row (NOT boxed/pilled chips, no icons). Small
            caption text in low-opacity white, bullet-separated, wraps on mobile. */}
        <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-caption font-medium text-white/50">
          <span>DPIIT Recognized</span>
          <span aria-hidden="true">&middot;</span>
          <span>25% Women-Led</span>
          <span aria-hidden="true">&middot;</span>
          <span>#14 GSER 2025</span>
          <span aria-hidden="true">&middot;</span>
          <span>32 GIA Partner Countries</span>
        </div>

        {/* Trust signal — text only, no logos */}
        <p className="mt-14 text-caption font-medium tracking-wide text-white/50">
          Department of Electronics, IT, Bt &amp; S&amp;T, Government of Karnataka
        </p>
      </div>
    </section>
  );
}

export default HeroSection;

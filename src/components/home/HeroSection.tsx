"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import {
  ClusterNetworkVisual,
  FundingVisual,
  GlobalAllianceVisual,
  KarnatakaMapVisual,
  LeadershipPortrait,
} from "@/components/home/HeroVisuals";
import { cn } from "@/lib/utils";

/**
 * HeroSection — the home hero, now a 4-slide carousel (founder request).
 *
 * Government-grade restraint is preserved: flat `bg-dark` with the CSS-only
 * `.hero-grid-pattern`, the institutional palette, Lucide icons only, and
 * license-clean hand-drawn SVG visuals (no stock imagery; the optional CM
 * portrait is a drop-in slot documented in `public/hero/README.md`).
 *
 * Behaviour:
 *  - Only the ACTIVE slide is rendered (keyed, with a subtle fade-in), so the
 *    DOM never contains duplicate headings or `aria-hidden` focusable elements,
 *    and the first slide reproduces the canonical hero content exactly.
 *  - Auto-advances every ~7s; pauses on hover/focus and when the user prefers
 *    reduced motion. Prev/Next, dot, and Pause controls are keyboard operable;
 *    Left/Right arrows change slide and Space toggles pause within the region.
 *  - Each slide's headline is the single page `h1` (`#hero-heading`).
 *
 * Client Component (carousel state + timer).
 */

interface HeroSlide {
  id: string;
  kicker: string;
  headline: React.ReactNode;
  subhead: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  Visual: React.ComponentType;
  showTrust?: boolean;
}

const SLIDES: HeroSlide[] = [
  {
    id: "ecosystem",
    kicker: "One Portal. One Login. One Ecosystem.",
    headline: "Karnataka\u2019s Innovation & Technology Ecosystem",
    subhead:
      "21,000+ DPIIT startups \u00b7 183 soonicorns \u00b7 730+ GCCs \u00b7 25,000 target by 2030.",
    primary: { label: "Register Your Startup", href: "/register" },
    secondary: { label: "Explore Schemes & Benefits", href: "/schemes" },
    Visual: KarnatakaMapVisual,
    showTrust: true,
  },
  {
    id: "clusters",
    kicker: "Beyond Bengaluru",
    headline: "Innovation across all of Karnataka",
    subhead:
      "Six regional clusters \u2014 Mysuru, Mangaluru, Hubballi-Dharwad-Belagavi, Kalaburagi, Shivamogga, and Tumakuru \u2014 backed by a \u20B975 Cr cluster seed fund.",
    primary: { label: "Explore Clusters", href: "/clusters" },
    secondary: { label: "K-Combinator", href: "/programs/k-combinator" },
    Visual: ClusterNetworkVisual,
  },
  {
    id: "leadership",
    kicker: "Vision 2030",
    headline: "Building a 25,000-startup ecosystem",
    subhead:
      "Karnataka\u2019s Startup Policy 2025-30 commits \u20B91,000 Cr through LEAP, KITVEN Fund-5, and dedicated support to make the state India\u2019s innovation capital.",
    primary: { label: "Read the Startup Policy", href: "/policies/startup-2025-30" },
    secondary: { label: "About KITE", href: "/about" },
    Visual: LeadershipPortrait,
  },
  {
    id: "gia",
    kicker: "Global Innovation Alliance",
    headline: "Karnataka, open to the world",
    subhead:
      "32 partner countries across five regions for market access, co-investment, and international knowledge exchange.",
    primary: { label: "Explore the Alliance", href: "/gia" },
    secondary: { label: "For Investors", href: "/investors" },
    Visual: GlobalAllianceVisual,
  },
];

const AUTO_ADVANCE_MS = 7000;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function HeroSection() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const count = SLIDES.length;

  const goTo = React.useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );
  const next = React.useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = React.useCallback(() => goTo(index - 1), [goTo, index]);

  React.useEffect(() => {
    if (paused || prefersReducedMotion() || count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((p) => (p + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      setPaused((p) => !p);
    }
  };

  const slide = SLIDES[index] ?? SLIDES[0]!;
  const { Visual } = slide;

  return (
    <section
      aria-labelledby="hero-heading"
      aria-roledescription="carousel"
      aria-label="Karnataka ecosystem highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative w-full bg-dark hero-grid-pattern",
        "flex items-center",
        "min-h-[600px] md:min-h-[720px]",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-24 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Text column (keyed for fade-in on slide change) */}
          <div key={slide.id} className="animate-in fade-in duration-700">
            <p className="text-caption font-heading font-semibold uppercase tracking-[0.18em] text-accent">
              {slide.kicker}
            </p>

            <h1
              id="hero-heading"
              className="mt-5 max-w-4xl font-heading text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-display"
            >
              {slide.headline}
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
              {slide.subhead}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href={slide.primary.href}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3",
                  "text-base font-semibold text-white transition-colors hover:bg-accent/90",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark",
                )}
              >
                {slide.primary.label}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>

              <Link
                href={slide.secondary.href}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/40 bg-transparent px-6 py-3",
                  "text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark",
                )}
              >
                {slide.secondary.label}
              </Link>
            </div>

            {slide.showTrust ? (
              <>
                <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-caption font-medium text-white/50">
                  <span>DPIIT Recognized</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>25% Women-Led</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>#14 GSER 2025</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>32 GIA Partner Countries</span>
                </div>
                <p className="mt-8 text-caption font-medium tracking-wide text-white/50">
                  Department of Electronics, IT, Bt &amp; S&amp;T, Government of Karnataka
                </p>
              </>
            ) : null}
          </div>

          {/* Visual column */}
          <div key={`${slide.id}-visual`} className="animate-in fade-in duration-700 lg:flex lg:justify-end">
            <Visual />
          </div>
        </div>

        {/* Carousel controls */}
        <div className="mt-12 flex items-center gap-4">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={prev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark",
                  i === index ? "w-6 bg-accent" : "w-1.5 bg-white/30 hover:bg-white/50",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Next slide"
            onClick={next}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-label={paused ? "Play carousel" : "Pause carousel"}
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
            className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
          >
            {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        {/* Screen-reader announcement of the active slide */}
        <div aria-live="polite" className="sr-only">
          {`Slide ${index + 1} of ${count}`}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

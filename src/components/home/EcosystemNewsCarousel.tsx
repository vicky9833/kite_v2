"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { generateEcosystemNews } from "@/lib/synthetic-ecosystem-news";
import { cn } from "@/lib/utils";

/**
 * EcosystemNewsCarousel — a thin home-hero strip rotating through illustrative
 * Karnataka ecosystem updates (v1.0.1 polish patch). No third-party carousel
 * library: plain React state, a `setInterval` auto-advance (7s) cleaned up on
 * unmount, pause-on-hover, and a CSS opacity fade.
 *
 * Accessibility:
 *  - `role="region"` labelled "Ecosystem news carousel".
 *  - The active slide's headline sits in an `aria-live="polite"` region.
 *  - Previous/Next controls carry `aria-label`s; the pause control reports
 *    `aria-pressed`.
 *  - Keyboard: Left/Right arrows change slide, Space toggles pause (when focus
 *    is within the carousel).
 *
 * Visual restraint: a single `bg-surface` band, muted dot/arrow controls, no
 * glow or decoration. The whole strip is marked Illustrative.
 */
const AUTO_ADVANCE_MS = 7000;

export function EcosystemNewsCarousel() {
  const news = generateEcosystemNews();
  const count = news.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((next: number) => {
    setIndex((prev) => {
      const total = count;
      return ((next % total) + total) % total;
    });
  }, [count]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Auto-advance, paused on hover/focus. Cleaned up on unmount or dep change.
  useEffect(() => {
    if (paused || count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
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

  if (count === 0) return null;

  return (
    <section
      ref={regionRef}
      role="region"
      aria-label="Ecosystem news carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={handleKeyDown}
      className="border-y border-border bg-surface"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Previous */}
          <button
            type="button"
            aria-label="Previous slide"
            onClick={prev}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Slides */}
          <div className="relative min-h-[3.25rem] flex-1">
            {news.map((item, i) => {
              const active = i === index;
              return (
                <div
                  key={item.id}
                  aria-hidden={!active}
                  className={cn(
                    "absolute inset-0 flex flex-col gap-1 transition-opacity duration-500 sm:flex-row sm:items-center sm:gap-4",
                    active ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-border bg-card px-2 py-0.5 text-caption font-medium text-muted">
                      {item.category}
                    </span>
                    <span className="text-caption text-muted">{item.dateRelative}</span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-2">
                    <span className="truncate font-heading text-body font-semibold text-dark">
                      {item.headline}
                    </span>
                    <span className="hidden truncate text-caption text-muted lg:inline">
                      {item.summary}
                    </span>
                  </div>
                  <Link
                    href={item.href}
                    className="inline-flex shrink-0 items-center gap-1 text-caption font-medium text-accent transition-colors hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Read More
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Pause / play */}
          <button
            type="button"
            aria-label={paused ? "Play carousel" : "Pause carousel"}
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
          </button>

          {/* Next */}
          <button
            type="button"
            aria-label="Next slide"
            onClick={next}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Dots + label + illustrative marker */}
        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose slide">
            {news.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}: ${item.headline}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  i === index ? "w-5 bg-primary" : "w-1.5 bg-border hover:bg-muted",
                )}
              />
            ))}
          </div>
          <IllustrativeBadge variant="inline" />
        </div>

        {/* Screen-reader live announcement of the active headline */}
        <div aria-live="polite" className="sr-only">
          {news[index]?.headline}
        </div>
      </div>
    </section>
  );
}

export default EcosystemNewsCarousel;

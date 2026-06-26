"use client";

import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import type { PressMention, PressType } from "@/types";

/**
 * MediaPressSection — "Karnataka Startup Ecosystem in the News" (Req 6.1). A
 * filterable grid of synthetic press mentions (publication as text, never a
 * logo), marked illustrative throughout (Req 6.4). Filter is session-only.
 */
export interface MediaPressSectionProps {
  mentions: PressMention[];
}

const TYPES: { value: PressType | "all"; label: string }[] = [
  { value: "all", label: "All coverage" },
  { value: "major-press", label: "Major press" },
  { value: "business-press", label: "Business press" },
  { value: "tech-press", label: "Tech press" },
  { value: "international-press", label: "International press" },
];

export function MediaPressSection({ mentions }: MediaPressSectionProps) {
  const [type, setType] = useState<PressType | "all">("all");

  const filtered = useMemo(
    () => (type === "all" ? mentions : mentions.filter((m) => m.publicationType === type)),
    [mentions, type],
  );

  return (
    <section id="media-coverage" aria-labelledby="media-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
              In the news
            </span>
            <IllustrativeBadge variant="inline" />
          </div>
          <h2 id="media-heading" className="font-heading text-h2 text-dark">
            Karnataka Startup Ecosystem in the News
          </h2>
          <p className="text-body text-muted">
            Illustrative press mentions showing the kind of coverage Karnataka&rsquo;s
            ecosystem attracts. Publications, headlines, and excerpts are synthetic
            examples, not real articles.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter coverage by publication type">
          {TYPES.map((t) => {
            const active = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={active}
                onClick={() => setType(t.value)}
                className={`rounded-full border px-3 py-1.5 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-surface"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 rounded-xl border border-border bg-surface p-6 text-body text-muted">
            No coverage matches the selected type.
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <li
                key={m.id}
                className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-heading text-caption font-semibold uppercase tracking-wide text-primary">
                    {m.publication}
                  </span>
                  <span className="text-caption text-muted">{m.dateLabel}</span>
                </div>
                <h3 className="font-heading text-h3 text-dark">{m.headline}</h3>
                <p className="flex-1 text-body text-muted">{m.excerpt}</p>
                <a
                  href={m.href}
                  className="inline-flex items-center gap-1.5 text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`Read more (illustrative): ${m.headline}`}
                >
                  Read More
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default MediaPressSection;

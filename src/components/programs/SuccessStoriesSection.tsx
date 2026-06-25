import { Sparkles } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { LazySection } from "@/components/shared/LazySection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { generateSuccessStories } from "@/lib/synthetic-program-stories";
import type { ProgramEditorialData } from "@/types";

/**
 * SuccessStoriesSection — section §5 of the Editorial_Section_Set
 * (Req 4.2/5.2). Unlike the other editorial sections, the success stories are
 * SYNTHETIC: they are produced by the pure, hash-seeded
 * {@link generateSuccessStories} generator, keyed solely by the program's
 * `successStoriesSeed` (Req 4.5/5.11). Because the whole section is illustrative,
 * it is marked with exactly ONE inline {@link IllustrativeBadge} beside the
 * heading.
 *
 * The section is deferred via {@link LazySection} with a reserved `minHeight`,
 * so it renders only as it nears the viewport while reserving space up front to
 * avoid layout shift (no CLS — Req 13.3). On the server (or where
 * `IntersectionObserver` is unavailable) `LazySection` renders its children
 * immediately, so the content is always reachable.
 *
 * Institutional restraint: a single muted Lucide glyph per card, no gradients,
 * glow, or emoji. The `<section>` is a region landmark with an `aria-label`
 * (Req 14.5); the section heading is an `h2` and each story name is an `h3`,
 * keeping a non-skipping heading order (Req 14.1). Copy is declarative,
 * third-person, and clearly illustrative.
 *
 * Server Component (no interactivity / no `"use client"`); `LazySection` is the
 * sole client wrapper.
 */
export interface SuccessStoriesSectionProps {
  data: ProgramEditorialData;
}

export function SuccessStoriesSection({ data }: SuccessStoriesSectionProps) {
  const stories = generateSuccessStories(data.successStoriesSeed);

  return (
    <LazySection minHeight={480}>
      <section
        aria-label="Illustrative success stories"
        className="bg-surface py-16 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <SectionHeading
              eyebrow="Success stories"
              title="Illustrative success stories"
              description={`Representative, illustrative outcomes for startups supported by ${data.name}.`}
            />
            <IllustrativeBadge variant="inline" />
          </div>

          <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <li
                key={story.id}
                className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-primary">
                  <Sparkles aria-hidden className="h-4 w-4" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-heading text-h3 text-dark">
                    {story.startupName}
                  </h3>
                  <p className="text-caption uppercase tracking-wide text-muted">
                    {story.sector}
                  </p>
                </div>
                <p className="text-body text-dark">{story.outcomeLine}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </LazySection>
  );
}

export default SuccessStoriesSection;

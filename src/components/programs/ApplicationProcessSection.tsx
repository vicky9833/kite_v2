import { SectionHeading } from "@/components/shared/SectionHeading";
import type { ProgramEditorialData } from "@/types";

/**
 * ApplicationProcessSection — section §4 of the Editorial_Section_Set
 * (Req 4.2/5.2). Renders the verified application steps from
 * `data.applicationSteps` as a horizontal, numbered step indicator that wraps
 * responsively (stacked on mobile, in-line on larger screens). The steps are
 * VERIFIED program facts, so no IllustrativeBadge appears (Req 4.6/5.12).
 *
 * The ordered list preserves step order for assistive technology; the
 * `<section>` is a region landmark with an `aria-label` (Req 14.5) and uses an
 * `h2` heading (Req 14.1).
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface ApplicationProcessSectionProps {
  data: ProgramEditorialData;
}

export function ApplicationProcessSection({ data }: ApplicationProcessSectionProps) {
  return (
    <section aria-label="Application process" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Application process" title="How to apply" />

        <ol className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.applicationSteps.map((step, index) => (
            <li
              key={step}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span
                aria-hidden
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface font-heading text-lg text-primary"
              >
                {index + 1}
              </span>
              <span className="text-caption font-heading font-semibold uppercase tracking-wide text-muted">
                Step {index + 1}
              </span>
              <span className="text-body text-dark">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default ApplicationProcessSection;

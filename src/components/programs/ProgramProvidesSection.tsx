import { Check } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import type { ProgramEditorialData } from "@/types";

/**
 * ProgramProvidesSection — section §2 of the Editorial_Section_Set
 * (Req 4.2/5.2). Lists the credible benefits the program provides, drawn
 * verbatim from `data.provides`. Each item is a VERIFIED statement, so the
 * section carries no IllustrativeBadge (Req 4.6/5.12).
 *
 * Institutional restraint: a single muted Lucide glyph per item, no gradients
 * or glow. The `<section>` is a region landmark with an `aria-label` (Req 14.5)
 * and uses an `h2` heading (Req 14.1).
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface ProgramProvidesSectionProps {
  data: ProgramEditorialData;
}

export function ProgramProvidesSection({ data }: ProgramProvidesSectionProps) {
  return (
    <section aria-label="What the program provides" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What the program provides"
          title={`What ${data.name} provides`}
        />

        <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {data.provides.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-primary">
                <Check aria-hidden className="h-4 w-4" />
              </span>
              <span className="text-body text-dark">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default ProgramProvidesSection;

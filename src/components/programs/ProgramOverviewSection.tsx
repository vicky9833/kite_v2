import type { ProgramEditorialData } from "@/types";

/**
 * ProgramOverviewSection — section §1 of the shared Editorial_Section_Set
 * (Req 4.2/5.2). A restrained, government-grade hero rendering the verified
 * program name as the page `h1` and the declarative third-person overview copy
 * beneath it. Every value is canonical / VERIFIED, so this section never renders
 * an IllustrativeBadge (Req 4.6/5.12).
 *
 * The program name is the page-level `h1`; every following section uses an `h2`,
 * keeping a correct, non-skipping heading order across the page (Req 14.1).
 * The `<section>` is a region landmark with an `aria-label` (Req 14.5).
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface ProgramOverviewSectionProps {
  data: ProgramEditorialData;
}

export function ProgramOverviewSection({ data }: ProgramOverviewSectionProps) {
  return (
    <section aria-label="Program overview" className="bg-dark py-16 text-white md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            Program overview
          </span>
          <h1 className="font-heading text-h1 text-white">{data.name}</h1>
          <p className="text-body text-slate-300">{data.overview}</p>
        </div>
      </div>
    </section>
  );
}

export default ProgramOverviewSection;

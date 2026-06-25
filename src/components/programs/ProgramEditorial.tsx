import { ApplicationProcessSection } from "@/components/programs/ApplicationProcessSection";
import { ApplyCtaSection } from "@/components/programs/ApplyCtaSection";
import { CohortStructureSection } from "@/components/programs/CohortStructureSection";
import { PartnerIncubatorsSection } from "@/components/programs/PartnerIncubatorsSection";
import { ProgramOverviewSection } from "@/components/programs/ProgramOverviewSection";
import { ProgramProvidesSection } from "@/components/programs/ProgramProvidesSection";
import { SuccessStoriesSection } from "@/components/programs/SuccessStoriesSection";
import type { ProgramEditorialData } from "@/types";

/**
 * ProgramEditorial — the single shared editorial composition consumed by both
 * `/programs/kan` and `/programs/k-combinator` (Req 4.2/5.2: identical
 * structure). It composes the seven Editorial_Section_Set sections in the one
 * fixed order, passing the same `ProgramEditorialData` to each:
 *
 *   1. ProgramOverviewSection      — verified name (page `h1`) + overview copy
 *   2. ProgramProvidesSection      — verified benefits list
 *   3. CohortStructureSection      — verified cohort structure + figures + sectors
 *   4. ApplicationProcessSection   — verified application steps
 *   5. SuccessStoriesSection       — SYNTHETIC, lazy; the only section carrying
 *                                    an IllustrativeBadge (handled internally)
 *   6. PartnerIncubatorsSection    — verified partner incubators/accelerators
 *   7. ApplyCtaSection             — the single external `https` call-to-action
 *
 * Every other section renders verified-only content and therefore carries no
 * IllustrativeBadge; only the success-stories section is illustrative, and its
 * badge is rendered inside that component (Req 4.6/5.12).
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface ProgramEditorialProps {
  data: ProgramEditorialData;
}

export function ProgramEditorial({ data }: ProgramEditorialProps) {
  return (
    <main>
      <ProgramOverviewSection data={data} />
      <ProgramProvidesSection data={data} />
      <CohortStructureSection data={data} />
      <ApplicationProcessSection data={data} />
      <SuccessStoriesSection data={data} />
      <PartnerIncubatorsSection data={data} />
      <ApplyCtaSection data={data} />
    </main>
  );
}

export default ProgramEditorial;

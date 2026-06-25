import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { ProgramEditorialData } from "@/types";

/**
 * CohortStructureSection — section §3 of the Editorial_Section_Set
 * (Req 4.2/5.2). Presents the verified cohort structure as a small data table
 * built from `data.cohortStructure`, alongside the canonical
 * `data.verifiedFigures` (rendered verbatim, Req 11.1) and, when present, the
 * program-specific verified `data.sectors` (K-Combinator's exact nine sectors,
 * Req 5.8). All values are VERIFIED, so no IllustrativeBadge appears
 * (Req 4.6/5.12).
 *
 * The `<section>` is a region landmark with an `aria-label` (Req 14.5); the
 * section heading is an `h2` and the sub-blocks use `h3`, keeping a
 * non-skipping heading order (Req 14.1).
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface CohortStructureSectionProps {
  data: ProgramEditorialData;
}

export function CohortStructureSection({ data }: CohortStructureSectionProps) {
  const { cohortStructure, verifiedFigures, sectors } = data;

  return (
    <section aria-label="Cohort structure" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Cohort structure" title="Cohort structure" />

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Cohort structure as a small data table. */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <Table>
              <TableCaption className="text-left">
                {cohortStructure.cadenceLabel}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-dark">Cohort detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cohortStructure.detailLines.map((line) => (
                  <TableRow key={line}>
                    <TableCell className="text-body text-dark">{line}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Canonical verified figures, rendered verbatim. */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-heading text-h3 text-dark">Verified figures</h3>
            <ul className="mt-4 flex flex-col gap-2">
              {verifiedFigures.map((figure) => (
                <li
                  key={figure}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-body text-dark"
                >
                  {figure}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* K-Combinator's exact nine verified sectors, when present (Req 5.8). */}
        {sectors && sectors.length > 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-heading text-h3 text-dark">Program sectors</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {sectors.map((sector) => (
                <li
                  key={sector}
                  className="rounded-lg border border-border bg-surface px-3 py-1 text-caption text-dark"
                >
                  {sector}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default CohortStructureSection;

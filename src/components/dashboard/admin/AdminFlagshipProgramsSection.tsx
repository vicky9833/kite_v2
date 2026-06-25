// src/components/dashboard/admin/AdminFlagshipProgramsSection.tsx
//
// "Flagship Programs" (Req 18). The admin view of the six canonical flagship
// programs (`src/data/flagship-programs.ts`), each rendered with the shared
// `FlagshipProgramCard` and passed its matching synthetic performance row from
// `getProgramPerformance()` so the card additionally surfaces disbursed value,
// enrolled count, a completion progress bar, and a status indicator (Req
// 18.4, 18.5). The page composition (task 15.1) wraps this section in
// `LazySection`. All synthetic figures are illustrative and labelled as such.

import { FlagshipProgramCard } from "@/components/shared/FlagshipProgramCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { flagshipPrograms } from "@/data/flagship-programs";
import { getProgramPerformance } from "@/lib/synthetic-admin-data";

/**
 * AdminFlagshipProgramsSection — six `FlagshipProgramCard`s in a 3×2 desktop
 * grid (one column on mobile, two on tablet), each enriched with its matching
 * `getProgramPerformance()` row keyed by program id.
 */
export function AdminFlagshipProgramsSection() {
  // Index performance rows by program id so each card gets its own figures.
  const performanceById = new Map(
    getProgramPerformance().map((row) => [row.programId, row] as const),
  );

  return (
    <section
      aria-labelledby="admin-flagship-programs-heading"
      className="flex flex-col gap-8"
    >
      <SectionHeading
        id="admin-flagship-programs-heading"
        title="Flagship Programs"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {flagshipPrograms.map((program) => (
          <FlagshipProgramCard
            key={program.id}
            program={program}
            performance={performanceById.get(program.id)}
          />
        ))}
      </div>

      <p className="text-caption text-muted">
        Illustrative data for preview purposes only.
      </p>
    </section>
  );
}

export default AdminFlagshipProgramsSection;

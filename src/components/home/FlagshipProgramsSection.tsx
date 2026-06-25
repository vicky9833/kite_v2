import { FlagshipProgramCard } from "@/components/shared/FlagshipProgramCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { flagshipPrograms } from "@/data/flagship-programs";

/**
 * FlagshipProgramsSection — the Home page's editorial showcase of Karnataka's
 * six flagship startup programs. The most editorial section after the hero:
 * generous breathing room, white (`bg-card`) background, and a 3×2 desktop grid
 * of {@link FlagshipProgramCard}s sourced from `flagship-programs.ts`.
 *
 * Server Component (no `"use client"`). Each card's CTA is a Next.js `<Link>` to
 * the program's internal route.
 *
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6.
 */
export function FlagshipProgramsSection() {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Flagship Programs"
          title="Karnataka Startup Policy 2025–2030"
          description="Six flagship programs powering the state's innovation economy — from catalytic capital and venture funds to regional cluster seed funding and grand challenges."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {flagshipPrograms.map((program) => (
            <FlagshipProgramCard key={program.id} program={program} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FlagshipProgramsSection;

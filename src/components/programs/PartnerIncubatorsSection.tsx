import { Building2 } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { incubators } from "@/data/incubators";
import type { Incubator, ProgramEditorialData } from "@/types";

/**
 * PartnerIncubatorsSection — section §6 of the Editorial_Section_Set
 * (Req 4.2/5.2). Resolves `data.partnerIncubatorIds` against the verified
 * `incubators` records and renders a grid of partner organizations, showing
 * each partner's verified `name` and `cluster` verbatim (Req 11.1). Ids with no
 * matching record are skipped. All content is VERIFIED, so no IllustrativeBadge
 * appears (Req 4.6/5.12).
 *
 * The `<section>` is a region landmark with an `aria-label` (Req 14.5) and uses
 * an `h2` heading (Req 14.1).
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface PartnerIncubatorsSectionProps {
  data: ProgramEditorialData;
}

export function PartnerIncubatorsSection({ data }: PartnerIncubatorsSectionProps) {
  // Resolve ids against verified incubator data; skip ids with no match.
  const partners: Incubator[] = data.partnerIncubatorIds
    .map((id) => incubators.find((incubator) => incubator.id === id))
    .filter((incubator): incubator is Incubator => incubator !== undefined);

  if (partners.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Partner incubators and accelerators"
      className="bg-surface py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Partner network"
          title="Partner incubators and accelerators"
        />

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <li
              key={partner.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-primary">
                <Building2 aria-hidden className="h-5 w-5" />
              </span>
              <h3 className="font-heading text-lg text-dark">{partner.name}</h3>
              <p className="text-body text-muted">{partner.cluster}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default PartnerIncubatorsSection;

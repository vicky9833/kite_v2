import { Landmark, MapPinned, Handshake, type LucideIcon } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { SectionHeading } from "@/components/shared/SectionHeading";

/**
 * CsrLandscape — section 2 of the CSR & NGO Hub (Req 17). A three-column
 * editorial "CSR landscape" that orients a CSR team lead before they browse
 * programs (Req 17.1). Each column is an `h3` inside a restrained card:
 *
 *  1. CSR Mandate Context (Req 17.2) — the India CSR mandate (the 2% of net
 *     profit obligation under the Companies Act) and Karnataka's share of the
 *     national CSR pool. No verified Karnataka CSR aggregate exists, so the
 *     state-share figure is stated as a clearly-labeled ILLUSTRATIVE range and
 *     carries an {@link IllustrativeBadge}.
 *  2. Karnataka Focus Areas (Req 17.3) — rural development, women empowerment,
 *     education, healthcare, and climate.
 *  3. Partnership Pathways (Req 17.4) — direct grant to startups, matched
 *     programs with government, and ecosystem partnerships through accelerators.
 *
 * Institutional visual discipline (Req 36): `rounded-xl shadow-sm border`
 * cards, `py-16 md:py-24`, `max-w-7xl`, Lucide icons only, no gradients/emoji.
 *
 * Server Component (no interactivity / no `"use client"`).
 */

interface LandscapeColumn {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Bulleted detail lines rendered beneath the body copy. */
  points: ReadonlyArray<string>;
  /** When true, the column carries an inline IllustrativeBadge. */
  illustrative?: boolean;
}

const LANDSCAPE_COLUMNS: ReadonlyArray<LandscapeColumn> = [
  {
    icon: Landmark,
    title: "CSR Mandate Context",
    body: "India's Companies Act directs qualifying companies to spend 2% of average net profit on CSR each year, creating a large, recurring pool of deployable capital. Karnataka, as a leading corporate and industrial state, draws a meaningful share of that national pool.",
    points: [
      "India CSR mandate: 2% of average net profit for qualifying companies.",
      "Karnataka's share of the national CSR pool: an illustrative 8–12% range.",
    ],
    illustrative: true,
  },
  {
    icon: MapPinned,
    title: "Karnataka Focus Areas",
    body: "CSR capital deployed through the ecosystem concentrates on the development priorities where startup-led delivery compounds public outcomes.",
    points: [
      "Rural development",
      "Women empowerment",
      "Education",
      "Healthcare",
      "Climate",
    ],
  },
  {
    icon: Handshake,
    title: "Partnership Pathways",
    body: "Partners deploy capital through whichever structure fits their CSR mandate and reporting needs.",
    points: [
      "Direct grant to startups solving a mandated CSR theme.",
      "Matched programs co-funded with government schemes.",
      "Ecosystem partnerships channelled through accelerators and incubators.",
    ],
  },
];

export function CsrLandscape() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The CSR landscape"
          title="How CSR capital meets the ecosystem"
          description="The mandate, where Karnataka channels it, and the structures available to partners."
        />

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {LANDSCAPE_COLUMNS.map((column) => {
            const Icon = column.icon;
            return (
              <li
                key={column.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-lg text-dark">
                    {column.title}
                  </h3>
                  {column.illustrative ? (
                    <IllustrativeBadge variant="inline" />
                  ) : null}
                </div>
                <p className="text-body text-muted">{column.body}</p>
                <ul className="mt-1 flex flex-col gap-1.5">
                  {column.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-body text-muted"
                    >
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default CsrLandscape;

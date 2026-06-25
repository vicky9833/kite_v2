import { ArrowUpRight, ClipboardCheck, Compass, Target } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * WomenAcceleratorProgram — the on-page anchor target (`id="women-accelerator"`)
 * reached from the Women_Hub hero (Req 11.1). An institutional editorial section,
 * mirroring the KAN / K-Combinator ProgramEditorial tone, that explains the
 * VERIFIED Women-Led Accelerators & Incubators grant of up to ₹5 crore over 5
 * years (Req 11.4, 38.1).
 *
 * It presents three editorial blocks — a program overview, eligibility for
 * incubators applying to host women-led tracks, and expected outcomes
 * (Req 11.2) — and closes with the single Apply_CTA linking to the official
 * external `https` Karnataka portal in a new tab with `rel="noopener noreferrer"`
 * (Req 11.3).
 *
 * The ₹5 crore over 5 years figure is Verified_Data and therefore renders
 * WITHOUT an IllustrativeBadge (Req 38.5).
 *
 * Server Component (no interactivity / no `"use client"`).
 */

const APPLY_PORTAL_HREF = "https://www.startupkarnataka.gov.in/";

interface EditorialBlock {
  readonly title: string;
  readonly icon: typeof Compass;
  readonly body: string;
  readonly points: readonly string[];
}

const EDITORIAL_BLOCKS: readonly EditorialBlock[] = [
  {
    title: "Program overview",
    icon: Compass,
    body:
      "The Women-Led Accelerators & Incubators initiative commits up to ₹5 crore over five years to fund dedicated women-led tracks inside Karnataka's incubation network. The grant underwrites structured cohorts, mentorship, and follow-on readiness so that women founders move from idea to investable venture within an established institutional setting.",
    points: [
      "Up to ₹5 crore in dedicated accelerator capital over a five-year horizon.",
      "Channelled through recognised incubators hosting women-led cohorts.",
      "Aligned with ELEVATE, ELEVATE Unnati, KITVEN, and Beyond Bengaluru pathways.",
    ],
  },
  {
    title: "Eligibility for incubators",
    icon: ClipboardCheck,
    body:
      "Incubators and accelerators applying to host a women-led track are assessed on their operating track record, cohort capacity, and the strength of their proposed women-led programming. Applicants outline how they will recruit, support, and graduate women founders across the cohort.",
    points: [
      "Recognised incubator or accelerator operating within Karnataka.",
      "A defined women-led track with cohort size, curriculum, and mentor pool.",
      "Demonstrated capacity to support founders through to follow-on readiness.",
    ],
  },
  {
    title: "Expected outcomes",
    icon: Target,
    body:
      "Funded tracks are expected to expand the pipeline of women-led ventures, deepen participation beyond Bengaluru, and connect graduates to the wider state ecosystem of schemes, mentors, and capital.",
    points: [
      "A larger, better-prepared pipeline of women-led startups.",
      "Wider participation across tier-2 and tier-3 Karnataka.",
      "Graduates connected to schemes, mentors, and investor pathways.",
    ],
  },
];

export function WomenAcceleratorProgram() {
  return (
    <section
      id="women-accelerator"
      aria-labelledby="women-accelerator-heading"
      className="scroll-mt-24 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            Women-Led Accelerator
          </span>
          <h2
            id="women-accelerator-heading"
            className="font-heading text-h2 text-dark"
          >
            Women-Led Accelerators &amp; Incubators
          </h2>
          <p className="text-body text-muted">
            Karnataka commits up to{" "}
            <span className="font-semibold text-dark">₹5 crore over 5 years</span>{" "}
            to fund dedicated women-led tracks within recognised incubators —
            giving women founders a structured route from idea to investable
            venture.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {EDITORIAL_BLOCKS.map((block) => {
            const Icon = block.icon;
            return (
              <article
                key={block.title}
                className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="font-heading text-h3 text-dark">{block.title}</h3>
                <p className="text-body text-muted">{block.body}</p>
                <ul className="mt-1 flex flex-col gap-2">
                  {block.points.map((point) => (
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
              </article>
            );
          })}
        </div>

        <div className="mt-10">
          <a
            href={APPLY_PORTAL_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
          >
            Apply for Accelerator Grant
            <ArrowUpRight aria-hidden className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default WomenAcceleratorProgram;

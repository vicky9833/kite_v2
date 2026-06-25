import { FileText, Layers, Send, type LucideIcon } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";

/**
 * IdeaHowItWorks — section 2 of the Idea Bank (Req 25). A concise
 * "How it works" editorial rendered as a three-column layout (Req 25.1),
 * each column explaining one step of the submit → match → apply journey:
 *
 *  1. Submit Your Idea — describe your idea in plain language, no jargon
 *     required.
 *  2. Get Matched to Programs — we match it to relevant Karnataka innovation
 *     schemes.
 *  3. Apply for Support — apply to the matched schemes via the official portal.
 *
 * Visual restraint is deliberate: this is grassroots inclusion, not a marketing
 * funnel (founder judgment).
 *
 * Institutional visual discipline (Req 36): `rounded-xl shadow-sm border`
 * cards, `py-16 md:py-24`, `max-w-7xl`, Lucide icons only, Plus Jakarta Sans
 * headings, no gradients/emoji.
 *
 * Server Component (no interactivity / no `"use client"`).
 */

interface HowItWorksStep {
  icon: LucideIcon;
  step: string;
  title: string;
  description: string;
}

const STEPS: ReadonlyArray<HowItWorksStep> = [
  {
    icon: Send,
    step: "Step 1",
    title: "Submit Your Idea",
    description:
      "Describe your idea in plain language. No business plan, pitch deck, or jargon required — just tell us what you want to build and the problem it solves.",
  },
  {
    icon: Layers,
    step: "Step 2",
    title: "Get Matched to Programs",
    description:
      "We match your idea to the Karnataka innovation schemes most relevant to it, from grassroots innovation grants to student and rural development programs.",
  },
  {
    icon: FileText,
    step: "Step 3",
    title: "Apply for Support",
    description:
      "Review the matched schemes and apply for the support you need through the official Karnataka government portal — funding, mentorship, or incubation.",
  },
];

export function IdeaHowItWorks() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From idea to government support in three steps"
          description="A straightforward path that takes your idea from plain words to a real application for support."
        />

        <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span className="text-caption font-heading font-semibold uppercase tracking-wide text-muted">
                  {step.step}
                </span>
                <h3 className="font-heading text-lg text-dark">{step.title}</h3>
                <p className="text-body text-muted">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default IdeaHowItWorks;

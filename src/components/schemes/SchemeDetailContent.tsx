import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { Scheme } from "@/types";

/**
 * SchemeDetailContent — the editorial main column of the Scheme Detail page
 * (`/schemes/[id]`). Pure SERVER component: all content is static and sourced
 * from the canonical `scheme` record (`src/data/schemes.ts`). No `"use client"`,
 * no interactivity, no state — the personalized eligibility / apply controls are
 * separate client islands composed by the route, not here.
 *
 * Government-grade, restrained editorial direction: flat cards (`rounded-xl` +
 * hairline border), Plus Jakarta Sans headings (`font-heading`), no gradients,
 * blobs, glow, or emoji. Lucide icons only.
 *
 * Sections (Req 16.2–16.6):
 *  - Breadcrumb (Home › Schemes › {name})
 *  - Name heading + type/status badges
 *  - Editorial intro (a 2–3 sentence framing expanded from `shortDescription`)
 *  - "Benefit at a Glance" — three stat tiles (amount / maxBenefit / duration)
 *  - "Eligibility" — bulleted list
 *  - "Required Documents" — numbered list
 *  - "Process Timeline" — a 4–5 step indicator whose STEP SET DIFFERS by `type`
 *    (illustrative founder-judgment guidance, NOT canonical data)
 *  - "Frequently Asked Questions" — 5–7 entry accordion derived from the
 *    scheme's own eligibility / documents / benefit (illustrative, not new facts)
 */

export interface SchemeDetailContentProps {
  scheme: Scheme;
}

/** Human-readable label for the scheme type (drives the accent type badge). */
function typeLabel(type: Scheme["type"]): string {
  return type === "fiscal" ? "Fiscal Incentive" : "Grant-in-Aid";
}

/** Human-readable label for the scheme status badge. */
function statusLabel(status: Scheme["status"]): string {
  return status === "open" ? "Open" : "Upcoming";
}

interface TimelineStep {
  title: string;
  detail: string;
}

/**
 * Illustrative process flows authored by founder judgment (Req 16.5). These are
 * NOT canonical scheme data — they describe a plausible journey so a visitor can
 * picture the path. The step SET intentionally differs between the two scheme
 * types: fiscal incentives follow a register → claim → reimbursement arc, while
 * grants follow an apply-to-call → evaluate → milestone-disbursement arc.
 */
const FISCAL_TIMELINE: TimelineStep[] = [
  {
    title: "Register",
    detail:
      "Confirm DPIIT recognition and Karnataka registration, then create your profile on the state startup portal.",
  },
  {
    title: "Apply with documents",
    detail:
      "Submit the claim along with the supporting documents listed above for the relevant period.",
  },
  {
    title: "Verification",
    detail:
      "The department reviews your submission and may seek clarifications before approving the claim.",
  },
  {
    title: "Sanction",
    detail:
      "An eligible claim is sanctioned and the approved benefit amount is recorded against your startup.",
  },
  {
    title: "Reimbursement",
    detail:
      "The sanctioned amount is reimbursed or adjusted as defined by the incentive's terms.",
  },
];

const GRANT_TIMELINE: TimelineStep[] = [
  {
    title: "Apply to call",
    detail:
      "Respond to an open call with your proposal and the documents listed above.",
  },
  {
    title: "Screening",
    detail:
      "Applications are screened against the program criteria to form a shortlist.",
  },
  {
    title: "Pitch & evaluation",
    detail:
      "Shortlisted teams present to a panel that evaluates the idea, team, and feasibility.",
  },
  {
    title: "Sanction",
    detail:
      "Selected startups enter an agreement that sets out the grant amount and milestones.",
  },
  {
    title: "Milestone disbursement",
    detail:
      "Funds are released in tranches as agreed milestones are met and verified.",
  },
];

function timelineFor(type: Scheme["type"]): TimelineStep[] {
  return type === "fiscal" ? FISCAL_TIMELINE : GRANT_TIMELINE;
}

interface Faq {
  question: string;
  answer: string;
}

/**
 * Build a 5–7 entry FAQ list derived from the scheme's OWN data (eligibility,
 * documents, benefit figures). These rephrase canonical facts into helpful Q&A;
 * they do not introduce new numbers or claims (Req 16.6).
 */
function buildFaqs(scheme: Scheme): Faq[] {
  const eligibilitySummary =
    scheme.eligibility.length > 0
      ? scheme.eligibility.join("; ")
      : "the criteria published for this scheme";

  const documentsSummary =
    scheme.documents.length > 0
      ? scheme.documents.join(", ")
      : "the documents specified at the time of application";

  const faqs: Faq[] = [
    {
      question: "Who is this scheme for?",
      answer: `${scheme.name} supports startups that meet the following: ${eligibilitySummary}.`,
    },
    {
      question: "What benefit can I expect?",
      answer: `The benefit is ${scheme.amount}, with a ceiling of ${scheme.maxBenefit}. Your actual benefit depends on your eligibility and the scheme's terms.`,
    },
    {
      question: "How long does the benefit run?",
      answer: `The applicable period is: ${scheme.duration}.`,
    },
    {
      question: "What documents will I need?",
      answer: `Keep these ready before you apply: ${documentsSummary}.`,
    },
    {
      question: `Is this a ${typeLabel(scheme.type).toLowerCase()}?`,
      answer:
        scheme.type === "fiscal"
          ? "Yes. It is a fiscal incentive, so you typically claim or reimburse against qualifying spend rather than receive an upfront grant."
          : "Yes. It is a grant-in-aid program, so funding is awarded against a proposal and released as milestones are met.",
    },
    {
      question: "Can I apply right now?",
      answer:
        scheme.status === "open"
          ? "This scheme is currently open. Confirm your eligibility, prepare the listed documents, and apply through the official portal."
          : "This scheme is marked upcoming. Prepare your documents now so you are ready to apply once the call opens.",
    },
  ];

  // Add a seventh, scheme-specific note only when the canonical record carries
  // one — keeping the list within the 5–7 range without fabricating content.
  if (scheme.note) {
    faqs.push({
      question: "Anything else worth knowing?",
      answer: scheme.note,
    });
  }

  return faqs;
}

/** A single "Benefit at a Glance" stat tile. */
function GlanceTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="text-caption font-heading font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 font-heading text-lg font-bold text-dark">{value}</p>
    </div>
  );
}

export function SchemeDetailContent({ scheme }: SchemeDetailContentProps) {
  const timeline = timelineFor(scheme.type);
  const faqs = buildFaqs(scheme);

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-caption text-muted">
          <li>
            <Link href="/" className="transition-colors hover:text-dark">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link href="/schemes" className="transition-colors hover:text-dark">
              Schemes
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li className="font-medium text-dark" aria-current="page">
            {scheme.name}
          </li>
        </ol>
      </nav>

      {/* Heading + badges */}
      <header className="space-y-4">
        <h1 className="font-heading text-h1 text-dark">{scheme.name}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{typeLabel(scheme.type)}</Badge>
          <Badge variant="outline">{statusLabel(scheme.status)}</Badge>
        </div>

        {/* Editorial intro — an expanded framing of the short description.
            Plausible founder framing drawn from the scheme's own data; no new
            facts or numbers beyond rephrasing. */}
        <p className="max-w-2xl text-body text-muted">
          {scheme.shortDescription}. {scheme.name} is part of Karnataka&rsquo;s
          startup support stack, administered by the EITBT Department. If your
          startup fits the criteria, it can be a practical way to{" "}
          {scheme.type === "fiscal"
            ? "lower real operating costs as you grow"
            : "fund the next stage of your idea"}
          .
        </p>
      </header>

      {/* Benefit at a Glance */}
      <section aria-labelledby="benefit-glance-heading" className="space-y-4">
        <h2
          id="benefit-glance-heading"
          className="font-heading text-h3 text-dark"
        >
          Benefit at a Glance
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <GlanceTile label="Amount" value={scheme.amount} />
          <GlanceTile label="Max Benefit" value={scheme.maxBenefit} />
          <GlanceTile label="Duration" value={scheme.duration} />
        </div>
      </section>

      {/* Eligibility */}
      <section aria-labelledby="eligibility-heading" className="space-y-4">
        <h2 id="eligibility-heading" className="font-heading text-h3 text-dark">
          Eligibility
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-body text-muted">
          {scheme.eligibility.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Required Documents */}
      <section aria-labelledby="documents-heading" className="space-y-4">
        <h2 id="documents-heading" className="font-heading text-h3 text-dark">
          Required Documents
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-body text-muted">
          {scheme.documents.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>

      {/* Process Timeline — step set differs by scheme type (illustrative) */}
      <section aria-labelledby="timeline-heading" className="space-y-4">
        <h2 id="timeline-heading" className="font-heading text-h3 text-dark">
          Process Timeline
        </h2>
        <p className="text-caption text-muted">
          An illustrative path — actual steps follow the official scheme
          guidelines.
        </p>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {timeline.map((step, index) => (
            <li
              key={step.title}
              className={cn(
                "rounded-xl border border-border bg-card p-4 shadow-sm",
              )}
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {index + 1}
              </span>
              <p className="mt-3 font-heading text-body font-semibold text-dark">
                {step.title}
              </p>
              <p className="mt-1 text-caption text-muted">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Frequently Asked Questions */}
      <section aria-labelledby="faq-heading" className="space-y-4">
        <h2 id="faq-heading" className="font-heading text-h3 text-dark">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="font-heading text-dark">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-body text-muted">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}

export default SchemeDetailContent;

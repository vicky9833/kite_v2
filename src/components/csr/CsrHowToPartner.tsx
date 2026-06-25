"use client";

// src/components/csr/CsrHowToPartner.tsx
//
// "How to partner" (Req 22) — the on-page partnership anchor target
// (`id="csr-partner"`) reached from the CSR_Hub hero. An editorial three-step
// pathway ("Connect with KDEM Partnership Team", "Identify Aligned Programs",
// "Formalize Partnership Agreement") rendered as a horizontal step indicator,
// closing with two CTAs:
//
//   1. "Contact KDEM Partnership Team" — a `mailto:` link (Req 22.2).
//   2. "Download CSR Partnership Brief" — builds an in-memory `text/plain`
//      `Blob` and triggers a client-side download through a transient anchor +
//      `URL.createObjectURL` / `revokeObjectURL`. There is NO network call
//      (Req 22.3, 33.4), mirroring the admin `ExportReportsSection` and the
//      investor `PipelineExportButton` download pattern.
//
// This is the only CSR section that needs the client runtime (the Blob
// download); the page composition (task 12.6) wraps the heavier grids in
// `LazySection` as needed.

import { Download, Handshake, Mail, ScrollText, Search } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * KDEM partnership inbox for CSR partnership enquiries. Used by the `mailto:`
 * CTA so the contact pathway is a real, activatable email link (Req 22.2).
 */
const PARTNERSHIP_EMAIL = "partnerships@kdem.in";
const PARTNERSHIP_MAILTO =
  `mailto:${PARTNERSHIP_EMAIL}` +
  "?subject=" +
  encodeURIComponent("KITE CSR Partnership Enquiry");

interface PartnerStep {
  readonly title: string;
  readonly icon: typeof Search;
  readonly body: string;
}

/** The three editorial steps, rendered left-to-right as a step indicator. */
const PARTNER_STEPS: readonly PartnerStep[] = [
  {
    title: "Connect with KDEM Partnership Team",
    icon: Handshake,
    body:
      "Reach out to the KDEM partnership team to introduce your organisation, your CSR mandate, and the impact areas you want to support across Karnataka's startup ecosystem.",
  },
  {
    title: "Identify Aligned Programs",
    icon: Search,
    body:
      "Work with the team to map your priorities to CSR-aligned programs — from grassroots innovation and SC/ST founder support to rural development and R&D grants.",
  },
  {
    title: "Formalize Partnership Agreement",
    icon: ScrollText,
    body:
      "Agree on scope, funding, and reporting, then formalise the engagement through a partnership agreement or MoU so deployment can begin.",
  },
];

/**
 * Plain-text partnership brief assembled entirely in the browser. Kept as a
 * fixed string so the produced file is deterministic and contains illustrative
 * placeholder content only — no real or fetched data.
 */
const PARTNERSHIP_BRIEF_TEXT = [
  "KITE — Karnataka Innovation & Technology Ecosystem",
  "CSR Partnership Brief (Sample)",
  "==================================================",
  "",
  "This is an illustrative partnership brief generated entirely in your browser.",
  "It contains placeholder information only and is not an official record.",
  "",
  "How to partner with KITE",
  "--------------------------------------------------",
  "1. Connect with KDEM Partnership Team",
  "   Introduce your organisation, CSR mandate, and target impact areas.",
  "",
  "2. Identify Aligned Programs",
  "   Map your priorities to CSR-aligned programs across the ecosystem.",
  "",
  "3. Formalize Partnership Agreement",
  "   Agree scope, funding, and reporting; formalise via an MoU.",
  "",
  "Partnership pathways",
  "--------------------------------------------------",
  "- Direct grant funding to aligned programs",
  "- Matched / co-funded program tracks",
  "- Ecosystem partnerships with incubators and NGO partners",
  "",
  "Get in touch",
  "--------------------------------------------------",
  `Email: ${PARTNERSHIP_EMAIL}`,
  "",
  "All figures and details are illustrative and for preview purposes only.",
].join("\n");

/**
 * Build a text/plain Blob from the partnership brief and trigger a download via
 * a transient anchor. No network request is made; the object URL is revoked
 * once the click has been dispatched (Req 22.3, 33.4).
 */
function downloadPartnershipBrief(): void {
  const blob = new Blob([PARTNERSHIP_BRIEF_TEXT], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "kite-csr-partnership-brief.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * CsrHowToPartner — the partnership-anchor section. A horizontal three-step
 * indicator followed by the mailto + Blob-download CTAs.
 */
export function CsrHowToPartner() {
  return (
    <section
      id="csr-partner"
      aria-labelledby="csr-partner-heading"
      className="scroll-mt-24 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            Partnership Pathway
          </span>
          <h2 id="csr-partner-heading" className="font-heading text-h2 text-dark">
            Partner with KITE
          </h2>
          <p className="text-body text-muted">
            Begin a CSR partnership in three steps — from a first conversation
            with the KDEM partnership team to a formalised agreement that puts
            your funding to work across Karnataka.
          </p>
        </div>

        {/* Horizontal step indicator */}
        <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PARTNER_STEPS.map((step, index) => {
            const Icon = step.icon;
            const stepNumber = index + 1;
            return (
              <li
                key={step.title}
                className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-sm font-semibold text-primary-foreground">
                    {stepNumber}
                  </span>
                  <Icon aria-hidden className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading text-h3 text-dark">{step.title}</h3>
                <p className="text-body text-muted">{step.body}</p>
              </li>
            );
          })}
        </ol>

        {/* CTAs: mailto contact + client-side Blob brief download */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <a
            href={PARTNERSHIP_MAILTO}
            className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
          >
            <Mail aria-hidden className="h-4 w-4" />
            Contact KDEM Partnership Team
          </a>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={downloadPartnershipBrief}
            className="rounded-lg"
          >
            <Download aria-hidden className="h-4 w-4" />
            Download CSR Partnership Brief
          </Button>
        </div>

        <p className="mt-6 text-caption text-muted">
          The partnership brief is assembled in your browser — no data leaves
          this page. Illustrative content for preview purposes only.
        </p>
      </div>
    </section>
  );
}

export default CsrHowToPartner;

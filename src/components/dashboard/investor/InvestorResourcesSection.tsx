// src/components/dashboard/investor/InvestorResourcesSection.tsx
//
// Investor Dashboard — "Investor Resources" (Req 25.2).
//
// Three resource cards:
//   1. Karnataka Investment Memo Template — synthetic, visual-only download.
//   2. KITVEN Co-Investment Guide — visual-only download.
//   3. Contact Investor Relations — helpline (tel:) + email (mailto:) sourced
//      from the canonical `@/data/footer` Support & Resources column, so the
//      contact details stay in sync with the site footer.
//
// Server Component (no interactivity / no `"use client"`).

import { Download, FileText, Mail, Phone } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { footerColumns } from "@/data/footer";
import { cn } from "@/lib/utils";

// Derive the canonical contact links from the footer's "Support & Resources"
// column so they never drift from the site footer.
const SUPPORT_LINKS =
  footerColumns.find((column) => column.title === "Support & Resources")?.links ??
  [];

const HELPLINE_LINK = SUPPORT_LINKS.find((link) => link.href.startsWith("tel:"));
const EMAIL_LINK = SUPPORT_LINKS.find((link) => link.href.startsWith("mailto:"));

// Fallbacks mirror the verified footer values (080-22231007 / startupcell@…).
const HELPLINE_HREF = HELPLINE_LINK?.href ?? "tel:+918022231007";
const HELPLINE_LABEL = HELPLINE_LINK?.label ?? "Helpline: 080-22231007";
const EMAIL_HREF = EMAIL_LINK?.href ?? "mailto:startupcell@karnataka.gov.in";
const EMAIL_LABEL =
  EMAIL_LINK?.label ?? "Email: startupcell@karnataka.gov.in";

const DOWNLOAD_LINK_CLASS = cn(
  "mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-primary",
  "transition-colors hover:text-accent",
  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
);

const CARD_CLASS = "flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm";

export function InvestorResourcesSection() {
  return (
    <section
      aria-labelledby="investor-resources-heading"
      className="bg-surface py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="investor-resources-heading"
          eyebrow="Toolkit"
          title="Investor Resources"
          description="Templates and contacts to support your diligence and co-investment workflow."
        />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Resource 1 — Investment Memo Template (synthetic download) */}
          <article className={CARD_CLASS}>
            <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
            <h3 className="mt-4 font-heading text-lg font-bold text-dark">
              Karnataka Investment Memo Template
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              A structured memo template covering thesis fit, diligence notes,
              and Karnataka scheme eligibility for portfolio candidates.
            </p>
            <button type="button" className={DOWNLOAD_LINK_CLASS}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download template
            </button>
          </article>

          {/* Resource 2 — KITVEN Co-Investment Guide */}
          <article className={CARD_CLASS}>
            <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
            <h3 className="mt-4 font-heading text-lg font-bold text-dark">
              KITVEN Co-Investment Guide
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              How KITVEN Fund-5 co-invests alongside private investors —
              eligibility, ticket sizing, and the proposal process.
            </p>
            <button type="button" className={DOWNLOAD_LINK_CLASS}>
              <Download className="h-4 w-4" aria-hidden="true" />
              Download guide
            </button>
          </article>

          {/* Resource 3 — Contact Investor Relations (helpline + email) */}
          <article className={CARD_CLASS}>
            <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
            <h3 className="mt-4 font-heading text-lg font-bold text-dark">
              Contact Investor Relations
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Reach the Karnataka startup cell for co-investment queries and
              ecosystem introductions.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <a
                href={HELPLINE_HREF}
                className="inline-flex items-center gap-1.5 font-semibold text-primary transition-colors hover:text-accent rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {HELPLINE_LABEL}
              </a>
              <a
                href={EMAIL_HREF}
                className="inline-flex items-center gap-1.5 font-semibold text-primary transition-colors hover:text-accent rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {EMAIL_LABEL}
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default InvestorResourcesSection;

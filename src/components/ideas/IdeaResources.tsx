import Link from "next/link";
import { ArrowRight, FileText, GraduationCap, Mail, Phone } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { footerColumns } from "@/data/footer";
import { cn } from "@/lib/utils";

/**
 * IdeaResources — the Idea_Bank resources section (Req 32).
 *
 * Renders EXACTLY 3 resource cards (Req 32.1):
 *  1. "Grassroot Innovation Program Guide" linking to the grassroot-innovation
 *     scheme (Req 32.2).
 *  2. "NAIN 2.0 Information for Students" linking to the NAIN 2.0 program
 *     (Req 32.3).
 *  3. "Contact KITS Innovation Cell" presenting a helpline and an email
 *     address, sourced verbatim from the canonical footer contact details so
 *     they stay in sync with the site footer (Req 32.4).
 *
 * Server Component (no interactivity / no `"use client"`). Government-grade
 * restraint: flat `rounded-xl shadow-sm border` cards, Lucide icons only, no
 * gradients/blobs/emoji.
 */

/** All footer links flattened, the single source of truth for KITS contacts. */
const FOOTER_LINKS = footerColumns.flatMap((column) => column.links);

/** Strip a known "Label: value" prefix from a footer link label, if present. */
function stripLabelPrefix(label: string): string {
  const separator = label.indexOf(": ");
  return separator >= 0 ? label.slice(separator + 2) : label;
}

/** Resolve the first footer link whose href uses the given scheme (tel/mailto). */
function resolveFooterContact(
  scheme: "tel:" | "mailto:",
): { href: string; display: string } | null {
  const link = FOOTER_LINKS.find((item) => item.href.startsWith(scheme));
  if (!link) return null;
  return { href: link.href, display: stripLabelPrefix(link.label) };
}

const HELPLINE = resolveFooterContact("tel:");
const EMAIL = resolveFooterContact("mailto:");

const CARD_CLASS =
  "flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm";

const LINK_CLASS = cn(
  buttonVariants({ variant: "outline", size: "sm" }),
  "mt-auto gap-2 self-start",
);

export function IdeaResources() {
  return (
    <section
      aria-labelledby="idea-resources-heading"
      className="bg-card py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="idea-resources-heading"
          title="Resources"
          description="Reach the grassroot program guide, the student innovation program, and the KITS Innovation Cell."
        />

        <ul
          role="list"
          className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {/* 1 — Grassroot Innovation Program Guide */}
          <li className={CARD_CLASS}>
            <FileText aria-hidden="true" className="h-6 w-6 text-primary" />
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg text-dark">
                Grassroot Innovation Program Guide
              </h3>
              <p className="text-body text-muted">
                How the Grassroot Innovation scheme supports rural and
                community innovators — eligibility, benefits, and how to apply.
              </p>
            </div>
            <Link href="/schemes#grassroot-innovation" className={LINK_CLASS}>
              Read the Guide
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </li>

          {/* 2 — NAIN 2.0 Information for Students */}
          <li className={CARD_CLASS}>
            <GraduationCap aria-hidden="true" className="h-6 w-6 text-primary" />
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg text-dark">
                NAIN 2.0 Information for Students
              </h3>
              <p className="text-body text-muted">
                The New Age Incubation Network 2.0 pathway for student
                innovators across Karnataka colleges and institutions.
              </p>
            </div>
            <Link href="/programs/nain" className={LINK_CLASS}>
              Explore NAIN 2.0
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </li>

          {/* 3 — Contact KITS Innovation Cell (canonical helpline + email) */}
          <li className={CARD_CLASS}>
            <Phone aria-hidden="true" className="h-6 w-6 text-primary" />
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg text-dark">
                Contact KITS Innovation Cell
              </h3>
              <p className="text-body text-muted">
                Speak with the Karnataka Innovation and Technology Society for
                guidance on grassroots schemes, student programs, and idea
                support.
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-2">
              {HELPLINE ? (
                <a
                  href={HELPLINE.href}
                  className="inline-flex items-center gap-2 text-body font-medium text-primary transition-colors hover:text-accent"
                >
                  <Phone aria-hidden="true" className="h-4 w-4" />
                  {HELPLINE.display}
                </a>
              ) : null}
              {EMAIL ? (
                <a
                  href={EMAIL.href}
                  className="inline-flex items-center gap-2 text-body font-medium text-primary transition-colors hover:text-accent"
                >
                  <Mail aria-hidden="true" className="h-4 w-4" />
                  {EMAIL.display}
                </a>
              ) : null}
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

export default IdeaResources;

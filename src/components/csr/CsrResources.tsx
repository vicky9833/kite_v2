import Link from "next/link";
import { ArrowRight, FileText, Handshake, Mail, Phone } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { footerColumns } from "@/data/footer";
import { cn } from "@/lib/utils";

/**
 * CsrResources — the CSR_Hub resources section (Req 23).
 *
 * Renders EXACTLY 3 resource cards (Req 23.1):
 *  1. "Karnataka CSR Framework" linking to the canonical startup policy
 *     (Req 23.2).
 *  2. "Sample MoU Templates" linking to the support centre where templates and
 *     downloads are catalogued (Req 23.3).
 *  3. "Contact CSR Team" presenting the canonical KITS helpline and email when
 *     available from the footer; otherwise falling back to a `/contact` link
 *     (Req 23.4).
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

export function CsrResources() {
  return (
    <section
      aria-labelledby="csr-resources-heading"
      className="bg-card py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="csr-resources-heading"
          title="Resources"
          description="Reach the CSR framework, MoU templates, and the KITS CSR team."
        />

        <ul
          role="list"
          className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {/* 1 — Karnataka CSR Framework */}
          <li className={CARD_CLASS}>
            <FileText aria-hidden="true" className="h-6 w-6 text-primary" />
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg text-dark">
                Karnataka CSR Framework
              </h3>
              <p className="text-body text-muted">
                The CSR provisions of the Karnataka Startup Policy 2025–30,
                outlining how corporate partners can align spend with the state
                innovation ecosystem.
              </p>
            </div>
            <Link href="/policies/startup-2025-30" className={LINK_CLASS}>
              Read the Framework
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </li>

          {/* 2 — Sample MoU Templates */}
          <li className={CARD_CLASS}>
            <Handshake aria-hidden="true" className="h-6 w-6 text-primary" />
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg text-dark">
                Sample MoU Templates
              </h3>
              <p className="text-body text-muted">
                Reference memorandum-of-understanding templates to structure CSR
                partnerships with KITS and the innovation ecosystem.
              </p>
            </div>
            <Link href="/support" className={LINK_CLASS}>
              Browse Templates
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </li>

          {/* 3 — Contact CSR Team (canonical helpline + email, else /contact) */}
          <li className={CARD_CLASS}>
            <Phone aria-hidden="true" className="h-6 w-6 text-primary" />
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg text-dark">
                Contact CSR Team
              </h3>
              <p className="text-body text-muted">
                Speak with the KITS CSR team for guidance on partnerships,
                aligned programs, and impact reporting.
              </p>
            </div>
            {HELPLINE || EMAIL ? (
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
            ) : (
              <Link href="/contact" className={LINK_CLASS}>
                Contact KITS
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            )}
          </li>
        </ul>
      </div>
    </section>
  );
}

export default CsrResources;

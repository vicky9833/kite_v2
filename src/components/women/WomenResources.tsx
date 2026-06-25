import Link from "next/link";
import { ArrowRight, FileText, Globe, Mail, Phone } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { footerColumns } from "@/data/footer";
import { cn } from "@/lib/utils";

/**
 * WomenResources — the Women_Hub resources section (Req 14).
 *
 * Renders EXACTLY 3 resource cards (Req 14.1):
 *  1. "Karnataka Startup Policy — Women Entrepreneurship Framework" linking to
 *     `/policies/startup-2025-30` (Req 14.2).
 *  2. "KITS Women Founders Helpdesk" presenting a helpline and an email
 *     address, sourced verbatim from the canonical footer contact details so
 *     they stay in sync with the site footer (Req 14.3).
 *  3. "International Women Founder Programs" linking to `/gia` (Req 14.4).
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

export function WomenResources() {
  return (
    <section
      aria-labelledby="women-resources-heading"
      className="bg-card py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="women-resources-heading"
          title="Resources for Women Founders"
          description="Reach the policy framework, the KITS helpdesk, and international founder programs."
        />

        <ul
          role="list"
          className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {/* 1 — Policy women-entrepreneurship framework */}
          <li className={CARD_CLASS}>
            <FileText aria-hidden="true" className="h-6 w-6 text-primary" />
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg text-dark">
                Karnataka Startup Policy — Women Entrepreneurship Framework
              </h3>
              <p className="text-body text-muted">
                The women-entrepreneurship provisions of the Karnataka Startup
                Policy 2025–30, including founder-stake preferences and
                Women-Led benefits.
              </p>
            </div>
            <Link href="/policies/startup-2025-30" className={LINK_CLASS}>
              Read the Framework
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </li>

          {/* 2 — KITS Women Founders Helpdesk (canonical helpline + email) */}
          <li className={CARD_CLASS}>
            <Phone aria-hidden="true" className="h-6 w-6 text-primary" />
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg text-dark">
                KITS Women Founders Helpdesk
              </h3>
              <p className="text-body text-muted">
                Speak with the Karnataka startup helpdesk for guidance on
                schemes, registration, and women-founder preferences.
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

          {/* 3 — International women founder programs */}
          <li className={CARD_CLASS}>
            <Globe aria-hidden="true" className="h-6 w-6 text-primary" />
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg text-dark">
                International Women Founder Programs
              </h3>
              <p className="text-body text-muted">
                Global Innovation Alliance pathways connecting Karnataka women
                founders with international markets and partners.
              </p>
            </div>
            <Link href="/gia" className={LINK_CLASS}>
              Explore Programs
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

export default WomenResources;

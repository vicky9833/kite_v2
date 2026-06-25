// src/components/dashboard/startup/DashboardResourcesSection.tsx
//
// "Resources" (Req 9). Three static resource cards for the startup dashboard:
//   1. Karnataka Startup Policy 2025-30 -> /policies/startup-2025-30
//   2. Help Center                      -> /support
//   3. Contact KITS                     -> helpline `tel:` + `mailto:` links
//
// The helpline phone and email are NOT hardcoded here: they are sourced from the
// canonical "Support & Resources" column in `src/data/footer.ts` (the single
// source of truth for KITS contact details), so they stay in sync with the
// footer and are never fabricated.

import Link from "next/link";
import { ArrowRight, FileText, LifeBuoy, Mail, Phone } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { footerColumns } from "@/data/footer";
import { cn } from "@/lib/utils";
import type { FooterLink } from "@/types";

/** Locate the canonical "Support & Resources" footer column. */
const SUPPORT_COLUMN = footerColumns.find(
  (column) => column.title === "Support & Resources",
);

/** First link whose href uses the given URI scheme (e.g. `tel:`, `mailto:`). */
function findLinkByScheme(scheme: string): FooterLink | undefined {
  return SUPPORT_COLUMN?.links.find((link) => link.href.startsWith(scheme));
}

const HELPLINE_LINK = findLinkByScheme("tel:");
const EMAIL_LINK = findLinkByScheme("mailto:");

/** Shared inline-CTA classes for resource links. */
const CTA_CLASS = cn(
  "inline-flex items-center gap-1 text-sm font-semibold text-primary",
  "transition-colors hover:text-accent",
  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
);

/**
 * DashboardResourcesSection — three editorial resource cards. The first two are
 * internal navigations; the third surfaces the canonical KITS helpline and email
 * as `tel:` / `mailto:` links.
 */
export function DashboardResourcesSection() {
  return (
    <section aria-labelledby="dashboard-resources-heading" className="flex flex-col gap-8">
      <SectionHeading id="dashboard-resources-heading" title="Resources" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 1 — Karnataka Startup Policy 2025-30 */}
        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
          <h3 className="font-heading text-lg font-semibold text-dark">
            Karnataka Startup Policy 2025-30
          </h3>
          <p className="text-sm text-muted">
            Read the policy framework powering Karnataka&apos;s startup ecosystem
            and the incentives available to you.
          </p>
          <Link
            href="/policies/startup-2025-30"
            className={cn("mt-auto pt-2", CTA_CLASS)}
          >
            View policy
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </article>

        {/* 2 — Help Center */}
        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          <LifeBuoy className="h-6 w-6 text-primary" aria-hidden="true" />
          <h3 className="font-heading text-lg font-semibold text-dark">
            Help Center
          </h3>
          <p className="text-sm text-muted">
            Browse guides and answers to common questions about registration,
            schemes, and applications.
          </p>
          <Link href="/support" className={cn("mt-auto pt-2", CTA_CLASS)}>
            Visit Help Center
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </article>

        {/* 3 — Contact KITS (canonical helpline + email from footer.ts) */}
        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          <Phone className="h-6 w-6 text-primary" aria-hidden="true" />
          <h3 className="font-heading text-lg font-semibold text-dark">
            Contact KITS
          </h3>
          <p className="text-sm text-muted">
            Reach the Karnataka Innovation and Technology Society team directly by
            phone or email.
          </p>
          <div className="mt-auto flex flex-col gap-2 pt-2">
            {HELPLINE_LINK ? (
              <a href={HELPLINE_LINK.href} className={CTA_CLASS}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                {HELPLINE_LINK.label}
              </a>
            ) : null}
            {EMAIL_LINK ? (
              <a href={EMAIL_LINK.href} className={CTA_CLASS}>
                <Mail className="h-4 w-4" aria-hidden="true" />
                {EMAIL_LINK.label}
              </a>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}

export default DashboardResourcesSection;

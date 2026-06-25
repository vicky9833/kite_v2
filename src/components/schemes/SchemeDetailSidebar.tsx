import Link from "next/link";
import type { ReactNode } from "react";
import { Mail, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ApplyButton } from "@/components/schemes/ApplyButton";
import { schemes } from "@/data/schemes";
import { footerColumns } from "@/data/footer";
import type { Scheme } from "@/types";

/**
 * SchemeDetailSidebar — the supporting right column of the Scheme Detail page
 * (`/schemes/[id]`). Pure SERVER component: all content is static and sourced
 * from the canonical `scheme` record and the canonical data modules
 * (`src/data/schemes.ts`, `src/data/footer.ts`). No `"use client"`, no state —
 * the only interactive piece is the `ApplyButton` client island composed at the
 * top.
 *
 * Government-grade, restrained direction: flat cards (`rounded-xl` + hairline
 * border), Plus Jakarta Sans headings (`font-heading`), no gradients, blobs,
 * glow, or emoji. Lucide icons only (decorative ones marked `aria-hidden`).
 *
 * Sections (Req 16.7):
 *  - "Apply Now" control — the `ApplyButton` island for this scheme.
 *  - "Key Facts" panel — id, type, status, owner "Karnataka EITBT Department",
 *    and the scheme note when present.
 *  - "Related Schemes" — exactly three OTHER schemes of the SAME `type`, each a
 *    linkable card → `/schemes/{id}` with a short benefit summary.
 *  - "Talk to KITS" card — the helpline `tel:` link and `mailto:` link, sourced
 *    verbatim from `src/data/footer.ts`.
 *  - "Last Updated" caption — a fixed illustrative date (founder judgment).
 */

export interface SchemeDetailSidebarProps {
  scheme: Scheme;
}

/** Canonical owner/administering department label (Req 16.7). */
const OWNER_LABEL = "Karnataka EITBT Department";

/**
 * Illustrative "Last Updated" date. This is founder-judgment editorial content,
 * NOT canonical scheme data — it gives the page a plausible freshness signal.
 * Kept as a single fixed string so the server render is deterministic.
 */
const LAST_UPDATED = "1 April 2025";

/** Human-readable label for the scheme type. */
function typeLabel(type: Scheme["type"]): string {
  return type === "fiscal" ? "Fiscal Incentive" : "Grant-in-Aid";
}

/** Human-readable label for the scheme status. */
function statusLabel(status: Scheme["status"]): string {
  return status === "open" ? "Open" : "Upcoming";
}

/** Short benefit summary for a related-scheme card (amount, capped by max). */
function benefitSummary(scheme: Scheme): string {
  return `${scheme.amount} · up to ${scheme.maxBenefit}`;
}

/**
 * Choose exactly three related schemes for the sidebar (Req 16.7). Prefers OTHER
 * schemes of the SAME `type` (excluding the current scheme); if fewer than three
 * same-type schemes exist, the list is topped up with the nearest other schemes
 * so the block always renders exactly three cards.
 */
function relatedSchemes(current: Scheme): Scheme[] {
  const others = schemes.filter((s) => s.id !== current.id);
  const sameType = others.filter((s) => s.type === current.type);
  const fallback = others.filter((s) => s.type !== current.type);
  return [...sameType, ...fallback].slice(0, 3);
}

/**
 * A footer contact link resolved from `src/data/footer.ts`. We look up the
 * canonical `tel:` / `mailto:` links rather than hard-coding the values, so the
 * sidebar stays in sync with the single source of truth.
 */
interface FooterContact {
  href: string;
  display: string;
}

const FOOTER_LINKS = footerColumns.flatMap((column) => column.links);

/** Strip a known "Label: value" prefix from a footer link label, if present. */
function stripLabelPrefix(label: string): string {
  const separator = label.indexOf(": ");
  return separator >= 0 ? label.slice(separator + 2) : label;
}

/** Resolve the first footer link whose href uses the given scheme (tel/mailto). */
function resolveFooterContact(scheme: "tel:" | "mailto:"): FooterContact | null {
  const link = FOOTER_LINKS.find((item) => item.href.startsWith(scheme));
  if (!link) return null;
  return { href: link.href, display: stripLabelPrefix(link.label) };
}

const HELPLINE = resolveFooterContact("tel:");
const EMAIL = resolveFooterContact("mailto:");

/** A single labelled row inside the Key Facts panel. */
function FactRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-caption text-muted">{label}</dt>
      <dd className="text-right text-caption font-medium text-dark">{value}</dd>
    </div>
  );
}

export function SchemeDetailSidebar({ scheme }: SchemeDetailSidebarProps) {
  const related = relatedSchemes(scheme);

  return (
    <aside className="space-y-6">
      {/* Apply control (client island) */}
      <ApplyButton schemeId={scheme.id} />

      {/* Key Facts */}
      <section
        aria-labelledby="key-facts-heading"
        className="rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <h2
          id="key-facts-heading"
          className="font-heading text-lg font-bold text-dark"
        >
          Key Facts
        </h2>
        <dl className="mt-3 divide-y divide-border">
          <FactRow label="Scheme ID" value={<code>{scheme.id}</code>} />
          <FactRow label="Type" value={typeLabel(scheme.type)} />
          <FactRow
            label="Status"
            value={
              <Badge variant={scheme.status === "open" ? "accent" : "outline"}>
                {statusLabel(scheme.status)}
              </Badge>
            }
          />
          <FactRow label="Owner" value={OWNER_LABEL} />
          {scheme.note ? <FactRow label="Note" value={scheme.note} /> : null}
        </dl>
      </section>

      {/* Related Schemes — exactly three same-type cards */}
      <section
        aria-labelledby="related-schemes-heading"
        className="rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <h2
          id="related-schemes-heading"
          className="font-heading text-lg font-bold text-dark"
        >
          Related Schemes
        </h2>
        <ul className="mt-3 space-y-3">
          {related.map((item) => (
            <li key={item.id}>
              <Link
                href={`/schemes/${item.id}`}
                className="block rounded-lg border border-border bg-background p-3 transition-colors hover:border-accent hover:bg-muted/10"
              >
                <p className="font-heading text-body font-semibold text-dark">
                  {item.name}
                </p>
                <p className="mt-1 text-caption text-muted">
                  {benefitSummary(item)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Talk to KITS — contact links sourced from footer.ts */}
      <section
        aria-labelledby="talk-to-kits-heading"
        className="rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <h2
          id="talk-to-kits-heading"
          className="font-heading text-lg font-bold text-dark"
        >
          Talk to KITS
        </h2>
        <p className="mt-2 text-caption text-muted">
          Need help deciding? Reach the Karnataka startup helpline.
        </p>
        <ul className="mt-3 space-y-2">
          {HELPLINE ? (
            <li>
              <a
                href={HELPLINE.href}
                className="flex items-center gap-2.5 text-body text-dark transition-colors hover:text-accent"
              >
                <Phone className="h-4 w-4 text-muted" aria-hidden="true" />
                <span>{HELPLINE.display}</span>
              </a>
            </li>
          ) : null}
          {EMAIL ? (
            <li>
              <a
                href={EMAIL.href}
                className="flex items-center gap-2.5 break-all text-body text-dark transition-colors hover:text-accent"
              >
                <Mail className="h-4 w-4 text-muted" aria-hidden="true" />
                <span>{EMAIL.display}</span>
              </a>
            </li>
          ) : null}
        </ul>
      </section>

      {/* Last Updated — illustrative freshness caption (founder judgment) */}
      <p className="text-caption text-muted">
        Last updated: {LAST_UPDATED} (illustrative)
      </p>
    </aside>
  );
}

export default SchemeDetailSidebar;

// src/components/layout/Footer.tsx
//
// Global mega Footer (Server Component — no interactivity required).
//
// Renders the five link columns and the bottom utility row from the verified
// data in `src/data/footer.ts` (`footerColumns`, `footerBottom`).
//
// Link rendering (Req 5.7, 5.8, 5.13):
//   - INTERNAL links (no `external` flag)  → Next `<Link href>` to a valid
//     internal route (navigation within 2s).
//   - EXTERNAL links (`external: true`, the tel:/mailto: entries) → native
//     `<a href>` anchors, since they use external protocols. `rel` is added
//     only for http(s); tel:/mailto: need no `rel`.
//
// A textual Karnataka emblem watermark sits behind the content: `aria-hidden`,
// very low opacity, `pointer-events-none`, so it never overlaps or obscures any
// interactive element (Req 5.12, 21.5).

import Link from "next/link";

import { footerColumns, footerBottom } from "@/data/footer";
import type { FooterLink } from "@/types";

/** Shared link styling: light text on dark bg + focus-visible ring. */
const LINK_CLASS =
  "inline-block rounded-sm text-sm text-slate-300 transition-colors " +
  "hover:text-white focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark";

/**
 * Render a single footer link. External links (tel:/mailto:) render as native
 * anchors; internal links render with Next `<Link>` for client-side routing.
 */
function FooterLinkItem({ link }: { link: FooterLink }) {
  if (link.external) {
    const isHttp = /^https?:/i.test(link.href);
    return (
      <a
        href={link.href}
        className={LINK_CLASS}
        {...(isHttp ? { rel: "noopener noreferrer" } : {})}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={LINK_CLASS}>
      {link.label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-dark text-slate-300">
      {/* Karnataka state emblem watermark — decorative, behind all content.
          aria-hidden + pointer-events-none + very low opacity so it never
          obscures or intercepts any interactive element (Req 5.12, 21.5). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <span className="select-none whitespace-nowrap font-heading text-[10rem] font-bold uppercase leading-none tracking-tighter text-white/[0.03] sm:text-[14rem] lg:text-[18rem]">
          Karnataka
        </span>
      </div>

      {/* Foreground content sits above the watermark. */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Five link columns (Req 5.2–5.8) */}
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-3 lg:grid-cols-5 md:py-16">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-white">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom utility row (Req 5.9–5.11), separated by a top border. */}
        <div className="border-t border-white/10 py-8">
          {/* Centered tagline (Req 5.11) */}
          <p className="text-center font-heading text-base font-semibold text-white">
            {footerBottom.tagline}
          </p>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Legal lines, in order (Req 5.9) */}
            <div className="space-y-1 text-sm text-slate-400">
              {footerBottom.legalLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            {/* Bottom-right utility links (Req 5.10) */}
            <ul className="flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
              {footerBottom.links.map((link) => (
                <li key={link.label}>
                  <FooterLinkItem link={link} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

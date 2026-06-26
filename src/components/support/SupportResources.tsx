import Link from "next/link";
import { BookOpen, FileText, ListTree } from "lucide-react";

/**
 * SupportResources — three resource cards (Req 10.1): the Karnataka Startup
 * Policy document, the KITE User Guide (illustrative), and a Glossary of Terms.
 *
 * Server Component.
 */
export function SupportResources() {
  return (
    <section aria-labelledby="support-resources-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="support-resources-heading" className="font-heading text-h2 text-dark">
          Resources
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link
            href="/policies/startup-2025-30"
            className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-h3 text-dark">Karnataka Startup Policy</h3>
            <p className="text-body text-muted">
              Read the Karnataka Startup Policy 2025-30 in full.
            </p>
          </Link>

          <Link
            href="/about"
            className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-h3 text-dark">KITE User Guide</h3>
            <p className="text-body text-muted">
              An illustrative guide to navigating the KITE portal.
            </p>
          </Link>

          <Link
            href="/sitemap"
            className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
              <ListTree className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-h3 text-dark">Glossary &amp; Sitemap</h3>
            <p className="text-body text-muted">
              Browse all KITE destinations and key terms.
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SupportResources;

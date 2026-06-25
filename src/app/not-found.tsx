import Link from "next/link";

/**
 * Custom not-found page (Req 19.5). Rendered inside RootLayout, so the banner
 * Header, contentinfo Footer, and floating AI button come for free — this file
 * only owns the MAIN content.
 *
 * Government-grade and restrained: no illustrations, no decorative art. Just a
 * clear heading, a short message, and two recovery links (home + schemes index),
 * using the same container, typography, and canonical tokens as StubPage.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12">
        <p className="text-caption font-medium uppercase tracking-wide text-primary">
          404
        </p>
        <h1 className="mt-2 font-heading text-h1 text-dark">Page not found</h1>
        <p className="mt-4 max-w-2xl text-body text-muted">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have
          moved. Check the address, or head back to a known starting point.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link
            href="/"
            className="inline-flex items-center text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            &larr; Back to home
          </Link>
          <Link
            href="/schemes"
            className="inline-flex items-center text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Browse schemes &amp; benefits
          </Link>
        </div>
      </div>
    </div>
  );
}

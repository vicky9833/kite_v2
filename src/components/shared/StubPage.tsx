/**
 * StubPage — placeholder body rendered by every non-Home route stub so that all
 * navigation destinations resolve to a real page (Req 19.4). Shows a visible
 * heading (the destination name, as an `h1`) and a visible "content
 * forthcoming" message, inside the standard inner-page container and padding.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
import Link from "next/link";

export interface StubPageProps {
  /** The destination name, rendered as the page `h1`. */
  title: string;
  /** Optional supporting copy rendered below the heading. */
  description?: string;
}

export function StubPage({ title, description }: StubPageProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12">
        <h1 className="font-heading text-h1 text-dark">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-body text-muted">{description}</p>
        ) : null}
        <p className="mt-6 text-body text-muted">
          This page&rsquo;s content is forthcoming.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}

export default StubPage;

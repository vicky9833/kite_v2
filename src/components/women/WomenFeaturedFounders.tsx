import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { generateWomenFounders } from "@/lib/synthetic-women-founders";

/**
 * WomenFeaturedFounders — the Women_Hub featured founders showcase. It renders
 * EXACTLY 6 cards from the Synthetic_Women_Founders_Module
 * (`generateWomenFounders()`) in a 3-column desktop grid (Req 12.1). Each card
 * carries a name, company, sector, stage, one-line pitch, and an initials avatar
 * — never a photo (Req 12.2).
 *
 * The founders are synthetic preview content, so the section carries EXACTLY ONE
 * IllustrativeBadge marking it illustrative (Req 12.3). The framing copy makes
 * clear the cards show the texture of women-founder activity in Karnataka and do
 * not promote specific people.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export function WomenFeaturedFounders() {
  const founders = generateWomenFounders();

  return (
    <section aria-labelledby="women-featured-founders-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
              Featured women founders
            </span>
            <IllustrativeBadge variant="inline" />
          </div>
          <h2
            id="women-featured-founders-heading"
            className="font-heading text-h2 text-dark"
          >
            Featured Women Founders
          </h2>
          <p className="text-body text-muted">
            These illustrative profiles show the texture of women-founder activity
            across Karnataka — sectors, stages, and the kinds of problems being
            tackled. They are synthetic examples, not real founders, and are not an
            endorsement or promotion of specific people.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {founders.map((founder) => (
            <li
              key={founder.id}
              className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span
                  role="img"
                  aria-label={founder.name}
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface font-heading text-body font-semibold text-primary"
                >
                  {founder.initialsAvatar}
                </span>
                <div className="flex flex-col">
                  <span className="font-heading text-h3 text-dark">{founder.name}</span>
                  <span className="text-caption text-muted">{founder.company}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted">
                  {founder.sector}
                </span>
                <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-caption font-medium text-muted">
                  {founder.stage}
                </span>
              </div>

              <p className="text-body text-muted">{founder.pitch}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default WomenFeaturedFounders;

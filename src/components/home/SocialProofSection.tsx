import { partnerLogos } from "@/data/social-proof";
import { cn } from "@/lib/utils";

/**
 * SocialProofSection — an understated, government-grade trust band (not a
 * feature section). Renders the ecosystem partner logos as monochrome text
 * marks between a visible top and bottom border on a white background.
 *
 * Implements Requirement 17 (Home Page — Social Proof Trust Bar Section):
 *  - White background with a visible top + bottom border (17.1).
 *  - "Ecosystem Partners" label heading (17.2).
 *  - Exactly 10 text logos from `social-proof.ts` (17.3).
 *  - Each logo in a single grayscale color, no chromatic fill (17.4).
 *  - All 10 fully visible 320–1920px with no horizontal scroll or truncation,
 *    achieved via `flex-wrap` so marks wrap onto new lines on narrow screens
 *    (17.5).
 *
 * Deliberately restrained: no gradients, blobs, emoji, glow, or glassmorphism.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface SocialProofSectionProps {
  /** Extra classes merged onto the `<section>` wrapper. */
  className?: string;
}

export function SocialProofSection({ className }: SocialProofSectionProps) {
  return (
    <section
      aria-labelledby="social-proof-heading"
      className={cn("border-y border-border bg-card py-10 md:py-12", className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="social-proof-heading"
          className="text-center text-caption font-heading font-semibold uppercase tracking-wide text-muted"
        >
          Ecosystem Partners
        </h2>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-12">
          {partnerLogos.map((logo) => (
            <li
              key={logo.id}
              className="font-heading text-body font-semibold tracking-wide text-muted"
            >
              {logo.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default SocialProofSection;

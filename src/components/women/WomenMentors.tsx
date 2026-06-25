import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { generateMentors } from "@/lib/synthetic-mentors";
import { cn } from "@/lib/utils";

/**
 * WomenMentors — the Women_Hub mentor section (Req 13).
 *
 * Renders EXACTLY 3 mentor cards drawn from the synthetic mentor directory
 * (`generateMentors()`) filtered to mentors whose illustrative label marks them
 * as women (`illustrativeGender === 'woman'`), each showing the mentor's name,
 * an initials avatar (whose accessible text alternative equals the mentor
 * name), title, and firm (Req 13.1). A "See All Mentors" link routes to the
 * full directory at `/mentors` (Req 13.2).
 *
 * The `illustrativeGender` label is synthetic preview data, NOT a verified
 * demographic record. The section therefore carries explicit framing copy
 * stating the labeling is illustrative and not a definitive demographic
 * classification (Req 6.4, 6.5, 13.3), plus exactly ONE section-level
 * {@link IllustrativeBadge} marking the cards as synthetic.
 *
 * Server Component (no interactivity / no `"use client"`). Government-grade
 * restraint: flat `rounded-xl shadow-sm border` cards, Lucide icons only, no
 * gradients/blobs/emoji.
 */
export function WomenMentors() {
  // Take the first three illustrative-women mentors from the canonical
  // directory. `generateMentors()` is byte-stable, so this selection is
  // deterministic across renders.
  const womenMentors = generateMentors()
    .filter((mentor) => mentor.illustrativeGender === "woman")
    .slice(0, 3);

  return (
    <section
      aria-labelledby="women-mentors-heading"
      className="bg-surface py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <SectionHeading
            id="women-mentors-heading"
            title="Women Mentors"
            description="A small, illustrative selection of mentors from across Karnataka's ecosystem."
          />
          <p className="flex items-center gap-2 text-caption text-muted">
            <IllustrativeBadge variant="inline" />
            <span>
              These mentors are surfaced using an illustrative label and are not
              a definitive demographic classification. Explore the full mentor
              directory for everyone available.
            </span>
          </p>
        </div>

        <ul
          role="list"
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {womenMentors.map((mentor) => (
            <li
              key={mentor.id}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span
                role="img"
                aria-label={mentor.name}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface font-heading text-lg font-semibold text-primary"
              >
                <span aria-hidden="true">{mentor.initialsAvatar}</span>
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-heading text-lg text-dark">{mentor.name}</h3>
                <p className="text-body text-muted">{mentor.title}</p>
                <p className="text-caption text-muted">{mentor.firm}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link
            href="/mentors"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            See All Mentors
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default WomenMentors;

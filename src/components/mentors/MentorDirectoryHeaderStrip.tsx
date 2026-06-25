import { Users } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";

/**
 * MentorDirectoryHeaderStrip — the header strip for Mentor Connect
 * (`/mentors`). A restrained, government-grade strip (`py-8` / `md:py-12`) that
 * introduces the mentor directory.
 *
 * No verified mentor data exists, so the ENTIRE directory is synthetic. This
 * strip therefore carries exactly ONE directory-level {@link IllustrativeBadge}
 * (Req 6.3) marking the whole directory as illustrative synthetic data. Copy is
 * declarative and third-person; no superlatives, urgency/scarcity phrasing, or
 * exhortations (Req 6.6) and no SaaS styling (Req 15).
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export function MentorDirectoryHeaderStrip() {
  return (
    <section
      aria-label="Mentor directory overview"
      className="border-b border-border bg-surface py-8 md:py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="flex items-center gap-2 text-caption font-heading font-semibold uppercase tracking-wide text-primary">
            <Users aria-hidden className="h-4 w-4" />
            Mentor Connect
          </span>

          <h1 className="font-heading text-h1 text-dark">
            A directory of mentors across Karnataka&apos;s ecosystem
          </h1>

          <p className="text-body text-muted">
            Mentor Connect helps founders discover individuals whose expertise,
            sector focus, and experience match their needs. Each profile lists a
            mentor&apos;s title, firm, sectors of expertise, and availability.
          </p>

          <p className="flex items-center gap-2 text-caption text-muted">
            <IllustrativeBadge variant="inline" />
            <span>
              The mentor directory below is illustrative synthetic data; no
              verified mentor records exist.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default MentorDirectoryHeaderStrip;

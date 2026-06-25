import Link from "next/link";
import { FileText } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ApplicationsEmptyState — "Your Applications" (Req 5).
 *
 * A restrained editorial empty-state card: a Lucide `FileText` icon, the
 * headline "No applications yet", a one-line subhead, and a primary
 * "Browse Eligible Schemes" button to `/schemes` (Req 5.1–5.3). No
 * illustration, no decorative effects — government-grade and calm.
 *
 * Purely presentational (no session reads), so it renders identically wherever
 * it is composed.
 */
export function ApplicationsEmptyState() {
  return (
    <section aria-labelledby="applications-heading" className="flex flex-col gap-6">
      <SectionHeading id="applications-heading" title="Your Applications" />

      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-10 text-center shadow-sm">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface">
          <FileText className="h-6 w-6 text-muted" aria-hidden />
        </span>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-heading text-lg font-bold text-dark">
            No applications yet
          </h3>
          <p className="max-w-md text-body text-muted">
            Apply to schemes you qualify for to start tracking your progress
            here.
          </p>
        </div>

        <Link
          href="/schemes"
          className={cn(
            buttonVariants({ variant: "default" }),
            "mt-1 min-h-11 rounded-lg",
          )}
        >
          Browse Eligible Schemes
        </Link>
      </div>
    </section>
  );
}

export default ApplicationsEmptyState;

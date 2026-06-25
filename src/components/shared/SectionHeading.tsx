import { cn } from "@/lib/utils";

/**
 * SectionHeading — consistent section header used across Home sections and inner
 * pages. Renders an `h2` in Plus Jakarta Sans (`font-heading`) at the `text-h2`
 * scale, with an optional small eyebrow label above and an optional muted
 * description below.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export interface SectionHeadingProps {
  /** The heading text (rendered as an `h2`). */
  title: string;
  /** Optional small label rendered above the title. */
  eyebrow?: string;
  /** Optional supporting copy rendered below the title, in muted text. */
  description?: string;
  /** Extra classes merged onto the wrapper. */
  className?: string;
  /** Optional id applied to the heading element (for in-page anchors / aria). */
  id?: string;
}

export function SectionHeading({
  title,
  eyebrow,
  description,
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {eyebrow ? (
        <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
          {eyebrow}
        </span>
      ) : null}
      <h2 id={id} className="font-heading text-h2 text-dark">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-body text-muted">{description}</p>
      ) : null}
    </div>
  );
}

export default SectionHeading;

import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * PageShell — shared institutional building blocks used to compose the
 * content pages that previously rendered the bare StubPage. Government-grade
 * restraint: flat tokens, Lucide icons, no gradients/blobs/emoji/glow.
 *
 * All server components (no interactivity).
 */

export interface PageHeroAction {
  label: string;
  href: string;
  variant?: "accent" | "outline";
  external?: boolean;
}

export interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: PageHeroAction[];
}

/** Compact dark hero strip (py-12 bg-dark) carrying the page's single h1. */
export function PageHero({ eyebrow, title, subtitle, actions }: PageHeroProps) {
  return (
    <section className="bg-dark py-12 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          {eyebrow ? (
            <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
              {eyebrow}
            </span>
          ) : null}
          <h1 className="font-heading text-h1 text-white">{title}</h1>
          {subtitle ? <p className="text-body text-slate-300">{subtitle}</p> : null}

          {actions && actions.length > 0 ? (
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              {actions.map((action) => {
                const className =
                  action.variant === "outline"
                    ? cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
                      )
                    : cn(buttonVariants({ variant: "accent", size: "lg" }));

                if (action.href.startsWith("#") || action.external) {
                  return (
                    <a
                      key={action.label}
                      href={action.href}
                      {...(action.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className={className}
                    >
                      {action.label}
                    </a>
                  );
                }
                return (
                  <Link key={action.label} href={action.href} className={className}>
                    {action.label}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export interface ContentSectionProps {
  id?: string;
  heading: string;
  lead?: string;
  surface?: boolean;
  children: ReactNode;
}

/** A titled content section with the standard vertical rhythm. */
export function ContentSection({ id, heading, lead, surface, children }: ContentSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={cn("py-16 md:py-24", surface && "bg-surface")}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id={id ? `${id}-heading` : undefined} className="font-heading text-h2 text-dark">
          {heading}
        </h2>
        {lead ? <p className="mt-3 max-w-3xl text-body text-muted">{lead}</p> : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export interface InfoItem {
  id: string;
  icon?: LucideIcon;
  title: string;
  description: string;
  href?: string;
  hrefLabel?: string;
  external?: boolean;
}

export interface InfoGridProps {
  items: InfoItem[];
  columns?: 2 | 3;
}

/** A responsive card grid for feature/resource/section listings. */
export function InfoGrid({ items, columns = 3 }: InfoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6",
        columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2",
      )}
    >
      {items.map(({ id, icon: Icon, title, description, href, hrefLabel, external }) => (
        <div
          key={id}
          className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          {Icon ? (
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
          <h3 className="font-heading text-h3 text-dark">{title}</h3>
          <p className="flex-1 text-body text-muted">{description}</p>
          {href ? (
            external ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {hrefLabel ?? "Learn more"}
              </a>
            ) : (
              <Link
                href={href}
                className="inline-flex items-center text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {hrefLabel ?? "Learn more"}
              </Link>
            )
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** A simple prose block for legal/editorial content. */
export function ProseSection({
  id,
  heading,
  paragraphs,
  surface,
}: {
  id?: string;
  heading: string;
  paragraphs: string[];
  surface?: boolean;
}) {
  return (
    <section className={cn("py-16 md:py-24", surface && "bg-surface")}>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-h2 text-dark">{heading}</h2>
        <div className="mt-6 flex flex-col gap-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-body text-muted">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

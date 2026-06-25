"use client";

// src/components/schemes/ApplyButton.tsx
//
// CLIENT ISLAND (Req 23). Renders an "Apply Now" control that opens the scheme's
// official Karnataka portal URL — resolved purely via `resolveApplyUrl(schemeId)`
// — in a new tab with `target="_blank" rel="noopener noreferrer"`, alongside a
// muted inline disclaimer clarifying that submission happens on the official
// portal and that this site is a frontend preview (Req 23.1, 23.6).

import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { resolveApplyUrl } from "@/lib/scheme-apply-urls";

export interface ApplyButtonProps {
  /** Real scheme id from `src/data/schemes.ts`; resolved to a portal URL. */
  schemeId: string;
  /** Optional wrapper class. */
  className?: string;
  /** Visible/accessible label for the control. Defaults to "Apply Now". */
  label?: string;
}

const DISCLAIMER =
  "You will be redirected to the official Karnataka portal. This is a frontend preview — application submission happens on the official portal.";

export function ApplyButton({
  schemeId,
  className,
  label = "Apply Now",
}: ApplyButtonProps) {
  const href = resolveApplyUrl(schemeId);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button asChild variant="accent">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} — opens the official Karnataka portal in a new tab`}
        >
          <span>{label}</span>
          <ExternalLink aria-hidden="true" />
        </a>
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
    </div>
  );
}

export default ApplyButton;

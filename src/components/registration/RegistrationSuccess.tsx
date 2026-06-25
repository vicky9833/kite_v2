"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Calculator,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRegistration } from "@/context/RegistrationContext";

/**
 * RegistrationSuccess — the post-submit success state (Req 10).
 *
 * Renders a centered success-token check icon and the "Registration Complete"
 * headline, the generated KITE ID in a callout with a Copy control (writes the
 * id to the clipboard + shows a confirmation toast and inline confirmation),
 * exactly three CTA cards routing to `/schemes`, `/calculator`, and `/`, and a
 * session-only disclaimer. Reads everything from the session profile in
 * `RegistrationContext`; performs no persistence or network I/O.
 */

interface SuccessCta {
  title: string;
  description: string;
  href: string;
  icon: typeof Sparkles;
}

/** Exactly three CTA cards (Req 10.4) — order and targets are fixed. */
const CTAS: readonly SuccessCta[] = [
  {
    title: "See Schemes You Qualify For",
    description:
      "Browse all 22 schemes with personalized eligibility based on your profile.",
    href: "/schemes",
    icon: Sparkles,
  },
  {
    title: "Calculate Your Benefits",
    description:
      "Estimate the total incentives and grants your startup could access.",
    href: "/calculator",
    icon: Calculator,
  },
  {
    title: "Explore the Ecosystem",
    description: "Discover programs, clusters, mentors, and events across Karnataka.",
    href: "/",
    icon: Compass,
  },
];

export function RegistrationSuccess() {
  const { registrationProfile } = useRegistration();
  const kiteId = registrationProfile?.kiteId ?? "";

  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!kiteId) return;
    try {
      await navigator.clipboard.writeText(kiteId);
      setCopied(true);
      toast.success("KITE ID copied to clipboard");
      // Revert the inline confirmation after a short delay.
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy automatically — copy it manually.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      {/* Success token + headline (Req 10.1) */}
      <div className="flex flex-col items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-h2 text-dark">Registration Complete</h2>
        <p className="max-w-md text-body text-muted">
          Your KITE profile is ready. Use your KITE ID to explore schemes and
          benefits tailored to your startup.
        </p>
      </div>

      {/* KITE ID callout with a Copy control (Req 10.2, 10.3) */}
      {kiteId ? (
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-6">
            <p className="text-caption font-medium uppercase tracking-wide text-muted">
              Your KITE ID
            </p>
            <p className="font-heading text-h3 font-semibold tracking-wide text-dark">
              {kiteId}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              aria-label="Copy KITE ID to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy KITE ID"}
            </Button>
            {/* Polite confirmation for screen readers (Req 10.3). */}
            <span aria-live="polite" className="sr-only">
              {copied ? "KITE ID copied to clipboard" : ""}
            </span>
          </CardContent>
        </Card>
      ) : null}

      {/* Exactly three CTA cards (Req 10.4, 10.5) */}
      <div className="grid w-full gap-4 sm:grid-cols-3">
        {CTAS.map((cta) => {
          const Icon = cta.icon;
          return (
            <Link
              key={cta.href}
              href={cta.href}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
              </span>
              <span className="font-heading text-body font-semibold text-dark">
                {cta.title}
              </span>
              <span className="text-caption text-muted">{cta.description}</span>
              <span className="mt-auto inline-flex items-center gap-1 text-caption font-medium text-accent">
                Continue
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Session-only disclaimer (Req 10.6) */}
      <p className="max-w-lg text-caption text-muted">
        This is a session-only frontend preview. Your registration has not been
        submitted to any government system and will reset when you refresh the
        page.
      </p>
    </div>
  );
}

export default RegistrationSuccess;

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  LayoutDashboard,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInvestor } from "@/context/InvestorContext";

/**
 * OnboardingSuccess — the post-submit success state for investor onboarding
 * (Req 16.5).
 *
 * Renders a centered success-token check icon and a "You're onboarded"
 * headline, the generated Investor ID in a callout with an optional Copy
 * control (writes the id to the clipboard + shows a confirmation toast and
 * inline confirmation), and CTA cards routing to the investor dashboard and
 * Investor Connect, plus a session-only disclaimer. Reads everything from the
 * session profile in `InvestorContext`; performs no persistence or network I/O.
 */

interface SuccessCta {
  title: string;
  description: string;
  href: string;
  icon: typeof Compass;
}

const CTAS: readonly SuccessCta[] = [
  {
    title: "Go to Your Dashboard",
    description:
      "See matched startups, your portfolio, deal flow, and Karnataka signals.",
    href: "/dashboard/investor",
    icon: LayoutDashboard,
  },
  {
    title: "Explore Investor Connect",
    description:
      "Browse featured opportunities, live deal flow, and co-investment with KITVEN.",
    href: "/investors",
    icon: Compass,
  },
];

export function OnboardingSuccess() {
  const { investorProfile } = useInvestor();
  const investorId = investorProfile?.investorId ?? "";

  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!investorId) return;
    try {
      await navigator.clipboard.writeText(investorId);
      setCopied(true);
      toast.success("Investor ID copied to clipboard");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy automatically — copy it manually.");
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      {/* Success token + headline */}
      <div className="flex flex-col items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-h2 text-dark">You&apos;re onboarded</h2>
        <p className="max-w-md text-body text-muted">
          Your investor profile is ready. Use your Investor ID to access your
          dashboard and deal pipeline.
        </p>
      </div>

      {/* Investor ID callout with an optional Copy control */}
      {investorId ? (
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-6">
            <p className="text-caption font-medium uppercase tracking-wide text-muted">
              Your Investor ID
            </p>
            <p className="font-heading text-h3 font-semibold tracking-wide text-dark">
              {investorId}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              aria-label="Copy Investor ID to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy Investor ID"}
            </Button>
            <span aria-live="polite" className="sr-only">
              {copied ? "Investor ID copied to clipboard" : ""}
            </span>
          </CardContent>
        </Card>
      ) : null}

      {/* CTA cards */}
      <div className="grid w-full gap-4 sm:grid-cols-2">
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

      {/* Session-only disclaimer */}
      <p className="max-w-lg text-caption text-muted">
        This is a session-only frontend preview. Your onboarding has not been
        submitted to any system and will reset when you refresh the page.
      </p>
    </div>
  );
}

export default OnboardingSuccess;

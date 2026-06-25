"use client";

// IdeaSuccessState — the post-submit confirmation for the Idea Bank (Req 27.4,
// 28, 35.4). It shows a green success check, the headline "Idea Submitted", the
// assigned Idea_Id prominently with a Copy control, one card per matched scheme
// (name, why-it-matched reason, max benefit, "View Scheme" link) or a friendly
// no-matches message, and the "Apply to Recommended Schemes" + "Submit Another
// Idea" CTAs. A polite aria-live region announces the ideaId and match count.
//
// Presentation only: matches are resolved through the pure
// `matchIdeaToSchemesDetailed` engine and scheme metadata is read from the
// canonical `schemes` data — no network, storage, or persistence.
//
// Visual discipline: rounded-xl shadow-sm border cards, max-w-3xl centered,
// Lucide icons only, success color reserved for the check (no danger color).

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Check, ArrowRight, ExternalLink, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { matchIdeaToSchemesDetailed } from "@/lib/idea-scheme-matching";
import { schemes } from "@/data/schemes";
import type { IdeaSubmission } from "@/types";

interface IdeaSuccessStateProps {
  /** The completed submission returned by `submitIdea`. */
  idea: IdeaSubmission;
  /** Returns the Idea Bank to the submission form (Req 28.6). */
  onSubmitAnother: () => void;
}

/** Anchor target for the "Apply to Recommended Schemes" CTA (Req 28.4). */
const MATCHES_ANCHOR_ID = "idea-matched-schemes";

interface ResolvedMatch {
  schemeId: string;
  reason: string;
  name: string;
  maxBenefit: string;
}

export function IdeaSuccessState({ idea, onSubmitAnother }: IdeaSuccessStateProps) {
  const [copied, setCopied] = React.useState(false);

  // Resolve detailed matches and join with canonical scheme metadata. Any id
  // the engine returns is guaranteed real, but we still guard the lookup.
  const matches = React.useMemo<ResolvedMatch[]>(() => {
    return matchIdeaToSchemesDetailed(idea).reduce<ResolvedMatch[]>((acc, match) => {
      const scheme = schemes.find((s) => s.id === match.schemeId);
      if (scheme) {
        acc.push({
          schemeId: match.schemeId,
          reason: match.reason,
          name: scheme.name,
          maxBenefit: scheme.maxBenefit,
        });
      }
      return acc;
    }, []);
  }, [idea]);

  const hasMatches = matches.length > 0;

  async function handleCopy() {
    const ideaId = idea.ideaId;
    if (!ideaId) return;
    try {
      await navigator.clipboard.writeText(ideaId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable; the id remains visible to copy manually.
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8">
      {/* Polite announcement of the assigned id + match count (Req 35.4). */}
      <span aria-live="polite" className="sr-only">
        {`Idea submitted. Your idea identifier is ${idea.ideaId}. ${
          hasMatches
            ? `${matches.length} matched ${matches.length === 1 ? "scheme" : "schemes"} found.`
            : "No matched schemes found."
        }`}
      </span>

      {/* Success token + headline + prominent Idea_Id (Req 28.1, 28.2). */}
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-9 w-9 text-success" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-h2 text-dark">Idea Submitted</h2>
        <p className="max-w-md text-body text-muted">
          Your idea is recorded for this session. Save your identifier and explore
          the schemes it matches below.
        </p>

        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-6">
            <p className="text-caption font-medium uppercase tracking-wide text-muted">
              Your Idea ID
            </p>
            <p className="font-mono text-h3 font-semibold tracking-wide text-dark">
              {idea.ideaId}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              aria-label="Copy Idea ID to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy ID"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Matched schemes — one card each, or a friendly no-matches message
          (Req 28.3, 28.5). */}
      <section
        id={MATCHES_ANCHOR_ID}
        aria-labelledby="idea-matched-heading"
        className="w-full scroll-mt-24"
      >
        <h3
          id="idea-matched-heading"
          className="mb-4 text-center font-heading text-h3 text-dark"
        >
          Your Idea is Matched to These Schemes
        </h3>

        {hasMatches ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {matches.map((match) => (
              <li key={match.schemeId}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col gap-3 py-5">
                    <h4 className="font-heading text-body font-semibold text-dark">
                      {match.name}
                    </h4>
                    <p className="text-caption text-muted">{match.reason}</p>
                    <p className="text-caption font-medium text-dark">
                      <span className="text-muted">Max benefit: </span>
                      {match.maxBenefit}
                    </p>
                    <Link
                      href={`/schemes#${match.schemeId}`}
                      className="mt-auto inline-flex items-center gap-1 text-caption font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      View Scheme
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/10">
                <Inbox className="h-6 w-6 text-muted" aria-hidden="true" />
              </span>
              <p className="max-w-md text-body text-muted">
                We couldn&apos;t match your idea to a specific scheme right now, but
                your submission is recorded. Browse all 22 schemes to find a pathway
                that fits.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Primary CTAs (Req 28.4, 28.6). */}
      <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href={hasMatches ? `#${MATCHES_ANCHOR_ID}` : "/schemes"}>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Apply to Recommended Schemes
          </Link>
        </Button>
        <Button type="button" variant="outline" onClick={onSubmitAnother}>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          Submit Another Idea
        </Button>
      </div>
    </div>
  );
}

export default IdeaSuccessState;

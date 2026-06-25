"use client";

/**
 * MatchedStartupsSection — the engine-driven "Startups Matching Your Thesis"
 * block on the Investor Dashboard (Req 20).
 *
 * It seeds the synthetic candidate pool with the investor's id
 * (`getCandidatePool(investorId)` → 50 candidates), scores each against the
 * investor thesis with the pure `evaluateMatch` engine, sorts by score desc
 * (tie-break `startupId`), and surfaces the top six — all inside a `useMemo`
 * keyed on the investor profile so the list re-derives only when the thesis
 * changes (Req 20.7, the subject of Property 17).
 *
 * Each {@link MatchCard} shows the company, sector, stage, ask, location, the
 * match SCORE as a large bold Plus Jakarta Sans number (the biggest numeric
 * moment), a signal badge (success / warning / muted — never danger, Req 39.4 /
 * Property 22), and a "View Details" link. A "See All Matches" link sits below,
 * and an `aria-live="polite"` region announces the match count on render
 * (Req 20.5, 20.6). The whole section is marked illustrative (Req 6.6).
 *
 * Client Component: the `useMemo` + context read require client rendering. KITE
 * tokens only — no gradients/blobs/glow.
 */

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { IllustrativeBadge } from "@/components/investors/IllustrativeBadge";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { useInvestor } from "@/context/InvestorContext";
import { sectors } from "@/data/sectors";
import {
  matchSignalBadgeStyle,
  matchSignalLabel,
  selectTopMatches,
  type MatchedStartup,
  type MatchSignalBadgeStyle,
} from "@/lib/investor-match-display";
import { getCandidatePool } from "@/lib/synthetic-investor-data";
import { cn } from "@/lib/utils";

/** Number of top matches surfaced on the dashboard (Req 20.3). */
const TOP_MATCH_LIMIT = 6;

/** Resolve a sector id → its canonical display label, falling back to the id. */
function resolveSectorLabel(sectorId: string): string {
  return sectors.find((s) => s.id === sectorId)?.name ?? sectorId;
}

/**
 * Format an ask expressed in lakhs into a clean ₹ label, promoting to crore at
 * or above 100 lakhs (1 crore). Pure & deterministic.
 */
function formatAsk(askLakhs: number): string {
  if (!Number.isFinite(askLakhs) || askLakhs <= 0) return "₹0 L";
  if (askLakhs >= 100) {
    const crore = askLakhs / 100;
    const rounded = Math.round(crore * 10) / 10;
    return `₹${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} Cr`;
  }
  return `₹${Math.round(askLakhs)} L`;
}

/** Tailwind classes for each logical signal badge style (never `danger`). */
const SIGNAL_BADGE_CLASSES: Record<MatchSignalBadgeStyle, string> = {
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  muted: "border-border bg-surface text-muted",
};

export function MatchedStartupsSection() {
  const { investorProfile } = useInvestor();

  // Seed the candidate pool with the investor id, score + rank inside a memo
  // keyed on the profile so the list only re-derives when the thesis changes.
  const { matches, poolSize } = useMemo(() => {
    if (!investorProfile) {
      return { matches: [] as MatchedStartup[], poolSize: 0 };
    }
    const seedKey = investorProfile.investorId || "preview";
    const pool = getCandidatePool(seedKey);
    return {
      matches: selectTopMatches(investorProfile, pool, TOP_MATCH_LIMIT),
      poolSize: pool.length,
    };
  }, [investorProfile]);

  const countMessage = `Showing top ${matches.length} of ${poolSize} matches`;

  return (
    <section aria-labelledby="matched-startups-heading">
      <div className="flex flex-col gap-2">
        <SectionHeading
          id="matched-startups-heading"
          eyebrow="Powered by your thesis"
          title="Startups Matching Your Thesis"
          description="Ranked against your focus sectors, stages, geography, and ticket size."
        />
        <IllustrativeBadge variant="inline" />
      </div>

      {/* aria-live region announces the match count on render (Req 20.6). */}
      <p aria-live="polite" className="mt-4 text-caption text-muted">
        {countMessage}
      </p>

      {matches.length === 0 ? (
        <p className="mt-6 rounded-xl border border-border bg-card p-6 text-body text-muted shadow-sm">
          No matching startups yet — complete your investment thesis to see
          ranked matches.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((matched) => (
            <li key={matched.candidate.kiteId} className="h-full">
              <MatchCard matched={matched} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Link
          href="/investors#deals"
          className="inline-flex items-center gap-1.5 text-body font-semibold text-primary hover:underline"
        >
          See All Matches
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

/** A single matched-startup card with the match score as the headline number. */
function MatchCard({ matched }: { matched: MatchedStartup }) {
  const { candidate, match } = matched;
  const badgeStyle = matchSignalBadgeStyle(match.signal);
  const badgeLabel = matchSignalLabel(match.signal);

  return (
    <article className="relative flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg text-dark">
            {candidate.companyName}
          </h3>
          <p className="text-caption text-muted">
            {resolveSectorLabel(candidate.sector)} · {candidate.stage}
          </p>
        </div>

        {/* The match score: the biggest numeric moment on the card. */}
        <div className="flex flex-col items-end leading-none">
          <span
            className="font-heading text-h1 font-bold text-primary"
            aria-label={`Match score ${match.score} out of 100`}
          >
            {match.score}
          </span>
          <span className="text-[0.625rem] uppercase tracking-wide text-muted">
            match
          </span>
        </div>
      </div>

      <span
        className={cn(
          "inline-flex w-fit items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold",
          SIGNAL_BADGE_CLASSES[badgeStyle],
        )}
      >
        {badgeLabel}
      </span>

      <p className="font-heading text-h3 text-dark">{formatAsk(candidate.askLakhs)}</p>

      <p className="flex items-center gap-1.5 text-caption text-muted">
        <MapPin aria-hidden className="h-3.5 w-3.5" />
        {candidate.location}
      </p>

      <div className="mt-auto pt-2">
        <Link
          href="/investors#deals"
          className="inline-flex items-center gap-1.5 text-caption font-semibold text-primary hover:underline"
          aria-label={`View details for ${candidate.companyName}`}
        >
          View Details
          <ArrowRight aria-hidden className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

export default MatchedStartupsSection;

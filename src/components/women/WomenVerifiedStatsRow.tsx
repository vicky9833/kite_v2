/**
 * WomenVerifiedStatsRow — section 2 of the Women Founders Hub (Req 8). A thin
 * horizontal row presenting the five VERIFIED Karnataka policy provisions for
 * women founders. Every figure here is canonical / verified, so the section
 * carries NO `IllustrativeBadge` and no illustrative label (Req 8.6, 38.1,
 * 38.5).
 *
 * The five verified stats (Req 8.1–8.5):
 *  1. 25% women-led ELEVATE winners — given additional typographic weight
 *     relative to its peers (Req 8.7, 36.7).
 *  2. 51%+ founder-stake threshold unlocks women-founder preferences.
 *  3. 51%+ women-employee share unlocks Women-Led benefits.
 *  4. ₹5 crore Women-Led Accelerator grant over 5 years.
 *  5. ELEVATE Unnati — dedicated track for SC/ST women founders.
 *
 * Institutional visual discipline (Req 36): `py-16 md:py-24`, `max-w-7xl`,
 * Plus Jakarta Sans headings via `font-heading`, no gradients/blobs/emoji,
 * no `text-h4`.
 *
 * Server Component (no interactivity / no `"use client"`).
 */

interface VerifiedStat {
  value: string;
  label: string;
  /** When true, the value gets the largest/boldest treatment. */
  emphasized?: boolean;
}

/** Verified, canonical figures — NOT synthetic (Req 8.6, 38.1). */
const VERIFIED_STATS: ReadonlyArray<VerifiedStat> = [
  {
    value: "25%",
    label: "women-led ELEVATE winners",
    emphasized: true,
  },
  {
    value: "51%",
    label: "founder-stake threshold unlocks women-founder preferences",
  },
  {
    value: "51%",
    label: "women-employee share unlocks Women-Led benefits",
  },
  {
    value: "₹5 crore",
    label: "Women-Led Accelerator grant over 5 years",
  },
  {
    value: "ELEVATE Unnati",
    label: "dedicated track for SC/ST women founders",
  },
];

export function WomenVerifiedStatsRow() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-h2 text-dark">
          Verified policy provisions
        </h2>
        <p className="mt-3 max-w-2xl text-body text-muted">
          Straight from the Karnataka Startup Policy — the provisions that back
          women-led ventures.
        </p>

        <dl className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-5">
          {VERIFIED_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-2">
              <dt className="text-caption text-muted">{stat.label}</dt>
              <dd
                className={
                  stat.emphasized
                    ? "font-heading text-h1 font-bold text-primary"
                    : "font-heading text-h3 text-dark"
                }
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default WomenVerifiedStatsRow;

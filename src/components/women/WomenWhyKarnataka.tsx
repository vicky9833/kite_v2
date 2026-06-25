import { Building2, Coins, Users, type LucideIcon } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";

/**
 * WomenWhyKarnataka — section 3 of the Women Founders Hub (Req 9). A concise
 * "Why Karnataka for women founders" editorial rendered as a three-column
 * layout (Req 9.1), each column explaining one structural advantage:
 *
 *  1. Founder Stake Threshold — a 51%+ founder stake unlocks preferred access
 *     to seed funding, VC, and procurement (Req 9.2).
 *  2. Women Employee Threshold — a 51%+ women-employee share unlocks
 *     incubation, mentorship, and workshop benefits even without a majority
 *     founder stake (Req 9.3).
 *  3. Dedicated Accelerator Capital — the verified ₹5 crore over 5 years grant,
 *     plus KITVEN, the Beyond Bengaluru fund, and ELEVATE Unnati (Req 9.4).
 *
 * All figures named here are canonical / verified, so no illustrative label
 * appears (Req 38.1, 38.5).
 *
 * Institutional visual discipline (Req 36): `rounded-xl shadow-sm border`
 * cards, `py-16 md:py-24`, `max-w-7xl`, Lucide icons only, Plus Jakarta Sans
 * headings, no `text-h4`.
 *
 * Server Component (no interactivity / no `"use client"`).
 */

interface WhyColumn {
  icon: LucideIcon;
  title: string;
  description: string;
}

const WHY_COLUMNS: ReadonlyArray<WhyColumn> = [
  {
    icon: Building2,
    title: "Founder Stake Threshold",
    description:
      "A 51%+ women-founder stake unlocks preferential access to seed funding, venture capital, and government procurement — putting majority women-led ventures at the front of the queue.",
  },
  {
    icon: Users,
    title: "Women Employee Threshold",
    description:
      "A 51%+ women-employee share unlocks incubation, mentorship, and workshop benefits, so a venture qualifies for Women-Led support even without a majority founder stake.",
  },
  {
    icon: Coins,
    title: "Dedicated Accelerator Capital",
    description:
      "The Women-Led Accelerator commits ₹5 crore over 5 years, alongside KITVEN funds, the Beyond Bengaluru fund, and the ELEVATE Unnati track for SC/ST women founders.",
  },
];

export function WomenWhyKarnataka() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The case for Karnataka"
          title="Why Karnataka for women founders"
          description="Three structural advantages that make Karnataka the place to build a women-led venture."
        />

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {WHY_COLUMNS.map((column) => {
            const Icon = column.icon;
            return (
              <li
                key={column.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="font-heading text-lg text-dark">
                  {column.title}
                </h3>
                <p className="text-body text-muted">{column.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default WomenWhyKarnataka;

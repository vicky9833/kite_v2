import { Cpu, TrendingUp, Trophy, type LucideIcon } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";

/**
 * WhyKarnatakaSection — section 2 of Investor Connect (Req 8). Three VERIFIED
 * cards on a 3-column desktop grid (`md:grid-cols-3`), stacked on mobile. Every
 * figure here is canonical / verified (workforce, VC concentration, soonicorn
 * count), so no illustrative label is shown.
 *
 * Government-grade restraint: rounded-xl cards, hairline border, soft shadow,
 * a single muted Lucide glyph each — no gradients, blobs, or glow.
 *
 * Server Component (no interactivity / no `"use client"`).
 */

interface WhyCard {
  icon: LucideIcon;
  title: string;
  stat: string;
  description: string;
}

const WHY_CARDS: ReadonlyArray<WhyCard> = [
  {
    icon: Cpu,
    title: "Largest Tech Workforce",
    stat: "2.5M tech professionals",
    description:
      "India's deepest technical talent pool, including 350,000 engineers in chip design and embedded systems.",
  },
  {
    icon: TrendingUp,
    title: "Highest VC Concentration",
    stat: "46% of India's VC",
    description:
      "Karnataka has attracted 46% of all venture capital invested in India since 2016 — the country's leading funding hub.",
  },
  {
    icon: Trophy,
    title: "Soonicorn Capital",
    stat: "183 soonicorns",
    description:
      "183 startups valued at $100M+ — the highest concentration of soonicorns anywhere in India.",
  },
];

export function WhyKarnatakaSection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The case for Karnataka"
          title="Why Karnataka"
          description="Three verified reasons Karnataka anchors India's startup and venture story."
        />

        <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {WHY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <li
                key={card.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="font-heading text-lg text-dark">{card.title}</h3>
                <p className="font-heading text-h3 text-primary">{card.stat}</p>
                <p className="text-body text-muted">{card.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default WhyKarnatakaSection;

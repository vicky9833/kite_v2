import { OpportunityCard } from "@/components/investors/OpportunityCard";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { getFeaturedOpportunities } from "@/lib/synthetic-investor-data";

/**
 * FeaturedOpportunitiesSection — section 3 of Investor Connect (Req 9). Renders
 * the six synthetic featured opportunities from `getFeaturedOpportunities` in a
 * responsive grid (3-col desktop / 2-col tablet / 1-col mobile). Each card is an
 * {@link OpportunityCard} carrying its own corner illustrative label.
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export function FeaturedOpportunitiesSection() {
  const opportunities = getFeaturedOpportunities();

  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Deal flow"
          title="Featured Opportunities"
          description="A curated preview of startups raising across Karnataka's priority sectors."
        />

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opportunity) => (
            <li key={opportunity.id} className="h-full">
              <OpportunityCard opportunity={opportunity} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default FeaturedOpportunitiesSection;

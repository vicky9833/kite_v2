"use client";

// IdeaCategoriesSpotlight — the Idea_Bank category spotlight (Req 30).
//
// Renders exactly 8 cards in a four-by-two grid (one per Idea_Category), each
// with a Lucide icon, the category name, a count of typically-matched schemes,
// and a "Submit in This Category" control (Req 30.1, 30.2). Activating a card's
// control calls `onSelectCategory(category)` so the parent island can pre-fill
// the `ideaCategory` field and scroll to the Idea_Submission_Form (Req 30.3).
//
// Government-grade restraint: flat `rounded-xl shadow-sm border`, `max-w-7xl`,
// Lucide icons only, no gradients/blobs/emoji (Req 36).

import * as React from "react";
import {
  Sprout,
  HeartPulse,
  Leaf,
  GraduationCap,
  Landmark,
  Tractor,
  Factory,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { matchIdeaToSchemes } from "@/lib/idea-scheme-matching";
import { IDEA_CATEGORIES, type IdeaCategory, type IdeaSubmission } from "@/types";

export interface IdeaCategoriesSpotlightProps {
  /** Called when a card's "Submit in This Category" control is activated. */
  onSelectCategory: (category: IdeaCategory) => void;
}

/** A sensible Lucide icon per Idea_Category (no emoji, Req 36). */
const CATEGORY_ICONS: Record<IdeaCategory, LucideIcon> = {
  AgriTech: Sprout,
  HealthTech: HeartPulse,
  ClimateTech: Leaf,
  EdTech: GraduationCap,
  FinTech: Landmark,
  "Rural Development": Tractor,
  Manufacturing: Factory,
  "Other Social Impact": Users,
};

/**
 * Count typically-matched schemes for a category by running the deterministic
 * matcher against a representative probe idea (Req 30.2). The probe holds the
 * category constant and uses neutral, representative values for every other
 * field, so the count reflects what a typical submission in that category would
 * surface. `matchIdeaToSchemes` is pure and deterministic (Req 4.12).
 */
function countMatchedSchemes(category: IdeaCategory): number {
  const probe: IdeaSubmission = {
    id: "probe",
    innovatorName: "Probe",
    innovatorEmail: "probe@example.com",
    innovatorAge: 30,
    innovatorType: "Citizen",
    ideaTitle: "Probe",
    ideaCategory: category,
    ideaSummary: "Probe",
    problemStatement: "Probe",
    proposedSolution: "Probe",
    location: "Mysuru",
    submittedAt: "1970-01-01T00:00:00.000Z",
    status: "submitted",
    matchedSchemeIds: [],
    ideaId: "IDEA-1970-000000",
  };
  return matchIdeaToSchemes(probe).length;
}

export function IdeaCategoriesSpotlight({
  onSelectCategory,
}: IdeaCategoriesSpotlightProps) {
  return (
    <section
      aria-labelledby="idea-categories-spotlight-heading"
      className="py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-3xl flex-col gap-4">
          <span className="text-caption font-heading font-semibold uppercase tracking-wide text-accent">
            Idea categories
          </span>
          <h2
            id="idea-categories-spotlight-heading"
            className="font-heading text-h2 text-dark"
          >
            Idea Categories
          </h2>
          <p className="text-body text-muted">
            Explore the eight idea categories and start a submission pre-filled to
            the area you care about. Each card shows how many real Karnataka
            schemes a typical idea in that category tends to match.
          </p>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {IDEA_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            const matchedCount = countMatchedSchemes(category);
            return (
              <li
                key={category}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface text-primary">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-heading text-h3 font-semibold text-dark">
                    {category}
                  </h3>
                  <p className="text-caption text-muted">
                    {matchedCount}{" "}
                    {matchedCount === 1 ? "scheme" : "schemes"} typically matched
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-auto w-full"
                  onClick={() => onSelectCategory(category)}
                >
                  Submit in This Category
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default IdeaCategoriesSpotlight;

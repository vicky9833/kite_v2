/**
 * PublicIdeasBoard component test (task 15.6) —
 * Requirements 29.1–29.8, 35.5.
 *
 * Renders the real `PublicIdeasBoard` with a single session submission and
 * pins the board's behaviour:
 *
 *   - the ideas render as a semantic `<ul>`/`<li>` list whose items are the
 *     union of the visitor's `sessionIdeas` and the pure `generateSeedIdeas()`
 *     seed set (Req 29.1, 35.5);
 *   - each card carries the title, an Idea_Category badge, an Innovator_Type
 *     badge, the location, a relative timestamp, a summary truncated to
 *     ≤150 characters, and a "Read More" control (Req 29.2);
 *   - seed cards carry the "Illustrative" marker (Req 29.3);
 *   - category / innovator-type / location filters are labelled native
 *     `<select>` controls, and selecting one narrows the list (Req 29.4, 29.6);
 *   - the default sort is most-recent and the visitor's own submission is
 *     pinned at the top with a "Yours" badge (Req 29.5, 29.8);
 *   - a zero-match filter combination shows the no-results message while the
 *     board stays sorted by most recent (Req 29.7).
 *
 * The session submission is given a `submittedAt` later than every seed idea
 * (seeds are anchored to 2025-06-15 minus an offset) so it is also the board's
 * reference instant and reads "Just now", and a >150-char summary so the
 * truncation + Read More behaviour is exercised on a card we fully control.
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import { PublicIdeasBoard } from "@/components/ideas/PublicIdeasBoard";
import { generateSeedIdeas } from "@/lib/synthetic-ideas";
import {
  IDEA_CATEGORIES,
  INNOVATOR_TYPES,
  type IdeaSubmission,
  type LocationKarnataka,
} from "@/types";

// The Karnataka locations offered in the board's location filter.
const LOCATION_OPTIONS: readonly LocationKarnataka[] = [
  "Bengaluru Urban",
  "Bengaluru Rural",
  "Mysuru",
  "Mangaluru",
  "Hubballi-Dharwad-Belagavi",
  "Kalaburagi",
  "Shivamogga",
  "Tumakuru",
  "Other Karnataka",
];

// A long (>150 char) summary so the card truncates and shows "Read More".
const LONG_SUMMARY =
  "An AgriTech idea proposing a low-cost mobile advisory that pairs sensor " +
  "data with agronomist support for smallholder farmers across rural " +
  "Karnataka, piloted locally and designed to scale through grassroots " +
  "partners and existing ecosystem channels over the coming seasons.";

/** The visitor's own session submission — pinned on top + marked "Yours". */
const SESSION_IDEA: IdeaSubmission = {
  id: "IDEA-2025-SESS01",
  ideaId: "IDEA-2025-SESS01",
  innovatorName: "Test Innovator",
  innovatorEmail: "test.innovator@example.org",
  innovatorAge: 34,
  innovatorType: "Farmer",
  ideaTitle: "My Own Session Idea Title",
  ideaCategory: "AgriTech",
  ideaSummary: LONG_SUMMARY,
  problemStatement: "A problem statement for the session idea.",
  proposedSolution: "A proposed solution for the session idea.",
  location: "Mysuru",
  // Later than every seed (seeds <= 2025-06-15) → pinned reference instant.
  submittedAt: "2025-12-31T12:00:00.000Z",
  status: "submitted",
  matchedSchemeIds: [],
};

const SEED_IDEAS = generateSeedIdeas();
const SEED_COUNT = SEED_IDEAS.length;
const UNION = [SESSION_IDEA, ...SEED_IDEAS];

describe("PublicIdeasBoard", () => {
  it("renders a semantic <ul>/<li> list unioning session + seed ideas (Req 29.1, 35.5)", () => {
    render(<PublicIdeasBoard sessionIdeas={[SESSION_IDEA]} />);

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");

    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(1 + SEED_COUNT);
  });

  it("pins the session idea first with a 'Yours' badge and the default most-recent sort (Req 29.5, 29.8)", () => {
    render(<PublicIdeasBoard sessionIdeas={[SESSION_IDEA]} />);

    const firstCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;

    // The visitor's own submission is the first card and is flagged "Yours".
    within(firstCard).getByText(SESSION_IDEA.ideaTitle);
    within(firstCard).getByText("Yours");
    // It is the board's reference instant, so it reads "Just now".
    within(firstCard).getByText(/just now/i);
  });

  it("shows title, category + innovator-type badges, location, timestamp, truncated summary, and Read More on a card (Req 29.2)", () => {
    render(<PublicIdeasBoard sessionIdeas={[SESSION_IDEA]} />);

    const firstCard = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    )[0]!;

    within(firstCard).getByText(SESSION_IDEA.ideaTitle);
    within(firstCard).getByText(SESSION_IDEA.ideaCategory); // category badge
    within(firstCard).getByText(SESSION_IDEA.innovatorType); // innovator-type badge
    within(firstCard).getByText(SESSION_IDEA.location); // location

    // Summary is truncated to at most 150 visible characters.
    const summary = firstCard.querySelector("p");
    expect(summary).not.toBeNull();
    expect((summary as HTMLElement).textContent ?? "").not.toBe(
      SESSION_IDEA.ideaSummary,
    );
    expect(((summary as HTMLElement).textContent ?? "").length).toBeLessThanOrEqual(
      150,
    );

    // A "Read More" control is present and expands to the full summary.
    const readMore = within(firstCard).getByRole("button", {
      name: /read more/i,
    });
    fireEvent.click(readMore);
    within(firstCard).getByText(SESSION_IDEA.ideaSummary);
    within(firstCard).getByRole("button", { name: /show less/i });
  });

  it("marks every seed card as 'Illustrative' (Req 29.3)", () => {
    render(<PublicIdeasBoard sessionIdeas={[SESSION_IDEA]} />);

    // One inline marker in the heading + one per seed card; the session card
    // carries "Yours" instead, so the count is exactly SEED_COUNT + 1.
    const markers = screen.getAllByText("Illustrative");
    expect(markers).toHaveLength(SEED_COUNT + 1);
  });

  it("exposes labelled native <select> filters that narrow the list (Req 29.4, 29.6)", () => {
    render(<PublicIdeasBoard sessionIdeas={[SESSION_IDEA]} />);

    const categorySelect = screen.getByLabelText("Category");
    const innovatorSelect = screen.getByLabelText("Innovator type");
    const locationSelect = screen.getByLabelText("Location");
    expect(categorySelect.tagName).toBe("SELECT");
    expect(innovatorSelect.tagName).toBe("SELECT");
    expect(locationSelect.tagName).toBe("SELECT");

    const fullCount = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    ).length;

    // Filtering by the session idea's category narrows to that category only.
    fireEvent.change(categorySelect, { target: { value: "AgriTech" } });

    const expected = UNION.filter((i) => i.ideaCategory === "AgriTech").length;
    const narrowed = within(screen.getByRole("list")).getAllByRole(
      "listitem",
    ).length;

    expect(narrowed).toBe(expected);
    expect(narrowed).toBeGreaterThanOrEqual(1); // the session idea matches
    expect(narrowed).toBeLessThan(fullCount); // strictly fewer than the union
  });

  it("shows the no-results message for a zero-match filter combination (Req 29.7)", () => {
    render(<PublicIdeasBoard sessionIdeas={[SESSION_IDEA]} />);

    // Find a category/innovator-type/location triple matched by no idea.
    let empty:
      | { category: string; innovatorType: string; location: string }
      | null = null;
    for (const category of IDEA_CATEGORIES) {
      for (const innovatorType of INNOVATOR_TYPES) {
        for (const location of LOCATION_OPTIONS) {
          const match = UNION.some(
            (i) =>
              i.ideaCategory === category &&
              i.innovatorType === innovatorType &&
              i.location === location,
          );
          if (!match) {
            empty = { category, innovatorType, location };
            break;
          }
        }
        if (empty) break;
      }
      if (empty) break;
    }
    expect(empty).not.toBeNull();
    const combo = empty as {
      category: string;
      innovatorType: string;
      location: string;
    };

    fireEvent.change(screen.getByLabelText("Category"), {
      target: { value: combo.category },
    });
    fireEvent.change(screen.getByLabelText("Innovator type"), {
      target: { value: combo.innovatorType },
    });
    fireEvent.change(screen.getByLabelText("Location"), {
      target: { value: combo.location },
    });

    // The list is gone and the no-results message (retaining the sort) shows.
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    screen.getByText(/no ideas match your filters/i);
    screen.getByText(/stays sorted by\s+most recent/i);
  });
});

/**
 * IdeaSuccessState component test (task 15.5) — Requirements 27.4, 28.1–28.6, 35.4.
 *
 * Renders the post-submit confirmation with a completed `IdeaSubmission` fixture
 * (well-formed `IDEA-YYYY-XXXXXX` id, real matched scheme ids) plus an
 * `onSubmitAnother` mock and pins:
 *
 *   - the "Idea Submitted" success headline + the `ideaId` rendered prominently,
 *     and a "Copy ID" control (Req 28.1, 28.2);
 *   - one matched scheme card per match — scheme name, why-it-matched reason,
 *     max benefit, and a "View Scheme" link to `/schemes#<id>` (Req 28.3);
 *   - a zero-match variant showing the no-matches message instead of cards
 *     (Req 28.5);
 *   - the "Apply to Recommended Schemes" + "Submit Another Idea" CTAs, with the
 *     latter calling `onSubmitAnother` on click (Req 28.4, 28.6);
 *   - a polite `aria-live` region announcing the id + matched-scheme count
 *     (Req 35.4).
 *
 * The component derives matches internally through `matchIdeaToSchemesDetailed`
 * (which always adds a baseline `elevate` match), so the engine is wrapped as a
 * call-through mock: real behaviour by default, overridden to `[]` for the
 * single zero-match assertion.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";

import { IdeaSuccessState } from "@/components/ideas/IdeaSuccessState";
import { matchIdeaToSchemesDetailed } from "@/lib/idea-scheme-matching";
import { schemes } from "@/data/schemes";
import type { IdeaSubmission } from "@/types";

// Wrap the matching engine so it returns the real result by default but can be
// forced to an empty list to exercise the no-matches branch.
vi.mock("@/lib/idea-scheme-matching", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/idea-scheme-matching")>();
  return {
    ...actual,
    matchIdeaToSchemesDetailed: vi.fn(actual.matchIdeaToSchemesDetailed),
  };
});

/** A completed AgriTech submission → grassroot-innovation, rd-project-grant, elevate. */
function buildIdea(overrides: Partial<IdeaSubmission> = {}): IdeaSubmission {
  const base: IdeaSubmission = {
    id: "IDEA-2025-ABC234",
    ideaId: "IDEA-2025-ABC234",
    innovatorName: "Asha Rao",
    innovatorEmail: "asha@example.com",
    innovatorAge: 34,
    innovatorType: "Farmer",
    ideaTitle: "Solar crop dryer",
    ideaCategory: "AgriTech",
    ideaSummary: "A low-cost solar dryer for smallholder farms.",
    problemStatement: "Post-harvest losses are high for smallholder farmers.",
    proposedSolution: "An affordable modular solar drying unit.",
    location: "Mysuru",
    submittedAt: "2025-01-15T10:00:00.000Z",
    status: "submitted",
    matchedSchemeIds: ["grassroot-innovation", "rd-project-grant", "elevate"],
  };
  return { ...base, ...overrides };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("IdeaSuccessState", () => {
  it("renders the success headline and the ideaId prominently with a Copy ID control (Req 28.1, 28.2)", () => {
    const idea = buildIdea();
    render(<IdeaSuccessState idea={idea} onSubmitAnother={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: /idea submitted/i }),
    ).toBeInTheDocument();

    // The assigned identifier is shown to the user.
    expect(screen.getByText(idea.ideaId)).toBeInTheDocument();

    // A copy control is present.
    expect(
      screen.getByRole("button", { name: /copy id/i }),
    ).toBeInTheDocument();
  });

  it("renders one matched scheme card per match with name, reason, max benefit and a View Scheme link (Req 28.3)", () => {
    const idea = buildIdea();
    const expected = matchIdeaToSchemesDetailed(idea);

    // Sanity: the fixture yields multiple real matches to assert against.
    expect(expected.length).toBeGreaterThan(1);

    render(<IdeaSuccessState idea={idea} onSubmitAnother={vi.fn()} />);

    const cards = screen.getAllByRole("listitem");
    expect(cards).toHaveLength(expected.length);

    for (const match of expected) {
      const scheme = schemes.find((s) => s.id === match.schemeId);
      expect(scheme).toBeDefined();

      // Locate the card by its scheme name, then assert its contents.
      const heading = screen.getByText(scheme!.name);
      const card = heading.closest("li");
      expect(card).not.toBeNull();
      const scoped = within(card as HTMLElement);

      // Why-it-matched reason.
      scoped.getByText(match.reason);
      // Max benefit value.
      expect(scoped.getByText(scheme!.maxBenefit, { exact: false })).toBeInTheDocument();
      // View Scheme link to the canonical scheme anchor.
      const link = scoped.getByRole("link", { name: /view scheme/i });
      expect(link).toHaveAttribute("href", `/schemes#${match.schemeId}`);
    }
  });

  it("shows a no-matches message instead of cards in the zero-match variant (Req 28.5)", () => {
    vi.mocked(matchIdeaToSchemesDetailed).mockReturnValueOnce([]);

    render(
      <IdeaSuccessState
        idea={buildIdea({ matchedSchemeIds: [] })}
        onSubmitAnother={vi.fn()}
      />,
    );

    // No scheme cards.
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    // A friendly no-matches message is shown instead.
    expect(screen.getByText(/match your idea to a specific scheme/i)).toBeInTheDocument();
  });

  it("renders the Apply and Submit Another CTAs, and Submit Another calls onSubmitAnother (Req 28.4, 28.6)", () => {
    const onSubmitAnother = vi.fn();
    render(<IdeaSuccessState idea={buildIdea()} onSubmitAnother={onSubmitAnother} />);

    expect(
      screen.getByRole("link", { name: /apply to recommended schemes/i }),
    ).toBeInTheDocument();

    const submitAnother = screen.getByRole("button", {
      name: /submit another idea/i,
    });
    expect(submitAnother).toBeInTheDocument();

    fireEvent.click(submitAnother);
    expect(onSubmitAnother).toHaveBeenCalledTimes(1);
  });

  it("announces the ideaId and matched-scheme count via an aria-live region (Req 35.4)", () => {
    const idea = buildIdea();
    const expected = matchIdeaToSchemesDetailed(idea);
    const { container } = render(
      <IdeaSuccessState idea={idea} onSubmitAnother={vi.fn()} />,
    );

    const live = container.querySelector("[aria-live]");
    expect(live).not.toBeNull();
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toHaveTextContent(idea.ideaId);
    expect(live).toHaveTextContent(new RegExp(`${expected.length} matched`));
  });
});

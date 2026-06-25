/**
 * IdeaBank page composition test (task 15.7) — Requirements 24, 25, 30, 31, 32.
 *
 * Renders the real `/ideas` route (`IdeasPage`) wrapped in the session-only
 * `IdeaBankProvider` (the page's client island consumes the throwing
 * `useIdeaBank()` hook, so a provider is required). Pins the behaviour that
 * replaces the former route stub:
 *
 *   - the stub "forthcoming" copy is gone and the page carries its single hero
 *     `h1` (Req 24);
 *   - the "How it works" section presents EXACTLY three steps (Req 25);
 *   - the categories spotlight renders EXACTLY 8 category cards, each with a
 *     "Submit in This Category" control (Req 30);
 *   - the featured grassroots schemes section is present and carries at least
 *     one "Grassroots Friendly" badge (Req 31);
 *   - the resources section renders EXACTLY 3 resource cards (Req 32).
 *
 * The public ideas board also renders category text and a category badge per
 * card, so section-scoped queries use `within()` against each section's
 * accessible region (the spotlight, featured and resources sections expose an
 * `aria-labelledby` region) to avoid cross-section matches.
 */

import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import IdeasPage from "@/app/ideas/page";
import { IdeaBankProvider } from "@/context/IdeaBankContext";
import { IDEA_CATEGORIES } from "@/types";

/** Render the real route inside the session-only provider. */
function renderPage() {
  return render(
    <IdeaBankProvider>
      <IdeasPage />
    </IdeaBankProvider>,
  );
}

describe("IdeasPage (Idea Bank)", () => {
  it("replaces the stub: no 'forthcoming' copy and the hero h1 is present (Req 24)", () => {
    renderPage();

    // The StubPage placeholder copy must be gone.
    expect(screen.queryByText(/forthcoming/i)).not.toBeInTheDocument();

    // Exactly one page-level h1 (the hero), with the grassroots-framed headline.
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent(/your idea/i);
  });

  it("renders the 'How it works' section with exactly three steps (Req 25)", () => {
    renderPage();

    // Scope to the how-it-works section via its title's enclosing <section>.
    const sectionTitle = screen.getByText(
      /from idea to government support in three steps/i,
    );
    const section = sectionTitle.closest("section");
    expect(section).not.toBeNull();

    // The three steps render as list items inside the section's ordered list.
    const steps = within(section as HTMLElement).getAllByRole("listitem");
    expect(steps).toHaveLength(3);

    // Each step's eyebrow label is present and unique to this section.
    within(section as HTMLElement).getByText("Step 1");
    within(section as HTMLElement).getByText("Step 2");
    within(section as HTMLElement).getByText("Step 3");
  });

  it("renders the categories spotlight with exactly 8 'Submit in This Category' cards (Req 30)", () => {
    renderPage();

    // The spotlight exposes an aria-labelledby region named by its h2.
    const spotlight = screen.getByRole("region", { name: /^idea categories$/i });

    const submitButtons = within(spotlight).getAllByRole("button", {
      name: /submit in this category/i,
    });
    expect(submitButtons).toHaveLength(8);
    // Sanity: matches the canonical Idea_Category count (4×2 grid).
    expect(submitButtons).toHaveLength(IDEA_CATEGORIES.length);

    // Each category name appears within the spotlight.
    for (const category of IDEA_CATEGORIES) {
      within(spotlight).getByText(category);
    }
  });

  it("renders the featured grassroots schemes section with at least one 'Grassroots Friendly' badge (Req 31)", () => {
    renderPage();

    const featured = screen.getByRole("region", {
      name: /schemes for grassroot innovators/i,
    });

    const badges = within(featured).getAllByText(/grassroots friendly/i);
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders exactly 3 resource cards in the resources section (Req 32)", () => {
    renderPage();

    const resources = screen.getByRole("region", { name: /^resources$/i });

    const cards = within(resources).getByRole("list");
    expect(within(cards).getAllByRole("listitem")).toHaveLength(3);
  });
});

/**
 * Enablement layer end-to-end journeys (task 12.3) — Requirements 2, 3, 9, 10.
 *
 * Exercises the full discovery journey for BOTH directory routes — `/incubators`
 * (`IncubatorsPage`) and `/mentors` (`MentorsPage`) — end to end through the
 * real client islands, with no router or network mocks (the islands hold all
 * state in memory and use neither `next/link` nor `next/navigation`):
 *
 *   1. Initial render shows every card (No_Filter_State) and the `aria-live`
 *      matching count reflects the full set.
 *   2. Applying a filter recomputes the grid to a known, smaller, non-empty
 *      subset and the `aria-live` count updates to match (Req 2.4–2.8/2.11,
 *      9.4–9.7/9.10).
 *   3. Activating a card opens its inline detail panel — Detail_Open_State,
 *      at most one open (Req 3.1, 10.1).
 *   4. The panel is dismissed via the close control (incubators) and via the
 *      Escape key (mentors) (Req 3.7, 10.4).
 *   5. After dismissal the previously applied filter is still active — the
 *      filtered grid, the selected control value, and the count are all
 *      preserved (Req 3.7, 10.4).
 *
 * Patterns mirror `IncubatorDetailPanel.test.tsx`: activation and dismissal are
 * driven via `fireEvent` (the project does not bundle
 * `@testing-library/user-event`); native `<select>` filter controls are driven
 * via `fireEvent.change`; open panels are enumerated via their stable
 * `aria-label="Details for …"` region hook.
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import IncubatorsPage from "@/app/incubators/page";
import MentorsPage from "@/app/mentors/page";
import { incubators } from "@/data/incubators";
import { filterMentors } from "@/lib/mentor-filters";
import { generateMentors } from "@/lib/synthetic-mentors";
import { MENTOR_TYPES } from "@/types";

/** Every directory card carries an accessible name containing " — "; the
 *  clear-all and close controls do not, so this isolates the card buttons. */
const cardButtons = (): HTMLElement[] =>
  screen
    .getAllByRole("button")
    .filter((b) => (b.getAttribute("aria-label") ?? "").includes(" — "));

/** Any currently-open inline detail panel (region landmark). */
const openPanels = (): Element[] =>
  Array.from(document.querySelectorAll('[aria-label^="Details for "]'));

describe("Enablement E2E — /incubators full journey (Req 2, 3)", () => {
  /** Mysuru hosts exactly three verified entries — a stable filtered slice. */
  const mysuru = incubators.filter((i) => i.cluster === "Mysuru");

  it("filters → recomputes the grid + count → opens detail → closes → preserves the filter", () => {
    render(<IncubatorsPage />);

    // 1. Initial render: all 24 verified cards, count reflects the full set.
    expect(cardButtons()).toHaveLength(incubators.length);
    expect(
      screen.getByText(`${incubators.length} incubators match`),
    ).toBeInTheDocument();
    expect(openPanels()).toHaveLength(0);

    // 2. Apply Cluster = Mysuru → grid recomputes to 3, aria-live count updates.
    expect(mysuru).toHaveLength(3);
    fireEvent.change(screen.getByLabelText("Cluster"), {
      target: { value: "Mysuru" },
    });
    expect(cardButtons()).toHaveLength(3);
    expect(screen.getByText("3 incubators match")).toBeInTheDocument();
    expect(screen.getByLabelText("Cluster")).toHaveValue("Mysuru");

    // 3. Open a card from within the filtered slice (Detail_Open_State, ≤1 open).
    const target = mysuru[0]!;
    fireEvent.click(
      screen.getByRole("button", {
        name: `${target.name} — ${target.type} in ${target.cluster}`,
      }),
    );
    expect(openPanels()).toHaveLength(1);
    expect(
      screen.getByRole("region", { name: target.name }),
    ).toBeInTheDocument();

    // 4. Close via the visible close control.
    fireEvent.click(
      screen.getByRole("button", { name: `Close details for ${target.name}` }),
    );
    expect(openPanels()).toHaveLength(0);

    // 5. The previously applied filter is still active.
    expect(cardButtons()).toHaveLength(3);
    expect(screen.getByText("3 incubators match")).toBeInTheDocument();
    expect(screen.getByLabelText("Cluster")).toHaveValue("Mysuru");
  });
});

describe("Enablement E2E — /mentors full journey (Req 9, 10)", () => {
  // The synthetic directory is deterministic; compute a Mentor_Type filter that
  // yields a known, non-empty PROPER subset (so the grid genuinely shrinks).
  const mentors = generateMentors();
  const total = mentors.length;
  const chosenType = MENTOR_TYPES.find((type) => {
    const n = filterMentors(mentors, {
      sector: null,
      mentorType: type,
      experienceLevel: null,
    }).length;
    return n > 0 && n < total;
  })!;
  const filtered = filterMentors(mentors, {
    sector: null,
    mentorType: chosenType,
    experienceLevel: null,
  });
  const expectedCount = filtered.length;

  it("filters → recomputes the grid + count → opens detail → closes (Escape) → preserves the filter", () => {
    // Guard the fixture: a proper non-empty subset must exist.
    expect(chosenType).toBeDefined();
    expect(expectedCount).toBeGreaterThan(0);
    expect(expectedCount).toBeLessThan(total);

    render(<MentorsPage />);

    // 1. Initial render: one card per generated mentor, count reflects the set.
    expect(cardButtons()).toHaveLength(total);
    expect(screen.getByText(`${total} mentors match`)).toBeInTheDocument();
    expect(openPanels()).toHaveLength(0);

    // 2. Apply Mentor type filter → grid recomputes, aria-live count updates.
    fireEvent.change(screen.getByLabelText("Mentor type"), {
      target: { value: chosenType },
    });
    expect(cardButtons()).toHaveLength(expectedCount);
    expect(
      screen.getByText(
        `${expectedCount} ${expectedCount === 1 ? "mentor" : "mentors"} match`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Mentor type")).toHaveValue(chosenType);

    // 3. Open a card from within the filtered slice (Detail_Open_State).
    const target = filtered[0]!;
    fireEvent.click(
      screen.getAllByRole("button", {
        name: `${target.name} — ${target.mentorType}`,
      })[0]!,
    );
    expect(openPanels()).toHaveLength(1);
    expect(
      screen.getByRole("region", { name: target.name }),
    ).toBeInTheDocument();

    // 4. Close via the Escape key.
    fireEvent.keyDown(document, { key: "Escape" });
    expect(openPanels()).toHaveLength(0);

    // 5. The previously applied filter is still active.
    expect(cardButtons()).toHaveLength(expectedCount);
    expect(
      screen.getByText(
        `${expectedCount} ${expectedCount === 1 ? "mentor" : "mentors"} match`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Mentor type")).toHaveValue(chosenType);
  });
});

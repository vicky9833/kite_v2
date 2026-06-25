/**
 * MentorDetailPanel component test (task 10.6) — Requirements 10.1, 10.2, 10.3,
 * 10.4.
 *
 * Exercises the inline, at-most-one-open mentor detail surface both directly
 * and through the real `/mentors` client island (`MentorsPage`), pinning:
 *   - activating a mentor card by pointer click AND by keyboard (Enter / Space)
 *     opens the detail panel (Detail_Open_State; Req 10.1);
 *   - every field renders — name, the initials-avatar placeholder whose text
 *     alternative equals the name, title, firm, sectors (canonical names),
 *     years of experience, mentor type, availability, and the one-paragraph
 *     illustrative bio (Req 10.2);
 *   - the panel carries an `IllustrativeBadge` because ALL mentor content is
 *     synthetic (Req 10.3);
 *   - the visible close control AND the Escape key dismiss the panel, and the
 *     prior filter state is preserved across open/close (Req 10.4);
 *   - a `null` mentor is a no-op — the panel renders nothing and never enters
 *     the open state.
 *
 * The page is a self-contained island (in-memory synthetic data + filter UI);
 * it uses neither `next/link` nor `next/navigation`, so no router mocks are
 * required. Keyboard and pointer activation are driven via `fireEvent` (the
 * project does not bundle `@testing-library/user-event`); native `<select>`
 * filter controls are driven via `fireEvent.change`. This mirrors the sibling
 * `incubators/__tests__/IncubatorDetailPanel.test.tsx`.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import MentorsPage from "@/app/mentors/page";
import { MentorDetailPanel } from "@/components/mentors/MentorDetailPanel";
import { sectors } from "@/data/sectors";
import { generateMentors } from "@/lib/synthetic-mentors";
import type { MentorProfile } from "@/types";

/** The byte-stable synthetic directory backing both the page and these tests. */
const mentors = generateMentors();

/** Accessible name pattern shared by every rendered card. */
const cardName = (m: MentorProfile) => `${m.name} — ${m.mentorType}`;

/**
 * Pick a mentor whose card accessible name (`name — mentorType`) is unique
 * across the whole directory, so `getByRole("button", { name })` resolves to a
 * single card regardless of incidental name collisions among synthetic records.
 */
const sample: MentorProfile = (() => {
  const counts = new Map<string, number>();
  for (const m of mentors) {
    counts.set(cardName(m), (counts.get(cardName(m)) ?? 0) + 1);
  }
  const unique = mentors.find((m) => counts.get(cardName(m)) === 1);
  if (!unique) throw new Error("expected at least one mentor with a unique card label");
  return unique;
})();

/** Resolve a sector id → its canonical display label (mirrors the component). */
const sectorLabel = (id: string) => sectors.find((s) => s.id === id)?.name ?? id;

/** The open detail panel, addressed by its region landmark (Req 14.5). */
const getOpenPanel = (m: MentorProfile) =>
  screen.getByRole("region", { name: m.name });

const queryOpenPanels = () =>
  Array.from(document.querySelectorAll('[aria-label^="Details for "]'));

describe("MentorDetailPanel — activation opens the detail panel (Req 10.1)", () => {
  it("opens the detail panel on a pointer click and keeps at most one open", () => {
    render(<MentorsPage />);

    expect(queryOpenPanels()).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: cardName(sample) }));
    expect(getOpenPanel(sample)).toBeInTheDocument();
    expect(queryOpenPanels()).toHaveLength(1);

    // Activating a different mentor swaps the open detail — still exactly one.
    const other = mentors.find(
      (m) => m.id !== sample.id && cardName(m) !== cardName(sample),
    )!;
    fireEvent.click(screen.getByRole("button", { name: cardName(other) }));

    expect(queryOpenPanels()).toHaveLength(1);
  });

  it("opens the detail panel on keyboard Enter activation", () => {
    render(<MentorsPage />);

    fireEvent.keyDown(
      screen.getByRole("button", { name: cardName(sample) }),
      { key: "Enter" },
    );

    expect(getOpenPanel(sample)).toBeInTheDocument();
    expect(queryOpenPanels()).toHaveLength(1);
  });

  it("opens the detail panel on keyboard Space activation", () => {
    render(<MentorsPage />);

    fireEvent.keyDown(
      screen.getByRole("button", { name: cardName(sample) }),
      { key: " " },
    );

    expect(getOpenPanel(sample)).toBeInTheDocument();
    expect(queryOpenPanels()).toHaveLength(1);
  });
});

describe("MentorDetailPanel — all fields render (Req 10.2)", () => {
  it("renders name, initials-avatar (text alt = name), title, firm, sectors, years, type, availability, and bio", () => {
    render(<MentorDetailPanel mentor={sample} onClose={vi.fn()} />);

    const panel = getOpenPanel(sample);
    const scope = within(panel);

    // Name (heading) and the initials-avatar placeholder whose text
    // alternative equals the name (Req 8.2, 14.7).
    expect(scope.getByRole("heading", { name: sample.name })).toBeInTheDocument();
    const avatar = scope.getByRole("img", { name: sample.name });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent(sample.initialsAvatar);

    // Title and firm.
    expect(scope.getByText(sample.title)).toBeInTheDocument();
    expect(scope.getByText(sample.firm)).toBeInTheDocument();

    // Sectors of expertise rendered as their canonical names (Req 8.4).
    const sectorList = scope.getByRole("list", { name: /sectors of expertise/i });
    const sectorItems = within(sectorList).getAllByRole("listitem");
    expect(sectorItems.map((li) => li.textContent)).toEqual(
      sample.sectors.map(sectorLabel),
    );

    // Years of experience, mentor type, and availability.
    expect(panel.textContent).toContain(
      `${sample.yearsExperience} ${sample.yearsExperience === 1 ? "year" : "years"}`,
    );
    expect(scope.getByText(sample.mentorType)).toBeInTheDocument();
    expect(scope.getByText(sample.availability)).toBeInTheDocument();

    // The one-paragraph illustrative bio (Req 10.2).
    expect(scope.getByText(sample.bio)).toBeInTheDocument();
  });

  it("renders the IllustrativeBadge — all mentor content is synthetic (Req 10.3)", () => {
    render(<MentorDetailPanel mentor={sample} onClose={vi.fn()} />);

    const panel = getOpenPanel(sample);
    expect(within(panel).getByText("Illustrative")).toBeInTheDocument();
  });
});

describe("MentorDetailPanel — dismissal preserves prior filter state (Req 10.4)", () => {
  it("closes via the close control and preserves the active filter", () => {
    render(<MentorsPage />);

    // Establish a Filtered_State: filter by the sample's first sector so the
    // sample card stays present in the filtered slice.
    const sectorId = sample.sectors[0]!;
    fireEvent.change(screen.getByLabelText("Sector"), {
      target: { value: sectorId },
    });

    const countBefore = screen.getByText(/mentors? match$/).textContent;

    // Open the sample's detail from within the filtered slice.
    fireEvent.click(screen.getByRole("button", { name: cardName(sample) }));
    expect(getOpenPanel(sample)).toBeInTheDocument();

    // Close via the visible close control.
    fireEvent.click(
      screen.getByRole("button", { name: `Close details for ${sample.name}` }),
    );

    // Panel gone; the prior Filtered_State is intact.
    expect(queryOpenPanels()).toHaveLength(0);
    expect(screen.getByLabelText("Sector")).toHaveValue(sectorId);
    expect(screen.getByText(/mentors? match$/).textContent).toBe(countBefore);
  });

  it("closes via the Escape key and preserves the active filter", () => {
    render(<MentorsPage />);

    const sectorId = sample.sectors[0]!;
    fireEvent.change(screen.getByLabelText("Sector"), {
      target: { value: sectorId },
    });

    const countBefore = screen.getByText(/mentors? match$/).textContent;

    fireEvent.click(screen.getByRole("button", { name: cardName(sample) }));
    expect(getOpenPanel(sample)).toBeInTheDocument();

    // Escape dismisses the panel.
    fireEvent.keyDown(document, { key: "Escape" });

    expect(queryOpenPanels()).toHaveLength(0);
    expect(screen.getByLabelText("Sector")).toHaveValue(sectorId);
    expect(screen.getByText(/mentors? match$/).textContent).toBe(countBefore);
  });
});

describe("MentorDetailPanel — null mentor is a no-op (Req 10.1)", () => {
  it("renders nothing when given a null mentor", () => {
    const { container } = render(
      <MentorDetailPanel mentor={null} onClose={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(queryOpenPanels()).toHaveLength(0);
  });
});

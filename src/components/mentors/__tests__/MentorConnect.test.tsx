/**
 * MentorConnect component test (task 10.5) — Requirements 6, 8.9, 9.1, 9.2,
 * 9.3, 9.9, 9.10, 15.
 *
 * Renders the real `/mentors` client island (`MentorsPage`) and pins the
 * behaviour that replaces the former StubPage:
 *   - one card per generated mentor; the count is the deterministic
 *     `generateMentors().length`, which lies in `[24, 30]` (Req 6, 7.1);
 *   - the whole directory is synthetic, so the header carries EXACTLY ONE
 *     directory-level `IllustrativeBadge` (Req 6.3, 13);
 *   - a sample card renders its synthetic fields — name, an initials-avatar
 *     whose text alternative equals the mentor name, title, firm, sectors,
 *     years of experience, mentor type, and availability (Req 8.2, 8.4, 8.9,
 *     14.7);
 *   - the three filter controls (sector, mentor type, experience level) each
 *     expose an accessible name and there is a clear-all control (Req 9.6,
 *     14.2);
 *   - selecting a filter narrows the visible cards and the `aria-live`
 *     matching count updates (Req 9.10);
 *   - a filter combination yielding zero results shows the empty state naming
 *     the active filters (Req 9.9).
 *
 * The page is a self-contained island composed of once-generated synthetic
 * data + filter UI; it uses neither `next/link` nor `next/navigation`, so no
 * router mocks are required. State changes are driven through native
 * `<select>` controls via `fireEvent.change` (the repo has no
 * `@testing-library/user-event`).
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import MentorsPage from "@/app/mentors/page";
import { generateMentors } from "@/lib/synthetic-mentors";
import { filterMentors, EMPTY_MENTOR_FILTERS } from "@/lib/mentor-filters";
import { sectors } from "@/data/sectors";
import { MENTOR_TYPES } from "@/types";

/** The byte-stable synthetic directory backing the page. */
const mentors = generateMentors();

/** Resolve a sector id → its canonical display label (mirrors MentorCard). */
const sectorLabel = (id: string): string =>
  sectors.find((s) => s.id === id)?.name ?? id;

/** All rendered mentor cards — accessible name is `${name} — ${mentorType}`. */
const getCards = () =>
  screen.getAllByRole("button", { name: /\u2014/ }); // em dash

const matchText = (count: number) =>
  `${count} ${count === 1 ? "mentor" : "mentors"} match`;

describe("MentorsPage (Mentor Connect)", () => {
  it("replaces the stub by rendering one card per generated mentor (count in [24, 30])", () => {
    render(<MentorsPage />);

    expect(mentors.length).toBeGreaterThanOrEqual(24);
    expect(mentors.length).toBeLessThanOrEqual(30);
    expect(getCards()).toHaveLength(mentors.length);
  });

  it("marks the whole synthetic directory with exactly one directory-level Illustrative badge in the header", () => {
    render(<MentorsPage />);

    const header = screen.getByRole("region", {
      name: /mentor directory overview/i,
    });

    // Exactly one Illustrative marker overall, and it lives in the header.
    expect(screen.getAllByText(/^illustrative$/i)).toHaveLength(1);
    expect(within(header).getByText(/^illustrative$/i)).toBeInTheDocument();
  });

  it("renders a sample mentor's synthetic fields (name, initials-avatar alt, title, firm, sectors, years, type, availability)", () => {
    render(<MentorsPage />);

    const sample = mentors[0]!;
    const card = getCards().find(
      (el) => el.getAttribute("aria-label") === `${sample.name} \u2014 ${sample.mentorType}`,
    )!;
    expect(card).toBeDefined();

    const scoped = within(card);

    // Name (heading) + initials-avatar whose text alternative IS the name.
    expect(scoped.getByText(sample.name)).toBeInTheDocument();
    expect(scoped.getByRole("img", { name: sample.name })).toBeInTheDocument();

    // Title, firm.
    expect(scoped.getByText(sample.title)).toBeInTheDocument();
    expect(scoped.getByText(sample.firm)).toBeInTheDocument();

    // Mentor type, availability.
    expect(scoped.getByText(sample.mentorType)).toBeInTheDocument();
    expect(scoped.getByText(sample.availability)).toBeInTheDocument();

    // Years of experience.
    const years = sample.yearsExperience;
    expect(
      scoped.getByText(`${years} ${years === 1 ? "year" : "years"} of experience`),
    ).toBeInTheDocument();

    // Each sector id rendered as its canonical display label.
    for (const id of sample.sectors) {
      expect(scoped.getByText(sectorLabel(id))).toBeInTheDocument();
    }
  });

  it("exposes accessible filter controls (sector, mentor type, experience level) and a clear-all", () => {
    render(<MentorsPage />);

    expect(screen.getByLabelText("Sector")).toBeInTheDocument();
    expect(screen.getByLabelText("Mentor type")).toBeInTheDocument();
    expect(screen.getByLabelText("Experience level")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /clear all/i }),
    ).toBeInTheDocument();
  });

  it("narrows the visible cards and updates the aria-live matching count when a filter is selected", () => {
    render(<MentorsPage />);

    // Baseline: every card and a count reflecting the full directory.
    expect(getCards()).toHaveLength(mentors.length);
    expect(screen.getByText(matchText(mentors.length))).toBeInTheDocument();

    // Pick a mentor type that yields a proper, non-empty subset.
    const type = MENTOR_TYPES.find((t) => {
      const n = filterMentors(mentors, {
        ...EMPTY_MENTOR_FILTERS,
        mentorType: t,
      }).length;
      return n > 0 && n < mentors.length;
    })!;
    expect(type).toBeDefined();

    const expected = filterMentors(mentors, {
      ...EMPTY_MENTOR_FILTERS,
      mentorType: type,
    }).length;

    fireEvent.change(screen.getByLabelText("Mentor type"), {
      target: { value: type },
    });

    expect(getCards()).toHaveLength(expected);
    expect(screen.getByText(matchText(expected))).toBeInTheDocument();
  });

  it("shows the empty state naming the active filters when a combination matches nothing", () => {
    render(<MentorsPage />);

    // Search the synthetic data for a sector+type combination matching zero.
    let zeroSector: string | null = null;
    let zeroType: (typeof MENTOR_TYPES)[number] | null = null;
    outer: for (const sector of sectors) {
      for (const type of MENTOR_TYPES) {
        const n = filterMentors(mentors, {
          ...EMPTY_MENTOR_FILTERS,
          sector: sector.id,
          mentorType: type,
        }).length;
        if (n === 0) {
          zeroSector = sector.id;
          zeroType = type;
          break outer;
        }
      }
    }
    expect(zeroSector).not.toBeNull();
    expect(zeroType).not.toBeNull();

    fireEvent.change(screen.getByLabelText("Sector"), {
      target: { value: zeroSector! },
    });
    fireEvent.change(screen.getByLabelText("Mentor type"), {
      target: { value: zeroType! },
    });

    // Empty state shown; no cards remain.
    expect(
      screen.getByText(/no mentors match the selected filters/i),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: /\u2014/ })).toHaveLength(0);

    // The empty state names each active filter dimension and its value.
    expect(screen.getByText(`Sector: ${zeroSector!}`)).toBeInTheDocument();
    expect(screen.getByText(`Mentor type: ${zeroType!}`)).toBeInTheDocument();

    // The aria-live count reports zero matches.
    expect(screen.getByText(matchText(0))).toBeInTheDocument();
  });
});

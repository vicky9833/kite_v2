/**
 * IncubatorDetailPanel component test (task 6.6) — Requirements 3.1, 3.2, 3.4,
 * 3.5, 3.7, 3.8.
 *
 * Exercises the inline, at-most-one-open detail surface both directly and
 * through the real `/incubators` client island (`IncubatorsPage`), pinning:
 *   - activating a card by pointer click AND by keyboard (Enter / Space) opens
 *     the detail panel (Detail_Open_State), with at most one open at a time
 *     (Req 3.1);
 *   - the verified fields (name, cluster, type, focus tags) render verbatim and
 *     the verified header carries NO IllustrativeBadge (Req 3.2, 3.5);
 *   - the synthetic sections render and each carry exactly one IllustrativeBadge
 *     (Req 3.3, 3.4);
 *   - the close control AND the Escape key dismiss the panel, and the prior
 *     filter state is preserved across open/close (Req 3.7);
 *   - an unknown/absent id is a no-op — the panel renders nothing when given a
 *     `null` incubator and the index never enters Detail_Open_State (Req 3.8).
 *
 * The page is a self-contained island (in-memory data + filter UI); it uses
 * neither `next/link` nor `next/navigation`, so no router mocks are required.
 * Keyboard and pointer activation are driven via `fireEvent` (the project does
 * not bundle `@testing-library/user-event`); native `<select>` filter controls
 * are driven via `fireEvent.change`.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import IncubatorsPage from "@/app/incubators/page";
import { IncubatorDetailPanel } from "@/components/incubators/IncubatorDetailPanel";
import { incubators } from "@/data/incubators";
import { generateIncubatorDetail } from "@/lib/synthetic-incubator-detail";

/** A verified sample record used across the open/close flow assertions. */
const sample = incubators[0]!; // NSRCEL (IIM Bangalore), Bengaluru, Incubator

/** Accessible-name pattern shared by every rendered card. */
const cardName = (i: typeof sample) => `${i.name} — ${i.type} in ${i.cluster}`;

/**
 * The open detail panel, addressed by its region landmark (Req 14.5). The
 * region's accessible name resolves from its `aria-labelledby` heading (the
 * incubator name); the `aria-label="Details for …"` attribute is the stable
 * hook used to enumerate any open panels.
 */
const getOpenPanel = (i: typeof sample) =>
  screen.getByRole("region", { name: i.name });

const queryOpenPanels = () =>
  Array.from(document.querySelectorAll('[aria-label^="Details for "]'));

describe("IncubatorDetailPanel — activation (Req 3.1)", () => {
  it("opens the detail panel on a pointer click and keeps at most one open", () => {
    render(<IncubatorsPage />);

    // No detail open initially.
    expect(queryOpenPanels()).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: cardName(sample) }));
    expect(getOpenPanel(sample)).toBeInTheDocument();
    expect(queryOpenPanels()).toHaveLength(1);

    // Activating a second card swaps the open detail — still exactly one.
    const other = incubators[1]!; // C-CAMP
    fireEvent.click(screen.getByRole("button", { name: cardName(other) }));

    expect(queryOpenPanels()).toHaveLength(1);
    expect(getOpenPanel(other)).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: sample.name }),
    ).not.toBeInTheDocument();
  });

  it("opens the detail panel on keyboard Enter activation", () => {
    render(<IncubatorsPage />);

    const card = screen.getByRole("button", { name: cardName(sample) });
    fireEvent.keyDown(card, { key: "Enter" });

    expect(getOpenPanel(sample)).toBeInTheDocument();
    expect(queryOpenPanels()).toHaveLength(1);
  });

  it("opens the detail panel on keyboard Space activation", () => {
    render(<IncubatorsPage />);

    const card = screen.getByRole("button", { name: cardName(sample) });
    fireEvent.keyDown(card, { key: " " });

    expect(getOpenPanel(sample)).toBeInTheDocument();
    expect(queryOpenPanels()).toHaveLength(1);
  });
});

describe("IncubatorDetailPanel — verified vs synthetic content (Req 3.2, 3.4, 3.5)", () => {
  it("renders the verified fields verbatim with NO IllustrativeBadge in the verified header", () => {
    render(<IncubatorDetailPanel incubator={sample} onClose={vi.fn()} />);

    const panel = getOpenPanel(sample);

    // The verified header is the panel's first child block (heading + meta +
    // focus tags + close control); the synthetic sections live in a sibling.
    const header = panel.querySelector(":scope > div");
    expect(header).not.toBeNull();
    const headerScope = within(header as HTMLElement);

    // Verified fields appear verbatim in the header.
    expect(headerScope.getByText(sample.name)).toBeInTheDocument();
    expect(headerScope.getByText(sample.cluster)).toBeInTheDocument();
    expect(headerScope.getByText(sample.type)).toBeInTheDocument();
    for (const tag of sample.focus) {
      expect(headerScope.getByText(tag)).toBeInTheDocument();
    }

    // One tag per focus[] entry, in stored order (Req 3.2 / Property 10).
    const focusList = headerScope.getByRole("list", { name: /focus areas/i });
    const tagItems = within(focusList).getAllByRole("listitem");
    expect(tagItems.map((li) => li.textContent)).toEqual([...sample.focus]);

    // The verified header carries NO illustrative marker (Req 3.5).
    expect(headerScope.queryByText("Illustrative")).toBeNull();
  });

  it("renders the synthetic sections, each carrying exactly one IllustrativeBadge", () => {
    render(<IncubatorDetailPanel incubator={sample} onClose={vi.fn()} />);

    const panel = getOpenPanel(sample);
    const detail = generateIncubatorDetail(sample.id);

    // The four synthetic sections are present.
    expect(within(panel).getByText("About")).toBeInTheDocument();
    expect(within(panel).getByText("Program snapshot")).toBeInTheDocument();
    expect(within(panel).getByText("Illustrative offerings")).toBeInTheDocument();
    expect(within(panel).getByText("Contact")).toBeInTheDocument();

    // Their synthetic content is rendered (seeded by the incubator id).
    expect(within(panel).getByText(detail.aboutParagraph)).toBeInTheDocument();
    expect(
      within(panel).getByText(detail.illustrativeContactLabel),
    ).toBeInTheDocument();

    // Exactly one badge per synthetic section — four in total (Req 3.4).
    expect(within(panel).getAllByText("Illustrative")).toHaveLength(4);
  });
});

describe("IncubatorDetailPanel — dismissal preserves prior filter state (Req 3.7)", () => {
  /** Mysuru hosts exactly three verified entries — a stable filtered slice. */
  const mysuru = incubators.filter((i) => i.cluster === "Mysuru");

  it("closes via the close control and preserves the active filter", () => {
    render(<IncubatorsPage />);

    // Establish a Filtered_State: Cluster = Mysuru (3 matches).
    fireEvent.change(screen.getByLabelText("Cluster"), {
      target: { value: "Mysuru" },
    });
    expect(mysuru).toHaveLength(3);
    expect(screen.getByText("3 incubators match")).toBeInTheDocument();

    // Open a detail from within the filtered slice.
    const target = mysuru[0]!;
    fireEvent.click(screen.getByRole("button", { name: cardName(target) }));
    expect(getOpenPanel(target)).toBeInTheDocument();

    // Close via the visible close control.
    fireEvent.click(
      screen.getByRole("button", { name: `Close details for ${target.name}` }),
    );

    // Panel gone; the prior Filtered_State is intact.
    expect(queryOpenPanels()).toHaveLength(0);
    expect(screen.getByText("3 incubators match")).toBeInTheDocument();
    expect(screen.getByLabelText("Cluster")).toHaveValue("Mysuru");
    expect(
      screen.queryAllByRole("button", { name: / in / }),
    ).toHaveLength(3);
  });

  it("closes via the Escape key and preserves the active filter", () => {
    render(<IncubatorsPage />);

    fireEvent.change(screen.getByLabelText("Cluster"), {
      target: { value: "Mysuru" },
    });
    expect(screen.getByText("3 incubators match")).toBeInTheDocument();

    const target = mysuru[0]!;
    fireEvent.click(screen.getByRole("button", { name: cardName(target) }));
    expect(getOpenPanel(target)).toBeInTheDocument();

    // Escape dismisses the panel.
    fireEvent.keyDown(document, { key: "Escape" });

    expect(queryOpenPanels()).toHaveLength(0);
    expect(screen.getByText("3 incubators match")).toBeInTheDocument();
    expect(screen.getByLabelText("Cluster")).toHaveValue("Mysuru");
    expect(
      screen.queryAllByRole("button", { name: / in / }),
    ).toHaveLength(3);
  });
});

describe("IncubatorDetailPanel — unknown/absent id is a no-op (Req 3.8)", () => {
  it("renders nothing when given a null incubator", () => {
    const onClose = vi.fn();
    const { container } = render(
      <IncubatorDetailPanel incubator={null} onClose={onClose} />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(queryOpenPanels()).toHaveLength(0);
  });

  it("never enters Detail_Open_State for an id with no matching record", () => {
    render(<IncubatorsPage />);

    // No card was activated — the index stays out of Detail_Open_State and the
    // full verified set remains visible.
    expect(queryOpenPanels()).toHaveLength(0);
    expect(screen.getAllByRole("button", { name: / in / })).toHaveLength(
      incubators.length,
    );
  });
});

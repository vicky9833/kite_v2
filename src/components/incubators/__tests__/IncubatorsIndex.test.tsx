/**
 * IncubatorsIndex component test (task 6.5) — Requirements 1, 2.3, 2.8, 2.10,
 * 2.11, 15.
 *
 * Renders the real `/incubators` client island (`IncubatorsPage`) and pins the
 * behaviour that replaces the former StubPage:
 *   - all 24 verified incubator records render as cards (Req 1.2, 1.6);
 *   - the verified "164+" canonical figure and the "representative verified
 *     subset" label are present (Req 1.4, 1.5);
 *   - a sample card renders its verified fields verbatim — name, cluster, type,
 *     and one tag per `focus[]` entry (Req 1.3, 1.7);
 *   - the three filter controls (cluster, focus, type) each expose an
 *     accessible name and there is a clear-all control (Req 2.3, 14.2);
 *   - selecting a filter narrows the visible cards and the `aria-live` matching
 *     count updates (Req 2.8, 2.11);
 *   - a filter combination yielding zero results shows the empty state naming
 *     the active filters (Req 2.10).
 *
 * The page is a self-contained island composed of in-memory data + filter UI;
 * it uses neither `next/link` nor `next/navigation`, so no router mocks are
 * required. State changes are driven through native `<select>` controls via
 * `fireEvent.change`.
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import IncubatorsPage from "@/app/incubators/page";
import { incubators } from "@/data/incubators";

/** All rendered incubator cards — their accessible name is `${name} — ${type} in ${cluster}`. */
const getCards = () => screen.getAllByRole("button", { name: / in / });

describe("IncubatorsPage (Incubators Index)", () => {
  it("replaces the stub by rendering one card per verified incubator (24)", () => {
    render(<IncubatorsPage />);

    expect(incubators).toHaveLength(24);
    expect(getCards()).toHaveLength(incubators.length);
  });

  it("states the verified 164+ figure and the representative-subset label", () => {
    render(<IncubatorsPage />);

    expect(screen.getByText(/164\+/)).toBeInTheDocument();
    expect(
      screen.getByText(/representative verified subset/i),
    ).toBeInTheDocument();
  });

  it("renders a sample incubator's verified fields (name, cluster, type, focus tags)", () => {
    render(<IncubatorsPage />);

    const sample = incubators[0]!; // NSRCEL (IIM Bangalore)
    const card = screen.getByRole("button", {
      name: `${sample.name} — ${sample.type} in ${sample.cluster}`,
    });

    expect(within(card).getByText(sample.name)).toBeInTheDocument();
    expect(within(card).getByText(sample.cluster)).toBeInTheDocument();
    expect(within(card).getByText(sample.type)).toBeInTheDocument();
    for (const tag of sample.focus) {
      expect(within(card).getByText(tag)).toBeInTheDocument();
    }
  });

  it("exposes accessible filter controls (cluster, focus, type) and a clear-all", () => {
    render(<IncubatorsPage />);

    expect(screen.getByLabelText("Cluster")).toBeInTheDocument();
    expect(screen.getByLabelText("Focus")).toBeInTheDocument();
    expect(screen.getByLabelText("Type")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /clear all/i }),
    ).toBeInTheDocument();
  });

  it("narrows the visible cards and updates the aria-live matching count when a filter is selected", () => {
    render(<IncubatorsPage />);

    // Baseline: all 24 cards and the count reflect the full set.
    expect(getCards()).toHaveLength(24);
    expect(screen.getByText("24 incubators match")).toBeInTheDocument();

    // Mysuru has exactly three verified entries.
    const mysuruCount = incubators.filter(
      (i) => i.cluster === "Mysuru",
    ).length;
    expect(mysuruCount).toBe(3);

    fireEvent.change(screen.getByLabelText("Cluster"), {
      target: { value: "Mysuru" },
    });

    expect(getCards()).toHaveLength(mysuruCount);
    expect(
      screen.getByText(`${mysuruCount} incubators match`),
    ).toBeInTheDocument();
  });

  it("shows the empty state naming the active filters when a combination matches nothing", () => {
    render(<IncubatorsPage />);

    // Mysuru hosts only Incubators, so Mysuru + Accelerator yields zero.
    fireEvent.change(screen.getByLabelText("Cluster"), {
      target: { value: "Mysuru" },
    });
    fireEvent.change(screen.getByLabelText("Type"), {
      target: { value: "Accelerator" },
    });

    expect(
      screen.getByText(/no incubators match the selected filters/i),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("button", { name: / in / })).toHaveLength(0);

    // The empty state names each active filter dimension and its value.
    expect(screen.getByText("Cluster: Mysuru")).toBeInTheDocument();
    expect(screen.getByText("Type: Accelerator")).toBeInTheDocument();

    // The aria-live count reports zero matches.
    expect(screen.getByText("0 incubators match")).toBeInTheDocument();
  });
});

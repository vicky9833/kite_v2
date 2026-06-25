// src/components/charts/__tests__/charts.test.tsx
//
// Unit tests for the shared chart primitives and the nine chart wrappers
// (tasks 4.1 / 4.2). We verify:
//   • ChartFrame emits role="group" + aria-label and an ADJACENT sr-only
//     <figcaption> prose summary (Req 28.1, 28.2).
//   • ChartSkeleton renders a reserved-height placeholder (no CLS).
//   • Each wrapper's Chart_Empty branch (data.length === 0) renders ChartEmpty.
//   • Each wrapper's Chart_Loaded branch renders the accessible ChartFrame with
//     aria-label + sr-only summary.
//   • No decorative gradient/blob/glow classes are applied anywhere (Req 29.6).
//
// Recharts' ResponsiveContainer measures its parent, which has zero size in
// jsdom. We mock it to inject a fixed width/height into the chart child so the
// SVG actually renders.
import { describe, it, expect, vi } from "vitest";
import { cloneElement, isValidElement } from "react";
import { render, screen } from "@testing-library/react";

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      isValidElement(children)
        ? cloneElement(children as React.ReactElement, {
            width: 600,
            height: 280,
          })
        : children,
  };
});

import { ChartFrame } from "../ChartFrame";
import { ChartSkeleton } from "../ChartSkeleton";
import { ChartEmpty } from "../ChartEmpty";
import { ChartLineFunding } from "../ChartLineFunding";
import { ChartBarSectorStartups } from "../ChartBarSectorStartups";
import { ChartBarHorizontalSchemes } from "../ChartBarHorizontalSchemes";
import { ChartAreaFundingTimeline } from "../ChartAreaFundingTimeline";
import { ChartBarRegionStartups } from "../ChartBarRegionStartups";
import { ChartBarStackedDisbursement } from "../ChartBarStackedDisbursement";
import { ChartTreemapSectors } from "../ChartTreemapSectors";
import { ChartBarHorizontalSectorGrowth } from "../ChartBarHorizontalSectorGrowth";
import { ChartPieGeneric } from "../ChartPieGeneric";
import type {
  ClusterCountDatum,
  DemographicSlice,
  FundingPoint,
  FundingTimelinePoint,
  SchemeDisbursementDatum,
  SectorGrowthDatum,
  SectorTreemapDatum,
  StackedDisbursementDatum,
} from "@/types";

/** Asserts the container has no decorative gradient/blob/glow utility classes. */
function expectNoDecorativeClasses(container: HTMLElement): void {
  const banned = /(gradient|blob|glow)/i;
  const offenders = Array.from(container.querySelectorAll<HTMLElement>("*")).filter(
    (el) => banned.test(el.getAttribute("class") ?? ""),
  );
  expect(offenders).toHaveLength(0);
}

// --- Fixtures -------------------------------------------------------------
const funding: FundingPoint[] = [
  { month: "Jan", rupeesCrore: 12 },
  { month: "Feb", rupeesCrore: 18 },
  { month: "Mar", rupeesCrore: 31 },
];
const clusters: ClusterCountDatum[] = [
  { cluster: "Bengaluru", count: 120 },
  { cluster: "Mysuru", count: 40 },
];
const schemes: SchemeDisbursementDatum[] = [
  { schemeId: "a", schemeName: "Idea2PoC", rupees: 5000000 },
  { schemeId: "b", schemeName: "Seed Fund", rupees: 3000000 },
];
const timeline: FundingTimelinePoint[] = [
  { quarter: "Q1", rupeesCrore: 100 },
  { quarter: "Q2", rupeesCrore: 140 },
];
const stacked: StackedDisbursementDatum[] = [
  { cluster: "Bengaluru", fiscal: 80, grant: 20 },
  { cluster: "Mysuru", fiscal: 30, grant: 10 },
];
const treemap: SectorTreemapDatum[] = [
  { sectorId: "fintech", name: "FinTech", startupCount: 50, fundingIntensity: 0.8 },
  { sectorId: "health", name: "HealthTech", startupCount: 30, fundingIntensity: 0.4 },
];
const growth: SectorGrowthDatum[] = [
  { sectorId: "fintech", name: "FinTech", growthPct: 42 },
  { sectorId: "health", name: "HealthTech", growthPct: 30 },
];
const slices: DemographicSlice[] = [
  { label: "Women-led", value: 25 },
  { label: "Other", value: 75 },
];

// --- Primitives -----------------------------------------------------------
describe("ChartFrame", () => {
  it("emits role=group + aria-label and an adjacent sr-only figcaption summary", () => {
    render(
      <ChartFrame ariaLabel="Line chart of monthly funding for FinTech" srSummary="Funding rose steadily.">
        <div>child</div>
      </ChartFrame>,
    );
    const group = screen.getByRole("group", {
      name: "Line chart of monthly funding for FinTech",
    });
    expect(group).toBeInTheDocument();
    expect(group.tagName.toLowerCase()).toBe("figure");

    const caption = group.querySelector("figcaption");
    expect(caption).not.toBeNull();
    expect(caption).toHaveClass("sr-only");
    expect(caption).toHaveTextContent("Funding rose steadily.");
  });

  it("reserves an explicit height for no CLS", () => {
    const { container } = render(
      <ChartFrame ariaLabel="x" srSummary="y" height={320}>
        <div>child</div>
      </ChartFrame>,
    );
    const sized = container.querySelector<HTMLElement>('div[style*="height"]');
    expect(sized?.style.height).toBe("320px");
  });
});

describe("ChartSkeleton", () => {
  it("renders a reserved-height busy placeholder", () => {
    const { container } = render(<ChartSkeleton height={240} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    const sized = container.querySelector<HTMLElement>('div[style*="height"]');
    expect(sized?.style.height).toBe("240px");
  });
});

describe("ChartEmpty", () => {
  it("renders the empty label without a chart frame group", () => {
    render(<ChartEmpty label="No data here" />);
    expect(screen.getByText("No data here")).toBeInTheDocument();
    expect(screen.queryByRole("group")).not.toBeInTheDocument();
  });
});

// --- Empty branches for every wrapper ------------------------------------
describe("wrappers — Chart_Empty branch", () => {
  it("each wrapper renders ChartEmpty (no group) when data is empty", () => {
    const cases = [
      <ChartLineFunding key="a" data={[]} sectorName="FinTech" />,
      <ChartBarSectorStartups key="b" data={[]} sectorName="FinTech" />,
      <ChartBarHorizontalSchemes key="c" data={[]} sectorName="FinTech" />,
      <ChartAreaFundingTimeline key="d" data={[]} />,
      <ChartBarRegionStartups key="e" data={[]} />,
      <ChartBarStackedDisbursement key="f" data={[]} />,
      <ChartTreemapSectors key="g" data={[]} />,
      <ChartBarHorizontalSectorGrowth key="h" data={[]} />,
      <ChartPieGeneric
        key="i"
        data={[]}
        title="Women-led"
        ariaLabel="Pie chart of women-led share"
      />,
    ];
    for (const element of cases) {
      const { unmount } = render(element);
      expect(screen.queryByRole("group")).not.toBeInTheDocument();
      // A "No ..." empty message is shown.
      expect(screen.getByText(/^No /i)).toBeInTheDocument();
      unmount();
    }
  });
});

// --- Loaded branches: accessible frame + sr-only summary -----------------
describe("wrappers — Chart_Loaded branch", () => {
  it("ChartLineFunding renders an accessible frame with aria-label + sr-only summary", () => {
    const { container } = render(
      <ChartLineFunding data={funding} sectorName="FinTech" />,
    );
    const group = screen.getByRole("group", {
      name: /Line chart of monthly funding for FinTech/i,
    });
    expect(group.querySelector("figcaption.sr-only")).toHaveTextContent(/Illustrative data\./i);
    expectNoDecorativeClasses(container);
  });

  it("renders accessible frames for every other wrapper with non-empty data", () => {
    const cases: Array<{ ui: React.ReactElement; name: RegExp }> = [
      { ui: <ChartBarSectorStartups data={clusters} sectorName="FinTech" />, name: /startup counts by cluster/i },
      { ui: <ChartBarHorizontalSchemes data={schemes} sectorName="FinTech" />, name: /scheme disbursement/i },
      { ui: <ChartAreaFundingTimeline data={timeline} />, name: /funding over time/i },
      { ui: <ChartBarRegionStartups data={clusters} />, name: /startup counts by region/i },
      { ui: <ChartBarStackedDisbursement data={stacked} />, name: /disbursement by cluster/i },
      { ui: <ChartTreemapSectors data={treemap} />, name: /treemap of sectors/i },
      { ui: <ChartBarHorizontalSectorGrowth data={growth} />, name: /sectors by growth/i },
      {
        ui: (
          <ChartPieGeneric
            data={slices}
            title="Women-led"
            ariaLabel="Pie chart of women-led startup share"
          />
        ),
        name: /women-led startup share/i,
      },
    ];
    for (const { ui, name } of cases) {
      const { container, unmount } = render(ui);
      const group = screen.getByRole("group", { name });
      expect(group.querySelector("figcaption")).toHaveClass("sr-only");
      expect(group.querySelector("figcaption")?.textContent ?? "").not.toBe("");
      expectNoDecorativeClasses(container);
      unmount();
    }
  });
});

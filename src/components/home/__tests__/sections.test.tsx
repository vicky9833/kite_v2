/**
 * Component / EXAMPLE tests — Home section fixed content & backgrounds (task 4.20).
 *
 * These are deterministic example tests (NOT property-based tests). They render
 * each Home section in isolation and assert its heading/title, background token
 * class, fixed copy, and child cardinality against the ACTUAL implemented
 * components and the VERIFIED data modules under `src/data/`.
 *
 * Where the implemented component intentionally renders different fixed strings
 * than the task brief's illustrative copy, the assertions follow the ACTUAL
 * rendered output and the divergence is called out in an inline NOTE comment so
 * the discrepancy is traceable (see the subagent report for the full list).
 *
 * References Req 8 (Hero), 9 (Live Metrics), 10 (Quick Actions), 11 (Flagship
 * Programs), 12 (Clusters), 13 (All Schemes), 14 (Sector Explorer), 15 (Events),
 * 16 (GIA Countries), 17 (Social Proof) — fixed-content / background criteria.
 *
 * Resilience notes for jsdom + Radix/Next:
 *  - jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView / pointer
 *    capture) live in `src/test/setup.ts`.
 *  - `next/link` is mocked to a plain anchor so links render without an App
 *    Router provider; `next/navigation`'s `useRouter` is mocked so the client
 *    sections (QuickActions) can render and `safeNavigate` never crashes.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { HeroSection } from "@/components/home/HeroSection";
import { LiveMetricsSection } from "@/components/home/LiveMetricsSection";
import { QuickActionsSection } from "@/components/home/QuickActionsSection";
import { FlagshipProgramsSection } from "@/components/home/FlagshipProgramsSection";
import { ClustersSection } from "@/components/home/ClustersSection";
import { AllSchemesSection } from "@/components/home/AllSchemesSection";
import { SectorExplorerSection } from "@/components/home/SectorExplorerSection";
import { EventsPreviewSection } from "@/components/home/EventsPreviewSection";
import { GIACountriesSection } from "@/components/home/GIACountriesSection";
import { SocialProofSection } from "@/components/home/SocialProofSection";

import { ecosystemStats, homeStatsStripIds } from "@/data/ecosystem-stats";
import { quickActions } from "@/data/quick-actions";
import { flagshipPrograms } from "@/data/flagship-programs";
import { clusters } from "@/data/clusters";
import { sectors } from "@/data/sectors";
import { events } from "@/data/events";
import { giaCountries } from "@/data/gia-countries";
import { partnerLogos } from "@/data/social-proof";
import { isValidGIACountry, selectPreview } from "@/lib/utils";
import type { Stat } from "@/types";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                               */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so sections render without an App
// Router context provider (these structural tests only care about hrefs/labels).
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string | { pathname?: string };
    children: React.ReactNode;
  }) => (
    <a href={typeof href === "string" ? href : (href?.pathname ?? "#")} {...props}>
      {children}
    </a>
  ),
}));

// Mock the App Router so client sections (QuickActionsSection) can render and
// `safeNavigate` never crashes.
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

beforeEach(() => {
  pushMock.mockClear();
});

/** Query the single <section> element rendered by a section component. */
function getSection(container: HTMLElement): HTMLElement {
  const section = container.querySelector("section");
  expect(section).not.toBeNull();
  return section as HTMLElement;
}

/* -------------------------------------------------------------------------- */
/* 1. HeroSection (Req 8)                                                     */
/* -------------------------------------------------------------------------- */

describe("HeroSection", () => {
  it("renders the actual hero heading on a bg-dark section", () => {
    const { container } = render(<HeroSection />);

    // Verified-data heading (reconciled): "Karnataka's Innovation & Technology
    // Ecosystem" — kept per founder direction over the older brief copy.
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toMatch(/Innovation & Technology Ecosystem/);

    // Background token on the section.
    expect(getSection(container).className).toContain("bg-dark");
  });

  it("renders exactly two CTAs to /register and /schemes", () => {
    render(<HeroSection />);

    // Reconciled: the second CTA is now "Explore Schemes & Benefits" to match
    // the navigation/footer terminology used elsewhere in the build.
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);

    const register = screen.getByRole("link", { name: "Register Your Startup" });
    expect(register).toHaveAttribute("href", "/register");

    const schemes = screen.getByRole("link", { name: "Explore Schemes & Benefits" });
    expect(schemes).toHaveAttribute("href", "/schemes");
  });

  it("renders the verified ecosystem scale supporting line", () => {
    render(<HeroSection />);
    expect(screen.getByText(/183 soonicorns/)).toBeInTheDocument();
  });

  it("renders the four R8.8 trust badges as a thin text row", () => {
    render(<HeroSection />);
    // Reconciled (R8.8): four government credibility signals rendered as
    // understated text (not boxed/pilled chips).
    expect(screen.getByText("DPIIT Recognized")).toBeInTheDocument();
    expect(screen.getByText("25% Women-Led")).toBeInTheDocument();
    expect(screen.getByText("#14 GSER 2025")).toBeInTheDocument();
    expect(screen.getByText("32 GIA Partner Countries")).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* 2. LiveMetricsSection (Req 9)                                              */
/* -------------------------------------------------------------------------- */

describe("LiveMetricsSection", () => {
  /** The six curated stats resolved from `homeStatsStripIds`, in order. */
  const homeStats: Stat[] = homeStatsStripIds
    .map((id) => ecosystemStats.find((stat) => stat.id === id))
    .filter((stat): stat is Stat => stat !== undefined);

  it("renders the 'Live Metrics' eyebrow and the actual section title", () => {
    render(<LiveMetricsSection />);

    expect(screen.getByText("Live Metrics")).toBeInTheDocument();

    // Reconciled (R9.1): the title is restored to "Karnataka's Digital Landscape".
    expect(
      screen.getByRole("heading", { name: "Karnataka's Digital Landscape" }),
    ).toBeInTheDocument();
  });

  it("renders exactly six StatCards from the curated home strip selection", () => {
    const { container } = render(<LiveMetricsSection />);

    // Sanity: the curated selection itself resolves to six stats.
    expect(homeStats).toHaveLength(6);

    // The stat grid holds exactly six card children.
    const grid = container.querySelector("div.grid");
    expect(grid).not.toBeNull();
    expect((grid as HTMLElement).childElementCount).toBe(6);

    // Each curated stat's label is rendered.
    for (const stat of homeStats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    }
  });
});

/* -------------------------------------------------------------------------- */
/* 3. QuickActionsSection (Req 10)                                            */
/* -------------------------------------------------------------------------- */

describe("QuickActionsSection", () => {
  it("renders the title on a bg-surface section", () => {
    const { container } = render(<QuickActionsSection />);

    expect(
      screen.getByRole("heading", { name: "What are you looking for?" }),
    ).toBeInTheDocument();
    expect(getSection(container).className).toContain("bg-surface");
  });

  it("renders exactly eight action cards", () => {
    render(<QuickActionsSection />);

    // Each QuickActionCard exposes role="link".
    const actionCards = screen.getAllByRole("link");
    expect(actionCards).toHaveLength(8);
    expect(quickActions).toHaveLength(8);
  });
});

/* -------------------------------------------------------------------------- */
/* 4. FlagshipProgramsSection (Req 11)                                        */
/* -------------------------------------------------------------------------- */

describe("FlagshipProgramsSection", () => {
  it("renders the actual policy title on a bg-card section", () => {
    const { container } = render(<FlagshipProgramsSection />);

    // NOTE (discrepancy): the implemented title uses an EN DASH —
    // "Karnataka Startup Policy 2025–2030" — not the brief's hyphen "2025-2030".
    expect(
      screen.getByRole("heading", { name: /Karnataka Startup Policy 2025.2030/ }),
    ).toBeInTheDocument();
    expect(getSection(container).className).toContain("bg-card");
  });

  it("renders exactly six program cards", () => {
    render(<FlagshipProgramsSection />);

    // Each FlagshipProgramCard renders as an <article> (role "article").
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(flagshipPrograms).toHaveLength(6);
  });
});

/* -------------------------------------------------------------------------- */
/* 5. ClustersSection (Req 12)                                                */
/* -------------------------------------------------------------------------- */

describe("ClustersSection", () => {
  it("renders the six valid clusters in source order on a bg-surface section", () => {
    const { container } = render(<ClustersSection />);

    expect(getSection(container).className).toContain("bg-surface");

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(6);

    // Each card's <h3> heading is the cluster name, in source order.
    const renderedNames = cards.map(
      (card) => within(card).getByRole("heading", { level: 3 }).textContent,
    );
    expect(renderedNames).toEqual(clusters.map((c) => c.name));
  });

  it("renders the known 'Mysuru' cluster", () => {
    render(<ClustersSection />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Mysuru" }),
    ).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* 6. AllSchemesSection (Req 13)                                              */
/* -------------------------------------------------------------------------- */

describe("AllSchemesSection", () => {
  it("renders the three filter tabs", () => {
    render(<AllSchemesSection />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual([
      "All",
      "Fiscal Incentives",
      "Grant-in-Aid",
    ]);
  });

  it("renders an Eligibility column header", () => {
    render(<AllSchemesSection />);
    expect(
      screen.getByRole("columnheader", { name: "Eligibility" }),
    ).toBeInTheDocument();
  });

  it("renders a 'View All 22 Schemes' link to /schemes", () => {
    render(<AllSchemesSection />);
    const viewAll = screen.getByRole("link", { name: "View All 22 Schemes" });
    expect(viewAll).toHaveAttribute("href", "/schemes");
  });
});

/* -------------------------------------------------------------------------- */
/* 7. SectorExplorerSection (Req 14)                                          */
/* -------------------------------------------------------------------------- */

describe("SectorExplorerSection", () => {
  it("renders all twenty sector chips on a bg-surface section", () => {
    const { container } = render(<SectorExplorerSection />);

    expect(getSection(container).className).toContain("bg-surface");

    // Each SectorChip renders as a <button>.
    const chips = screen.getAllByRole("button");
    expect(chips).toHaveLength(20);
    expect(sectors).toHaveLength(20);
  });

  it("renders the known 'FinTech' sector chip", () => {
    render(<SectorExplorerSection />);
    expect(screen.getByRole("button", { name: "FinTech" })).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* 8. EventsPreviewSection (Req 15)                                           */
/* -------------------------------------------------------------------------- */

describe("EventsPreviewSection", () => {
  it("renders 4–6 event cards sorted ascending by start date", () => {
    render(<EventsPreviewSection />);

    const cards = screen.getAllByRole("article");
    // NOTE: the section caps the 4–6 sorted preview to the first 4 rows.
    expect(cards.length).toBeGreaterThanOrEqual(4);
    expect(cards.length).toBeLessThanOrEqual(6);

    // Rendered order matches the ascending-by-startDate preview order.
    const renderedNames = cards.map(
      (card) => within(card).getByRole("heading", { level: 3 }).textContent,
    );
    const expectedNames = selectPreview(events)
      .slice(0, cards.length)
      .map((e) => e.name);
    expect(renderedNames).toEqual(expectedNames);
  });

  it("renders a 'View All Events' link to /events and a known event name", () => {
    render(<EventsPreviewSection />);

    // NOTE (discrepancy): the implemented "view all" link is labelled
    // "View All Events" (not just "View All").
    const viewAll = screen.getByRole("link", { name: "View All Events" });
    expect(viewAll).toHaveAttribute("href", "/events");

    // Earliest event by start date (2026-07-10) is the known first card.
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "K-Combinator Masterclass Series",
      }),
    ).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* 9. GIACountriesSection (Req 16)                                            */
/* -------------------------------------------------------------------------- */

describe("GIACountriesSection", () => {
  const validCountries = giaCountries.filter(isValidGIACountry);

  it("renders the '32 Partner Countries' title on a bg-dark section", () => {
    const { container } = render(<GIACountriesSection />);

    expect(
      screen.getByRole("heading", { level: 2, name: "32 Partner Countries" }),
    ).toBeInTheDocument();
    expect(getSection(container).className).toContain("bg-dark");
  });

  it("renders one tile per valid partner country, with names", () => {
    render(<GIACountriesSection />);

    const tiles = screen.getAllByRole("listitem");
    expect(tiles).toHaveLength(validCountries.length);

    // A known country name (the first valid entry) is rendered.
    const firstName = validCountries[0]?.name;
    expect(firstName).toBeTruthy();
    expect(screen.getByText(firstName as string)).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* 10. SocialProofSection (Req 17)                                            */
/* -------------------------------------------------------------------------- */

describe("SocialProofSection", () => {
  it("renders the 'Ecosystem Partners' heading with border-y + bg-card", () => {
    const { container } = render(<SocialProofSection />);

    expect(
      screen.getByRole("heading", { name: "Ecosystem Partners" }),
    ).toBeInTheDocument();

    const className = getSection(container).className;
    expect(className).toContain("border-y");
    expect(className).toContain("bg-card");
  });

  it("renders exactly ten partner logos", () => {
    render(<SocialProofSection />);

    const logos = screen.getAllByRole("listitem");
    expect(logos).toHaveLength(10);
    expect(partnerLogos).toHaveLength(10);
  });
});

/* eslint-disable react/display-name -- inline chart-barrel mock stubs need no display name */
/**
 * Investor Connect hero-anchor e2e (task 7.6) — Requirements 7.3, 7.4, 15.2.
 *
 * Pins the cross-section CTA wiring that drives the Investor Connect journey:
 *   - the hero "View Live Deal Flow" CTA resolves to the in-page `#deals`
 *     anchor (Req 7.3);
 *   - the hero "Get Investor Access" CTA and the closing
 *     "Begin Onboarding" CTA both target `/investors/onboard` (Req 7.4, 15.2).
 *
 * The real `/investors` page lazy-loads its below-the-fold sections via
 * `next/dynamic`, so — mirroring the dashboard e2e tests — the hero and the
 * onboarding CTA sections are imported and rendered DIRECTLY from their own
 * files rather than through the page, sidestepping the dynamic-import boundary.
 *
 * jsdom / Next notes (mirrors dashboards.e2e.test.tsx):
 *  - `next/link` → plain anchor and `next/navigation` so the CTAs render
 *    without an App Router provider.
 *  - `@/components/charts` (the dynamic barrel) → lightweight stubs, kept here
 *    for parity even though the rendered sections are chart-free.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                                */
/* -------------------------------------------------------------------------- */

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

vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/investors",
}));

vi.mock("@/components/charts", () => {
  const stub = (label: string) => () =>
    React.createElement("div", { "data-chart-stub": label }, label);
  return {
    __esModule: true,
    ChartBarHorizontalFunding: stub("bar-horizontal-funding"),
    ChartLineFunding: stub("line-funding"),
    ChartFrame: ({ children }: { children?: React.ReactNode }) =>
      React.createElement("div", null, children),
    ChartSkeleton: () => React.createElement("div", { "data-chart-skeleton": "" }),
  };
});

// Imported AFTER the mocks so the sections pick up the stubs.
import { InvestorHeroStrip } from "@/components/investors/InvestorHeroStrip";
import { InvestorOnboardingCta } from "@/components/investors/InvestorOnboardingCta";

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("Investor Connect hero anchor + onboarding CTAs (e2e, task 7.6)", () => {
  it("the hero 'View Live Deal Flow' CTA anchors to #deals (Req 7.3)", () => {
    render(<InvestorHeroStrip />);

    const dealFlowCta = screen.getByRole("link", {
      name: /View Live Deal Flow/i,
    });
    expect(dealFlowCta.getAttribute("href")).toMatch(/#deals$/);
  });

  it("the hero 'Get Investor Access' CTA targets /investors/onboard (Req 7.4)", () => {
    render(<InvestorHeroStrip />);

    expect(
      screen.getByRole("link", { name: /Get Investor Access/i }),
    ).toHaveAttribute("href", "/investors/onboard");
  });

  it("the closing 'Begin Onboarding' CTA targets /investors/onboard (Req 15.2)", () => {
    render(<InvestorOnboardingCta />);

    expect(
      screen.getByRole("link", { name: /Begin Onboarding/i }),
    ).toHaveAttribute("href", "/investors/onboard");
  });
});

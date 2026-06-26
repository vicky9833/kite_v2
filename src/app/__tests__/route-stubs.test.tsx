/**
 * Route content integration test.
 *
 * Every route that previously rendered the bare `StubPage` placeholder has been
 * upgraded to real content. This suite renders a representative sample of those
 * routes (static content pages + the dynamic detail pages) and asserts each now
 * surfaces a real page: a visible `h1`, and NO leftover StubPage placeholder
 * ("content is forthcoming" / "← Back to home").
 *
 * NOTE on chrome: the global Header, Footer, and floating AI button are mounted
 * by RootLayout (`src/app/layout.tsx`), NOT by individual page components — so
 * this suite asserts only the PAGE-level body each route renders.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

// Mock Next's <Link> as a plain anchor so pages render without an App Router
// provider (mirrors the layout/home section tests).
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

import AboutPage from "@/app/about/page";
import ContactPage from "@/app/contact/page";
import PrivacyPage from "@/app/privacy/page";
import StartupsPage from "@/app/startups/page";
import CoePage from "@/app/coe/page";
import InvestorPipelinePage from "@/app/investors/pipeline/page";

import ClusterDetailPage from "@/app/clusters/[id]/page";
import PolicyDetailPage from "@/app/policies/[id]/page";
import EventDetailPage from "@/app/events/[id]/page";
import ProgramDetailPage from "@/app/programs/[slug]/page";

const STUB_FORTHCOMING = /content\s+is\s+forthcoming/i;

/** Assert a real page body: a non-empty `h1`, and no StubPage placeholder. */
function expectRealPage(): HTMLElement {
  const heading = screen.getByRole("heading", { level: 1 });
  expect(heading).toBeInTheDocument();
  expect(heading.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  expect(screen.queryByText(STUB_FORTHCOMING)).toBeNull();
  expect(screen.queryByRole("link", { name: /back to home/i })).toBeNull();
  return heading;
}

describe("upgraded static content pages", () => {
  const staticPages: ReadonlyArray<readonly [string, () => React.JSX.Element]> = [
    ["about", AboutPage],
    ["contact", ContactPage],
    ["privacy", PrivacyPage],
    ["startups", StartupsPage],
    ["coe", CoePage],
    ["investors/pipeline", InvestorPipelinePage],
  ];

  it.each(staticPages)(
    "renders real content (h1, no forthcoming placeholder) for /%s",
    (_route, Page) => {
      render(<Page />);
      expectRealPage();
    },
  );
});

async function renderDynamic(
  element: React.JSX.Element | Promise<React.JSX.Element>,
): Promise<void> {
  render(await Promise.resolve(element));
}

describe("upgraded dynamic detail pages — resolved (data-backed) params", () => {
  it("clusters/[id] 'mysuru' resolves the cluster name", async () => {
    await renderDynamic(ClusterDetailPage({ params: { id: "mysuru" } }));
    const heading = expectRealPage();
    expect(heading).toHaveTextContent(/Mysuru/i);
  });

  it("policies/[id] 'startup-2025-30' resolves the policy title", async () => {
    await renderDynamic(PolicyDetailPage({ params: { id: "startup-2025-30" } }));
    const heading = expectRealPage();
    expect(heading).toHaveTextContent(/Karnataka Startup Policy 2025-30/i);
  });

  it("events/[id] 'bts-2026' resolves the event title", async () => {
    await renderDynamic(EventDetailPage({ params: { id: "bts-2026" } }));
    const heading = expectRealPage();
    expect(heading).toHaveTextContent(/Bengaluru Tech Summit 2026/i);
  });

  it("programs/[slug] 'leap' resolves the program title", async () => {
    await renderDynamic(ProgramDetailPage({ params: { slug: "leap" } }));
    const heading = expectRealPage();
    expect(heading).toHaveTextContent(/LEAP/i);
  });
});

describe("upgraded dynamic detail pages — fallback (humanized) params", () => {
  it("programs/[slug] unknown 'nain' renders a humanized real page (no placeholder)", async () => {
    await renderDynamic(ProgramDetailPage({ params: { slug: "nain" } }));
    const heading = expectRealPage();
    expect(within(heading).getByText("Nain")).toBeInTheDocument();
  });
});

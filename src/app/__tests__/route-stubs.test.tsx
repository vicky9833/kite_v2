/**
 * Route-stub navigation integration test (task 5.2).
 *
 * These are EXAMPLE tests (not property-based). They render a representative
 * sample of the static stub pages and the dynamic detail pages and assert each
 * surfaces its page-level `StubPage` content: a visible `h1` heading, the
 * "content forthcoming" message, and the "← Back to home" link (Req 19.4).
 *
 * NOTE on chrome: the global Header, Footer, and floating AI button are mounted
 * by RootLayout (`src/app/layout.tsx`), NOT by individual page components — so
 * this suite deliberately does NOT assert Header/Footer here. That chrome is
 * covered by the layout tests (`src/components/layout/__tests__/layout.test.tsx`).
 * Here we only assert the PAGE-level StubPage body each route renders.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

// Mock Next's <Link> as a plain anchor so stub pages render without an App
// Router provider (mirrors the pattern in the layout/home section tests).
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
    <a
      href={typeof href === "string" ? href : (href?.pathname ?? "#")}
      {...props}
    >
      {children}
    </a>
  ),
}));

// Static stub pages (representative sample, incl. a deeply nested route).
// NOTE: `/schemes` was promoted from a stub to the full Schemes Hub in the
// kite-registration-schemes-calculator slice, so it is no longer asserted here
// (its real behavior is covered by that slice's hub tests).
// NOTE: `/investors` was promoted from a stub to the full Investor Connect page
// in the kite-investor-suite slice, so it is no longer asserted here (its real
// behavior is covered by that slice's Investor Connect tests). `/investors/pipeline`
// remains a stub (the live Deal Pipeline lives at `/dashboard/investor/pipeline`).
import AboutPage from "@/app/about/page";
import FaqsPage from "@/app/support/faqs/page";
import PrivacyPage from "@/app/privacy/page";
import InvestorPipelinePage from "@/app/investors/pipeline/page";

// Dynamic detail pages (each receives `{ params }`).
// NOTE: `/schemes/[id]` was promoted to a full editorial detail page in the
// kite-registration-schemes-calculator slice (covered by that slice's
// scheme-detail tests), so it is no longer asserted as a stub here.
import ClusterDetailPage from "@/app/clusters/[id]/page";
import PolicyDetailPage from "@/app/policies/[id]/page";
import EventDetailPage from "@/app/events/[id]/page";
import ProgramDetailPage from "@/app/programs/[slug]/page";

/**
 * Assert the standard StubPage body: a non-empty `h1`, the forthcoming message,
 * and the back-to-home link. Returns the resolved `h1` for further assertions.
 */
function expectStubBody(): HTMLElement {
  const heading = screen.getByRole("heading", { level: 1 });
  expect(heading).toBeInTheDocument();
  expect(heading.textContent?.trim().length ?? 0).toBeGreaterThan(0);

  expect(screen.getByText(/content is forthcoming/i)).toBeInTheDocument();

  const backLink = screen.getByRole("link", { name: /back to home/i });
  expect(backLink).toHaveAttribute("href", "/");

  return heading;
}

/* -------------------------------------------------------------------------- */
/* Static stub pages                                                          */
/* -------------------------------------------------------------------------- */

describe("static route stubs", () => {
  const staticPages: ReadonlyArray<readonly [string, () => React.JSX.Element]> =
    [
      ["about", AboutPage],
      ["support/faqs", FaqsPage],
      ["privacy", PrivacyPage],
      ["investors/pipeline", InvestorPipelinePage],
    ];

  it.each(staticPages)(
    "renders StubPage content (h1 + forthcoming + back link) for /%s",
    (_route, Page) => {
      render(<Page />);
      expectStubBody();
    },
  );
});

/* -------------------------------------------------------------------------- */
/* Dynamic detail pages                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Render a dynamic page. The page components are synchronous in this slice, but
 * App Router pages may be async — `await Promise.resolve(...)` handles both a
 * returned element and a returned promise uniformly.
 */
async function renderDynamic(
  element: React.JSX.Element | Promise<React.JSX.Element>,
): Promise<void> {
  render(await Promise.resolve(element));
}

describe("dynamic detail stubs — resolved (data-backed) params", () => {
  it("clusters/[id] with 'mysuru' resolves the cluster title 'Mysuru'", async () => {
    await renderDynamic(ClusterDetailPage({ params: { id: "mysuru" } }));
    const heading = expectStubBody();
    expect(within(heading).getByText("Mysuru")).toBeInTheDocument();
  });

  it("policies/[id] with 'startup-2025-30' resolves the policy title", async () => {
    await renderDynamic(
      PolicyDetailPage({ params: { id: "startup-2025-30" } }),
    );
    const heading = expectStubBody();
    expect(heading).toHaveTextContent(/Karnataka Startup Policy 2025-30/i);
  });

  it("events/[id] with 'bts-2026' resolves the event title", async () => {
    await renderDynamic(EventDetailPage({ params: { id: "bts-2026" } }));
    const heading = expectStubBody();
    expect(heading).toHaveTextContent(/Bengaluru Tech Summit 2026/i);
  });

  it("programs/[slug] with 'leap' resolves the program title", async () => {
    await renderDynamic(ProgramDetailPage({ params: { slug: "leap" } }));
    const heading = expectStubBody();
    expect(heading).toHaveTextContent(/LEAP/i);
  });
});

describe("dynamic detail stubs — fallback (humanized) params", () => {
  it("programs/[slug] with unknown 'nain' renders a humanized title + forthcoming content", async () => {
    await renderDynamic(ProgramDetailPage({ params: { slug: "nain" } }));
    const heading = expectStubBody();
    // No flagship program href ends with '/nain' → humanized fallback "Nain".
    expect(within(heading).getByText("Nain")).toBeInTheDocument();
  });
});

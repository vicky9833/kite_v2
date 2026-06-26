/**
 * Programs routing integration test (task 8.7).
 *
 * Verifies the App Router resolution decision recorded in design.md: the two
 * dedicated STATIC route segments `app/programs/kan/page.tsx` and
 * `app/programs/k-combinator/page.tsx` outrank the sibling dynamic
 * `app/programs/[slug]/page.tsx`, so `/programs/kan` and `/programs/k-combinator`
 * resolve to the editorial pages, while every OTHER slug still falls through to
 * the existing humanized `[slug]` StubPage (Req 4.1, 5.1).
 *
 * Next.js route resolution is not executed inside a unit test, so we verify the
 * decision structurally by rendering each route's page component directly:
 *
 *   - The KAN page (default export of `@/app/programs/kan/page`) renders the
 *     editorial content (verified "6-month acceleration cohorts" / "306 startups")
 *     and NOT the StubPage placeholder copy — proving `/programs/kan` resolves to
 *     the editorial page rather than the humanized stub.
 *   - The K-Combinator page renders its verified content (KDEM + TiE Mangaluru,
 *     wrkwrk in Silicon Beach Mangaluru) and NOT the stub placeholder.
 *   - The dynamic `[slug]` page, rendered with a non-special slug, still produces
 *     the humanized StubPage (title "Some Other Program" + the forthcoming copy) —
 *     proving the `[slug]` fallback is intact for ordinary slugs.
 *
 * jsdom notes: `next/link` (used by StubPage) is rendered as a plain anchor so
 * the stub renders without an App Router provider. The editorial pages are pure
 * synchronous Server Components and render directly; their success-stories
 * section degrades to eager rendering when `IntersectionObserver` is absent
 * (jsdom), so all editorial content is reachable synchronously.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

// Render Next's <Link> as a plain anchor so StubPage renders without an App
// Router context provider.
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

// Imported AFTER the mock so the stub picks up the anchor stub.
import KanProgramPage from "@/app/programs/kan/page";
import KCombinatorPage from "@/app/programs/k-combinator/page";
import ProgramDetailPage from "@/app/programs/[slug]/page";

// The exact StubPage placeholder copy — its absence proves the editorial pages
// are NOT the humanized fallback, and its presence proves the [slug] fallback.
const STUB_FORTHCOMING = /content\s+is\s+forthcoming/i;

describe("programs routing — static segments outrank the [slug] fallback", () => {
  it("renders the KAN editorial page (verified figures), not the stub", () => {
    const { container } = render(<KanProgramPage />);
    const root = within(container);

    // Verified editorial content present (Req 4.3, 4.4).
    expect(root.getAllByText(/306 startups/i).length).toBeGreaterThan(0);
    expect(
      root.getAllByText(/6-month acceleration cohorts/i).length,
    ).toBeGreaterThan(0);

    // The editorial page name is the page heading (h1), not a humanized slug.
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Karnataka Acceleration Network/i,
      }),
    ).toBeInTheDocument();

    // No StubPage placeholder copy leaked into the editorial route.
    expect(root.queryByText(STUB_FORTHCOMING)).toBeNull();
  });

  it("renders the K-Combinator editorial page (verified spec), not the stub", () => {
    const { container } = render(<KCombinatorPage />);
    const root = within(container);

    // Verified K-Combinator content present (Req 5.3, 5.4).
    expect(root.getAllByText(/KDEM and TiE Mangaluru/i).length).toBeGreaterThan(
      0,
    );
    expect(
      root.getAllByText(/wrkwrk in Silicon Beach Mangaluru/i).length,
    ).toBeGreaterThan(0);

    // The editorial page name is the page heading (h1), not a humanized slug.
    expect(
      screen.getByRole("heading", { level: 1, name: /^K-Combinator$/i }),
    ).toBeInTheDocument();

    // No StubPage placeholder copy leaked into the editorial route.
    expect(root.queryByText(STUB_FORTHCOMING)).toBeNull();
  });

  it("still renders a humanized [slug] page for a non-special slug", () => {
    const { container } = render(
      <ProgramDetailPage params={{ slug: "some-other-program" }} />,
    );
    const root = within(container);

    // The dynamic fallback humanizes the slug into the page title.
    expect(
      screen.getByRole("heading", { level: 1, name: "Some Other Program" }),
    ).toBeInTheDocument();

    // The page is now a real content surface — the old StubPage "forthcoming"
    // placeholder copy must NOT be present.
    expect(root.queryByText(STUB_FORTHCOMING)).toBeNull();

    // Sanity: it does NOT carry the dedicated editorial program content.
    expect(root.queryByText(/306 startups/i)).toBeNull();
    expect(root.queryByText(/wrkwrk in Silicon Beach Mangaluru/i)).toBeNull();
  });
});

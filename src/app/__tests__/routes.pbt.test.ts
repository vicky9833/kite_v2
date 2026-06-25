// Feature: kite-foundation-home, Property 17: Every referenced route resolves
//
// For ANY internal destination referenced anywhere in the data layer
// (navigation, footer, quick actions, flagship programs, clusters, policies,
// events) or by the Home CTAs / scheme-detail links, a corresponding App Router
// page resolves on disk — either a static `<seg>/page.tsx` or a dynamic
// `[param]/page.tsx` segment. This guards Req 19.1: no navigation destination
// dead-ends.
//
// The property samples from the collected referenced-route set and asserts the
// filesystem resolver returns true for every sampled route. Resolution is done
// against the real `src/app` tree with node `fs`/`path` (available under the
// jsdom/node test runtime), walking segment by segment and letting a `[param]`
// directory match any concrete segment.

import { describe, expect, it } from "vitest";
import fc from "fast-check";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NavItem } from "@/types";
import { navigation, utilityNav } from "@/data/navigation";
import { footerColumns, footerBottom } from "@/data/footer";
import { quickActions } from "@/data/quick-actions";
import { flagshipPrograms } from "@/data/flagship-programs";
import { clusters } from "@/data/clusters";
import { policies } from "@/data/policies";
import { events } from "@/data/events";
import { schemes } from "@/data/schemes";

/* -------------------------------------------------------------------------- */
/* App Router page resolver (filesystem-backed)                               */
/* -------------------------------------------------------------------------- */

// This test file lives at src/app/__tests__/routes.pbt.test.ts, so the App
// Router root is its parent directory.
const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Return the single `[param]` child directory of `dir`, if one exists. */
function findDynamicSegmentDir(dir: string): string | null {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  const dynamic = entries.find(
    (e) => e.isDirectory() && /^\[.+\]$/.test(e.name),
  );
  return dynamic ? dynamic.name : null;
}

/**
 * Resolve an internal route to an App Router page on disk.
 *
 * Walks `src/app` segment by segment. At each level a concrete directory is
 * preferred; if it is absent, a `[param]` directory may stand in for the
 * segment. The route resolves only if the final directory contains a
 * `page.tsx`. Root (`/`) resolves to `src/app/page.tsx`.
 */
function resolveRoute(route: string): boolean {
  const segments = route.split("/").filter(Boolean);

  let dir = APP_DIR;
  for (const seg of segments) {
    const exact = path.join(dir, seg);
    if (fs.existsSync(exact) && fs.statSync(exact).isDirectory()) {
      dir = exact;
      continue;
    }
    const dynamic = findDynamicSegmentDir(dir);
    if (dynamic) {
      dir = path.join(dir, dynamic);
      continue;
    }
    return false;
  }

  return fs.existsSync(path.join(dir, "page.tsx"));
}

/* -------------------------------------------------------------------------- */
/* Reference-route collection                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Normalize a raw href: drop the query string and hash, then keep it only if it
 * is an internal app path (a single leading `/`). External links (`tel:`,
 * `mailto:`, protocol-relative `//…`, anything not starting with `/`) return
 * null and are excluded.
 */
function normalizeInternalHref(href: string): string | null {
  const withoutHash = href.split("#")[0] ?? "";
  const withoutQuery = withoutHash.split("?")[0] ?? "";
  if (!withoutQuery.startsWith("/") || withoutQuery.startsWith("//")) {
    return null;
  }
  return withoutQuery;
}

/** Recursively collect every href referenced by a NavItem tree. */
function collectNavHrefs(items: readonly NavItem[]): string[] {
  const hrefs: string[] = [];
  for (const item of items) {
    if (item.href) hrefs.push(item.href);
    if (item.children) hrefs.push(...collectNavHrefs(item.children));
  }
  return hrefs;
}

/** Every raw href referenced across the data layer + Home CTAs + scheme links. */
const rawReferencedHrefs: string[] = [
  // Navigation (dropdowns + leaves) and the utility cluster.
  ...collectNavHrefs(navigation),
  utilityNav.signInHref,
  // Footer columns + bottom row (includes external tel:/mailto: — filtered out).
  ...footerColumns.flatMap((c) => c.links.map((l) => l.href)),
  ...footerBottom.links.map((l) => l.href),
  // Home sections.
  ...quickActions.map((a) => a.href),
  ...flagshipPrograms.map((p) => p.href),
  ...clusters.map((c) => c.href),
  ...policies.map((p) => p.href),
  ...events.map((e) => e.href),
  // Home hero / CTA destinations.
  "/register",
  "/schemes",
  "/intelligence",
  "/gia",
  // Scheme-detail routes referenced from the schemes table rows.
  ...schemes.map((s) => `/schemes/${s.id}`),
];

/** Deduplicated set of internal routes that must each resolve to a page. */
const referencedRoutes: string[] = Array.from(
  new Set(
    rawReferencedHrefs
      .map(normalizeInternalHref)
      .filter((r): r is string => r !== null),
  ),
);

/* -------------------------------------------------------------------------- */
/* Property                                                                   */
/* -------------------------------------------------------------------------- */

describe("every referenced route resolves (Property 17)", () => {
  it("collects a non-empty set of internal referenced routes", () => {
    expect(referencedRoutes.length).toBeGreaterThan(0);
  });

  it("resolves the home page route", () => {
    // Root resolves to src/app/page.tsx.
    expect(resolveRoute("/")).toBe(true);
  });

  it("resolves a corresponding App Router page for any referenced route", () => {
    fc.assert(
      fc.property(fc.constantFrom(...referencedRoutes), (route) => {
        expect(resolveRoute(route)).toBe(true);
      }),
      { numRuns: 25 },
    );
  });
});

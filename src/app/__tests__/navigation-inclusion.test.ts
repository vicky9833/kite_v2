// Feature: kite-inclusion-grassroots — Navigation & footer inclusion wiring (Req 37)
//
// The Idea Bank (/ideas), Women Founders (/women), and NGOs & CSR (/csr)
// surfaces must be reachable from the global navigation and footer (Req 37.1–
// 37.4) WITHOUT removing or altering any pre-existing destination:
//   • Header nav: `/women` + `/csr` live under the "For Stakeholders" group;
//     `/ideas` lives under the "Connect" group.
//   • Footer: `/women` + `/ideas` appear under "For Startups"; `/csr` is
//     already present under "For Ecosystem Partners".
//
// This is a pure DATA assertion over the navigation / footer single sources of
// truth — no rendering, no storage, no network.

import { describe, expect, it } from "vitest";
import { navigation } from "@/data/navigation";
import { footerColumns } from "@/data/footer";
import type { NavItem } from "@/types";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Recursively collect every leaf `href` reachable from a NavItem tree. */
function flattenHrefs(items: readonly NavItem[]): string[] {
  const out: string[] = [];
  for (const item of items) {
    if (item.href) out.push(item.href);
    if (item.children) out.push(...flattenHrefs(item.children));
  }
  return out;
}

/** Find a top-level nav group by its label. */
function findGroup(label: string): NavItem | undefined {
  return navigation.find((item) => item.label === label);
}

/** All leaf hrefs reachable anywhere in the navigation tree. */
const allNavHrefs = flattenHrefs(navigation);

/** All footer hrefs, flattened across every column. */
const allFooterHrefs = footerColumns.flatMap((col) => col.links.map((l) => l.href));

/** Look up a footer column's hrefs by title. */
function footerColumnHrefs(title: string): string[] {
  const col = footerColumns.find((c) => c.title === title);
  return col ? col.links.map((l) => l.href) : [];
}

/* -------------------------------------------------------------------------- */
/* Navigation wiring (Req 37.1, 37.2, 37.3)                                   */
/* -------------------------------------------------------------------------- */

describe("navigation exposes the inclusion & grassroots surfaces", () => {
  it('places `/women` and `/csr` under the "For Stakeholders" group', () => {
    const group = findGroup("For Stakeholders");
    expect(group, 'expected a "For Stakeholders" nav group').toBeDefined();
    const hrefs = flattenHrefs(group!.children ?? []);
    expect(hrefs).toContain("/women");
    expect(hrefs).toContain("/csr");
  });

  it('places `/ideas` under the "Connect" group', () => {
    const group = findGroup("Connect");
    expect(group, 'expected a "Connect" nav group').toBeDefined();
    const hrefs = flattenHrefs(group!.children ?? []);
    expect(hrefs).toContain("/ideas");
  });

  it("exposes each of /women, /csr, /ideas at least once across the nav tree", () => {
    for (const route of ["/women", "/csr", "/ideas"] as const) {
      expect(
        allNavHrefs.filter((h) => h === route).length,
        `expected nav to expose ${route} at least once`,
      ).toBeGreaterThanOrEqual(1);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* Footer wiring (Req 37.1, 37.2, 37.4)                                       */
/* -------------------------------------------------------------------------- */

describe("footer links to the inclusion & grassroots surfaces", () => {
  it('adds `/women` and `/ideas` under the "For Startups" column', () => {
    const hrefs = footerColumnHrefs("For Startups");
    expect(hrefs).toContain("/women");
    expect(hrefs).toContain("/ideas");
  });

  it('keeps `/csr` under the "For Ecosystem Partners" column', () => {
    const hrefs = footerColumnHrefs("For Ecosystem Partners");
    expect(hrefs).toContain("/csr");
  });

  it("links to each of /women, /ideas, /csr somewhere in the footer", () => {
    for (const route of ["/women", "/ideas", "/csr"] as const) {
      expect(allFooterHrefs).toContain(route);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* Non-regression: pre-existing destinations remain (Req 37 "no removal")     */
/* -------------------------------------------------------------------------- */

describe("pre-existing navigation entries are preserved", () => {
  it("still exposes the established stakeholder routes", () => {
    const group = findGroup("For Stakeholders");
    const hrefs = flattenHrefs(group!.children ?? []);
    // A representative sample of the entries that pre-date this slice.
    expect(hrefs).toContain("/investors");
    expect(hrefs).toContain("/mentors");
    expect(hrefs).toContain("/startups");
    expect(hrefs).toContain("/incubators");
  });

  it("still exposes the established Connect routes alongside /ideas", () => {
    const group = findGroup("Connect");
    const hrefs = flattenHrefs(group!.children ?? []);
    expect(hrefs).toContain("/investors");
    expect(hrefs).toContain("/events");
    expect(hrefs).toContain("/jobs");
  });

  it("preserves the established footer columns and key links", () => {
    const titles = footerColumns.map((c) => c.title);
    expect(titles).toContain("For Startups");
    expect(titles).toContain("For Investors");
    expect(titles).toContain("For Ecosystem Partners");
    // Pre-existing links that must survive the additive wiring.
    expect(footerColumnHrefs("For Startups")).toContain("/register");
    expect(footerColumnHrefs("For Startups")).toContain("/schemes");
    expect(footerColumnHrefs("For Ecosystem Partners")).toContain("/incubators");
  });
});

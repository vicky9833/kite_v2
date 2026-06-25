// src/app/__tests__/navigation-enablement.test.ts
//
// Navigation integration test for the KITE Ecosystem Enablement Layer.
// Validates Requirement 17: the four enablement routes are reachable through the
// site navigation, the pre-existing entries are preserved, and the KAN entry is
// added — without removing any existing navigation entry.

import { describe, it, expect } from "vitest";
import type { NavItem } from "@/types";
import { navigation } from "@/data/navigation";
import { footerColumns } from "@/data/footer";

/**
 * Recursively flatten the navigation tree to the set of leaf hrefs. A "leaf" is
 * any NavItem that carries an href (children may also be present, but in this
 * navigation every destination is a leaf with an href).
 */
function flattenNavHrefs(items: NavItem[]): string[] {
  const hrefs: string[] = [];
  for (const item of items) {
    if (typeof item.href === "string" && item.href.length > 0) {
      hrefs.push(item.href);
    }
    if (item.children && item.children.length > 0) {
      hrefs.push(...flattenNavHrefs(item.children));
    }
  }
  return hrefs;
}

/** Collect every NavItem (at any depth) whose href matches the target. */
function findNavEntriesByHref(items: NavItem[], href: string): NavItem[] {
  const matches: NavItem[] = [];
  for (const item of items) {
    if (item.href === href) {
      matches.push(item);
    }
    if (item.children && item.children.length > 0) {
      matches.push(...findNavEntriesByHref(item.children, href));
    }
  }
  return matches;
}

const navHrefs = flattenNavHrefs(navigation);

describe("Navigation integration — Ecosystem Enablement Layer (Requirement 17)", () => {
  it("contains leaf hrefs for all four enablement routes (Req 17.1, 17.2)", () => {
    expect(navHrefs).toContain("/incubators");
    expect(navHrefs).toContain("/mentors");
    expect(navHrefs).toContain("/programs/k-combinator");
    expect(navHrefs).toContain("/programs/kan");
  });

  it("has a KAN entry at /programs/kan with a non-empty label (Req 17.2)", () => {
    const kanEntries = findNavEntriesByHref(navigation, "/programs/kan");
    expect(kanEntries.length).toBeGreaterThanOrEqual(1);
    for (const entry of kanEntries) {
      expect(typeof entry.label).toBe("string");
      expect(entry.label.trim().length).toBeGreaterThan(0);
    }
  });

  it("resolves each of the four routes to at least one nav entry (Req 17.1, 17.2)", () => {
    const routes = [
      "/incubators",
      "/mentors",
      "/programs/k-combinator",
      "/programs/kan",
    ];
    for (const route of routes) {
      const entries = findNavEntriesByHref(navigation, route);
      expect(entries.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("keeps the pre-existing core entries present (no removals) (Req 17.3)", () => {
    // The entries that existed before this layer must still resolve.
    expect(findNavEntriesByHref(navigation, "/incubators").length).toBeGreaterThanOrEqual(1);
    expect(findNavEntriesByHref(navigation, "/mentors").length).toBeGreaterThanOrEqual(1);
    expect(findNavEntriesByHref(navigation, "/programs/k-combinator").length).toBeGreaterThanOrEqual(1);
  });

  it("includes a /programs/kan link in the footer", () => {
    const footerHrefs = footerColumns.flatMap((col) => col.links.map((l) => l.href));
    expect(footerHrefs).toContain("/programs/kan");
  });
});

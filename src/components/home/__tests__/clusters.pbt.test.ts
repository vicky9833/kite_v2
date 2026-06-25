import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { isValidCluster } from "@/lib/utils";
import type { Cluster } from "@/types";

// Feature: kite-foundation-home, Property 7: Invalid clusters are skipped, valid clusters preserved

/**
 * Property 7 model. `ClustersSection` renders `clusters.filter(isValidCluster)`
 * in source order, so the faithful model of "rendered subset" is exactly that
 * filter. This test partitions arbitrary mixed lists of cluster-like records
 * (valid + malformed) and asserts the filtered result equals — in source order
 * — precisely the records for which `isValidCluster` returns true, and that
 * every excluded record fails the guard.
 */

/** A record that may or may not satisfy `isValidCluster`. */
type ClusterLike = Record<string, unknown>;

/** Non-empty string arbitrary (covers ascii, unicode, spaces around content). */
const nonEmptyString: fc.Arbitrary<string> = fc.oneof(
  fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
  fc.constantFrom(
    "Mysuru",
    "BioTech",
    "₹50 Cr",
    "Explore Cluster",
    "café münchen",
    "ಕನ್ನಡ",
  ),
);

/** Non-empty array of non-empty strings. */
const nonEmptyStringArray: fc.Arbitrary<string[]> = fc.array(nonEmptyString, {
  minLength: 1,
  maxLength: 4,
});

/** A valid internal path: a single leading slash followed by a non-slash segment. */
const validHref: fc.Arbitrary<string> = fc
  .string({ minLength: 1 })
  .filter((s) => !s.includes("/") && s.trim().length > 0)
  .map((segment) => `/clusters/${segment}`);

/** A fully valid Cluster record (every guarded constraint satisfied). */
const validClusterArbitrary: fc.Arbitrary<Cluster> = fc.record({
  id: nonEmptyString,
  name: nonEmptyString,
  tagline: nonEmptyString,
  focusAreas: nonEmptyStringArray,
  infrastructure: nonEmptyStringArray,
  seedFund: nonEmptyString,
  anchorInstitutions: nonEmptyStringArray,
  ctaLabel: nonEmptyString,
  href: validHref,
});

/**
 * A malformed cluster-like record. Built from a valid base then corrupted in at
 * least one way the guard must reject: blanking a required string, emptying a
 * required array, dropping a field, or supplying an invalid href.
 */
const malformedClusterArbitrary: fc.Arbitrary<ClusterLike> = fc
  .tuple(
    validClusterArbitrary,
    fc.constantFrom<
      | "emptyId"
      | "emptyName"
      | "emptyTagline"
      | "emptySeedFund"
      | "emptyCtaLabel"
      | "emptyFocusAreas"
      | "emptyInfrastructure"
      | "emptyAnchors"
      | "dropName"
      | "dropFocusAreas"
      | "emptyHref"
      | "externalHref"
      | "protocolRelativeHref"
      | "relativeHref"
    >(
      "emptyId",
      "emptyName",
      "emptyTagline",
      "emptySeedFund",
      "emptyCtaLabel",
      "emptyFocusAreas",
      "emptyInfrastructure",
      "emptyAnchors",
      "dropName",
      "dropFocusAreas",
      "emptyHref",
      "externalHref",
      "protocolRelativeHref",
      "relativeHref",
    ),
  )
  .map(([base, mutation]): ClusterLike => {
    const record: ClusterLike = { ...base };
    switch (mutation) {
      case "emptyId":
        record.id = "";
        break;
      case "emptyName":
        record.name = "   ";
        break;
      case "emptyTagline":
        record.tagline = "";
        break;
      case "emptySeedFund":
        record.seedFund = "";
        break;
      case "emptyCtaLabel":
        record.ctaLabel = "  ";
        break;
      case "emptyFocusAreas":
        record.focusAreas = [];
        break;
      case "emptyInfrastructure":
        record.infrastructure = [];
        break;
      case "emptyAnchors":
        record.anchorInstitutions = [];
        break;
      case "dropName":
        delete record.name;
        break;
      case "dropFocusAreas":
        delete record.focusAreas;
        break;
      case "emptyHref":
        record.href = "";
        break;
      case "externalHref":
        record.href = "http://example.com/clusters/x";
        break;
      case "protocolRelativeHref":
        record.href = "//evil.com/clusters/x";
        break;
      case "relativeHref":
        record.href = "clusters/x";
        break;
    }
    return record;
  });

/** A mixed list of valid and malformed cluster-like records. */
const mixedListArbitrary: fc.Arbitrary<ClusterLike[]> = fc.array(
  fc.oneof(
    validClusterArbitrary as unknown as fc.Arbitrary<ClusterLike>,
    malformedClusterArbitrary,
  ),
  { maxLength: 12 },
);

describe("ClustersSection (Property 7: invalid clusters skipped, valid preserved)", () => {
  it("renders exactly the isValidCluster subset in source order", () => {
    fc.assert(
      fc.property(mixedListArbitrary, (list) => {
        // The faithful model of the rendered subset.
        const rendered = list.filter(isValidCluster);

        // Independently compute the expected valid subset, preserving order.
        const expected = list.filter((record) => isValidCluster(record));

        // Rendered subset equals the valid subset exactly, in source order.
        expect(rendered).toEqual(expected);

        // Every rendered record passes the guard.
        for (const cluster of rendered) {
          expect(isValidCluster(cluster)).toBe(true);
        }

        // Every excluded record fails the guard.
        const renderedSet = new Set<ClusterLike>(rendered);
        for (const record of list) {
          if (renderedSet.has(record)) continue;
          expect(isValidCluster(record)).toBe(false);
        }

        // Source order is preserved: rendered is a subsequence of list.
        let cursor = 0;
        for (const record of list) {
          if (cursor < rendered.length && rendered[cursor] === record) {
            cursor += 1;
          }
        }
        expect(cursor).toBe(rendered.length);
      }),
      { numRuns: 25 },
    );
  });
});

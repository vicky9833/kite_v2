import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { schemes } from "@/data/schemes";
import { clusters } from "@/data/clusters";
import { policies } from "@/data/policies";
import { giaCountries } from "@/data/gia-countries";
import { sectors } from "@/data/sectors";
import { quickActions } from "@/data/quick-actions";
import { flagshipPrograms } from "@/data/flagship-programs";
import { partnerLogos } from "@/data/social-proof";
import { ecosystemStats } from "@/data/ecosystem-stats";
import { events } from "@/data/events";
import { incubators } from "@/data/incubators";
import { assertDataIntegrity } from "@/lib/utils";

// Feature: kite-foundation-home, Property 15: Data completeness

/**
 * Property 15 contract for a single data module. Field groups are exhaustive
 * with respect to each `src/types` interface:
 *  - `stringFields`     — required scalar string fields (non-empty, non-null).
 *  - `stringArrayFields`— required `string[]` fields (non-empty arrays whose
 *                         every element is a non-empty string).
 *  - `numberFields`     — required numeric fields (finite numbers).
 *  - `optionalStringFields` — fields that MAY be absent, but when present must
 *                         be non-empty strings (the design's OPTIONAL fields).
 */
interface ModuleSpec {
  readonly name: string;
  readonly records: ReadonlyArray<Record<string, unknown>>;
  readonly stringFields: readonly string[];
  readonly stringArrayFields: readonly string[];
  readonly numberFields: readonly string[];
  readonly optionalStringFields: readonly string[];
}

/**
 * Widen a typed collection to `Record<string, unknown>[]` for structural,
 * field-name-driven assertions. The double assertion via `unknown` keeps the
 * test free of `any` while erasing the concrete interface so the shared
 * `assertDataIntegrity` helper can index fields by name.
 */
const asRecords = <T>(
  arr: ReadonlyArray<T>,
): ReadonlyArray<Record<string, unknown>> =>
  arr.map((item) => item as unknown as Record<string, unknown>);

const moduleSpecs: readonly ModuleSpec[] = [
  {
    name: "schemes",
    records: asRecords(schemes),
    stringFields: [
      "id",
      "name",
      "type",
      "shortDescription",
      "amount",
      "maxBenefit",
      "duration",
      "status",
    ],
    stringArrayFields: ["eligibility", "documents"],
    numberFields: [],
    optionalStringFields: ["note"],
  },
  {
    name: "clusters",
    records: asRecords(clusters),
    stringFields: ["id", "name", "tagline", "seedFund", "ctaLabel", "href"],
    stringArrayFields: ["focusAreas", "infrastructure", "anchorInstitutions"],
    numberFields: [],
    optionalStringFields: ["note"],
  },
  {
    name: "policies",
    records: asRecords(policies),
    stringFields: ["id", "name", "vertical", "period", "summary", "href"],
    stringArrayFields: [],
    numberFields: [],
    optionalStringFields: [],
  },
  {
    name: "giaCountries",
    records: asRecords(giaCountries),
    stringFields: ["id", "name", "countryCode", "region"],
    stringArrayFields: ["focusAreas"],
    numberFields: [],
    optionalStringFields: [],
  },
  {
    name: "sectors",
    records: asRecords(sectors),
    stringFields: ["id", "name"],
    stringArrayFields: [],
    numberFields: [],
    // Sector.description and Sector.icon are OPTIONAL — skip when absent.
    optionalStringFields: ["description", "icon"],
  },
  {
    name: "quickActions",
    records: asRecords(quickActions),
    stringFields: ["id", "label", "description", "icon", "href"],
    stringArrayFields: [],
    numberFields: [],
    optionalStringFields: [],
  },
  {
    name: "flagshipPrograms",
    records: asRecords(flagshipPrograms),
    stringFields: [
      "id",
      "name",
      "tagline",
      "description",
      "keyMetric",
      "status",
      "ctaLabel",
      "href",
    ],
    stringArrayFields: [],
    numberFields: [],
    optionalStringFields: [],
  },
  {
    name: "partnerLogos",
    records: asRecords(partnerLogos),
    stringFields: ["id", "label"],
    stringArrayFields: [],
    numberFields: [],
    optionalStringFields: [],
  },
  {
    name: "ecosystemStats",
    records: asRecords(ecosystemStats),
    stringFields: ["id", "label", "displayValue", "source", "asOf"],
    stringArrayFields: [],
    numberFields: ["value"],
    optionalStringFields: [],
  },
  {
    name: "events",
    records: asRecords(events),
    stringFields: [
      "id",
      "name",
      "startDate",
      "endDate",
      "location",
      "category",
      "description",
      "href",
    ],
    stringArrayFields: [],
    numberFields: [],
    optionalStringFields: [],
  },
  {
    name: "incubators",
    records: asRecords(incubators),
    stringFields: ["id", "name", "cluster", "type"],
    stringArrayFields: ["focus"],
    numberFields: [],
    optionalStringFields: [],
  },
];

/**
 * Assert completeness for a single record (Property 15):
 *  - required string + string[] fields are present, non-empty, and (for arrays)
 *    contain only non-empty strings — delegated to `assertDataIntegrity`;
 *  - required numeric fields are present and finite;
 *  - optional string fields, when present, are non-empty strings.
 */
function assertRecordComplete(
  spec: ModuleSpec,
  record: Record<string, unknown>,
): void {
  const requiredStringFields = [...spec.stringFields, ...spec.stringArrayFields];
  const requiredFields = [...requiredStringFields, ...spec.numberFields];

  // Required (non-null/non-undefined) + non-empty string / string[] checks.
  assertDataIntegrity([record], {
    name: spec.name,
    requiredFields,
    requiredStringFields,
  });

  // Numeric fields must be finite numbers.
  for (const field of spec.numberFields) {
    const value = record[field];
    expect(
      typeof value === "number" && Number.isFinite(value),
      `[${spec.name}] field "${field}" must be a finite number`,
    ).toBe(true);
  }

  // Optional string fields, when present, must be non-empty strings.
  for (const field of spec.optionalStringFields) {
    const value = record[field];
    if (value === undefined || value === null) {
      continue;
    }
    expect(
      typeof value === "string" && value.trim().length > 0,
      `[${spec.name}] optional field "${field}", when present, must be a non-empty string`,
    ).toBe(true);
  }
}

describe("data completeness (Property 15)", () => {
  it("every required field of every record is present, non-empty, and well-typed", () => {
    fc.assert(
      fc.property(
        fc
          .constantFrom<ModuleSpec>(...moduleSpecs)
          .chain((spec) =>
            fc
              .nat({ max: Math.max(0, spec.records.length - 1) })
              .map((index) => ({ spec, index })),
          ),
        ({ spec, index }) => {
          const record = spec.records[index];
          expect(
            record,
            `[${spec.name}] record ${index} must exist`,
          ).toBeDefined();
          assertRecordComplete(spec, record as Record<string, unknown>);
        },
      ),
      { numRuns: 25 },
    );
  });
});

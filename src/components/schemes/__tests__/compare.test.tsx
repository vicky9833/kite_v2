/**
 * Compare View tests (task 3.18).
 *
 * Covers:
 *  - Property 14: Compare URL round-trips the selection — the pure
 *    `serializeCompareIds` / `parseCompareIds` helpers recover the canonical
 *    cleaned selection (order preserved, deduped, capped at 3, invalid dropped),
 *    and removing one id from a set re-serializes to exactly the remaining ids.
 *  - EXAMPLE component tests for `CompareView`: the semantic comparison
 *    `<table>` (column/row header association), column removal rewriting the URL
 *    via `router.replace`, and the "< 2 valid ids" select-schemes prompt.
 *
 * `next/navigation` (`useSearchParams` / `useRouter`) and `next/link` are mocked
 * so the client component renders without an App Router provider. The tree is
 * rendered inside `RegistrationProvider` (unregistered session → no personalized
 * "Your Eligibility" row).
 *
 * References Req 14.5, 17.1, 17.4 (Property 14) and Req 17.2, 17.8, 27.5
 * (examples).
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import fc from "fast-check";

import {
  CompareView,
  serializeCompareIds,
  parseCompareIds,
} from "@/components/schemes/CompareView";
import { RegistrationProvider } from "@/context/RegistrationContext";
import { schemes } from "@/data/schemes";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                               */
/* -------------------------------------------------------------------------- */

// A controllable `ids` search-param value. The component only ever calls
// `searchParams.get("ids")`, so a minimal URLSearchParams-like object suffices.
// Prefixed `mock*` so the hoisted `vi.mock` factory may reference them.
let mockIds: string | null = null;
const mockReplace = vi.fn();
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "ids" ? mockIds : null),
  }),
}));

// Render Next's <Link> as a plain anchor so the prompt's "Back to Schemes" link
// renders without an App Router context provider.
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

beforeEach(() => {
  mockIds = null;
  mockReplace.mockClear();
  mockPush.mockClear();
});

/** Render helper that wraps a tree in the session RegistrationProvider. */
function renderCompare(): ReturnType<typeof render> {
  return render(
    <RegistrationProvider>
      <CompareView />
    </RegistrationProvider>,
  );
}

/* -------------------------------------------------------------------------- */
/* Property 14 — Compare URL round-trips the selection                        */
/* -------------------------------------------------------------------------- */

// Feature: kite-registration-schemes-calculator, Property 14

/** The canonical valid scheme ids from `src/data/schemes.ts`. */
const ALL_IDS: readonly string[] = schemes.map((s) => s.id);
const VALID = new Set(ALL_IDS);

/**
 * Reference implementation of the parse-time cleaning (independent of the code
 * under test): split-free input → trim, drop empty, dedupe (first wins, order
 * preserved), keep only valid ids, cap at 3. Used to assert the round-trip of an
 * arbitrary noisy entry list.
 */
function referenceClean(entries: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of entries) {
    const id = raw.trim();
    if (id.length === 0) continue;
    if (seen.has(id)) continue;
    if (!VALID.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length === 3) break;
  }
  return out;
}

// A valid scheme id.
const validIdArb = fc.constantFrom(...ALL_IDS);

// An "invalid" entry: a comma-free string that is not a valid id (commas would
// be interpreted as the serializer's delimiter, so we exclude them by design).
const invalidArb = fc
  .string()
  .map((s) => s.replace(/,/g, ""))
  .filter((s) => !VALID.has(s.trim()));

// A whitespace-only / empty entry that the parser must drop.
const whitespaceArb = fc.constantFrom("", " ", "   ", "\t", " \n ");

// A noisy mix of valid ids, invalid strings, duplicates, and whitespace.
const noisyEntryArb = fc.oneof(
  { weight: 3, arbitrary: validIdArb },
  { weight: 1, arbitrary: invalidArb },
  { weight: 1, arbitrary: whitespaceArb },
);

describe("Property 14: Compare URL round-trips the selection", () => {
  it("serialize→parse recovers the canonical selection and remove yields the rest", () => {
    fc.assert(
      fc.property(
        // 1–3 distinct valid ids — a clean selection.
        fc.uniqueArray(validIdArb, { minLength: 1, maxLength: 3 }),
        // A noisy list mixing valid/invalid/duplicate/whitespace entries.
        fc.array(noisyEntryArb, { maxLength: 10 }),
        // Seed selecting which id to remove from the clean selection.
        fc.nat(),
        (cleanIds, noisy, removeSeed) => {
          // Round-trip identity: a clean (valid, distinct, ≤3) selection
          // serializes and parses back to itself, order preserved.
          expect(parseCompareIds(serializeCompareIds(cleanIds))).toEqual(
            cleanIds,
          );

          // Round-trip of a NOISY list: serialize→parse yields exactly the
          // reference-cleaned valid id set (deduped, capped at 3, invalid and
          // whitespace dropped), order preserved.
          const parsedNoisy = parseCompareIds(serializeCompareIds(noisy));
          expect(parsedNoisy).toEqual(referenceClean(noisy));

          // Invariants on the parsed result.
          expect(parsedNoisy.length).toBeLessThanOrEqual(3);
          expect(new Set(parsedNoisy).size).toBe(parsedNoisy.length);
          for (const id of parsedNoisy) {
            expect(VALID.has(id)).toBe(true);
          }

          // Remove one id (model as array filter + serialize): the resulting
          // params parse back to exactly the remaining ids, never the removed.
          const removeIndex = removeSeed % cleanIds.length;
          const removed = cleanIds[removeIndex]!;
          const remaining = cleanIds.filter((_, i) => i !== removeIndex);
          const remainingParam = serializeCompareIds(remaining);

          expect(parseCompareIds(remainingParam)).toEqual(remaining);
          expect(parseCompareIds(remainingParam)).not.toContain(removed);
        },
      ),
      { numRuns: 25 },
    );
  });
});

/* -------------------------------------------------------------------------- */
/* EXAMPLE — CompareView component                                            */
/* -------------------------------------------------------------------------- */

const SCHEME_A = schemes[0]!; // sgst-reimbursement — "State GST Reimbursement"
const SCHEME_B = schemes[1]!; // patent-subsidy — "Patent Filing Subsidy"

describe("CompareView (examples)", () => {
  it("renders a semantic table with a column header per scheme and attribute row headers", () => {
    mockIds = `${SCHEME_A.id},${SCHEME_B.id}`;
    renderCompare();

    // A real <table> is present.
    expect(screen.getByRole("table")).toBeInTheDocument();

    // Each scheme gets a <th scope="col"> carrying its name (Req 27.5).
    expect(
      screen.getByRole("columnheader", { name: new RegExp(SCHEME_A.name) }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: new RegExp(SCHEME_B.name) }),
    ).toBeInTheDocument();

    // Attribute rows expose <th scope="row"> row headers (assert a couple).
    expect(
      screen.getByRole("rowheader", { name: "Type" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "Max Benefit" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "Documents" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("rowheader", { name: "Eligibility" }),
    ).toBeInTheDocument();
  });

  it("removing a column rewrites the URL to the remaining ids via router.replace", () => {
    mockIds = `${SCHEME_A.id},${SCHEME_B.id}`;
    renderCompare();

    // Click the Remove control for scheme A.
    fireEvent.click(
      screen.getByRole("button", {
        name: `Remove ${SCHEME_A.name} from the comparison`,
      }),
    );

    expect(mockReplace).toHaveBeenCalledTimes(1);
    const target = mockReplace.mock.calls[0]![0] as string;
    // The rewritten URL keeps the remaining id and drops the removed one.
    expect(target).toContain(SCHEME_B.id);
    expect(target).not.toContain(SCHEME_A.id);
  });

  it("shows the select-schemes prompt with a Back to Schemes link when no ids are present", () => {
    mockIds = null;
    renderCompare();

    expect(
      screen.getByText("Select at least two schemes to compare."),
    ).toBeInTheDocument();
    // No comparison table is rendered in the prompt state.
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    const back = screen.getByRole("link", { name: /Back to Schemes/i });
    expect(back).toHaveAttribute("href", "/schemes");
  });

  it("shows the prompt when fewer than two valid ids are present (single id)", () => {
    mockIds = SCHEME_A.id;
    renderCompare();

    expect(
      screen.getByText("Select at least two schemes to compare."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Back to Schemes/i }),
    ).toHaveAttribute("href", "/schemes");
  });
});

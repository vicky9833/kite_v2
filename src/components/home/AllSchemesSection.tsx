"use client";

import Link from "next/link";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { SchemeRow } from "@/components/shared/SchemeRow";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { filterSchemes, type SchemeFilterTab } from "@/lib/utils";
import { schemes } from "@/data/schemes";
import type { Scheme } from "@/types";

/**
 * AllSchemesSection — the home "Schemes & Benefits at a Glance" preview.
 *
 * Government-grade editorial: a flat white section with a SectionHeading, three
 * filter tabs, a dense table of a CURATED preview subset of schemes, and a
 * primary "View All 22 Schemes" link to `/schemes`. The full set of 22 schemes
 * lives at `/schemes`; the home page intentionally shows a curated 8–12 preview
 * (refines Req 13.1).
 *
 * Client Component because the filter tabs are interactive. Filtering reuses the
 * pure `filterSchemes` helper from `src/lib/utils.ts`.
 */

/**
 * Curated preview scheme ids (12). Founder judgment: every fiscal incentive
 * (the day-one benefits most startups qualify for) plus the four flagship grant
 * programs (ELEVATE, KITVEN Fund-5, Grand Challenge Karnataka, KAN). Drawn from
 * `src/data/schemes.ts`. Order here defines the "All" preview order.
 */
export const CURATED_SCHEME_IDS: readonly string[] = [
  // Fiscal incentives (8)
  "sgst-reimbursement",
  "patent-subsidy",
  "global-karnataka",
  "quality-certification",
  "pf-esi-reimbursement",
  "cloud-storage",
  "rd-project-grant",
  "internship-support",
  // Flagship grants (4)
  "elevate",
  "kitven-fund-5",
  "grand-challenge-karnataka",
  "kan",
];

/** The three filter tabs, mapping a human label to a `SchemeFilterTab` value. */
const FILTER_TABS: ReadonlyArray<{ label: string; type: SchemeFilterTab }> = [
  { label: "All", type: "All" },
  { label: "Fiscal Incentives", type: "fiscal" },
  { label: "Grant-in-Aid", type: "grant" },
];

/** The curated preview set, resolved from ids and preserving curated order. */
const CURATED_PREVIEW: Scheme[] = CURATED_SCHEME_IDS.map((id) =>
  schemes.find((scheme) => scheme.id === id),
).filter((scheme): scheme is Scheme => scheme !== undefined);

/**
 * Renders the dense scheme preview table for a filtered set, or a no-match
 * message (Req 13.9) when the filter yields nothing.
 */
function SchemesPreviewTable({ schemes: rows }: { schemes: Scheme[] }) {
  if (rows.length === 0) {
    return (
      <p className="px-4 py-12 text-center text-body text-muted">
        No schemes match this filter.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-dark">Scheme</TableHead>
          <TableHead className="text-dark">Benefit</TableHead>
          <TableHead className="text-dark">Duration</TableHead>
          <TableHead className="text-dark">Eligibility</TableHead>
          <TableHead className="text-right text-dark">
            <span className="sr-only">Details</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((scheme) => (
          <SchemeRow key={scheme.id} scheme={scheme} />
        ))}
      </TableBody>
    </Table>
  );
}

export function AllSchemesSection() {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Incentives & Grants"
          title="Schemes & Benefits at a Glance"
          description="A curated snapshot of Karnataka's startup incentives and grant programs — from day-one fiscal benefits to the flagship funding tracks. Filter by type, then explore the full catalogue of 22 schemes."
        />

        {/* Filter tabs + their result panels. Each tab owns a `TabsContent`
            panel so the tablist's `aria-controls` relationships resolve to a
            real, programmatically-associated tabpanel (Req 21.1/21.2). Radix
            mounts only the ACTIVE panel, so exactly one table is present at a
            time. 'All' is preselected (Req 13.8). */}
        <div className="mt-8">
          <Tabs defaultValue="All">
            <TabsList>
              {FILTER_TABS.map((tab) => (
                <TabsTrigger key={tab.type} value={tab.type}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {FILTER_TABS.map((tab) => (
              <TabsContent
                key={tab.type}
                value={tab.type}
                className="mt-6 rounded-xl border border-border"
              >
                <SchemesPreviewTable
                  schemes={filterSchemes(CURATED_PREVIEW, tab.type)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="accent" size="lg" className="min-h-11">
            <Link href="/schemes">View All 22 Schemes</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default AllSchemesSection;

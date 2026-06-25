"use client";

// src/components/dashboard/admin/ExportReportsSection.tsx
//
// "Export and Reports" (Req 21). Three editorial cards for the admin preview:
//   1. Generate Monthly Report — a "Download Report Sample" button that builds a
//      client-side text/plain `Blob` and triggers a download through a temporary
//      anchor (NO network call). Req 21.1, 21.2, 30.6.
//   2. Schedule Email Briefings — an inline "opens in Phase 2" note (no action).
//   3. API Access — a link to the public `/developers` page.
//
// This is the only admin section that needs the client runtime: the Blob
// download uses `URL.createObjectURL` / `revokeObjectURL` and a transient
// anchor. The page composition (task 15.1) wraps this section in `LazySection`.

import Link from "next/link";
import { ArrowRight, Code2, Download, Mail } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Placeholder report content for the downloadable sample. Kept as a fixed
 * string so the produced file is deterministic and contains no real data.
 */
const REPORT_SAMPLE_TEXT = [
  "KITE — Karnataka Innovation & Technology Ecosystem",
  "Monthly Ecosystem Report (Sample)",
  "==================================================",
  "",
  "This is an illustrative sample report generated entirely in your browser.",
  "It contains placeholder figures only and is not an official record.",
  "",
  "Total Registered Startups:            16,234",
  "Total Benefits Disbursed:             ₹312 crore",
  "Active Schemes:                       22",
  "Scheme Applications (last month):     1,847",
  "Average Benefit Per Startup:          ₹19 lakh",
  "Soonicorns Tracked:                   183",
  "",
  "All figures are illustrative and for preview purposes only.",
].join("\n");

/**
 * Build a text/plain Blob from the sample report and trigger a download via a
 * transient anchor. No network request is made; the object URL is revoked once
 * the click has been dispatched (Req 21.2, 30.6).
 */
function downloadReportSample(): void {
  const blob = new Blob([REPORT_SAMPLE_TEXT], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "kite-report-sample.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * ExportReportsSection — three cards (download sample, schedule briefings,
 * API access) in a responsive grid.
 */
export function ExportReportsSection() {
  return (
    <section
      aria-labelledby="export-reports-heading"
      className="flex flex-col gap-8"
    >
      <SectionHeading id="export-reports-heading" title="Export and Reports" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 1 — Generate Monthly Report (client-side Blob download) */}
        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          <Download className="h-6 w-6 text-primary" aria-hidden="true" />
          <h3 className="font-heading text-lg font-semibold text-dark">
            Generate Monthly Report
          </h3>
          <p className="text-sm text-muted">
            Download an illustrative monthly ecosystem report. The file is built
            in your browser — no data leaves this page.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={downloadReportSample}
            className="mt-auto w-fit min-h-11 rounded-lg"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download Report Sample
          </Button>
        </article>

        {/* 2 — Schedule Email Briefings (Phase 2 note, no action) */}
        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          <Mail className="h-6 w-6 text-primary" aria-hidden="true" />
          <h3 className="font-heading text-lg font-semibold text-dark">
            Schedule Email Briefings
          </h3>
          <p className="text-sm text-muted">
            Set up recurring email briefings with the metrics that matter to your
            department.
          </p>
          <p className="mt-auto inline-flex w-fit items-center rounded-md border border-border bg-surface px-3 py-1.5 text-caption font-medium text-muted">
            Opens in Phase 2
          </p>
        </article>

        {/* 3 — API Access → /developers */}
        <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm">
          <Code2 className="h-6 w-6 text-primary" aria-hidden="true" />
          <h3 className="font-heading text-lg font-semibold text-dark">
            API Access
          </h3>
          <p className="text-sm text-muted">
            Integrate ecosystem data into your own tools through the KITE
            developer APIs.
          </p>
          <Link
            href="/developers"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "mt-auto w-fit min-h-11 rounded-lg",
            )}
          >
            View Developer APIs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </article>
      </div>

      <p className="text-caption text-muted">
        Illustrative data for preview purposes only.
      </p>
    </section>
  );
}

export default ExportReportsSection;

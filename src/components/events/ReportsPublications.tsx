"use client";

import Link from "next/link";
import { Download, FileText } from "lucide-react";

import { buildPlaceholderDocument, downloadTextAsFile } from "@/lib/blob-download";

/**
 * ReportsPublications — "Reports and Publications" (Req 6.1). Three cards; each
 * download triggers a client-side Blob generation of a placeholder document
 * (no fetch/network). The sector reports card links to /intelligence.
 */
const REPORTS = [
  {
    id: "annual-startup-report",
    title: "Karnataka Annual Startup Report",
    description:
      "An illustrative overview of Karnataka's startup ecosystem performance over the year.",
    filename: "karnataka-annual-startup-report.txt",
    lines: [
      "Karnataka Annual Startup Report (Illustrative Preview)",
      "",
      "Highlights:",
      "- 21,000+ DPIIT-recognized startups",
      "- 183 soonicorns; $79B VC raised since 2010",
      "- 22 schemes under the Karnataka Startup Policy 2025-30",
      "- 6 Beyond Bengaluru clusters; 32 GIA partner countries",
    ],
  },
  {
    id: "innovation-report",
    title: "Karnataka Innovation Report",
    description:
      "An illustrative deep dive into innovation, R&D, and deep-tech across the state.",
    filename: "karnataka-innovation-report.txt",
    lines: [
      "Karnataka Innovation Report (Illustrative Preview)",
      "",
      "Themes: deep tech, AI, ESDM, biotech, and Beyond Bengaluru clusters.",
      "16 Centres of Excellence anchor sector-specific innovation.",
    ],
  },
] as const;

export function ReportsPublications() {
  return (
    <section aria-labelledby="reports-heading" className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="reports-heading" className="font-heading text-h2 text-dark">
          Reports and Publications
        </h2>
        <p className="mt-3 max-w-2xl text-body text-muted">
          Downloadable previews are illustrative placeholder documents. For
          official publications, visit the EITBT startup portal.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {REPORTS.map((r) => (
            <div
              key={r.id}
              className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
                <FileText className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-heading text-h3 text-dark">{r.title}</h3>
              <p className="flex-1 text-body text-muted">{r.description}</p>
              <button
                type="button"
                onClick={() =>
                  downloadTextAsFile(r.filename, buildPlaceholderDocument(r.title, [...r.lines]))
                }
                className="inline-flex items-center gap-1.5 text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download (illustrative)
              </button>
            </div>
          ))}

          <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-h3 text-dark">Sector Deep Dive Reports</h3>
            <p className="flex-1 text-body text-muted">
              Explore sector-level intelligence and deep-dive analysis across the
              ecosystem.
            </p>
            <Link
              href="/intelligence"
              className="inline-flex items-center text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              View Ecosystem Intelligence
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReportsPublications;

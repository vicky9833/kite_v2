"use client";

import { Download, FileText, Mail } from "lucide-react";

import { buildPlaceholderDocument, downloadTextAsFile } from "@/lib/blob-download";

/**
 * GiaResources — three resource cards for the GIA index (Req 7.1): an
 * international partners brief (Blob download), an investment guide for
 * international investors (Blob download), and a contact-international-cell card.
 */
export function GiaResources() {
  return (
    <section aria-labelledby="gia-resources-heading" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="gia-resources-heading" className="font-heading text-h2 text-dark">
          Resources
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-h3 text-dark">International Partners Brief</h3>
            <p className="flex-1 text-body text-muted">
              An illustrative overview of the GIA framework and how partners engage.
            </p>
            <button
              type="button"
              onClick={() =>
                downloadTextAsFile(
                  "gia-partners-brief.txt",
                  buildPlaceholderDocument("GIA International Partners Brief", [
                    "Karnataka Global Innovation Alliance",
                    "32 partner countries across five regions.",
                    "Engagement: knowledge exchange, co-investment, market access.",
                  ]),
                )
              }
              className="inline-flex items-center gap-1.5 text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download (illustrative)
            </button>
          </div>

          <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-h3 text-dark">Investment Guide for International Investors</h3>
            <p className="flex-1 text-body text-muted">
              An illustrative guide to Karnataka&rsquo;s deal flow, funds, and
              co-investment pathways.
            </p>
            <button
              type="button"
              onClick={() =>
                downloadTextAsFile(
                  "karnataka-international-investment-guide.txt",
                  buildPlaceholderDocument("Karnataka Investment Guide (International)", [
                    "183 soonicorns; $79B VC raised since 2010.",
                    "KITVEN Fund-5 and co-investment pathways.",
                    "6 Beyond Bengaluru clusters and 16 Centres of Excellence.",
                  ]),
                )
              }
              className="inline-flex items-center gap-1.5 text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download (illustrative)
            </button>
          </div>

          <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary">
              <Mail className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="font-heading text-h3 text-dark">Contact International Cell</h3>
            <p className="flex-1 text-body text-muted">
              Reach the GIA international cell for partnership inquiries.
            </p>
            <a
              href="mailto:gia@kdem.in"
              className="inline-flex items-center text-body text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              gia@kdem.in · 080-22341030
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GiaResources;

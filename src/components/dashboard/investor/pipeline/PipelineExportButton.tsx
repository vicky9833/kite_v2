"use client";

// src/components/dashboard/investor/pipeline/PipelineExportButton.tsx
//
// Deal Pipeline — "Export Pipeline (CSV)" button (Req 31.1, 31.2).
//
// Builds a `text/csv` Blob from the PURE `dealsToCsv(deals)` helper and triggers
// a download through a transient anchor + `URL.createObjectURL` /
// `revokeObjectURL`. There is NO network call — the file is assembled entirely
// in the browser, mirroring the admin `ExportReportsSection` download pattern.

import { Download } from "lucide-react";

import { dealsToCsv } from "@/lib/deal-pipeline";
import { Button } from "@/components/ui/button";
import type { TrackedDeal } from "@/types";

export interface PipelineExportButtonProps {
  /** The deals to serialise (already filtered upstream). */
  deals: TrackedDeal[];
}

/**
 * Build a text/csv Blob from `deals` and trigger a download via a transient
 * anchor. The object URL is revoked once the click has been dispatched
 * (Req 31.2). No network request is made.
 */
function downloadPipelineCsv(deals: TrackedDeal[]): void {
  const csv = dealsToCsv(deals);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "kite-deal-pipeline.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function PipelineExportButton({ deals }: PipelineExportButtonProps) {
  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => downloadPipelineCsv(deals)}
        className="w-fit min-h-11 rounded-lg"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Export Pipeline (CSV)
      </Button>
      <p className="text-caption text-muted">
        The file is built in your browser — no data leaves this page.
      </p>
    </div>
  );
}

export default PipelineExportButton;

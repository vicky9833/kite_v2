// src/components/charts/__tests__/recharts-isolation.test.ts
//
// Feature: kite-dashboards, Property 15
//
// Recharts must be imported in exactly one place per chart type — the wrapper
// files under `src/components/charts/` — and NOWHERE else in the application
// code (Req 23.2, 23.9). This is the static-scan enforcement: we recursively
// walk every `.ts`/`.tsx` source file under `src/`, find the ones whose source
// imports from `recharts`, and assert each such file lives under
// `src/components/charts/`. Test files (`__tests__`) are excluded — they may
// import/mock `recharts` for testing without being shipped in any route bundle.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(here, "..", "..", ".."); // .../src
const CHARTS_DIR = path.join(SRC_DIR, "components", "charts");

/** Recursively collect every .ts/.tsx file under `dir`, excluding __tests__. */
function collectSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules") continue;
      out.push(...collectSourceFiles(full));
    } else if (/\.tsx?$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

/** True when the file's source imports (statically or dynamically) from recharts. */
function importsRecharts(file: string): boolean {
  const src = readFileSync(file, "utf8");
  // matches:  from "recharts" | from 'recharts' | import("recharts") | require("recharts")
  return /(?:from|import|require)\s*\(?\s*["']recharts["']/.test(src);
}

const allSourceFiles = collectSourceFiles(SRC_DIR);
const rechartsImporters = allSourceFiles.filter(importsRecharts);

/** Normalised, OS-independent check that `file` is under src/components/charts. */
function isUnderChartsDir(file: string): boolean {
  const rel = path.relative(CHARTS_DIR, file);
  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
}

describe("recharts isolation (Property 15)", () => {
  it("discovers the chart wrapper files as the recharts importers", () => {
    // Sanity: the scan actually found files (otherwise the property is vacuous).
    expect(rechartsImporters.length).toBeGreaterThan(0);
  });

  it("every file importing recharts lives under src/components/charts/", () => {
    fc.assert(
      fc.property(fc.constantFrom(...rechartsImporters), (file) => {
        return isUnderChartsDir(file);
      }),
      { numRuns: 100 },
    );
  });

  it("(full-set) no recharts importer lives outside src/components/charts/", () => {
    const offenders = rechartsImporters.filter((f) => !isUnderChartsDir(f));
    expect(offenders).toEqual([]);
  });
});

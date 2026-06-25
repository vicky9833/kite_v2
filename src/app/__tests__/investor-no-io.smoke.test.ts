// Feature: kite-investor-suite — Investor "no storage / no network" smoke check
//
// The entire Investor Suite slice — the session-only `InvestorContext`, the
// investor-facing marketing/onboarding components, the investor dashboard
// surfaces, the pure investor `lib/*` modules, and the investor route pages —
// is frontend-only / session-only by hard constraint (Req 1.1–1.3, 30.4,
// 40.2–40.3). Its source must contain NO usage of `fetch`, `XMLHttpRequest`,
// `localStorage`, `sessionStorage`, cookies (`document.cookie`), or
// `indexedDB`.
//
// This is a STATIC SOURCE SCAN (mirrors `dashboards-no-io.smoke.test.ts`). It
// reads the investor slice source files from disk and regex-asserts that none
// of the forbidden browser-storage / network APIs are used. It deliberately
// scans actual API-usage patterns (e.g. `document.cookie`, `localStorage.`,
// `new XMLHttpRequest`, bare `fetch(`) rather than the bare word — the word
// "cookie" can legitimately appear inside prose/comments.
//
// IMPORTANT NUANCE: the `PipelineExportButton` legitimately performs a
// CLIENT-SIDE CSV download (Req 31.1, 31.2) via `URL.createObjectURL`, a
// `Blob`, and a transient anchor. That is ALLOWED — it touches no network and
// no persistent storage. The forbidden-pattern regexes below match ONLY the
// listed network/storage APIs, so they never false-positive on
// `createObjectURL` / `Blob` / anchor usage.
//
// `__tests__` directories are excluded from the scan: test files may reference
// these tokens in mocks or comments (this file itself mentions them).

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* -------------------------------------------------------------------------- */
/* Locate the investor slice source roots                                     */
/* -------------------------------------------------------------------------- */

// This file lives at src/app/__tests__/investor-no-io.smoke.test.ts.
const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.resolve(APP_DIR, "..");

/** Directories whose entire (recursive) tree belongs to the investor slice. */
const SCAN_DIRS = [
  path.join(SRC_DIR, "components", "investors"),
  path.join(SRC_DIR, "components", "dashboard", "investor"),
  path.join(SRC_DIR, "app", "investors"),
  path.join(SRC_DIR, "app", "dashboard", "investor"),
];

/** Individual slice files that live alongside non-slice files. */
const SCAN_FILES = [
  path.join(SRC_DIR, "context", "InvestorContext.tsx"),
  path.join(SRC_DIR, "lib", "investor-id-generator.ts"),
  path.join(SRC_DIR, "lib", "investor-matching.ts"),
  path.join(SRC_DIR, "lib", "synthetic-investor-data.ts"),
  path.join(SRC_DIR, "lib", "investor-dashboard-data.ts"),
  path.join(SRC_DIR, "lib", "investor-dashboard-selectors.ts"),
  path.join(SRC_DIR, "lib", "investor-match-display.ts"),
  path.join(SRC_DIR, "lib", "deal-pipeline.ts"),
  path.join(SRC_DIR, "lib", "investor-onboarding-validators.ts"),
];

const SOURCE_EXT = new Set([".ts", ".tsx"]);

/** Recursively collect `.ts`/`.tsx` files under `dir`, skipping `__tests__`. */
function collectSourceFiles(dir: string): string[] {
  const out: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") continue;
      out.push(...collectSourceFiles(full));
    } else if (SOURCE_EXT.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

/** Every investor slice source file the scan covers. */
const sliceFiles: string[] = Array.from(
  new Set([
    ...SCAN_DIRS.flatMap(collectSourceFiles),
    ...SCAN_FILES.filter((f) => fs.existsSync(f)),
  ]),
).sort();

/* -------------------------------------------------------------------------- */
/* Forbidden API-usage patterns                                               */
/* -------------------------------------------------------------------------- */

interface ForbiddenPattern {
  /** Human label for the forbidden API. */
  readonly name: string;
  /** Regex matching ACTUAL usage of the API (not incidental prose). */
  readonly regex: RegExp;
}

const FORBIDDEN_PATTERNS: readonly ForbiddenPattern[] = [
  // Network — bare `fetch(` (word-boundary avoids `prefetch(`/`refetch(`,
  // but still catches `window.fetch(` / `globalThis.fetch(`). Does NOT match
  // the allowed `URL.createObjectURL(` client-download plumbing.
  { name: "fetch(", regex: /\bfetch\s*\(/ },
  // Network — classic XHR.
  { name: "new XMLHttpRequest", regex: /new\s+XMLHttpRequest/ },
  { name: "XMLHttpRequest", regex: /\bXMLHttpRequest\b/ },
  // Storage — localStorage / sessionStorage member access.
  { name: "localStorage.", regex: /\blocalStorage\s*\./ },
  { name: "window.localStorage", regex: /window\s*\.\s*localStorage/ },
  { name: "sessionStorage.", regex: /\bsessionStorage\s*\./ },
  { name: "window.sessionStorage", regex: /window\s*\.\s*sessionStorage/ },
  // Cookies — actual document.cookie access (not the bare word "cookie").
  { name: "document.cookie", regex: /document\s*\.\s*cookie/ },
  // IndexedDB.
  { name: "indexedDB", regex: /\bindexedDB\b/ },
];

interface Offense {
  readonly api: string;
  readonly file: string;
  readonly line: number;
  readonly text: string;
}

/** Scan a single file's contents for every forbidden pattern. */
function scanFile(file: string): Offense[] {
  const offenses: Offense[] = [];
  const contents = fs.readFileSync(file, "utf8");
  const lines = contents.split(/\r?\n/);
  const relative = path.relative(SRC_DIR, file).replace(/\\/g, "/");
  lines.forEach((text, index) => {
    for (const { name, regex } of FORBIDDEN_PATTERNS) {
      if (regex.test(text)) {
        offenses.push({
          api: name,
          file: relative,
          line: index + 1,
          text: text.trim(),
        });
      }
    }
  });
  return offenses;
}

function formatOffenses(offenses: readonly Offense[]): string {
  return offenses
    .map((o) => `  [${o.api}] src/${o.file}:${o.line}  >  ${o.text}`)
    .join("\n");
}

/* -------------------------------------------------------------------------- */
/* The smoke check                                                            */
/* -------------------------------------------------------------------------- */

describe("investor suite is frontend-only / session-only (no storage, no network)", () => {
  it("discovers a non-empty set of investor source files to scan", () => {
    expect(sliceFiles.length).toBeGreaterThan(0);
  });

  it("excludes __tests__ files from the scan set", () => {
    expect(
      sliceFiles.every((f) => !f.includes(`${path.sep}__tests__${path.sep}`)),
    ).toBe(true);
  });

  it("covers the investor routes, context, dashboard, and pure lib modules", () => {
    const covered = (suffix: string): boolean =>
      sliceFiles.some((f) => f.replace(/\\/g, "/").endsWith(suffix));
    expect(covered("app/investors/page.tsx")).toBe(true);
    expect(covered("app/investors/onboard/page.tsx")).toBe(true);
    expect(covered("app/investors/pipeline/page.tsx")).toBe(true);
    expect(covered("app/dashboard/investor/page.tsx")).toBe(true);
    expect(covered("context/InvestorContext.tsx")).toBe(true);
    expect(covered("lib/investor-matching.ts")).toBe(true);
    expect(covered("lib/deal-pipeline.ts")).toBe(true);
    expect(covered("lib/synthetic-investor-data.ts")).toBe(true);
  });

  it("contains NO forbidden storage / network API usage anywhere in the investor slice", () => {
    const offenses = sliceFiles.flatMap(scanFile);
    expect(
      offenses,
      offenses.length > 0
        ? `Found forbidden storage/network API usage in investor source:\n${formatOffenses(
            offenses,
          )}`
        : "",
    ).toEqual([]);
  });

  // Per-API breakdown so a failure points directly at the offending API.
  for (const { name, regex } of FORBIDDEN_PATTERNS) {
    it(`has zero usages of \`${name}\``, () => {
      const offenses = sliceFiles.flatMap((file) => {
        const contents = fs.readFileSync(file, "utf8");
        const lines = contents.split(/\r?\n/);
        const relative = path.relative(SRC_DIR, file).replace(/\\/g, "/");
        const hits: Offense[] = [];
        lines.forEach((text, index) => {
          if (regex.test(text)) {
            hits.push({
              api: name,
              file: relative,
              line: index + 1,
              text: text.trim(),
            });
          }
        });
        return hits;
      });
      expect(
        offenses,
        offenses.length > 0 ? `\n${formatOffenses(offenses)}` : "",
      ).toEqual([]);
    });
  }
});

/* -------------------------------------------------------------------------- */
/* Allowed client-side download (Req 31.1, 31.2) — sanity guard               */
/* -------------------------------------------------------------------------- */

describe("pipeline CSV export stays client-side (no network)", () => {
  const exportSource = fs.readFileSync(
    path.join(
      SRC_DIR,
      "components",
      "dashboard",
      "investor",
      "pipeline",
      "PipelineExportButton.tsx",
    ),
    "utf8",
  );

  it("uses an in-browser Blob + object URL download, not a network request", () => {
    // The legitimate client-side download primitives are present...
    expect(/URL\s*\.\s*createObjectURL\s*\(/.test(exportSource)).toBe(true);
    expect(/new\s+Blob\s*\(/.test(exportSource)).toBe(true);
    // ...and crucially it performs NO network call.
    expect(/\bfetch\s*\(/.test(exportSource)).toBe(false);
    expect(/\bXMLHttpRequest\b/.test(exportSource)).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* Session-reset behavior (Req 1.1–1.3, 40.2–40.3) — reset on refresh         */
/* -------------------------------------------------------------------------- */

describe("session-reset is honored via in-memory InvestorContext", () => {
  const contextSource = fs.readFileSync(
    path.join(SRC_DIR, "context", "InvestorContext.tsx"),
    "utf8",
  );

  it("holds investor state in React `useState` only (no persistence)", () => {
    // Investor state lives in a React `useState` hook, so a page refresh
    // remounts the provider and resets to the not-onboarded initial state —
    // there is no persistence layer to rehydrate from.
    expect(/useState\s*</.test(contextSource)).toBe(true);
    expect(/\blocalStorage\s*\./.test(contextSource)).toBe(false);
    expect(/\bsessionStorage\s*\./.test(contextSource)).toBe(false);
    expect(/document\s*\.\s*cookie/.test(contextSource)).toBe(false);
    expect(/\bindexedDB\b/.test(contextSource)).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* Deal ticker uses CSS animation only (Req 10.4, 37.4, 38.3) — sanity guard  */
/* -------------------------------------------------------------------------- */

describe("live deal-flow ticker animates with CSS only (no animation library)", () => {
  const tickerSource = fs.readFileSync(
    path.join(SRC_DIR, "components", "investors", "LiveDealFlowSection.tsx"),
    "utf8",
  );

  it("drives the marquee with CSS keyframes, not framer-motion / react-spring", () => {
    // The marquee uses a CSS `animation` keyframe loop in a scoped <style>.
    expect(/animation\s*:/.test(tickerSource) || /@keyframes/.test(tickerSource)).toBe(
      true,
    );
    // No JS animation library is imported into the bundle.
    expect(/from\s+["']framer-motion["']/.test(tickerSource)).toBe(false);
    expect(/from\s+["']react-spring["']/.test(tickerSource)).toBe(false);
    expect(/from\s+["']@react-spring\/.+["']/.test(tickerSource)).toBe(false);
  });
});

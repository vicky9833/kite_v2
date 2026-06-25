// Feature: kite-registration-schemes-calculator — Slice "no storage / no network" smoke check
//
// This slice is frontend-only / session-only by hard constraint: its source
// must contain NO usage of `fetch`, `XMLHttpRequest`, `localStorage`,
// `sessionStorage`, cookies (`document.cookie`), or `indexedDB`.
//
// This is a STATIC SOURCE SCAN. It reads the slice source files from disk and
// regex-asserts that none of the forbidden browser-storage / network APIs are
// used. It deliberately scans actual API-usage patterns (e.g. `document.cookie`,
// `localStorage.`, `new XMLHttpRequest`, bare `fetch(`) rather than the bare
// word — the word "cookie" can legitimately appear inside prose/comments.
//
// `__tests__` directories are excluded from the scan: test files may reference
// these tokens in mocks or comments (this file itself mentions them).

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* -------------------------------------------------------------------------- */
/* Locate the slice source roots                                              */
/* -------------------------------------------------------------------------- */

// This file lives at src/app/__tests__/slice-no-storage.smoke.test.ts.
const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.resolve(APP_DIR, "..");

/** Directories whose entire (recursive) tree belongs to this slice. */
const SCAN_DIRS = [
  path.join(SRC_DIR, "context"),
  path.join(SRC_DIR, "lib"),
  path.join(SRC_DIR, "components", "registration"),
  path.join(SRC_DIR, "components", "schemes"),
  path.join(SRC_DIR, "components", "calculator"),
  path.join(SRC_DIR, "app", "register"),
  path.join(SRC_DIR, "app", "schemes"),
  path.join(SRC_DIR, "app", "calculator"),
];

/** Individual slice files that live alongside non-slice files. */
const SCAN_FILES = [
  path.join(SRC_DIR, "components", "home", "SchemesPersonalizationBanner.tsx"),
  path.join(SRC_DIR, "components", "home", "RegisterQuickActionCard.tsx"),
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

/** Every slice source file the scan covers. */
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
  // but still catches `window.fetch(` / `globalThis.fetch(`).
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

describe("slice is frontend-only / session-only (no storage, no network)", () => {
  it("discovers a non-empty set of slice source files to scan", () => {
    expect(sliceFiles.length).toBeGreaterThan(0);
  });

  it("excludes __tests__ files from the scan set", () => {
    expect(sliceFiles.every((f) => !f.includes(`${path.sep}__tests__${path.sep}`))).toBe(
      true,
    );
  });

  it("contains NO forbidden storage / network API usage anywhere in the slice", () => {
    const offenses = sliceFiles.flatMap(scanFile);
    expect(
      offenses,
      offenses.length > 0
        ? `Found forbidden storage/network API usage in slice source:\n${formatOffenses(
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
            hits.push({ api: name, file: relative, line: index + 1, text: text.trim() });
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

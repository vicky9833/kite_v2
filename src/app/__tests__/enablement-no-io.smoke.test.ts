// Feature: kite-ecosystem-enablement — Enablement "no storage / no network" smoke check
//
// The entire Ecosystem Enablement slice — the four route pages
// (`/incubators`, `/mentors`, `/programs/kan`, `/programs/k-combinator`), the
// incubator / mentor / program presentation components, the pure filter
// modules, the verified program-data modules, and the pure hash-seeded
// synthetic generators — is frontend-only / session-only by hard constraint
// (Req 12.1–12.4). Its source must contain NO usage of `fetch`,
// `XMLHttpRequest`, `localStorage`, `sessionStorage`, cookies
// (`document.cookie`), or `indexedDB`.
//
// This is a STATIC SOURCE SCAN (mirrors `investor-no-io.smoke.test.ts` /
// `dashboards-no-io.smoke.test.ts`). It reads the enablement slice source
// files from disk and regex-asserts that none of the forbidden browser-storage
// / network APIs are used. It deliberately scans actual API-usage patterns
// (e.g. `document.cookie`, `localStorage.`, `new XMLHttpRequest`, bare
// `fetch(`) rather than the bare word — the word "cookie" can legitimately
// appear inside prose/comments.
//
// Two enablement-specific guards ride alongside the shared scan:
//   1. DETERMINISM (Req 7.3, 11.3): the synthetic generators
//      (`synthetic-mentors.ts`, `synthetic-incubator-detail.ts`,
//      `synthetic-program-stories.ts`) are hash-seeded and ambient-free — they
//      reference NO `Math.random`, `Date` / `Date.now` / `new Date`,
//      `performance.now`, or any other time/locale source.
//   2. APPLY CTA (Req 12.6): the Apply CTAs in the verified program-data
//      modules link to an EXTERNAL `https` portal.
//
// Blob-based downloads are permitted (Req 12.5); none exist in this slice, and
// the forbidden-pattern regexes never match `createObjectURL` / `Blob` anyway.
//
// `__tests__` directories are excluded from the scan: test files may reference
// these tokens in mocks or comments (this file itself mentions them).

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* -------------------------------------------------------------------------- */
/* Locate the enablement slice source roots                                   */
/* -------------------------------------------------------------------------- */

// This file lives at src/app/__tests__/enablement-no-io.smoke.test.ts.
const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.resolve(APP_DIR, "..");

/** Directories whose entire (recursive) tree belongs to the enablement slice. */
const SCAN_DIRS = [
  path.join(SRC_DIR, "components", "incubators"),
  path.join(SRC_DIR, "components", "mentors"),
  path.join(SRC_DIR, "components", "programs"),
];

/** Individual slice files that live alongside non-slice files. */
const SCAN_FILES = [
  // Route pages.
  path.join(SRC_DIR, "app", "incubators", "page.tsx"),
  path.join(SRC_DIR, "app", "mentors", "page.tsx"),
  path.join(SRC_DIR, "app", "programs", "kan", "page.tsx"),
  path.join(SRC_DIR, "app", "programs", "k-combinator", "page.tsx"),
  // Pure synthetic generators.
  path.join(SRC_DIR, "lib", "synthetic-mentors.ts"),
  path.join(SRC_DIR, "lib", "synthetic-incubator-detail.ts"),
  path.join(SRC_DIR, "lib", "synthetic-program-stories.ts"),
  // Pure filter modules.
  path.join(SRC_DIR, "lib", "incubator-filters.ts"),
  path.join(SRC_DIR, "lib", "mentor-filters.ts"),
  // Verified program-data modules.
  path.join(SRC_DIR, "data", "kan-program.ts"),
  path.join(SRC_DIR, "data", "k-combinator-program.ts"),
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

/** Every enablement slice source file the scan covers. */
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

describe("enablement layer is frontend-only / session-only (no storage, no network)", () => {
  it("discovers a non-empty set of enablement source files to scan", () => {
    expect(sliceFiles.length).toBeGreaterThan(0);
  });

  it("excludes __tests__ files from the scan set", () => {
    expect(
      sliceFiles.every((f) => !f.includes(`${path.sep}__tests__${path.sep}`)),
    ).toBe(true);
  });

  it("covers the four routes, the synthetic generators, filters, and program data", () => {
    const covered = (suffix: string): boolean =>
      sliceFiles.some((f) => f.replace(/\\/g, "/").endsWith(suffix));
    // Route pages.
    expect(covered("app/incubators/page.tsx")).toBe(true);
    expect(covered("app/mentors/page.tsx")).toBe(true);
    expect(covered("app/programs/kan/page.tsx")).toBe(true);
    expect(covered("app/programs/k-combinator/page.tsx")).toBe(true);
    // Synthetic generators.
    expect(covered("lib/synthetic-mentors.ts")).toBe(true);
    expect(covered("lib/synthetic-incubator-detail.ts")).toBe(true);
    expect(covered("lib/synthetic-program-stories.ts")).toBe(true);
    // Filters.
    expect(covered("lib/incubator-filters.ts")).toBe(true);
    expect(covered("lib/mentor-filters.ts")).toBe(true);
    // Verified program data.
    expect(covered("data/kan-program.ts")).toBe(true);
    expect(covered("data/k-combinator-program.ts")).toBe(true);
  });

  it("contains NO forbidden storage / network API usage anywhere in the enablement slice", () => {
    const offenses = sliceFiles.flatMap(scanFile);
    expect(
      offenses,
      offenses.length > 0
        ? `Found forbidden storage/network API usage in enablement source:\n${formatOffenses(
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
/* Synthetic generators are deterministic & ambient-free (Req 7.3, 11.3)      */
/* -------------------------------------------------------------------------- */

describe("synthetic generators are hash-seeded with no ambient / time source", () => {
  const GENERATOR_FILES = [
    path.join(SRC_DIR, "lib", "synthetic-mentors.ts"),
    path.join(SRC_DIR, "lib", "synthetic-incubator-detail.ts"),
    path.join(SRC_DIR, "lib", "synthetic-program-stories.ts"),
  ];

  // Patterns that would introduce non-determinism: randomness or any
  // time/date/perf source. The word-boundaries avoid false hits on identifier
  // substrings (e.g. `updateDate` would NOT match `\bDate\b` only when used as
  // a standalone token — but we scan for the constructor/static-call forms).
  const NONDETERMINISTIC_PATTERNS: readonly ForbiddenPattern[] = [
    { name: "Math.random", regex: /Math\s*\.\s*random/ },
    { name: "Date.now", regex: /Date\s*\.\s*now/ },
    { name: "new Date", regex: /new\s+Date\b/ },
    { name: "Date(", regex: /\bDate\s*\(/ },
    { name: "performance.now", regex: /performance\s*\.\s*now/ },
  ];

  // Strip `//` line comments and `/* ... */` block comments so the scan reads
  // only executable code — the generators legitimately DOCUMENT their
  // determinism contract in prose ("NO use of `Math.random`, `Date`, ...").
  // Blanking comments to spaces preserves line numbers for accurate reporting.
  const stripComments = (src: string): string =>
    src
      .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\r\n]/g, " "))
      .replace(/\/\/[^\r\n]*/g, (m) => m.replace(/[^\r\n]/g, " "));

  for (const file of GENERATOR_FILES) {
    const rel = path.relative(SRC_DIR, file).replace(/\\/g, "/");

    it(`\`${rel}\` references no Math.random / Date / performance.now`, () => {
      const contents = stripComments(fs.readFileSync(file, "utf8"));
      const lines = contents.split(/\r?\n/);
      const hits: Offense[] = [];
      lines.forEach((text, index) => {
        for (const { name, regex } of NONDETERMINISTIC_PATTERNS) {
          if (regex.test(text)) {
            hits.push({ api: name, file: rel, line: index + 1, text: text.trim() });
          }
        }
      });
      expect(
        hits,
        hits.length > 0
          ? `Found non-deterministic source in synthetic generator:\n${formatOffenses(
              hits,
            )}`
          : "",
      ).toEqual([]);
    });
  }
});

/* -------------------------------------------------------------------------- */
/* Apply CTAs link to an external https portal (Req 12.6)                     */
/* -------------------------------------------------------------------------- */

describe("Apply CTAs in the program data modules are external https links", () => {
  const PROGRAM_DATA_FILES = [
    path.join(SRC_DIR, "data", "kan-program.ts"),
    path.join(SRC_DIR, "data", "k-combinator-program.ts"),
  ];

  for (const file of PROGRAM_DATA_FILES) {
    const rel = path.relative(SRC_DIR, file).replace(/\\/g, "/");
    const source = fs.readFileSync(file, "utf8");

    it(`\`${rel}\` declares an applyCta with an external https href`, () => {
      // The module declares an `applyCta` object literal.
      expect(/applyCta\s*:/.test(source)).toBe(true);

      // Capture the href value inside the applyCta block. The applyCta literal
      // carries a `href: '...'` (or "...") pointing at an external portal.
      const hrefMatch = source.match(
        /applyCta\s*:\s*\{[\s\S]*?href\s*:\s*['"]([^'"]+)['"]/,
      );
      expect(hrefMatch, `no applyCta.href found in ${rel}`).not.toBeNull();

      const href = hrefMatch![1] ?? "";
      // External + secure: an absolute https URL (not a relative / internal path).
      expect(href.startsWith("https://")).toBe(true);
      // Not an http (insecure) or protocol-relative or internal route.
      expect(/^http:\/\//.test(href)).toBe(false);
      expect(href.startsWith("/")).toBe(false);
    });
  }
});

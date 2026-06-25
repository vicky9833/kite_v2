// Feature: kite-inclusion-grassroots — Inclusion "no storage / no network" smoke check
//
// The entire Inclusion_Layer slice — the three route pages (`/women`, `/csr`,
// `/ideas`), the women / CSR / ideas presentation components, the
// `IdeaBankContext` provider, the pure id generator, the pure matching engine,
// the pure board-filter / form-validation / scheme-tagging helpers, and the
// hash-seeded synthetic generators — is frontend-only / session-only by hard
// constraint (Req 33.1–33.4). Its source must contain NO usage of `fetch`,
// `XMLHttpRequest`, `localStorage`, `sessionStorage`, cookies
// (`document.cookie`), or `indexedDB`.
//
// This is a STATIC SOURCE SCAN (mirrors `enablement-no-io.smoke.test.ts`). It
// reads the inclusion slice source files from disk and regex-asserts that none
// of the forbidden browser-storage / network APIs are used. It scans actual
// API-usage patterns (e.g. `document.cookie`, `localStorage.`,
// `new XMLHttpRequest`, bare `fetch(`) rather than the bare word — the words
// "cookie" / "fetch" / "localStorage" legitimately appear inside the modules'
// own constraint-documenting prose.
//
// The CSR partnership brief (CsrHowToPartner) legitimately produces a
// client-side download via `new Blob([...])` + `URL.createObjectURL` (Req 22.3,
// 33.4). That is ALLOWED and is NOT a network request: the forbidden-pattern
// regexes deliberately target `fetch(` / `XMLHttpRequest`, so they never
// false-positive on `createObjectURL` / `Blob` / `document.createElement`.
//
// Two inclusion-specific guards ride alongside the shared I/O scan:
//   1. DETERMINISM (Req 4.12, 5.6): the synthetic generators
//      (`synthetic-women-founders`, `synthetic-csr-partnerships`,
//      `synthetic-ngo-partners`, `synthetic-csr-impact`, `synthetic-ideas`) and
//      the matching engine (`idea-scheme-matching`) are hash-seeded and
//      ambient-free — they reference NO `Math.random`, `Date` / `Date.now` /
//      `new Date`, or `performance.now`. NOTE: `idea-id-generator.ts` is
//      deliberately EXCLUDED from this determinism scan. Req 2.3 specifies the
//      id generator is invoked "with a given random source and year" and is
//      pure/deterministic FOR those inputs (Req 2.4); it legitimately defaults
//      its injected parameters to `Math.random` / `new Date().getFullYear()`.
//      Only the matching engine (Req 4.12) and the generators (Req 5.6) carry
//      the no-`Math.random` / no-time-source obligation. The id generator is
//      still covered by the I/O scan above.
//   2. NO PHANTOM SCHEME (Req 38.2): the literal `rural-innovation-center`
//      appears NOWHERE in the slice — there is no such scheme id; rural /
//      grassroot references map to the real `grassroot-innovation` scheme.
//
// `__tests__` directories are excluded from the scan: test files may reference
// these tokens in mocks or comments (this file itself mentions them).

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* -------------------------------------------------------------------------- */
/* Locate the inclusion slice source roots                                    */
/* -------------------------------------------------------------------------- */

// This file lives at src/app/__tests__/inclusion-no-io.smoke.test.ts.
const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.resolve(APP_DIR, "..");

/** Directories whose entire (recursive) tree belongs to the inclusion slice. */
const SCAN_DIRS = [
  path.join(SRC_DIR, "components", "women"),
  path.join(SRC_DIR, "components", "csr"),
  path.join(SRC_DIR, "components", "ideas"),
];

/** Individual slice files that live alongside non-slice files. */
const SCAN_FILES = [
  // Route pages.
  path.join(SRC_DIR, "app", "women", "page.tsx"),
  path.join(SRC_DIR, "app", "csr", "page.tsx"),
  path.join(SRC_DIR, "app", "ideas", "page.tsx"),
  // Session-only in-memory context.
  path.join(SRC_DIR, "context", "IdeaBankContext.tsx"),
  // Pure id generator.
  path.join(SRC_DIR, "lib", "idea-id-generator.ts"),
  // Pure matching engine.
  path.join(SRC_DIR, "lib", "idea-scheme-matching.ts"),
  // Pure board / form / tagging helpers.
  path.join(SRC_DIR, "lib", "ideas-board-filters.ts"),
  path.join(SRC_DIR, "lib", "idea-form-validation.ts"),
  path.join(SRC_DIR, "lib", "scheme-tagging.ts"),
  // Pure synthetic generators.
  path.join(SRC_DIR, "lib", "synthetic-women-founders.ts"),
  path.join(SRC_DIR, "lib", "synthetic-csr-partnerships.ts"),
  path.join(SRC_DIR, "lib", "synthetic-ngo-partners.ts"),
  path.join(SRC_DIR, "lib", "synthetic-csr-impact.ts"),
  path.join(SRC_DIR, "lib", "synthetic-ideas.ts"),
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

/** Every inclusion slice source file the scan covers. */
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
  // the legitimate `URL.createObjectURL` / `new Blob(...)` download path.
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

describe("inclusion layer is frontend-only / session-only (no storage, no network)", () => {
  it("discovers a non-empty set of inclusion source files to scan", () => {
    expect(sliceFiles.length).toBeGreaterThan(0);
  });

  it("excludes __tests__ files from the scan set", () => {
    expect(
      sliceFiles.every((f) => !f.includes(`${path.sep}__tests__${path.sep}`)),
    ).toBe(true);
  });

  it("covers the three routes, the context, the id generator, the engine, the helpers, and the generators", () => {
    const covered = (suffix: string): boolean =>
      sliceFiles.some((f) => f.replace(/\\/g, "/").endsWith(suffix));
    // Route pages.
    expect(covered("app/women/page.tsx")).toBe(true);
    expect(covered("app/csr/page.tsx")).toBe(true);
    expect(covered("app/ideas/page.tsx")).toBe(true);
    // Session-only context.
    expect(covered("context/IdeaBankContext.tsx")).toBe(true);
    // Pure libs.
    expect(covered("lib/idea-id-generator.ts")).toBe(true);
    expect(covered("lib/idea-scheme-matching.ts")).toBe(true);
    expect(covered("lib/ideas-board-filters.ts")).toBe(true);
    expect(covered("lib/idea-form-validation.ts")).toBe(true);
    expect(covered("lib/scheme-tagging.ts")).toBe(true);
    // Synthetic generators.
    expect(covered("lib/synthetic-women-founders.ts")).toBe(true);
    expect(covered("lib/synthetic-csr-partnerships.ts")).toBe(true);
    expect(covered("lib/synthetic-ngo-partners.ts")).toBe(true);
    expect(covered("lib/synthetic-csr-impact.ts")).toBe(true);
    expect(covered("lib/synthetic-ideas.ts")).toBe(true);
  });

  it("contains NO forbidden storage / network API usage anywhere in the inclusion slice", () => {
    const offenses = sliceFiles.flatMap(scanFile);
    expect(
      offenses,
      offenses.length > 0
        ? `Found forbidden storage/network API usage in inclusion source:\n${formatOffenses(
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
/* Comment-stripping helper (shared by the determinism + literal scans)       */
/* -------------------------------------------------------------------------- */

// Strip `//` line comments and `/* ... */` block comments so the scan reads
// only executable code — the generators and the matching engine legitimately
// DOCUMENT their determinism contract in prose ("NO use of `Math.random`,
// `Date`, ..."). Blanking comments to spaces preserves line numbers for
// accurate reporting.
const stripComments = (src: string): string =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\r\n]/g, " "))
    .replace(/\/\/[^\r\n]*/g, (m) => m.replace(/[^\r\n]/g, " "));

/* -------------------------------------------------------------------------- */
/* Generators + matching engine are deterministic & ambient-free (Req 4.12,   */
/* 5.6)                                                                       */
/* -------------------------------------------------------------------------- */

describe("synthetic generators and the matching engine are hash-seeded with no ambient / time source", () => {
  // The synthetic generators (Req 5.6) plus the matching engine (Req 4.12).
  // `idea-id-generator.ts` is intentionally NOT in this list: per Req 2.3 it is
  // invoked with an injected random source / year and only defaults those
  // params to `Math.random` / `new Date()`, which the requirements permit.
  const DETERMINISTIC_FILES = [
    path.join(SRC_DIR, "lib", "synthetic-women-founders.ts"),
    path.join(SRC_DIR, "lib", "synthetic-csr-partnerships.ts"),
    path.join(SRC_DIR, "lib", "synthetic-ngo-partners.ts"),
    path.join(SRC_DIR, "lib", "synthetic-csr-impact.ts"),
    path.join(SRC_DIR, "lib", "synthetic-ideas.ts"),
    path.join(SRC_DIR, "lib", "idea-scheme-matching.ts"),
  ];

  // Patterns that would introduce non-determinism: randomness or any
  // time/date/perf source. Word-boundaries avoid false hits on identifier
  // substrings (e.g. `formatDate(` does NOT match `\bDate\s*\(` because there
  // is no word boundary before `Date`).
  const NONDETERMINISTIC_PATTERNS: readonly ForbiddenPattern[] = [
    { name: "Math.random", regex: /Math\s*\.\s*random/ },
    { name: "Date.now", regex: /Date\s*\.\s*now/ },
    { name: "new Date", regex: /new\s+Date\b/ },
    { name: "Date(", regex: /\bDate\s*\(/ },
    { name: "performance.now", regex: /performance\s*\.\s*now/ },
  ];

  for (const file of DETERMINISTIC_FILES) {
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
          ? `Found non-deterministic source in deterministic module:\n${formatOffenses(
              hits,
            )}`
          : "",
      ).toEqual([]);
    });
  }
});

/* -------------------------------------------------------------------------- */
/* No phantom `rural-innovation-center` scheme anywhere in the slice (Req 38.2)*/
/* -------------------------------------------------------------------------- */

describe("the phantom `rural-innovation-center` scheme id appears nowhere in the inclusion slice", () => {
  // Req 38.2 forbids any REFERENCE to a `rural-innovation-center` scheme id —
  // rural / grassroot references must resolve to the real `grassroot-innovation`
  // id. We therefore scan executable code with comments stripped: a handful of
  // slice modules legitimately DOCUMENT, in prose, that "the literal
  // `rural-innovation-center` never appears" (their no-phantom-scheme contract),
  // and that meta-documentation must not itself trip the guard. Any occurrence
  // in actual code — an import, a literal, a scheme-id reference — still fails.
  const PHANTOM_SCHEME = /rural-innovation-center/;

  it("has zero occurrences of the literal `rural-innovation-center` in executable code", () => {
    const hits: Offense[] = [];
    for (const file of sliceFiles) {
      const lines = stripComments(fs.readFileSync(file, "utf8")).split(/\r?\n/);
      const rel = path.relative(SRC_DIR, file).replace(/\\/g, "/");
      lines.forEach((text, index) => {
        if (PHANTOM_SCHEME.test(text)) {
          hits.push({
            api: "rural-innovation-center",
            file: rel,
            line: index + 1,
            text: text.trim(),
          });
        }
      });
    }
    expect(
      hits,
      hits.length > 0
        ? `Found the phantom scheme id 'rural-innovation-center' (use 'grassroot-innovation'):\n${formatOffenses(
            hits,
          )}`
        : "",
    ).toEqual([]);
  });
});

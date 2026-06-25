// Feature: kite-inclusion-grassroots — Inclusion_Layer visual-discipline smoke check
//
// Requirement 36 (Visual Discipline) demands that the three Inclusion_Layer
// surfaces — the Women Hub, the CSR Hub, and the Idea Bank — read as
// institutional government pages: NO gradients, NO decorative blobs, NO emoji,
// NO glassmorphism, NO glow effects, and NO `text-h4` class. Cards must use
// `rounded-xl` + `shadow-sm` + a border; content sections must use
// `py-16 md:py-24`; header strips must use `py-8`/`py-12`; and content width
// must be constrained with `max-w-7xl`.
//
// This is a STATIC SOURCE SCAN (mirrors `slice-no-storage.smoke.test.ts` /
// `enablement-no-io.smoke.test.ts`). It reads the inclusion slice source files
// from disk and regex-asserts presence/absence of the relevant utility tokens.
//
// Comments are STRIPPED before the banned-token / emoji scans run, because the
// slice source legitimately DOCUMENTS its visual-discipline contract in prose
// (e.g. "no gradients/blobs/emoji/glow, no `text-h4`"). Blanking comment bodies
// to spaces preserves line numbers for accurate offense reporting.
//
// `__tests__` directories are excluded from the scan.

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/* -------------------------------------------------------------------------- */
/* Locate the inclusion slice source roots                                    */
/* -------------------------------------------------------------------------- */

// This file lives at src/app/__tests__/inclusion-visual.test.ts.
const APP_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.resolve(APP_DIR, "..");

/** Directories whose entire (recursive) tree belongs to the inclusion slice. */
const SCAN_DIRS = [
  path.join(SRC_DIR, "components", "women"),
  path.join(SRC_DIR, "components", "csr"),
  path.join(SRC_DIR, "components", "ideas"),
];

/** The three route pages. */
const SCAN_FILES = [
  path.join(SRC_DIR, "app", "women", "page.tsx"),
  path.join(SRC_DIR, "app", "csr", "page.tsx"),
  path.join(SRC_DIR, "app", "ideas", "page.tsx"),
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

const rel = (file: string): string =>
  path.relative(SRC_DIR, file).replace(/\\/g, "/");

/**
 * Strip `//` line comments and block comments so scans read only executable
 * code. Comment bodies are blanked to spaces (newlines preserved) so reported
 * line numbers stay accurate.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\r\n]/g, " "))
    .replace(/\/\/[^\r\n]*/g, (m) => m.replace(/[^\r\n]/g, " "));
}

/** Map of file -> comment-stripped source (computed once). */
const strippedSources = new Map<string, string>(
  sliceFiles.map((f) => [f, stripComments(fs.readFileSync(f, "utf8"))]),
);

interface Offense {
  readonly token: string;
  readonly file: string;
  readonly line: number;
  readonly text: string;
}

function scanStripped(token: string, regex: RegExp): Offense[] {
  const offenses: Offense[] = [];
  for (const file of sliceFiles) {
    const lines = (strippedSources.get(file) ?? "").split(/\r?\n/);
    lines.forEach((text, index) => {
      if (regex.test(text)) {
        offenses.push({ token, file: rel(file), line: index + 1, text: text.trim() });
      }
    });
  }
  return offenses;
}

function formatOffenses(offenses: readonly Offense[]): string {
  return offenses
    .map((o) => `  [${o.token}] src/${o.file}:${o.line}  >  ${o.text}`)
    .join("\n");
}

/* -------------------------------------------------------------------------- */
/* Banned decorative / non-institutional utility classes (Req 36.1, 36.6)     */
/* -------------------------------------------------------------------------- */

interface BannedPattern {
  readonly name: string;
  readonly regex: RegExp;
}

const BANNED_PATTERNS: readonly BannedPattern[] = [
  // Gradients.
  { name: "bg-gradient", regex: /\bbg-gradient-/ },
  { name: "from-/via-/to- gradient stops", regex: /\b(from|via|to)-\[/ },
  { name: "text-gradient / bg-clip-text", regex: /\bbg-clip-text\b/ },
  // Glassmorphism — backdrop blur + frosted surfaces.
  { name: "backdrop-blur", regex: /\bbackdrop-blur(?:-|\b)/ },
  // Blur / glow-like effects.
  { name: "blur- utility", regex: /\bblur-(?:sm|md|lg|xl|2xl|3xl|\[)/ },
  { name: "drop-shadow-2xl (glow-like)", regex: /\bdrop-shadow-2xl\b/ },
  { name: "shadow-glow / glow utility", regex: /\b(?:shadow-glow|glow-)/ },
  // Disallowed typographic class.
  { name: "text-h4", regex: /\btext-h4\b/ },
];

/* -------------------------------------------------------------------------- */
/* Required institutional tokens (Req 36.3, 36.4, 36.5)                       */
/* -------------------------------------------------------------------------- */

/** Does any slice file contain `token` (in comment-stripped source)? */
function sliceHas(token: string): boolean {
  return sliceFiles.some((f) => (strippedSources.get(f) ?? "").includes(token));
}

/* -------------------------------------------------------------------------- */
/* Emoji scan (Req 36.1) — emoji must not appear in source                    */
/* -------------------------------------------------------------------------- */

// Common emoji / pictograph ranges: misc symbols & pictographs, emoticons,
// transport, supplemental symbols, dingbats, misc symbols, and the variation
// selector that renders text as emoji. Deliberately conservative to avoid
// matching ordinary punctuation or accented Latin text.
const EMOJI_REGEX =
  /[\u231A\u231B\u23E9-\u23FA\u24C2\u25AA-\u25FE\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u{1F000}-\u{1FAFF}]/u;

/* -------------------------------------------------------------------------- */
/* The smoke check                                                            */
/* -------------------------------------------------------------------------- */

describe("Inclusion_Layer visual discipline (Req 36)", () => {
  it("discovers a non-empty set of inclusion source files to scan", () => {
    expect(sliceFiles.length).toBeGreaterThan(0);
  });

  it("excludes __tests__ files from the scan set", () => {
    expect(
      sliceFiles.every((f) => !f.includes(`${path.sep}__tests__${path.sep}`)),
    ).toBe(true);
  });

  it("covers the women, csr, and ideas component dirs plus the three route pages", () => {
    const covered = (suffix: string): boolean =>
      sliceFiles.some((f) => rel(f).endsWith(suffix));
    expect(covered("app/women/page.tsx")).toBe(true);
    expect(covered("app/csr/page.tsx")).toBe(true);
    expect(covered("app/ideas/page.tsx")).toBe(true);
    expect(sliceFiles.some((f) => rel(f).startsWith("components/women/"))).toBe(true);
    expect(sliceFiles.some((f) => rel(f).startsWith("components/csr/"))).toBe(true);
    expect(sliceFiles.some((f) => rel(f).startsWith("components/ideas/"))).toBe(true);
  });

  /* ---- Absence: no decorative / non-institutional classes (Req 36.1, 36.6) ---- */

  it("uses NO gradient / blob / glassmorphism / glow / text-h4 utility classes", () => {
    const offenses = BANNED_PATTERNS.flatMap(({ name, regex }) =>
      scanStripped(name, regex),
    );
    expect(
      offenses,
      offenses.length > 0
        ? `Found banned decorative utility classes in inclusion source:\n${formatOffenses(
            offenses,
          )}`
        : "",
    ).toEqual([]);
  });

  // Per-pattern breakdown so a failure points directly at the offending class.
  for (const { name, regex } of BANNED_PATTERNS) {
    it(`has zero usages of \`${name}\``, () => {
      const offenses = scanStripped(name, regex);
      expect(
        offenses,
        offenses.length > 0 ? `\n${formatOffenses(offenses)}` : "",
      ).toEqual([]);
    });
  }

  /* ---- Absence: no emoji characters in source (Req 36.1) ---- */

  it("contains NO emoji characters in source", () => {
    const offenses: Offense[] = [];
    for (const file of sliceFiles) {
      const lines = (strippedSources.get(file) ?? "").split(/\r?\n/);
      lines.forEach((text, index) => {
        if (EMOJI_REGEX.test(text)) {
          offenses.push({
            token: "emoji",
            file: rel(file),
            line: index + 1,
            text: text.trim(),
          });
        }
      });
    }
    expect(
      offenses,
      offenses.length > 0
        ? `Found emoji characters in inclusion source:\n${formatOffenses(offenses)}`
        : "",
    ).toEqual([]);
  });

  /* ---- Presence: required institutional tokens (Req 36.3, 36.4, 36.5) ---- */

  it("renders cards with rounded-xl + shadow-sm + border somewhere in the slice", () => {
    expect(sliceHas("rounded-xl")).toBe(true);
    expect(sliceHas("shadow-sm")).toBe(true);
    expect(sliceHas("border")).toBe(true);
  });

  it("uses py-16 md:py-24 for content sections", () => {
    expect(sliceHas("py-16")).toBe(true);
    expect(sliceHas("md:py-24")).toBe(true);
  });

  it("uses py-8 or py-12 for header strips", () => {
    expect(sliceHas("py-12") || sliceHas("py-8")).toBe(true);
  });

  it("constrains content width with max-w-7xl", () => {
    expect(sliceHas("max-w-7xl")).toBe(true);
  });
});

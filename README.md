# KITE — Karnataka Innovation & Technology Ecosystem

**One Portal. One Login. One Ecosystem.**

KITE is a government-grade web portal for Karnataka's startup and innovation
ecosystem. This repository contains the **complete, feature-complete build** —
all eight prompt slices shipped (v1.0.0). It spans the public home and chrome,
registration and the policy calculator, the 22-scheme hub, startup/admin/investor
dashboards, the investor suite, the ecosystem enablement layer (incubators &
mentors), the inclusion & grassroots layer (women founders, CSR/NGO, idea bank),
ecosystem intelligence, and the closing surfaces: the Events & Media Hub, the
Global Innovation Alliance index with detail pages for all 32 partner countries,
a functional AI Chat Assistant, and the Support Center. Every route referenced in
navigation, footer, home, and the verified data resolves to a real working page.

All canonical content is verified Karnataka ecosystem data served from typed data
modules with **no backend, database, or API**. All non-verified figures are
deterministic, hash-seeded synthetic data, clearly labeled *Illustrative*.

## The eight prompts

1. **Foundation & Home** — home page, global chrome, navigation, schemes data,
   resolving stubs.
2. **Registration, Schemes & Calculator** — registration wizard, 22-scheme hub,
   scheme detail pages, the eligibility Policy Calculator.
3. **Dashboards** — startup and government admin dashboards with charts.
4. **Investor Suite** — Investor Connect, onboarding, dashboard, deal pipeline,
   matching.
5. **Ecosystem Enablement** — incubators & accelerators directory, mentors
   directory, KAN and K-Combinator program pages.
6. **Inclusion & Grassroots** — Women Founders Hub, CSR & NGO Hub, Idea Bank.
7. **Ecosystem Intelligence** — sector intelligence and reports.
8. **Events, GIA, AI Assistant & Support (closing)** — Events & Media Hub
   (`/events`), Global Innovation Alliance index + 32 country detail pages
   (`/gia`, `/gia/[country]`), the functional AI Chat Assistant, and the Support
   Center (`/support`, `/support/faqs`), plus final polish.

## The AI Chat Assistant

The floating assistant panel wires the conversation to an actual response path.
It attempts the **Anthropic Messages API via the documented Artifacts pattern**
when that runtime is available, and otherwise falls back to a pure, deterministic
**rule-based response engine** (`src/lib/kite-assistant-rules.ts`) grounded in the
KITE system prompt (`src/lib/ai-assistant-system-prompt.ts`). In the standard
Next.js runtime the Artifacts bridge is absent, so the rule engine is the
de-facto path — the assistant always responds, never exposes API keys, and never
makes blind cross-origin calls. Responses surface clickable KITE route chips so
the assistant is actionable.

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14 (App Router, React Server Components) |
| Language | TypeScript (strict, `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS 3.4 with canonical KITE design tokens |
| UI primitives | shadcn/ui (Radix) |
| Icons | Lucide React (named imports); `flag-icons` SVG flags |
| Fonts | Inter (body) + Plus Jakarta Sans (headings) via `next/font/google` |
| Animation | Framer Motion (panel transitions) + CSS-only decorations |
| Charts | Recharts (loaded via a dynamic barrel) |
| Data | Typed TS modules in `src/data/` — no fetch, no API, no storage |
| Testing | Vitest + fast-check (property-based testing) + Testing Library + axe-core |

The UI is deliberately restrained and editorial (gov.uk / Stripe / Y Combinator
reference): no gradients, blobs, emoji, glassmorphism, glow, or over-rounded
cards. Visual interest comes from typography, data density, and the Karnataka
palette.

## Getting started

```bash
npm install        # install dependencies
npm run dev        # start the dev server at http://localhost:3000
```

## Common commands

```bash
npm run build       # production build
npm run start       # serve the production build
npm run lint        # ESLint (next lint)
npm run type-check  # tsc --noEmit
npm run test:run    # run the full test suite once (Vitest)
npm run test        # Vitest watch mode
```

## Project structure

```
src/
  app/             # App Router pages, layout, dynamic routes, 404, and test suites
  components/
    home/          # the ten Home page sections
    layout/        # Header, MobileNav, CommandPalette, Footer, AIAssistantButton, SiteChrome
    events/        # Events & Media Hub sections
    gia/           # GIA index + country-detail sections
    support/       # Support Center sections
    women/ csr/ ideas/ incubators/ mentors/ investors/ dashboard/   # earlier-slice surfaces
    shared/        # reusable presentational components (cards, tiles, chips, StubPage, LazySection)
    ui/            # shadcn/ui primitives
  context/         # session-only providers (Language, Registration, Investor, IdeaBank)
  data/            # typed, verified data modules (schemes, clusters, policies, events, gia, faqs, …)
  lib/             # pure logic — synthetic generators, matching, filters, AI rule engine, reducers
  types/           # shared TypeScript interfaces
```

## Spec-driven workflow

This project was built spec-first. Each slice has its own spec under
`.kiro/specs/` with three documents: `requirements.md` (EARS-format acceptance
criteria), `design.md` (technical design plus a set of executable **correctness
properties**), and `tasks.md` (a dependency-ordered implementation plan). The
closing slice lives at `.kiro/specs/kite-events-gia-assistant-support/`.

Four principles held across all eight prompts:

- **Verified data is canonical.** Official Karnataka figures and records are
  authored verbatim and never fabricated. Every non-verified figure is synthetic,
  deterministically hash-seeded via `src/lib/synthetic-prng.ts` (never
  `Math.random`/`Date`/ambient input), byte-stable across reloads, and visibly
  labeled *Illustrative*.
- **Property-based testing.** Each correctness property is verified by a
  `fast-check` test tagged `// Feature: <slice>, Property N`, run alongside
  example/component tests, accessibility audits (axe-core), and route-resolution
  checks — so the implementation is traceable back to the spec.
- **Bundle ceiling discipline.** Every route holds **First Load JS ≤ 150KB**;
  heavy dependencies (charts) load only via a dynamic barrel.
- **Government-grade visual restraint.** No gradients, blobs, emoji,
  glassmorphism, or glow; Lucide icons only; institutional typography-led density
  throughout; WCAG 2.1 AA targeted across every surface.

## Status

Feature-complete — **v1.0.0**. All eight prompt slices shipped; the full test
suite passes; the production build succeeds with every route under the 150KB
First Load JS ceiling.

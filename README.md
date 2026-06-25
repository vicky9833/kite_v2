# KITE — Karnataka Innovation & Technology Ecosystem

**One Portal. One Login. One Ecosystem.**

KITE is a government-grade web portal for Karnataka's startup and innovation
ecosystem. This repository contains the **foundation slice**: a fully composed,
responsive, accessible Home page plus the global chrome (header, mega-menu
navigation, command palette, footer, AI assistant entry point) and resolving
stub pages for every referenced destination. All content is verified Karnataka
ecosystem data — schemes, clusters, policies, flagship programs, events, and GIA
partner countries — served from typed data modules with no backend.

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
  app/             # App Router pages, layout, route stubs, 404, and test suites
  components/
    home/          # the ten Home page sections
    layout/        # Header, MobileNav, CommandPalette, Footer, AIAssistantButton, SiteChrome
    shared/        # reusable presentational components (cards, tiles, chips, StubPage, LazySection)
    ui/            # shadcn/ui primitives
  context/         # LanguageContext (visual-only EN/ಕನ್ನಡ toggle)
  data/            # typed, verified data modules (schemes, clusters, policies, events, …)
  lib/             # utils — class merge, route validation, safe navigation, filters, guards
  types/           # shared TypeScript interfaces
```

## Spec-driven workflow

This project was built spec-first. Requirements (EARS-format acceptance
criteria), a technical design (including a set of executable **correctness
properties**), and a dependency-ordered implementation plan live under
`.kiro/specs/kite-foundation-home/` (`requirements.md`, `design.md`,
`tasks.md`). Each correctness property is verified by a `fast-check`
property-based test tagged `// Feature: kite-foundation-home, Property N`, run
alongside example/component tests, an accessibility audit, and route-resolution
checks — so the implementation is traceable back to the spec and continuously
validated against it.

// src/components/schemes/scheme-filter-state.ts
//
// Lightweight, dependency-free filter-state contract for the Schemes Hub.
//
// The visible filter controls live in `SchemeFilters.tsx`, which pulls in
// several Radix primitives (Tabs + Select). The Hub, however, only needs the
// state SHAPE and its initial value to manage `React.useState` and to run the
// pure `filterSchemeList` core. Keeping the type + default here — in a module
// with NO component/Radix imports — lets `SchemesHub` reference them WITHOUT
// statically pulling the heavy `SchemeFilters` module into the route's First
// Load, so the controls can be lazy-loaded (Req 28 performance budget).

import type { CurrentStage } from "@/types";

/**
 * Controlled filter state for the Schemes Hub (Req 13.1).
 *
 * The Hub owns this state and composes the actual filtering (AND semantics).
 * The `SchemeFilters` component only renders the controls and reports state
 * changes — it never filters schemes itself.
 */
export interface SchemeFilterState {
  /** Type tab: 'All' shows everything; 'fiscal'/'grant' match Scheme.type. */
  type: "All" | "fiscal" | "grant";
  /** Selected secondary-sector ids (multi-select). */
  sectors: string[];
  /** Selected current-stage values (multi-select). */
  stages: CurrentStage[];
  /** Status filter: 'All' shows everything; 'open'/'upcoming' match Scheme.status. */
  status: "All" | "open" | "upcoming";
  /** Case-insensitive substring matched against scheme name by the Hub (Req 13.6). */
  search: string;
}

/** Default filter state: All type + All status, no sector/stage filters, empty search (Req 13.2). */
export const INITIAL_SCHEME_FILTERS: SchemeFilterState = {
  type: "All",
  sectors: [],
  stages: [],
  status: "All",
  search: "",
};

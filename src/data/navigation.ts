// src/data/navigation.ts
//
// Single source of truth for the KITE header / mobile navigation structure.
// Consumed by Header, MobileNav, and CommandPalette (flattened destinations).
//
// VERIFIED navigation data — labels and hrefs are authored verbatim from the
// approved spec content; do not infer or paraphrase. Every leaf href is a
// non-empty internal path (query-string hrefs such as "/schemes?type=fiscal"
// are valid internal paths). Items with `children` render as dropdowns;
// "Register" is a direct link rendered by the Header as a primary CTA.

import type { NavItem } from "@/types";

export const navigation: NavItem[] = [
  {
    label: "Ecosystem",
    children: [
      { label: "About KITE", href: "/about" },
      {
        label: "Karnataka Startup Policy 2025-30",
        href: "/policies/startup-2025-30",
      },
      { label: "All 10 Vertical Policies", href: "/policies" },
      { label: "Ecosystem Intelligence", href: "/intelligence" },
      { label: "Beyond Bengaluru Clusters", href: "/clusters" },
      { label: "Annual Reports", href: "/reports" },
    ],
  },
  {
    label: "Schemes & Benefits",
    children: [
      { label: "All Schemes (22+)", href: "/schemes" },
      { label: "Fiscal Incentives", href: "/schemes?type=fiscal" },
      { label: "Grant-in-Aid Programs", href: "/schemes?type=grant" },
      { label: "ELEVATE (Idea2PoC)", href: "/schemes/elevate" },
      { label: "KITVEN Fund-5", href: "/schemes/kitven" },
      { label: "K-Combinator", href: "/programs/k-combinator" },
      {
        label: "KAN — Karnataka Acceleration Network",
        href: "/programs/kan",
      },
      { label: "LEAP (₹1,000 Cr)", href: "/programs/leap" },
      { label: "Policy Calculator", href: "/calculator" },
    ],
  },
  {
    label: "For Stakeholders",
    children: [
      { label: "Startups", href: "/startups" },
      { label: "Investors", href: "/investors" },
      { label: "Incubators & Accelerators", href: "/incubators" },
      { label: "Mentors", href: "/mentors" },
      { label: "Corporates", href: "/corporates" },
      { label: "NGOs & CSR", href: "/csr" },
      { label: "Universities", href: "/universities" },
      { label: "Women Founders", href: "/women" },
      { label: "Student Entrepreneurs", href: "/students" },
    ],
  },
  {
    label: "Beyond Bengaluru",
    children: [
      { label: "All 6 Clusters", href: "/clusters" },
      { label: "Mysuru — Cybersecurity & ESDM", href: "/clusters/mysuru" },
      { label: "Mangaluru — Silicon Beach", href: "/clusters/mangaluru" },
      {
        label: "Hubballi-Dharwad-Belagavi — AI & Aerospace",
        href: "/clusters/hdb",
      },
      { label: "Kalaburagi — AgriTech", href: "/clusters/kalaburagi" },
      { label: "Shivamogga — Manufacturing", href: "/clusters/shivamogga" },
      { label: "Tumakuru — ESDM", href: "/clusters/tumakuru" },
    ],
  },
  {
    label: "Dashboard",
    children: [
      { label: "My Startup Dashboard", href: "/dashboard/startup" },
      { label: "Government Admin Dashboard", href: "/dashboard/admin" },
    ],
  },
  {
    label: "Connect",
    children: [
      { label: "Mentor Connect", href: "/mentors" },
      { label: "Investor Connect", href: "/investors" },
      { label: "Investor Dashboard", href: "/dashboard/investor" },
      { label: "Deal Pipeline", href: "/dashboard/investor/pipeline" },
      {
        label: "Global Innovation Alliance (32 countries)",
        href: "/gia",
      },
      { label: "Events & Media", href: "/events" },
      { label: "Idea Bank", href: "/ideas" },
      { label: "Startup Jobs", href: "/jobs" },
    ],
  },
  {
    label: "Register",
    href: "/register",
  },
];

/**
 * Href for the "Register" primary call-to-action. Kept as a separate constant
 * (rather than a flag on NavItem) so the Header can style the CTA without
 * adding non-typed ad-hoc fields to the NavItem shape.
 */
export const primaryCtaHref = "/register" as const;

/**
 * Utility cluster on the right side of the Header. All entries are visual-only
 * in this slice (no backend, no storage). The search trigger opens the
 * CommandPalette via the ⌘K / Ctrl+K shortcut; the language toggle, bell, and
 * Sign In link are visual-only placeholders.
 */
export interface UtilityNav {
  /** Keyboard shortcut that opens the CommandPalette search overlay. */
  readonly searchShortcut: string;
  /** Visual-only bilingual toggle label (English | Kannada). */
  readonly languageToggleLabel: string;
  /** Visual-only notification bell, no badge in this slice. */
  readonly showNotificationBell: boolean;
  /** Visual-only "Sign In" destination. */
  readonly signInHref: string;
}

export const utilityNav: UtilityNav = {
  searchShortcut: "⌘K / Ctrl+K",
  languageToggleLabel: "EN | ಕನ್ನಡ",
  showNotificationBell: true,
  signInHref: "/signin",
};

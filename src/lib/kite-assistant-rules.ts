// src/lib/kite-assistant-rules.ts
//
// Pure, deterministic rule-based response engine for the KITE AI Assistant
// (Req 4). This is the de-facto response path in the standard Next.js runtime
// (the Anthropic Artifacts API is unavailable there); it is also used to enrich
// API responses with route suggestion chips. No I/O, no Math.random, no Date —
// the same input always yields the same output.

import type { AssistantResponse, ChatSuggestion } from '@/types';

/** Known KITE routes and the label used when surfacing them as a chip. */
const ROUTE_LABELS: Record<string, string> = {
  '/register': 'Register Your Startup',
  '/calculator': 'Policy Calculator',
  '/schemes': 'Browse Schemes',
  '/schemes/elevate': 'ELEVATE (Idea2PoC)',
  '/schemes/kitven': 'KITVEN Fund-5',
  '/schemes/gck': 'Grand Challenge Karnataka',
  '/programs/k-combinator': 'K-Combinator',
  '/programs/kan': 'KAN',
  '/programs/leap': 'LEAP',
  '/clusters': 'Beyond Bengaluru Clusters',
  '/clusters/mysuru': 'Mysuru Cluster',
  '/clusters/mangaluru': 'Mangaluru (Silicon Beach)',
  '/clusters/hdb': 'Hubballi-Dharwad-Belagavi',
  '/clusters/kalaburagi': 'Kalaburagi Cluster',
  '/clusters/shivamogga': 'Shivamogga Cluster',
  '/clusters/tumakuru': 'Tumakuru Cluster',
  '/investors': 'Investor Connect',
  '/incubators': 'Incubators & Accelerators',
  '/mentors': 'Find a Mentor',
  '/women': 'Women Founders Hub',
  '/ideas': 'Idea Bank',
  '/events': 'Events & Media',
  '/gia': 'Global Innovation Alliance',
  '/support': 'Support Center',
};

function chip(href: string): ChatSuggestion {
  return { label: ROUTE_LABELS[href] ?? href, href };
}

interface RuleMatcher {
  /** Lowercased substrings; any match triggers the rule. */
  keywords: string[];
  respond: () => AssistantResponse;
}

// Higher-priority (more specific) rules come first.
const MATCHERS: RuleMatcher[] = [
  {
    keywords: ['elevate', 'idea2poc', 'idea to poc'],
    respond: () => ({
      text: 'ELEVATE (Idea2PoC) is Karnataka\u2019s flagship early-stage grant — up to \u20B950 lakh through a four-stage selection, with 1,227+ startups funded since 2017. It is a strong fit for idea- and proof-of-concept-stage ventures. Submit applications through the official portal eitbt.karnataka.gov.in/startup. Next, review the full scheme details.',
      suggestions: [chip('/schemes/elevate'), chip('/calculator')],
    }),
  },
  {
    keywords: ['kitven'],
    respond: () => ({
      text: 'KITVEN Fund-5 is Karnataka\u2019s \u20B9100 Cr venture capital fund for growth-stage startups, investing 2\u201310% of corpus with a maximum 30% stake. It suits ventures with traction seeking institutional capital. Apply via eitbt.karnataka.gov.in/startup. Next, explore the KITVEN fund details.',
      suggestions: [chip('/schemes/kitven'), chip('/investors')],
    }),
  },
  {
    keywords: ['k-combinator', 'k combinator', 'kcombinator'],
    respond: () => ({
      text: 'K-Combinator is the Mangaluru-based accelerator run by KDEM and TiE Mangaluru — 90 startups over five years, 4\u20136 per cohort, three cohorts a year, backed by \u20B99.5 Cr from the Government of Karnataka. It is ideal for coastal-Karnataka and early-stage founders. Next, see the K-Combinator program page.',
      suggestions: [chip('/programs/k-combinator'), chip('/clusters/mangaluru')],
    }),
  },
  {
    keywords: ['kan', 'acceleration network'],
    respond: () => ({
      text: 'KAN (Karnataka Acceleration Network) connects startups with accelerators and structured growth support across the state. It is a good route once you are past the idea stage and seeking scale. Next, view the KAN program page.',
      suggestions: [chip('/programs/kan'), chip('/incubators')],
    }),
  },
  {
    keywords: ['leap'],
    respond: () => ({
      text: 'LEAP is Karnataka\u2019s \u20B91,000 Cr umbrella program spanning 16 sub-programs over five years, covering catalytic capital, deep-tech, fund-of-funds, and ecosystem infrastructure. Next, explore the LEAP program.',
      suggestions: [chip('/programs/leap'), chip('/schemes')],
    }),
  },
  {
    keywords: ['grand challenge', 'gck'],
    respond: () => ({
      text: 'Grand Challenge Karnataka is a sector-specific challenge program with public-private problem statements — Phase 2A awards \u20B910L to five startups and the Phase 2B winner receives \u20B950L. Next, view active challenges.',
      suggestions: [chip('/schemes/gck'), chip('/schemes')],
    }),
  },
  {
    keywords: ['register', 'registration', 'sign up', 'signup', 'get started'],
    respond: () => ({
      text: 'You can register your startup with KITE through the guided registration wizard — it captures your founder, company, team, sector, and location details so the portal can match you to relevant schemes. Registration is free. For formal application submission, use eitbt.karnataka.gov.in/startup. Next, start the registration wizard.',
      suggestions: [chip('/register'), chip('/calculator')],
    }),
  },
  {
    keywords: ['eligib', 'qualify', 'calculator', 'am i eligible'],
    respond: () => ({
      text: 'To check which schemes you qualify for, use the Policy Calculator — it evaluates your profile against the eligibility rules of all 22 schemes and estimates your likely benefit. Browse the full schemes hub for the underlying criteria. Next, open the Policy Calculator.',
      suggestions: [chip('/calculator'), chip('/schemes')],
    }),
  },
  {
    keywords: ['women', 'woman founder', 'female founder'],
    respond: () => ({
      text: 'The Women Founders Hub covers Karnataka\u2019s women-founder provisions — 25% of ELEVATE winners are women-led, plus the Women-Led Accelerator with dedicated capital and ELEVATE Unnati support. It also lists women-preference schemes and mentors. Next, visit the Women Founders Hub.',
      suggestions: [chip('/women'), chip('/schemes')],
    }),
  },
  {
    keywords: ['mysuru', 'mangaluru', 'silicon beach', 'hubballi', 'dharwad', 'belagavi', 'kalaburagi', 'shivamogga', 'tumakuru', 'beyond bengaluru', 'cluster'],
    respond: () => ({
      text: 'Karnataka\u2019s Beyond Bengaluru strategy spans six regional clusters — Mysuru (Cybersecurity & ESDM), Mangaluru (Silicon Beach), Hubballi-Dharwad-Belagavi (AI & Aerospace), Kalaburagi (AgriTech), Shivamogga (Manufacturing), and Tumakuru (ESDM) — backed by a \u20B975 Cr cluster seed fund. Next, explore the clusters.',
      suggestions: [chip('/clusters'), chip('/clusters/mangaluru')],
    }),
  },
  {
    keywords: ['investor', 'funding', 'venture capital', 'raise'],
    respond: () => ({
      text: 'KITE\u2019s Investor Connect surface helps founders and investors find each other, with a deal pipeline and co-investment pathways alongside KITVEN Fund-5. Next, visit Investor Connect.',
      suggestions: [chip('/investors'), chip('/schemes/kitven')],
    }),
  },
  {
    keywords: ['incubator', 'accelerator'],
    respond: () => ({
      text: 'Karnataka hosts 164+ incubators and accelerators across the state. The incubators directory is filterable by cluster, focus, and type so you can find the right host for your stage. Next, browse incubators.',
      suggestions: [chip('/incubators'), chip('/clusters')],
    }),
  },
  {
    keywords: ['mentor'],
    respond: () => ({
      text: 'The mentors directory lets you find domain experts, founder mentors, investor mentors, and government liaisons, filterable by sector and experience. Next, find a mentor.',
      suggestions: [chip('/mentors'), chip('/incubators')],
    }),
  },
  {
    keywords: ['idea', 'innovation', 'grassroot', 'student', 'farmer', 'rural'],
    respond: () => ({
      text: 'The Idea Bank lets citizens, students, farmers, researchers, and rural innovators submit ideas and get matched to real Karnataka schemes like Grassroot Innovation, NAIN 2.0, and ELEVATE. Next, visit the Idea Bank.',
      suggestions: [chip('/ideas'), chip('/schemes')],
    }),
  },
  {
    keywords: ['event', 'summit', 'demo day', 'media', 'news', 'press'],
    respond: () => ({
      text: 'The Events & Media Hub lists Karnataka\u2019s startup calendar — including the flagship Bengaluru Tech Summit 2026 — alongside ecosystem media coverage and government announcements. Next, browse Events & Media.',
      suggestions: [chip('/events'), chip('/support')],
    }),
  },
  {
    keywords: ['gia', 'international', 'global', 'partner countr', 'market access', 'export'],
    respond: () => ({
      text: 'The Global Innovation Alliance (GIA) is Karnataka\u2019s international engagement framework spanning 32 partner countries, opening market access, co-investment, and knowledge exchange for Karnataka startups. Next, explore the GIA partner countries.',
      suggestions: [chip('/gia'), chip('/investors')],
    }),
  },
  {
    keywords: ['scheme', 'grant', 'incentive', 'subsidy', 'benefit'],
    respond: () => ({
      text: 'Karnataka offers 22 schemes under the Startup Policy 2025-30, spanning fiscal incentives and grant-in-aid programs. The schemes hub lists every one with eligibility and benefits, and the Policy Calculator matches them to your profile. Apply through eitbt.karnataka.gov.in/startup. Next, browse all schemes.',
      suggestions: [chip('/schemes'), chip('/calculator')],
    }),
  },
  {
    keywords: ['support', 'help', 'contact', 'helpline', 'faq', 'question'],
    respond: () => ({
      text: 'The Support Center has FAQs, department contacts, helpline (080-22231007) and email (startupcell@karnataka.gov.in), and a ticket form. Next, visit the Support Center.',
      suggestions: [chip('/support'), chip('/register')],
    }),
  },
];

/**
 * The fallback response for any message that matches no rule (Req 4.3).
 */
function defaultResponse(): AssistantResponse {
  return {
    text: 'I can help you navigate Karnataka\u2019s startup ecosystem — schemes and eligibility, registration, incubators and mentors, investors, clusters, events, and international partnerships. Tell me what you\u2019re working on, or start by browsing the schemes hub. For application submission, use eitbt.karnataka.gov.in/startup. Next, explore your options below.',
    suggestions: [chip('/schemes'), chip('/register'), chip('/support')],
  };
}

/**
 * Generate a deterministic rule-based response for `message` (Req 4.1, 4.4).
 * Case-insensitive substring matching; the first (highest-priority) matching
 * rule wins. Always returns a non-empty `text`.
 */
export function generateRuleResponse(message: string): AssistantResponse {
  const normalized = message.toLowerCase();
  for (const matcher of MATCHERS) {
    if (matcher.keywords.some((kw) => normalized.includes(kw))) {
      return matcher.respond();
    }
  }
  return defaultResponse();
}

/**
 * Scan free-form response `text` for known KITE route tokens and return them as
 * labeled suggestion chips (used to enrich API-returned responses). Order
 * follows first appearance; duplicates are removed.
 */
export function extractRouteSuggestions(text: string): ChatSuggestion[] {
  const found: { href: string; index: number }[] = [];
  for (const href of Object.keys(ROUTE_LABELS)) {
    const index = text.indexOf(href);
    if (index !== -1) found.push({ href, index });
  }
  // Prefer longer (more specific) routes when one is a prefix of another at the
  // same position; sort by appearance, then de-dupe by href.
  return found
    .sort((a, b) => a.index - b.index)
    .map((f) => chip(f.href))
    .filter((c, i, arr) => arr.findIndex((x) => x.href === c.href) === i)
    .slice(0, 4);
}

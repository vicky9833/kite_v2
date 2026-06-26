// src/data/gia-region-editorial.ts
//
// Verified editorial templates for GIA surfaces. The per-region opportunity
// copy is a small fixed template (founder judgment, recorded once) used by the
// country detail "Investment & Partnership Opportunities" section so prose is
// never invented per country (Req 8.3). The featured programs list powers the
// GIA index "Featured International Programs" section.

import type { GIARegion } from '@/types';

/** Per-region opportunity framing for the country detail page (Req 8.3). */
export const REGION_OPPORTUNITY_COPY: Record<GIARegion, string> = {
  Europe:
    'For European partners, Karnataka offers regulatory alignment, deep-tech research depth, and a mature engineering talent base. Collaboration emphasises standards-aligned product development, joint R&D, and access to a fast-scaling domestic market.',
  'Middle East':
    'For Middle East partners, Karnataka offers a destination for capital deployment and a pipeline of ventures across smart cities, logistics, and fintech. Engagement emphasises co-investment, sovereign and family-office participation, and pilots in flagship urban projects.',
  'Asia-Pacific':
    'For Asia-Pacific partners, Karnataka offers manufacturing partnerships, supply-chain integration, and complementary hardware and software strengths. Engagement emphasises joint production, technology localisation, and two-way market access.',
  Americas:
    'For partners in the Americas, Karnataka offers technology transfer, growth capital opportunities, and a large base of AI, SaaS, and deep-tech ventures. Engagement emphasises cross-border investment, go-to-market partnerships, and R&D collaboration.',
  Africa:
    'For African partners, Karnataka offers capacity building and south-south cooperation across agritech, fintech, and skilling. Engagement emphasises knowledge exchange, affordable-innovation transfer, and shared-market solutions.',
};

export interface FeaturedInternationalProgram {
  id: string;
  name: string;
  countryCode: string;   // links to the country detail page
  focusArea: string;
  description: string;
}

/** Featured bilateral programs for the GIA index (illustrative framing). */
export const FEATURED_INTERNATIONAL_PROGRAMS: FeaturedInternationalProgram[] = [
  {
    id: 'uk-fintech-bridge',
    name: 'UK\u2013Karnataka FinTech Bridge',
    countryCode: 'gb',
    focusArea: 'FinTech',
    description:
      'A bilateral track connecting Karnataka fintech ventures with UK markets, regulators, and capital.',
  },
  {
    id: 'germany-industry40',
    name: 'Germany\u2013Karnataka Industry 4.0 Track',
    countryCode: 'de',
    focusArea: 'Industry 4.0',
    description:
      'Joint programming on advanced manufacturing, automation, and Mittelstand-startup collaboration.',
  },
  {
    id: 'israel-cyber-exchange',
    name: 'Israel\u2013Karnataka Cybersecurity Exchange',
    countryCode: 'il',
    focusArea: 'Cybersecurity',
    description:
      'A cybersecurity and deep-tech exchange linking Karnataka founders with Israeli innovation networks.',
  },
  {
    id: 'usa-ai-partnership',
    name: 'USA\u2013Karnataka AI Partnership',
    countryCode: 'us',
    focusArea: 'AI',
    description:
      'Cross-border collaboration on AI research, talent, and go-to-market for Karnataka ventures.',
  },
  {
    id: 'france-deeptech',
    name: 'France\u2013Karnataka DeepTech Program',
    countryCode: 'fr',
    focusArea: 'DeepTech',
    description:
      'A deep-tech and aerospace partnership supporting joint research and soft-landing in both ecosystems.',
  },
];

// src/data/ecosystem-stats.ts
import type { Stat } from '@/types';

/**
 * All 20 verified Karnataka ecosystem statistics.
 * Values are sourced verbatim from official reports and policy documents.
 * The home Stats Strip renders a curated subset (see `homeStatsStripIds`).
 */
export const ecosystemStats: Stat[] = [
  {
    id: 'dpiit-startups',
    label: 'DPIIT-recognized startups',
    value: 21000,
    displayValue: '21,000+',
    source: 'DPIIT, Government of India',
    asOf: '2026',
  },
  {
    id: 'vc-raised',
    label: 'VC raised by Bengaluru startups since 2010',
    value: 79,
    displayValue: '$79B',
    source: 'Bengaluru Innovation Report 2025',
    asOf: '2025',
  },
  {
    id: 'indias-vc-share',
    label: "Share of India's VC funding since 2016",
    value: 46,
    displayValue: '46%',
    source: 'Bengaluru Innovation Report 2025',
    asOf: '2025',
  },
  {
    id: 'soonicorns',
    label: 'Soonicorns (valued $100M+ or raised $50M+)',
    value: 183,
    displayValue: '183',
    source: 'Bengaluru Innovation Report 2025',
    asOf: '2025',
  },
  {
    id: 'gccs',
    label: 'Global Capability Centres',
    value: 730,
    displayValue: '730+',
    source: 'Karnataka GCC Policy 2024-29',
    asOf: '2025',
  },
  {
    id: 'gccs-india-share',
    label: "Share of India's GCCs",
    value: 40,
    displayValue: '40%',
    source: 'Karnataka GCC Policy 2024-29',
    asOf: '2025',
  },
  {
    id: 'elevate-funded',
    label: 'ELEVATE startups funded',
    value: 1227,
    displayValue: '1,227+',
    source: 'Karnataka Startup Policy OPG 2025-30',
    asOf: '2025',
  },
  {
    id: 'elevate-committed',
    label: 'Committed by ELEVATE since 2017',
    value: 280,
    displayValue: '₹280+ Cr',
    source: 'Karnataka Startup Policy OPG 2025-30',
    asOf: '2025',
  },
  {
    id: 'women-led-pct',
    label: 'Women-led among ELEVATE winners',
    value: 25,
    displayValue: '25%',
    source: 'Karnataka Startup Policy OPG 2025-30',
    asOf: '2025',
  },
  {
    id: 'gser-rank',
    label: 'Global Startup Ecosystem Rank',
    value: 14,
    displayValue: '#14',
    source: 'Global Startup Ecosystem Report 2025',
    asOf: '2025',
  },
  {
    id: 'tech-workforce',
    label: 'Tech workforce in Bengaluru',
    value: 2500000,
    displayValue: '2.5M+',
    source: 'Bengaluru Innovation Report 2025',
    asOf: '2025',
  },
  {
    id: 'chip-design-workforce',
    label: 'Workforce in chip design & embedded systems',
    value: 350000,
    displayValue: '350K+',
    source: 'Karnataka ESDM Policy 2022-27',
    asOf: '2025',
  },
  {
    id: 'coes',
    label: 'Centres of Excellence',
    value: 16,
    displayValue: '16',
    source: 'Karnataka EITBT Department',
    asOf: '2025',
  },
  {
    id: 'tbis',
    label: 'Technology Business Incubators',
    value: 50,
    displayValue: '50+',
    source: 'Karnataka Startup Compendium 2025',
    asOf: '2025',
  },
  {
    id: 'incubators-total',
    label: 'Incubators & accelerators in network',
    value: 164,
    displayValue: '164+',
    source: 'KITS Compendium 2025',
    asOf: '2025',
  },
  {
    id: 'biotech-companies',
    label: 'Biotech companies',
    value: 300,
    displayValue: '300+',
    source: 'Karnataka Biotechnology Policy 2024-29',
    asOf: '2025',
  },
  {
    id: 'gia-countries',
    label: 'Global Innovation Alliance partner countries',
    value: 32,
    displayValue: '32',
    source: 'Karnataka EITBT Department',
    asOf: '2025',
  },
  {
    id: 'gdp-growth',
    label: 'GDP growth forecast (highest globally)',
    value: 8.5,
    displayValue: '8.5%',
    source: 'Bengaluru Innovation Report 2025',
    asOf: '2025',
  },
  {
    id: 'ai-funding-share',
    label: "Share of India's AI startup funding (last 5 yrs)",
    value: 58,
    displayValue: '58%',
    source: 'Bengaluru Innovation Report 2025',
    asOf: '2024',
  },
  {
    id: 'target-startups',
    label: 'Target startups by 2030',
    value: 25000,
    displayValue: '25,000',
    source: 'Karnataka Startup Policy 2025-30',
    asOf: 'Target',
  },
];

/**
 * Curated, ordered ids the home Stats Strip renders (exactly six).
 * Consumed by LiveMetricsSection (task 4.3) so the selection is not invented downstream.
 */
export const homeStatsStripIds = [
  'dpiit-startups',
  'vc-raised',
  'soonicorns',
  'gccs',
  'gser-rank',
  'gia-countries',
] as const;

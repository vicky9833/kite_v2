// src/data/support-faqs.ts
//
// Curated Support Center FAQ content (founder judgment, drawing on verified
// Karnataka Startup Policy data). Written as government-grade support content,
// not marketing copy. Related links point only at real KITE routes.

import type { FaqItem } from '@/types';

export const supportFaqs: FaqItem[] = [
  {
    id: 'faq-register',
    category: 'Registration',
    question: 'How do I register my startup with KITE?',
    answer:
      'Use the guided registration wizard, which captures your founder, company, team, sector, and location details and assigns you a KITE ID. Registration is free and helps the portal match you to relevant schemes. For formal scheme applications, submit through the official portal at eitbt.karnataka.gov.in/startup.',
    relatedLinks: [
      { label: 'Start registration', href: '/register' },
      { label: 'Browse schemes', href: '/schemes' },
    ],
  },
  {
    id: 'faq-dpiit',
    category: 'Registration',
    question: 'Do I need DPIIT recognition before registering?',
    answer:
      'DPIIT recognition is not required to register on KITE, but several schemes ask for it as an eligibility condition. If you do not yet have it, you can still explore schemes and the Policy Calculator, and pursue DPIIT recognition in parallel.',
    relatedLinks: [
      { label: 'Check eligibility', href: '/calculator' },
      { label: 'Register', href: '/register' },
    ],
  },
  {
    id: 'faq-eligibility',
    category: 'Eligibility',
    question: 'How do I find out which schemes I qualify for?',
    answer:
      'The Policy Calculator evaluates your profile against the eligibility rules of all 22 schemes under the Karnataka Startup Policy 2025-30 and estimates your likely benefit. It is the fastest way to shortlist the schemes worth applying to.',
    relatedLinks: [
      { label: 'Open the Policy Calculator', href: '/calculator' },
      { label: 'All schemes', href: '/schemes' },
    ],
  },
  {
    id: 'faq-eligibility-age',
    category: 'Eligibility',
    question: 'Is there an age limit for the startup or founder?',
    answer:
      'Eligibility windows vary by scheme. Many schemes reference the DPIIT definition of a startup (incorporated within the last 10 years). Some youth-focused programs add a founder age condition. Use the Policy Calculator, which applies each scheme\u2019s specific rules.',
    relatedLinks: [{ label: 'Check eligibility', href: '/calculator' }],
  },
  {
    id: 'faq-schemes-count',
    category: 'Schemes',
    question: 'How many schemes does Karnataka offer?',
    answer:
      'There are 22 schemes under the Karnataka Startup Policy 2025-30, spanning fiscal incentives and grant-in-aid programs. The schemes hub lists every one with eligibility, benefits, and required documents.',
    relatedLinks: [{ label: 'Browse all schemes', href: '/schemes' }],
  },
  {
    id: 'faq-elevate',
    category: 'Schemes',
    question: 'What is ELEVATE and how much funding does it provide?',
    answer:
      'ELEVATE (Idea2PoC) is Karnataka\u2019s flagship early-stage grant, offering up to \u20B950 lakh through a four-stage selection. More than 1,227 startups have been funded since 2017, with \u20B9280+ Cr committed.',
    relatedLinks: [
      { label: 'ELEVATE details', href: '/schemes/elevate' },
      { label: 'Check eligibility', href: '/calculator' },
    ],
  },
  {
    id: 'faq-kitven',
    category: 'Schemes',
    question: 'What is KITVEN Fund-5?',
    answer:
      'KITVEN Fund-5 is Karnataka\u2019s \u20B9100 Cr venture capital fund for growth-stage startups. It invests 2\u201310% of corpus per company with a maximum 30% stake.',
    relatedLinks: [{ label: 'KITVEN Fund-5', href: '/schemes/kitven' }],
  },
  {
    id: 'faq-apply',
    category: 'Application',
    question: 'Where do I actually submit a scheme application?',
    answer:
      'KITE helps you discover and prepare, but formal applications are submitted through the official Karnataka portal at eitbt.karnataka.gov.in/startup. Keep your incorporation, DPIIT, GST, and pitch documents ready before you begin.',
    relatedLinks: [{ label: 'Browse schemes', href: '/schemes' }],
  },
  {
    id: 'faq-documents',
    category: 'Application',
    question: 'What documents do I typically need to apply?',
    answer:
      'Common requirements include your certificate of incorporation, DPIIT recognition (where applicable), GST registration, a pitch deck or concept note, and founder identity documents. Each scheme lists its exact document set on the scheme detail page.',
    relatedLinks: [{ label: 'See scheme requirements', href: '/schemes' }],
  },
  {
    id: 'faq-disbursement',
    category: 'Disbursement',
    question: 'How and when are grants disbursed?',
    answer:
      'Disbursement is typically milestone-linked and released in tranches after the relevant approvals and a signed agreement. Timelines depend on the scheme and verification stage. Track communications through the official portal and your registered email.',
    relatedLinks: [{ label: 'Browse schemes', href: '/schemes' }],
  },
  {
    id: 'faq-disbursement-delay',
    category: 'Disbursement',
    question: 'My disbursement is delayed — what should I do?',
    answer:
      'First confirm that all milestone documents and utilization certificates have been submitted and verified. If everything is in order and the delay persists beyond the stated SLA, raise a support ticket or contact the relevant cell directly.',
    relatedLinks: [{ label: 'Submit a ticket', href: '/support' }],
  },
  {
    id: 'faq-women',
    category: 'Women Founders',
    question: 'What support exists for women founders?',
    answer:
      'Women lead 25% of ELEVATE winners, and Karnataka runs a Women-Led Accelerator with dedicated capital alongside women-preference treatment in several schemes. ELEVATE Unnati additionally supports SC/ST founders. The Women Founders Hub collects these in one place.',
    relatedLinks: [
      { label: 'Women Founders Hub', href: '/women' },
      { label: 'Schemes', href: '/schemes' },
    ],
  },
  {
    id: 'faq-beyond-bengaluru',
    category: 'Beyond Bengaluru',
    question: 'What is the Beyond Bengaluru program?',
    answer:
      'Beyond Bengaluru is Karnataka\u2019s strategy to grow startup activity across six regional clusters — Mysuru, Mangaluru, Hubballi-Dharwad-Belagavi, Kalaburagi, Shivamogga, and Tumakuru — supported by a \u20B975 Cr cluster seed fund.',
    relatedLinks: [{ label: 'Explore clusters', href: '/clusters' }],
  },
  {
    id: 'faq-cluster-fund',
    category: 'Beyond Bengaluru',
    question: 'How do startups outside Bengaluru access funding?',
    answer:
      'Startups in the six clusters can access the \u20B975 Cr Beyond Bengaluru Cluster Fund and cluster-specific incubators and CoEs. The Mangaluru cluster also anchors the K-Combinator accelerator.',
    relatedLinks: [
      { label: 'Clusters', href: '/clusters' },
      { label: 'K-Combinator', href: '/programs/k-combinator' },
    ],
  },
  {
    id: 'faq-k-combinator',
    category: 'Programs',
    question: 'What is K-Combinator and who is it for?',
    answer:
      'K-Combinator is a Mangaluru-based accelerator run by KDEM and TiE Mangaluru, supporting 90 startups over five years (4\u20136 per cohort, three cohorts a year) with \u20B99.5 Cr of Government of Karnataka backing. It is aimed at early-stage founders, especially in coastal Karnataka.',
    relatedLinks: [{ label: 'K-Combinator program', href: '/programs/k-combinator' }],
  },
  {
    id: 'faq-kan',
    category: 'Programs',
    question: 'What is the Karnataka Acceleration Network (KAN)?',
    answer:
      'KAN connects startups with accelerators and structured growth support across the state. It is a good route once you are past the idea stage and looking to scale.',
    relatedLinks: [{ label: 'KAN program', href: '/programs/kan' }],
  },
  {
    id: 'faq-kitven-program',
    category: 'Programs',
    question: 'How does the LEAP program work?',
    answer:
      'LEAP is a \u20B91,000 Cr umbrella program with 16 sub-programs over five years, covering catalytic capital, deep-tech, fund-of-funds, and ecosystem infrastructure.',
    relatedLinks: [{ label: 'LEAP program', href: '/programs/leap' }],
  },
  {
    id: 'faq-international',
    category: 'International',
    question: 'How can my startup access international markets?',
    answer:
      'The Global Innovation Alliance (GIA) spans 32 partner countries and opens market access, co-investment, and knowledge exchange. Each partner country has a detail page outlining bilateral programs and opportunities.',
    relatedLinks: [{ label: 'Global Innovation Alliance', href: '/gia' }],
  },
  {
    id: 'faq-international-partner',
    category: 'International',
    question: 'I represent an international organisation — how do we partner?',
    answer:
      'International partnership inquiries are handled by the Karnataka EITBT international cell. The standard path for formal partnership initiation is engagement through the relevant India consulate, supported by the GIA framework.',
    relatedLinks: [{ label: 'Partner with Karnataka (GIA)', href: '/gia' }],
  },
  {
    id: 'faq-grassroots',
    category: 'Schemes',
    question: 'I have an idea but no company yet — can I still participate?',
    answer:
      'Yes. The Idea Bank lets citizens, students, farmers, researchers, and rural innovators submit ideas and get matched to grassroots-friendly schemes such as Grassroot Innovation, NAIN 2.0, and RGEP — no incorporated company required to start.',
    relatedLinks: [
      { label: 'Idea Bank', href: '/ideas' },
      { label: 'Schemes', href: '/schemes' },
    ],
  },
  {
    id: 'faq-incubator',
    category: 'Programs',
    question: 'How do I find an incubator or accelerator?',
    answer:
      'Karnataka hosts 164+ incubators and accelerators. The incubators directory is filterable by cluster, focus area, and type so you can match your stage and sector.',
    relatedLinks: [{ label: 'Find an incubator', href: '/incubators' }],
  },
  {
    id: 'faq-mentor',
    category: 'Programs',
    question: 'Can I get mentorship through KITE?',
    answer:
      'The mentors directory lists domain experts, founder mentors, investor mentors, and government liaisons, filterable by sector and experience level.',
    relatedLinks: [{ label: 'Find a mentor', href: '/mentors' }],
  },
  {
    id: 'faq-escalation',
    category: 'Escalation',
    question: 'How do I escalate an unresolved issue?',
    answer:
      'If a query is not resolved within the stated SLA, escalate by submitting a support ticket with your reference details, or contact the KITS helpline at 080-22231007 and email startupcell@karnataka.gov.in. For program-specific issues, contact the relevant department cell.',
    relatedLinks: [{ label: 'Submit a ticket', href: '/support' }],
  },
  {
    id: 'faq-escalation-time',
    category: 'Escalation',
    question: 'What response times can I expect?',
    answer:
      'General queries are typically acknowledged within 2 working days, scheme-specific queries within 3\u20135 working days, and escalations within 7 working days. These are indicative service levels; see the Helpline Hours & SLA section for details.',
    relatedLinks: [{ label: 'Contact KITS', href: '/contact' }],
  },
];

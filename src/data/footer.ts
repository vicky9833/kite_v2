// src/data/footer.ts
import type { FooterColumn, FooterBottom } from '@/types';

export const footerColumns: FooterColumn[] = [
  {
    title: 'For Startups',
    links: [
      { label: 'Register Your Startup', href: '/register' },
      { label: 'Browse All Schemes', href: '/schemes' },
      { label: 'ELEVATE Program', href: '/schemes/elevate' },
      { label: 'K-Combinator', href: '/programs/k-combinator' },
      { label: 'Policy Calculator', href: '/calculator' },
      { label: 'Find Incubator', href: '/incubators' },
      { label: 'Find Mentor', href: '/mentors' },
      { label: 'Apply for Grants', href: '/schemes?type=grant' },
      { label: 'Startup Jobs', href: '/jobs' },
      { label: 'Dashboards', href: '/dashboard/startup' },
      { label: 'Women Founders Hub', href: '/women' },
      { label: 'Idea Bank', href: '/ideas' },
    ],
  },
  {
    title: 'For Investors',
    links: [
      { label: 'Investor Connect', href: '/investors' },
      { label: 'Investor Dashboard', href: '/dashboard/investor' },
      { label: 'Pipeline Dashboard', href: '/dashboard/investor/pipeline' },
      { label: 'Deal Pipeline', href: '/investors/pipeline' },
      { label: 'KITVEN Fund-5', href: '/schemes/kitven' },
      { label: 'Beyond Bengaluru Clusters', href: '/clusters' },
      { label: 'Co-investment Opportunities', href: '/investors/co-invest' },
      { label: 'Sector Reports', href: '/intelligence/reports' },
      { label: 'Submit Term Sheet', href: '/investors/submit' },
    ],
  },
  {
    title: 'For Ecosystem Partners',
    links: [
      { label: 'Incubators & Accelerators', href: '/incubators' },
      { label: 'Corporates & GCCs', href: '/corporates' },
      { label: 'NGOs & CSR Partners', href: '/csr' },
      { label: 'Universities & R&D', href: '/universities' },
      { label: 'International Partners (GIA)', href: '/gia' },
      { label: 'Government Procurement', href: '/procurement' },
    ],
  },
  {
    title: 'Programs & Policies',
    links: [
      { label: 'Karnataka Startup Policy 2025-30', href: '/policies/startup-2025-30' },
      { label: 'All 10 Vertical Policies', href: '/policies' },
      { label: 'LEAP (₹1,000 Cr)', href: '/programs/leap' },
      { label: 'KAN — Karnataka Acceleration Network', href: '/programs/kan' },
      { label: 'Centres of Excellence (16)', href: '/coe' },
      { label: 'NAIN 2.0', href: '/programs/nain' },
      { label: 'Grand Challenge Karnataka', href: '/schemes/gck' },
      { label: 'Beyond Bengaluru', href: '/clusters' },
    ],
  },
  {
    title: 'Support & Resources',
    links: [
      { label: 'Help Center', href: '/support' },
      { label: 'FAQs', href: '/support/faqs' },
      { label: 'Contact KITS', href: '/contact' },
      { label: 'Helpline: 080-22231007', href: 'tel:+918022231007', external: true },
      { label: 'Email: startupcell@karnataka.gov.in', href: 'mailto:startupcell@karnataka.gov.in', external: true },
      { label: 'Events & Media', href: '/events' },
      { label: 'Annual Reports', href: '/reports' },
      { label: 'Tenders & RFPs', href: '/tenders' },
      { label: 'API Documentation', href: '/developers' },
    ],
  },
];

export const footerBottom: FooterBottom = {
  legalLines: [
    '© 2025 Government of Karnataka. All rights reserved.',
    'Department of Electronics, IT, Bt and S&T',
    'Operated by KITS (Karnataka Innovation and Technology Society) and KDEM (Karnataka Digital Economy Mission)',
  ],
  links: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'Sitemap', href: '/sitemap' },
    { label: 'RTI', href: '/rti' },
  ],
  tagline: 'One Portal. One Login. One Ecosystem.',
};

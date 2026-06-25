// src/data/sectors.ts
import type { Sector } from '@/types';

// Sector taxonomy derived from the union of focus areas across the verified,
// already-authored data (innovation schemes, Beyond Bengaluru clusters,
// flagship programs, GIA partner countries, and incubators). Icons are valid
// lucide-react export names. Kept to a curated set so the chip filter stays
// useful without overwhelming the visitor.
export const sectors: Sector[] = [
  {
    id: 'deep-tech',
    name: 'Deep Tech',
    description:
      'Frontier research-led ventures spanning advanced materials, quantum, and core R&D.',
    icon: 'Atom',
  },
  {
    id: 'ai-ml',
    name: 'AI & ML',
    description:
      'Artificial intelligence and machine learning applied across products and platforms.',
    icon: 'BrainCircuit',
  },
  {
    id: 'fintech',
    name: 'FinTech',
    description: 'Digital payments, lending, and financial infrastructure startups.',
    icon: 'Banknote',
  },
  {
    id: 'health-tech',
    name: 'HealthTech',
    description: 'Digital health, diagnostics, and care-delivery innovation.',
    icon: 'HeartPulse',
  },
  {
    id: 'agri-tech',
    name: 'AgriTech',
    description: 'Technology for farming, supply chains, and rural agricultural productivity.',
    icon: 'Sprout',
  },
  {
    id: 'bio-tech',
    name: 'BioTech',
    description: 'Life sciences, genomics, and bio-manufacturing ventures.',
    icon: 'FlaskConical',
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    description: 'Security, privacy, and trust infrastructure for the digital economy.',
    icon: 'ShieldCheck',
  },
  {
    id: 'esdm-semiconductor',
    name: 'ESDM & Semiconductor',
    description:
      'Electronics system design, manufacturing, and semiconductor design ventures.',
    icon: 'Cpu',
  },
  {
    id: 'space-tech',
    name: 'SpaceTech',
    description: 'Space systems, launch, and satellite-enabled applications.',
    icon: 'Rocket',
  },
  {
    id: 'marine-tech',
    name: 'MarineTech',
    description: 'Coastal, ocean, and blue-economy innovation.',
    icon: 'Waves',
  },
  {
    id: 'cleantech-climatetech',
    name: 'CleanTech & ClimateTech',
    description: 'Clean energy, sustainability, and climate-resilience solutions.',
    icon: 'Leaf',
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Advanced and smart manufacturing across industrial sectors.',
    icon: 'Factory',
  },
  {
    id: 'robotics',
    name: 'Robotics',
    description: 'Automation, robotics, and intelligent machines.',
    icon: 'Bot',
  },
  {
    id: 'ed-tech',
    name: 'EdTech',
    description: 'Learning, skilling, and education-delivery platforms.',
    icon: 'GraduationCap',
  },
  {
    id: 'social-impact',
    name: 'Social Impact',
    description: 'Ventures addressing grassroots, rural, and inclusive development.',
    icon: 'HandHeart',
  },
  {
    id: 'gaming-avgc',
    name: 'GamingTech & AVGC',
    description: 'Animation, visual effects, gaming, comics, and extended reality.',
    icon: 'Gamepad2',
  },
  {
    id: 'mobility',
    name: 'Mobility',
    description: 'Electric vehicles, transport, and next-generation mobility.',
    icon: 'Car',
  },
  {
    id: 'aerospace',
    name: 'Aerospace',
    description: 'Aerospace and defence systems and components.',
    icon: 'Plane',
  },
  {
    id: 'saas-enterprise',
    name: 'SaaS & Enterprise',
    description: 'Software-as-a-service and enterprise platforms, including GCC innovation.',
    icon: 'Cloud',
  },
  {
    id: 'logistics',
    name: 'Logistics',
    description: 'Supply chain, warehousing, and logistics technology.',
    icon: 'Truck',
  },
];

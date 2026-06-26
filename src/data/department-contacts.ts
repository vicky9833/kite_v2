// src/data/department-contacts.ts
//
// Department contact cards for the Support Center. The KITS helpline and email
// are the verified footer details; the remaining cell contacts are clearly
// illustrative (marked `illustrative: true`).

import type { DepartmentContact } from '@/types';

export const departmentContacts: DepartmentContact[] = [
  {
    id: 'kits',
    name: 'KITS — Karnataka Innovation and Technology Society',
    email: 'startupcell@karnataka.gov.in',
    phone: '080-22231007',
    illustrative: false,
  },
  {
    id: 'kdem',
    name: 'KDEM — Karnataka Digital Economy Mission',
    email: 'partnerships@kdem.in',
    phone: '080-22340000',
    illustrative: true,
  },
  {
    id: 'elevate-cell',
    name: 'ELEVATE Cell',
    email: 'elevate@karnataka.gov.in',
    phone: '080-22341010',
    illustrative: true,
  },
  {
    id: 'investor-cell',
    name: 'Investor Cell',
    email: 'investors@kdem.in',
    phone: '080-22341020',
    illustrative: true,
  },
  {
    id: 'international-cell',
    name: 'International Cell (Global Innovation Alliance)',
    email: 'gia@kdem.in',
    phone: '080-22341030',
    illustrative: true,
  },
];

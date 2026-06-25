// src/app/programs/k-combinator/page.tsx
//
// Dedicated static route segment for `/programs/k-combinator` (Req 5.1). This
// real editorial page replaces the StubPage previously reached via the dynamic
// `app/programs/[slug]/page.tsx` fallback. The dynamic [slug] route is left
// untouched; Next.js prefers this static segment over the dynamic match.
//
// Server Component: renders the shared ProgramEditorial composition with the
// verified `kCombinatorProgram` data (KDEM/TiE partnership, wrkwrk Silicon
// Beach Mangaluru, 4–6 startups per cohort, 3 cohorts/year, 90 startups over
// 5 years, 5 soonicorns by 2034, the nine verified sectors, ₹10 lakh @ 0%
// equity, ₹9.5 crore from GoK plus ₹50 lakh in-kind from TiE).

import type { Metadata } from "next";

import { ProgramEditorial } from "@/components/programs/ProgramEditorial";
import { kCombinatorProgram } from "@/data/k-combinator-program";

export const metadata: Metadata = {
  title: "K-Combinator",
  description:
    "K-Combinator is a frontier-technology acceleration program delivered in " +
    "partnership with KDEM and TiE Mangaluru, based at wrkwrk in Silicon Beach " +
    "Mangaluru.",
};

export default function KCombinatorPage() {
  return <ProgramEditorial data={kCombinatorProgram} />;
}

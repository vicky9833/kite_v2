// src/app/programs/kan/page.tsx
// KAN — Karnataka Acceleration Network editorial program page (Req 4).
// Dedicated static route segment: in the App Router a static segment outranks
// the sibling dynamic `app/programs/[slug]/page.tsx`, so `/programs/kan`
// resolves here to the editorial page while every other slug still falls
// through to the humanized stub. The `[slug]` route is left untouched (Req 4.1).
import type { Metadata } from "next";

import { ProgramEditorial } from "@/components/programs/ProgramEditorial";
import { kanProgram } from "@/data/kan-program";

export const metadata: Metadata = {
  title: "Karnataka Acceleration Network (KAN) — KITE",
  description:
    "KAN runs six-month acceleration cohorts and has supported 306 startups over three years across Karnataka.",
};

export default function KanProgramPage() {
  return <ProgramEditorial data={kanProgram} />;
}

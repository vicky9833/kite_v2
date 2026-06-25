// src/app/ideas/page.tsx
//
// Idea Bank (`/ideas`) — the grassroots-facing surface where citizens,
// students, farmers, researchers, and rural innovators submit ideas in plain
// language and get routed to real Karnataka government innovation programs
// (Req 36). Replaces the foundation route stub.
//
// Server component shell composing the Idea_Bank sections in order. The hero
// carries the page's single `h1`; every following section owns a single `h2`,
// giving a flat, sequential heading outline. Each section is full-bleed and
// self-contained (its own background, `py-16 md:py-24` rhythm, and inner
// `max-w-7xl px-4 sm:px-6 lg:px-8` container), so the page renders them in
// order without an extra wrapper.
//
// IdeaBankClient is the only client island: it consumes the session-only
// `useIdeaBank()` context (wired globally via `IdeaBankProvider` in
// layout.tsx) and internally renders the categories spotlight, submission
// form, success state, and public ideas board. The remaining sections are
// Server Components, keeping the route's First Load JS lean (Req 36).

import type { Metadata } from "next";

import { IdeaHeroStrip } from "@/components/ideas/IdeaHeroStrip";
import { IdeaHowItWorks } from "@/components/ideas/IdeaHowItWorks";
import { IdeaBankClient } from "@/components/ideas/IdeaBankClient";
import { IdeaFeaturedSchemes } from "@/components/ideas/IdeaFeaturedSchemes";
import { IdeaResources } from "@/components/ideas/IdeaResources";

export const metadata: Metadata = {
  title: "Idea Bank | KITE",
  description:
    "Share your idea in plain language and we'll match it to the Karnataka government innovation programs that can help bring it to life.",
};

export default function IdeasPage() {
  return (
    <>
      <IdeaHeroStrip />
      <IdeaHowItWorks />
      <IdeaBankClient />
      <IdeaFeaturedSchemes />
      <IdeaResources />
    </>
  );
}

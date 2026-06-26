// src/app/support/page.tsx
//
// `/support` — Support Center (Req 10). Server shell composing the hero, help
// grid, FAQ accordion (client island), contact, department contacts, ticket
// form (client island), helpline/SLA, and resources.

import type { Metadata } from "next";

import { SupportHero } from "@/components/support/SupportHero";
import { SupportHelpGrid } from "@/components/support/SupportHelpGrid";
import { SupportFaqAccordion } from "@/components/support/SupportFaqAccordion";
import { ContactKits } from "@/components/support/ContactKits";
import { DepartmentContacts } from "@/components/support/DepartmentContacts";
import { SubmitTicket } from "@/components/support/SubmitTicket";
import { HelplineSla } from "@/components/support/HelplineSla";
import { SupportResources } from "@/components/support/SupportResources";

export const metadata: Metadata = {
  title: "Support Center — KITE",
  description:
    "FAQs, contacts, helpline, and support for the Karnataka startup ecosystem.",
};

export default function SupportPage() {
  return (
    <>
      <SupportHero />
      <SupportHelpGrid />
      <SupportFaqAccordion />
      <ContactKits />
      <DepartmentContacts />
      <SubmitTicket />
      <HelplineSla />
      <SupportResources />
    </>
  );
}

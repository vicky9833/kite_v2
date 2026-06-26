// src/app/students/page.tsx
import type { Metadata } from "next";
import { GraduationCap, Lightbulb, Rocket, Trophy } from "lucide-react";

import { PageHero, ContentSection, InfoGrid } from "@/components/shared/PageShell";

export const metadata: Metadata = {
  title: "For Students — KITE",
  description: "Student innovation programs including NAIN and campus entrepreneurship initiatives.",
};

const ITEMS = [
  { id: "nain", icon: GraduationCap, title: "NAIN 2.0", description: "The New Age Innovation Network funds student innovation teams across Karnataka colleges.", href: "/programs/nain", hrefLabel: "About NAIN" },
  { id: "ideas", icon: Lightbulb, title: "Submit an idea", description: "Have an idea but no company yet? Submit it to the Idea Bank and get matched to schemes.", href: "/ideas", hrefLabel: "Idea Bank" },
  { id: "rgep", icon: Trophy, title: "RGEP stipend", description: "Young innovators (age ≤ 30) can access a 12-month stipend to pursue their venture.", href: "/schemes", hrefLabel: "Browse schemes" },
  { id: "register", icon: Rocket, title: "Register your startup", description: "Ready to incorporate? Create your KITE profile and unlock scheme matching.", href: "/register", hrefLabel: "Register" },
];

export default function StudentsPage() {
  return (
    <>
      <PageHero
        eyebrow="For Students"
        title="Student entrepreneurship in Karnataka"
        subtitle="From campus ideas to funded ventures — NAIN 2.0, the Idea Bank, RGEP stipends, and the path to registration."
        actions={[
          { label: "Submit an Idea", href: "/ideas" },
          { label: "Browse Schemes", href: "/schemes", variant: "outline" },
        ]}
      />
      <ContentSection id="student-programs" heading="Programs for students">
        <InfoGrid items={ITEMS} columns={2} />
      </ContentSection>
    </>
  );
}

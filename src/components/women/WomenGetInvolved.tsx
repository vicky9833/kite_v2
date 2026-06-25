import Link from "next/link";
import { ArrowRight, HeartHandshake, Rocket } from "lucide-react";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * WomenGetInvolved — the Women_Hub get-involved section (Req 15).
 *
 * Renders EXACTLY 2 get-involved cards (Req 15.1):
 *  1. "I am a Woman Founder" with calls-to-action linking to `/register`
 *     ("Register Your Startup") and `/schemes` ("Browse Eligible Schemes")
 *     (Req 15.2).
 *  2. "I want to Support Women Founders" with calls-to-action linking to
 *     `/mentors` ("Become a Mentor") and `/investors` ("Partner as an
 *     Investor") (Req 15.3).
 *
 * Server Component (no interactivity / no `"use client"`). Government-grade
 * restraint: flat `rounded-xl shadow-sm border` cards, Lucide icons only, no
 * gradients/blobs/emoji.
 */

const CARD_CLASS =
  "flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm";

const PRIMARY_LINK_CLASS = cn(buttonVariants({ variant: "default" }), "gap-2");
const SECONDARY_LINK_CLASS = cn(buttonVariants({ variant: "outline" }), "gap-2");

export function WomenGetInvolved() {
  return (
    <section
      aria-labelledby="women-get-involved-heading"
      className="bg-surface py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="women-get-involved-heading"
          title="Get Involved"
          description="Whether you are building a venture or supporting those who do, there is a clear path forward."
        />

        <ul
          role="list"
          className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2"
        >
          {/* 1 — I am a Woman Founder */}
          <li className={CARD_CLASS}>
            <Rocket aria-hidden="true" className="h-6 w-6 text-primary" />
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg text-dark">
                I am a Woman Founder
              </h3>
              <p className="text-body text-muted">
                Register your startup and discover the schemes and preferences
                you are eligible for.
              </p>
            </div>
            <div className="mt-auto flex flex-wrap gap-3">
              <Link href="/register" className={PRIMARY_LINK_CLASS}>
                Register Your Startup
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link href="/schemes" className={SECONDARY_LINK_CLASS}>
                Browse Eligible Schemes
              </Link>
            </div>
          </li>

          {/* 2 — I want to Support Women Founders */}
          <li className={CARD_CLASS}>
            <HeartHandshake aria-hidden="true" className="h-6 w-6 text-primary" />
            <div className="flex flex-col gap-2">
              <h3 className="font-heading text-lg text-dark">
                I want to Support Women Founders
              </h3>
              <p className="text-body text-muted">
                Share your expertise as a mentor or back women-led ventures as
                an investor.
              </p>
            </div>
            <div className="mt-auto flex flex-wrap gap-3">
              <Link href="/mentors" className={PRIMARY_LINK_CLASS}>
                Become a Mentor
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link href="/investors" className={SECONDARY_LINK_CLASS}>
                Partner as an Investor
              </Link>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

export default WomenGetInvolved;

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * InvestorOnboardingCta — section 9 of Investor Connect (Req 15). A centered
 * "Get Investor Access" closing band:
 *  - primary CTA "Begin Onboarding" → `/investors/onboard` (Req 15.2);
 *  - a secondary line explaining the free Phase-2 verification process (Req 15.3).
 *
 * Server Component (no interactivity / no `"use client"`).
 */
export function InvestorOnboardingCta() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-h2 text-dark">Get Investor Access</h2>
        <Link
          href="/investors/onboard"
          className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
        >
          Begin Onboarding
        </Link>
        <p className="text-body text-muted">
          KITE Investor Access is a free verification process for accredited
          investors looking to engage with the Karnataka ecosystem. Real
          verification opens in Phase 2.
        </p>
      </div>
    </section>
  );
}

export default InvestorOnboardingCta;

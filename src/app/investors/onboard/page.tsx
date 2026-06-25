import { Suspense } from "react";

import { OnboardPageClient } from "@/components/investors/OnboardPageClient";

/**
 * `/investors/onboard` — thin server component wrapping the client island in a
 * `Suspense` boundary (required because `OnboardPageClient` calls
 * `useSearchParams`, which opts its subtree into client-side rendering). The
 * section wrapper/padding mirrors `/register`.
 */
export default function InvestorOnboardPage() {
  return (
    <section className="py-16 md:py-24">
      <Suspense fallback={<div aria-hidden className="min-h-[24rem]" />}>
        <OnboardPageClient />
      </Suspense>
    </section>
  );
}

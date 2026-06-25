import { Suspense } from "react";

import { RegisterPageClient } from "@/components/registration/RegisterPageClient";

/**
 * `/register` — thin server component wrapping the client island in a `Suspense`
 * boundary (required because `RegisterPageClient` calls `useSearchParams`, which
 * opts its subtree into client-side rendering). The section wrapper/padding is
 * preserved from the original page so layout is unchanged.
 */
export default function RegisterPage() {
  return (
    <section className="py-16 md:py-24">
      <Suspense fallback={<div aria-hidden className="min-h-[24rem]" />}>
        <RegisterPageClient />
      </Suspense>
    </section>
  );
}

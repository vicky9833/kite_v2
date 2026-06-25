// src/app/schemes/compare/page.tsx
//
// Route: `/schemes/compare` (task 3.14, Req 17.1).
//
// `CompareView` reads the selected scheme ids via `useSearchParams()`. In the
// App Router that hook must sit under a `<Suspense>` boundary, otherwise the
// build emits a "useSearchParams should be wrapped in a suspense boundary"
// error and the entire route is forced into client-side rendering. This page
// stays a server component and supplies the boundary plus a restrained
// loading fallback.

import { Suspense } from "react";

import { CompareView } from "@/components/schemes/CompareView";

function CompareFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-center text-body text-muted">Loading comparison…</p>
    </div>
  );
}

export default function CompareSchemesPage() {
  return (
    <Suspense fallback={<CompareFallback />}>
      <CompareView />
    </Suspense>
  );
}

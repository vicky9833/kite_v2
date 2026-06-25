"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { useRegistration } from "@/context/RegistrationContext";

// Only one view renders at a time (entry OR results), so each is code-split into
// its own chunk via `next/dynamic` to keep `/calculator` First Load JS lean — the
// inactive view's chunk (and, for the entry, its on-demand Radix form) never
// enters the initial bundle. `ssr: false` is safe here: the coordinator is an
// interactive Client Component anyway. Height-reserving fallbacks hold layout
// while the active view's chunk loads.
const CalculatorEntry = dynamic(
  () => import("@/components/calculator/CalculatorEntry").then((m) => m.CalculatorEntry),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[24rem]" /> },
);

const CalculatorResults = dynamic(
  () => import("@/components/calculator/CalculatorResults").then((m) => m.CalculatorResults),
  { ssr: false, loading: () => <div aria-hidden="true" className="min-h-[24rem]" /> },
);

/**
 * Calculator — the client coordinator for the Policy Calculator at `/calculator`
 * (Req 20.1, 20.5). It owns the entry ⇄ results state switch and the
 * edit-profile flow, delegating presentation to {@link CalculatorEntry} (the
 * State-1 entry card) and {@link CalculatorResults} (the results view).
 *
 * STATE SWITCH (Req 20.5):
 *   The application is in one of three conceptual states, derived from context:
 *     - No_Profile_State   → `registrationProfile === null`
 *     - Profile_Set_State  → profile exists, `isRegistered === false`
 *     - Registered_State   → profile exists, `isRegistered === true`
 *   A Registration_Profile exists in BOTH Profile_Set_State and Registered_State,
 *   so the single predicate `registrationProfile !== null` decides the view:
 *   profile present → results; otherwise → entry.
 *
 * EDIT-PROFILE FLOW:
 *   `CalculatorResults` exposes an Edit/Update Profile affordance via
 *   `onEditProfile`. We hold a local `editing` flag that, when true, forces the
 *   entry view back into the DOM even though a profile already exists — letting
 *   the visitor reach the inline `QuickProfileForm` (or the `/register` path)
 *   again. Saving the quick profile fires `onProfileReady`, which clears
 *   `editing` and returns the coordinator to the results view.
 *
 *   View resolution: show the entry card when there is no profile yet OR the
 *   visitor is actively editing; otherwise show the results.
 */
export function Calculator() {
  const { registrationProfile } = useRegistration();
  const [editing, setEditing] = useState(false);

  const hasProfile = registrationProfile !== null;
  const showEntry = !hasProfile || editing;

  return (
    <>
      {/* Compact hero — mirrors the Schemes Hub styling (Req 20.1). */}
      <section className="bg-dark py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Policy Calculator
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/80">
            Estimate your benefits across all twenty-two schemes under the
            Karnataka Startup Policy 2025-30.
          </p>
        </div>
      </section>

      {/* Content area — entry (No_Profile_State / editing) or results. */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        {showEntry ? (
          <CalculatorEntry onProfileReady={() => setEditing(false)} />
        ) : (
          <CalculatorResults onEditProfile={() => setEditing(true)} />
        )}
      </section>
    </>
  );
}

export default Calculator;

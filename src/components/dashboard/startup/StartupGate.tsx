"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useRegistration } from "@/context/RegistrationContext";

/**
 * StartupGate — registration gate for `/dashboard/startup` (Req 1.1–1.4, 28.4).
 *
 * Reads `isRegistered` from the session `RegistrationContext`:
 *
 *  - **Unregistered_State** — in a `useEffect`, `router.push` to
 *    `/register?redirectFrom=dashboard/startup` (Req 1.1), and render a
 *    `Redirecting_State` block that announces the redirect through an
 *    `aria-live="polite"` region (Req 1.2, 1.3, 28.4). No personalized content
 *    flashes before the redirect.
 *  - **Registered_State** — render `children` (Req 1.4).
 *
 * Because `RegistrationContext` is in-memory only, a refresh resets to the
 * unregistered state, so a hard-loaded `/dashboard/startup` always redirects
 * (Req 30.4).
 */
export interface StartupGateProps {
  children: ReactNode;
}

export function StartupGate({ children }: StartupGateProps) {
  const { isRegistered } = useRegistration();
  const router = useRouter();

  useEffect(() => {
    if (!isRegistered) {
      router.push("/register?redirectFrom=dashboard/startup"); // Req 1.1
    }
  }, [isRegistered, router]);

  if (!isRegistered) {
    // Redirecting_State (Req 1.2, 1.3, 28.4).
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <p aria-live="polite" className="text-body text-muted">
          Redirecting you to registration…
        </p>
      </div>
    );
  }

  return <>{children}</>; // Registered_State (Req 1.4).
}

export default StartupGate;

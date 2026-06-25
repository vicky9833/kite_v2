/**
 * Context unit tests — InvestorProvider / useInvestor (task 2.3).
 *
 * These are EXAMPLE / unit tests (not property-based tests) for the session-only
 * investor context defined in `src/context/InvestorContext.tsx`.
 *
 * They exercise the public contract (Req 1.1, 1.3, 1.5, 1.6, 2.2, 2.7):
 *  - initial null / false state,
 *  - "refresh reset": a freshly mounted provider yields the initial state
 *    because the state is in-memory only and never persisted (Req 1.1, 1.3),
 *  - `completeOnboarding` setting `isOnboarded` + a well-formed `investorId`
 *    (`INV_ID_PATTERN`) + a non-empty ISO `onboardedAt` (Req 2.2),
 *  - `resetInvestor` back to the initial state (Req 2.7),
 *  - the descriptive error thrown when `useInvestor` is used outside a provider
 *    (Req 1.6),
 *  - and the non-throwing `useOptionalInvestor` fallback (Req 1.5).
 *
 * The hook is exercised with @testing-library/react's `renderHook` (+ `act` for
 * state-mutating callbacks). jsdom global cleanup lives in `src/test/setup.ts`.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import {
  InvestorProvider,
  useInvestor,
  useOptionalInvestor,
} from "@/context/InvestorContext";
import { INV_ID_PATTERN } from "@/lib/investor-id-generator";

/** Wrapper that mounts the hook under a fresh InvestorProvider. */
function wrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return <InvestorProvider>{children}</InvestorProvider>;
}

/** Render `useInvestor` inside a fresh provider (one mount per call). */
function renderInvestor() {
  return renderHook(() => useInvestor(), { wrapper });
}

describe("InvestorProvider / useInvestor", () => {
  /* ---------------------------------------------------------------------- */
  /* Initial state (Req 1.1)                                                */
  /* ---------------------------------------------------------------------- */

  it("starts with a null profile and not onboarded", () => {
    const { result } = renderInvestor();

    expect(result.current.investorProfile).toBeNull();
    expect(result.current.isOnboarded).toBe(false);
  });

  /* ---------------------------------------------------------------------- */
  /* updateInvestorProfile merge (Req 2.1)                                  */
  /* ---------------------------------------------------------------------- */

  it("merges successive updateInvestorProfile partials, preserving untouched fields", () => {
    const { result } = renderInvestor();

    act(() => {
      result.current.updateInvestorProfile({
        investorName: "Asha",
        firmName: "Kite Capital",
      });
    });

    expect(result.current.investorProfile).toMatchObject({
      investorName: "Asha",
      firmName: "Kite Capital",
    });

    // A second partial overwrites only its own keys and preserves the rest.
    act(() => {
      result.current.updateInvestorProfile({
        firmName: "Kite Ventures",
        assetsUnderManagement: 5000,
      });
    });

    expect(result.current.investorProfile).toMatchObject({
      investorName: "Asha", // preserved from the first partial
      firmName: "Kite Ventures", // overwritten by the second partial
      assetsUnderManagement: 5000, // added by the second partial
    });
  });

  /* ---------------------------------------------------------------------- */
  /* completeOnboarding (Req 2.2)                                           */
  /* ---------------------------------------------------------------------- */

  it("completeOnboarding sets isOnboarded, a well-formed investorId, and an ISO onboardedAt", () => {
    const { result } = renderInvestor();

    act(() => {
      result.current.updateInvestorProfile({ investorName: "Asha" });
    });

    act(() => {
      result.current.completeOnboarding();
    });

    expect(result.current.isOnboarded).toBe(true);

    const profile = result.current.investorProfile;
    expect(profile).not.toBeNull();
    // The investorId matches the unambiguous INV-YYYY-XXXXXX pattern.
    expect(profile!.investorId).toMatch(INV_ID_PATTERN);
    expect(profile!.isOnboarded).toBe(true);

    // onboardedAt is a non-empty ISO 8601 timestamp.
    expect(typeof profile!.onboardedAt).toBe("string");
    expect(profile!.onboardedAt.length).toBeGreaterThan(0);
    expect(new Date(profile!.onboardedAt).toISOString()).toBe(
      profile!.onboardedAt,
    );
  });

  /* ---------------------------------------------------------------------- */
  /* resetInvestor (Req 2.7)                                                */
  /* ---------------------------------------------------------------------- */

  it("resetInvestor returns to the initial null / false state", () => {
    const { result } = renderInvestor();

    act(() => {
      result.current.updateInvestorProfile({ investorName: "Asha" });
      result.current.completeOnboarding();
    });

    expect(result.current.isOnboarded).toBe(true);
    expect(result.current.investorProfile).not.toBeNull();

    act(() => {
      result.current.resetInvestor();
    });

    expect(result.current.investorProfile).toBeNull();
    expect(result.current.isOnboarded).toBe(false);
  });

  /* ---------------------------------------------------------------------- */
  /* Refresh reset — state does not survive a remount (Req 1.1, 1.3)        */
  /* ---------------------------------------------------------------------- */

  it("does not persist state across a fresh provider mount (models a page refresh)", () => {
    // First "session": populate and complete onboarding.
    const first = renderInvestor();
    act(() => {
      first.result.current.updateInvestorProfile({
        investorName: "Asha",
        firmName: "Kite Capital",
      });
      first.result.current.completeOnboarding();
    });
    expect(first.result.current.isOnboarded).toBe(true);
    first.unmount();

    // A refresh remounts a brand-new provider — no persistence layer exists,
    // so the new instance must read back as the pristine initial state.
    const second = renderInvestor();
    expect(second.result.current.investorProfile).toBeNull();
    expect(second.result.current.isOnboarded).toBe(false);
  });

  /* ---------------------------------------------------------------------- */
  /* Outside-provider usage error (Req 1.6)                                 */
  /* ---------------------------------------------------------------------- */

  it("throws a descriptive error when used outside an InvestorProvider", () => {
    // React logs the thrown render error to console.error; silence it so the
    // expected-failure path does not pollute the test output.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => renderHook(() => useInvestor())).toThrow(
      "useInvestor must be used within an InvestorProvider",
    );

    consoleError.mockRestore();
  });

  /* ---------------------------------------------------------------------- */
  /* Non-throwing fallback (Req 1.5)                                        */
  /* ---------------------------------------------------------------------- */

  it("useOptionalInvestor returns the not-onboarded fallback outside a provider", () => {
    const { result } = renderHook(() => useOptionalInvestor());

    expect(result.current.investorProfile).toBeNull();
    expect(result.current.isOnboarded).toBe(false);

    // Every mutator is a safe no-op — calling them must not throw.
    expect(() => {
      act(() => {
        result.current.updateInvestorProfile({ investorName: "Asha" });
        result.current.completeOnboarding();
        result.current.resetInvestor();
      });
    }).not.toThrow();

    // State is unaffected by the no-op mutators.
    expect(result.current.investorProfile).toBeNull();
    expect(result.current.isOnboarded).toBe(false);
  });
});

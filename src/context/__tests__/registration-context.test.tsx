/**
 * Context unit tests — RegistrationProvider / useRegistration (task 1.16).
 *
 * These are EXAMPLE / unit tests (not property-based tests) for the session-only
 * registration context defined in `src/context/RegistrationContext.tsx`.
 *
 * They exercise the public contract (Req 1.2–1.10):
 *  - initial null / false state,
 *  - `updateProfile` partial merge that preserves untouched fields (Req 1.4),
 *  - derived `zone` from `location` (Req 1.7),
 *  - `completeRegistration` setting `isRegistered` + a well-formed `kiteId`
 *    (`KITE_ID_PATTERN`) + a non-empty ISO `registeredAt` (Req 1.5),
 *  - `resetRegistration` back to the initial state (Req 1.6),
 *  - "refresh reset": a freshly mounted provider yields the initial state
 *    because the state is in-memory only and never persisted (Req 1.2, 1.8),
 *  - and the descriptive error thrown when `useRegistration` is used outside a
 *    provider (Req 1.10).
 *
 * The hook is exercised with @testing-library/react's `renderHook` (+ `act` for
 * state-mutating callbacks). jsdom global cleanup lives in `src/test/setup.ts`.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import {
  RegistrationProvider,
  useRegistration,
} from "@/context/RegistrationContext";
import { KITE_ID_PATTERN } from "@/lib/kite-id-generator";

/** Wrapper that mounts the hook under a fresh RegistrationProvider. */
function wrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return <RegistrationProvider>{children}</RegistrationProvider>;
}

/** Render `useRegistration` inside a fresh provider (one mount per call). */
function renderRegistration() {
  return renderHook(() => useRegistration(), { wrapper });
}

describe("RegistrationProvider / useRegistration", () => {
  /* ---------------------------------------------------------------------- */
  /* Initial state (Req 1.2)                                                */
  /* ---------------------------------------------------------------------- */

  it("starts with a null profile, not registered, no zone, and zero qualifying schemes", () => {
    const { result } = renderRegistration();

    expect(result.current.registrationProfile).toBeNull();
    expect(result.current.isRegistered).toBe(false);
    expect(result.current.zone).toBeNull();
    expect(result.current.qualifyingCount).toBe(0);
  });

  /* ---------------------------------------------------------------------- */
  /* updateProfile merge (Req 1.4)                                          */
  /* ---------------------------------------------------------------------- */

  it("merges successive updateProfile partials, preserving untouched fields", () => {
    const { result } = renderRegistration();

    act(() => {
      result.current.updateProfile({ founderName: "Asha", founderAge: 29 });
    });

    expect(result.current.registrationProfile).toMatchObject({
      founderName: "Asha",
      founderAge: 29,
    });

    // A second partial overwrites only its own keys and preserves the rest.
    act(() => {
      result.current.updateProfile({
        companyName: "Kite Labs",
        founderAge: 30,
      });
    });

    expect(result.current.registrationProfile).toMatchObject({
      founderName: "Asha", // preserved from the first partial
      companyName: "Kite Labs", // added by the second partial
      founderAge: 30, // overwritten by the second partial
    });
  });

  /* ---------------------------------------------------------------------- */
  /* Derived zone (Req 1.7)                                                 */
  /* ---------------------------------------------------------------------- */

  it("derives zone from the profile location", () => {
    const { result } = renderRegistration();

    act(() => {
      result.current.updateProfile({ location: "Mysuru" });
    });
    expect(result.current.zone).toBe("Zone 2");

    act(() => {
      result.current.updateProfile({ location: "Bengaluru Urban" });
    });
    expect(result.current.zone).toBe("Zone 3");

    act(() => {
      result.current.updateProfile({ location: "Kalaburagi" });
    });
    expect(result.current.zone).toBe("Zone 1");
  });

  /* ---------------------------------------------------------------------- */
  /* completeRegistration (Req 1.5)                                         */
  /* ---------------------------------------------------------------------- */

  it("completeRegistration sets isRegistered, a well-formed kiteId, and an ISO registeredAt", () => {
    const { result } = renderRegistration();

    act(() => {
      result.current.updateProfile({ founderName: "Asha" });
    });

    act(() => {
      result.current.completeRegistration();
    });

    expect(result.current.isRegistered).toBe(true);

    const profile = result.current.registrationProfile;
    expect(profile).not.toBeNull();
    // The kiteId matches the unambiguous KITE-YYYY-XXXXXX pattern.
    expect(profile!.kiteId).toMatch(KITE_ID_PATTERN);
    expect(profile!.isRegistered).toBe(true);

    // registeredAt is a non-empty ISO 8601 timestamp.
    expect(typeof profile!.registeredAt).toBe("string");
    expect(profile!.registeredAt.length).toBeGreaterThan(0);
    expect(new Date(profile!.registeredAt).toISOString()).toBe(
      profile!.registeredAt,
    );
  });

  /* ---------------------------------------------------------------------- */
  /* resetRegistration (Req 1.6)                                            */
  /* ---------------------------------------------------------------------- */

  it("resetRegistration returns to the initial null / false state", () => {
    const { result } = renderRegistration();

    act(() => {
      result.current.updateProfile({ founderName: "Asha" });
      result.current.completeRegistration();
    });

    expect(result.current.isRegistered).toBe(true);
    expect(result.current.registrationProfile).not.toBeNull();

    act(() => {
      result.current.resetRegistration();
    });

    expect(result.current.registrationProfile).toBeNull();
    expect(result.current.isRegistered).toBe(false);
    expect(result.current.zone).toBeNull();
    expect(result.current.qualifyingCount).toBe(0);
  });

  /* ---------------------------------------------------------------------- */
  /* Refresh reset — state does not survive a remount (Req 1.2, 1.8)        */
  /* ---------------------------------------------------------------------- */

  it("does not persist state across a fresh provider mount (models a page refresh)", () => {
    // First "session": populate and complete registration.
    const first = renderRegistration();
    act(() => {
      first.result.current.updateProfile({
        founderName: "Asha",
        location: "Mysuru",
      });
      first.result.current.completeRegistration();
    });
    expect(first.result.current.isRegistered).toBe(true);
    first.unmount();

    // A refresh remounts a brand-new provider — no persistence layer exists,
    // so the new instance must read back as the pristine initial state.
    const second = renderRegistration();
    expect(second.result.current.registrationProfile).toBeNull();
    expect(second.result.current.isRegistered).toBe(false);
    expect(second.result.current.zone).toBeNull();
    expect(second.result.current.qualifyingCount).toBe(0);
  });

  /* ---------------------------------------------------------------------- */
  /* Outside-provider usage error (Req 1.10)                                */
  /* ---------------------------------------------------------------------- */

  it("throws a descriptive error when used outside a RegistrationProvider", () => {
    // React logs the thrown render error to console.error; silence it so the
    // expected-failure path does not pollute the test output.
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => renderHook(() => useRegistration())).toThrow(
      "useRegistration must be used within a RegistrationProvider",
    );

    consoleError.mockRestore();
  });
});

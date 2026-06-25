"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  EligibilityResult,
  RegistrationContextValue,
  RegistrationProfile,
  Scheme,
  Zone,
} from "@/types";
import {
  deriveZone,
  evaluateAllSchemes,
  evaluateScheme,
} from "@/lib/eligibility-engine";
import { generateKiteId } from "@/lib/kite-id-generator";

/**
 * Session-only registration state for the KITE Registration / Schemes /
 * Calculator slice (Req 1.1–1.10).
 *
 * ABSOLUTE CONSTRAINT — frontend-only, session-only:
 * This provider holds its state in **in-memory React state ONLY**. It performs
 * NO persistence of any kind: no `localStorage`, no `sessionStorage`, no
 * cookies, no IndexedDB, no `fetch`/network, no I/O whatsoever. Because the
 * state lives only in React, it initializes to `{ registrationProfile: null,
 * isRegistered: false }` and **resets to that initial state on every page
 * refresh** — a refresh remounts the provider (Req 1.2, 1.8, 1.9, 25.4).
 */

/**
 * Internal in-memory state shape. `registrationProfile` accumulates wizard /
 * quick-profile input. It is typed as `RegistrationProfile | null`: a non-null
 * value is the running draft that the wizard and quick-profile populate with
 * known `RegistrationProfile` keys before any eligibility surface reads it.
 */
interface RegistrationState {
  registrationProfile: RegistrationProfile | null;
  isRegistered: boolean;
}

const INITIAL_STATE: RegistrationState = {
  registrationProfile: null,
  isRegistered: false,
};

const RegistrationContext = createContext<RegistrationContextValue | undefined>(
  undefined,
);

export interface RegistrationProviderProps {
  children: ReactNode;
}

export function RegistrationProvider({
  children,
}: RegistrationProviderProps): JSX.Element {
  // In-memory React state ONLY — no persistence, no I/O (Req 1.2, 1.8).
  const [state, setState] = useState<RegistrationState>(INITIAL_STATE);

  const { registrationProfile, isRegistered } = state;

  /**
   * Merge a partial into the current profile, preserving every untouched field
   * (Req 1.4). When no profile exists yet, seed from the partial: the wizard /
   * quick-profile only ever set known `RegistrationProfile` keys, so the seeded
   * draft is treated as a `RegistrationProfile`-shaped accumulator (cast on
   * seed). Uses functional `setState` so merges never race.
   */
  const updateProfile = useCallback(
    (partial: Partial<RegistrationProfile>): void => {
      setState((current) => {
        const merged: RegistrationProfile =
          current.registrationProfile === null
            ? // Seed: the partial becomes the running draft. Known keys only.
              ({ ...partial } as RegistrationProfile)
            : // Merge: spread preserves untouched fields, partial overwrites.
              { ...current.registrationProfile, ...partial };
        return { ...current, registrationProfile: merged };
      });
    },
    [],
  );

  /**
   * Finalize registration (Req 1.5): set `isRegistered`, generate a `kiteId`,
   * stamp `registeredAt` (ISO 8601), and merge these onto the profile. If no
   * profile draft exists yet, the status fields seed a new profile object.
   */
  const completeRegistration = useCallback((): void => {
    setState((current) => {
      const kiteId = generateKiteId();
      const registeredAt = new Date().toISOString();
      const statusFields: Partial<RegistrationProfile> = {
        isRegistered: true,
        kiteId,
        registeredAt,
      };
      const merged: RegistrationProfile =
        current.registrationProfile === null
          ? ({ ...statusFields } as RegistrationProfile)
          : { ...current.registrationProfile, ...statusFields };
      return { registrationProfile: merged, isRegistered: true };
    });
  }, []);

  /** Reset to the initial null / false state (Req 1.6). */
  const resetRegistration = useCallback((): void => {
    setState(INITIAL_STATE);
  }, []);

  /**
   * Derived zone (Req 1.7). Only derivable once a profile with a `location`
   * exists; otherwise null. `deriveZone` is a pure total function over
   * `LocationKarnataka`.
   */
  const zone = useMemo<Zone | null>(() => {
    if (registrationProfile && registrationProfile.location) {
      return deriveZone(registrationProfile.location);
    }
    return null;
  }, [registrationProfile]);

  /**
   * Number of schemes the profile qualifies for — status `definitely-eligible`
   * or `likely-eligible` (Req 12.4). Memoized on the profile so the full
   * `evaluateAllSchemes` batch runs once per profile change, not per render.
   * 0 when no profile exists.
   */
  const qualifyingCount = useMemo<number>(() => {
    if (!registrationProfile) return 0;
    const results = evaluateAllSchemes(registrationProfile);
    return Object.values(results).filter(
      (r) =>
        r.status === "definitely-eligible" || r.status === "likely-eligible",
    ).length;
  }, [registrationProfile]);

  /**
   * Evaluate a single scheme against the current profile. Returns null when no
   * profile exists (the contract's "no profile → no result" case).
   */
  const evaluate = useCallback(
    (scheme: Scheme): EligibilityResult | null => {
      if (!registrationProfile) return null;
      return evaluateScheme(registrationProfile, scheme);
    },
    [registrationProfile],
  );

  const value = useMemo<RegistrationContextValue>(
    () => ({
      registrationProfile,
      isRegistered,
      zone,
      qualifyingCount,
      updateProfile,
      completeRegistration,
      resetRegistration,
      evaluate,
    }),
    [
      registrationProfile,
      isRegistered,
      zone,
      qualifyingCount,
      updateProfile,
      completeRegistration,
      resetRegistration,
      evaluate,
    ],
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

/**
 * Access the session registration context. Throws a descriptive error when
 * called outside a `RegistrationProvider` rather than returning `undefined`
 * silently (Req 1.10).
 */
export function useRegistration(): RegistrationContextValue {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error(
      "useRegistration must be used within a RegistrationProvider",
    );
  }
  return context;
}

/**
 * Default, fully-unregistered context value used as a graceful fallback by
 * {@link useOptionalRegistration} when no `RegistrationProvider` is present.
 * Every mutator is a no-op and every derivation is the empty/zero case, so a
 * consumer rendered in isolation behaves exactly like the unregistered state.
 */
const UNREGISTERED_FALLBACK: RegistrationContextValue = {
  registrationProfile: null,
  isRegistered: false,
  zone: null,
  qualifyingCount: 0,
  updateProfile: () => {},
  completeRegistration: () => {},
  resetRegistration: () => {},
  evaluate: () => null,
};

/**
 * Non-throwing variant of {@link useRegistration} for **additive, optional**
 * personalization islands (e.g. the home Quick Actions completed-state card)
 * that may be rendered in isolation — such as in foundation component tests —
 * without a surrounding `RegistrationProvider`.
 *
 * Inside the real application the provider always wraps the tree (locked in
 * `app/layout.tsx`), so this returns the live session value. When mounted with
 * no provider it returns {@link UNREGISTERED_FALLBACK} instead of throwing,
 * which renders the byte-for-byte unregistered behavior. This does NOT relax
 * the Req 1.10 contract: `useRegistration` still throws; this accessor exists
 * solely for islands whose unregistered output must equal the foundation slice.
 */
export function useOptionalRegistration(): RegistrationContextValue {
  return useContext(RegistrationContext) ?? UNREGISTERED_FALLBACK;
}

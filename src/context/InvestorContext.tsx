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
  DealStage,
  InvestorContextValue,
  InvestorProfile,
  PortfolioCompany,
  TrackedDeal,
} from "@/types";
import { generateInvestorId } from "@/lib/investor-id-generator";

/**
 * Session-only investor state for the KITE Investor Suite (Req 1.1–1.6, 2.x).
 *
 * ABSOLUTE CONSTRAINT — frontend-only, session-only:
 * This provider holds its state in **in-memory React state ONLY**. It performs
 * NO persistence of any kind: no `localStorage`, no `sessionStorage`, no
 * cookies, no IndexedDB, no `fetch`/network, no I/O whatsoever. Because the
 * state lives only in React, it initializes to `{ investorProfile: null,
 * isOnboarded: false }` and **resets to that initial state on every page
 * refresh** — a refresh remounts the provider (Req 1.1–1.3, 40.2–40.3).
 *
 * A direct mirror of `RegistrationContext`: same seed-on-null merge pattern,
 * same functional-setState discipline, same throwing + non-throwing hook pair.
 */

/**
 * Internal in-memory state shape. `dealsTracked` and `portfolioCompanies` live
 * ON `investorProfile` (they are fields of `InvestorProfile`, Req 3.8), so the
 * mutators operate through the profile. Before onboarding seeds a profile,
 * mutators that need a profile seed a minimal draft (mirroring
 * `RegistrationContext.updateProfile`'s seed-on-null pattern).
 */
interface InvestorState {
  investorProfile: InvestorProfile | null;
  isOnboarded: boolean;
}

const INITIAL_STATE: InvestorState = {
  investorProfile: null,
  isOnboarded: false,
};

/**
 * Extended context contract. `InvestorContextValue` (in `@/types`) lists the
 * core mutator surface; the pipeline "Add Note" action needs a targeted
 * note-setter, so `addDealNote` is exposed here as an additional method
 * (implemented as a targeted update over `dealsTracked`, Req 30.4) without
 * altering the canonical type.
 */
export interface InvestorContextValueWithNotes extends InvestorContextValue {
  addDealNote: (dealId: string, note: string) => void;
}

const InvestorContext = createContext<InvestorContextValueWithNotes | undefined>(
  undefined,
);

export interface InvestorProviderProps {
  children: ReactNode;
}

export function InvestorProvider({
  children,
}: InvestorProviderProps): JSX.Element {
  // In-memory React state ONLY — no persistence, no I/O (Req 1.1–1.3).
  const [state, setState] = useState<InvestorState>(INITIAL_STATE);

  const { investorProfile, isOnboarded } = state;

  /**
   * Merge a partial into the current profile, preserving every untouched field
   * (Req 2.1). When no profile exists yet, seed from the partial: onboarding /
   * mutators only ever set known `InvestorProfile` keys, so the seeded draft is
   * treated as an `InvestorProfile`-shaped accumulator (cast on seed). Uses
   * functional `setState` so merges never race.
   */
  const updateInvestorProfile = useCallback(
    (partial: Partial<InvestorProfile>): void => {
      setState((current) => {
        const merged: InvestorProfile =
          current.investorProfile === null
            ? // Seed: the partial becomes the running draft. Known keys only.
              ({ ...partial } as InvestorProfile)
            : // Merge: spread preserves untouched fields, partial overwrites.
              { ...current.investorProfile, ...partial };
        return { ...current, investorProfile: merged };
      });
    },
    [],
  );

  /**
   * Finalize onboarding (Req 2.2): set `isOnboarded`, generate an `investorId`
   * (`INV-YYYY-XXXXXX`), stamp `onboardedAt` (ISO 8601), and merge these onto
   * the profile. If no profile draft exists yet, the status fields seed a new
   * profile object. `onboardedAt` is the only clock read in the suite and is a
   * status stamp, not synthetic data.
   */
  const completeOnboarding = useCallback((): void => {
    setState((current) => {
      const statusFields: Partial<InvestorProfile> = {
        isOnboarded: true,
        investorId: generateInvestorId(),
        onboardedAt: new Date().toISOString(),
      };
      const merged: InvestorProfile =
        current.investorProfile === null
          ? ({ ...statusFields } as InvestorProfile)
          : { ...current.investorProfile, ...statusFields };
      return { investorProfile: merged, isOnboarded: true };
    });
  }, []);

  /**
   * Append a tracked deal (Req 2.3). The deal's manual order within its
   * `currentStage` is assigned as the current count of deals already in that
   * stage (a monotonically increasing per-stage index), so appended deals sort
   * after existing ones (Req 28.5). Seeds a draft profile when none exists.
   */
  const addDeal = useCallback((deal: TrackedDeal): void => {
    setState((current) => {
      const existing = current.investorProfile?.dealsTracked ?? [];
      const orderInStage = existing.filter(
        (d) => d.currentStage === deal.currentStage,
      ).length;
      const placed: TrackedDeal = { ...deal, orderInStage };
      const nextDeals = [...existing, placed];
      const merged: InvestorProfile =
        current.investorProfile === null
          ? ({ dealsTracked: nextDeals } as InvestorProfile)
          : { ...current.investorProfile, dealsTracked: nextDeals };
      return { ...current, investorProfile: merged };
    });
  }, []);

  /**
   * Move a single deal to a new kanban stage (Req 2.4). Maps over
   * `dealsTracked`, changing ONLY the matching deal's `currentStage` (and
   * assigning it the next manual order in the destination stage); every other
   * deal is referentially preserved.
   */
  const updateDealStage = useCallback(
    (dealId: string, stage: DealStage): void => {
      setState((current) => {
        if (current.investorProfile === null) return current;
        const deals = current.investorProfile.dealsTracked ?? [];
        // Next order in the destination stage = count of deals already there,
        // excluding the deal being moved.
        const nextOrder = deals.filter(
          (d) => d.currentStage === stage && d.id !== dealId,
        ).length;
        const nextDeals = deals.map((d) =>
          d.id === dealId
            ? { ...d, currentStage: stage, orderInStage: nextOrder }
            : d,
        );
        return {
          ...current,
          investorProfile: {
            ...current.investorProfile,
            dealsTracked: nextDeals,
          },
        };
      });
    },
    [],
  );

  /** Remove a tracked deal by id (Req 2.5). */
  const removeDeal = useCallback((dealId: string): void => {
    setState((current) => {
      if (current.investorProfile === null) return current;
      const deals = current.investorProfile.dealsTracked ?? [];
      const nextDeals = deals.filter((d) => d.id !== dealId);
      return {
        ...current,
        investorProfile: {
          ...current.investorProfile,
          dealsTracked: nextDeals,
        },
      };
    });
  }, []);

  /** Append a portfolio company (Req 2.6). Seeds a draft profile when none. */
  const addPortfolioCompany = useCallback(
    (company: PortfolioCompany): void => {
      setState((current) => {
        const existing = current.investorProfile?.portfolioCompanies ?? [];
        const nextCompanies = [...existing, company];
        const merged: InvestorProfile =
          current.investorProfile === null
            ? ({ portfolioCompanies: nextCompanies } as InvestorProfile)
            : {
                ...current.investorProfile,
                portfolioCompanies: nextCompanies,
              };
        return { ...current, investorProfile: merged };
      });
    },
    [],
  );

  /**
   * Store a note on a single deal's record via a targeted update over
   * `dealsTracked` (Req 30.4). Only the matching deal's `notes` field changes;
   * every other deal is referentially preserved.
   */
  const addDealNote = useCallback((dealId: string, note: string): void => {
    setState((current) => {
      if (current.investorProfile === null) return current;
      const deals = current.investorProfile.dealsTracked ?? [];
      const nextDeals = deals.map((d) =>
        d.id === dealId ? { ...d, notes: note } : d,
      );
      return {
        ...current,
        investorProfile: {
          ...current.investorProfile,
          dealsTracked: nextDeals,
        },
      };
    });
  }, []);

  /** Reset to the initial null / false state (Req 2.7). */
  const resetInvestor = useCallback((): void => {
    setState(INITIAL_STATE);
  }, []);

  const value = useMemo<InvestorContextValueWithNotes>(
    () => ({
      investorProfile,
      isOnboarded,
      updateInvestorProfile,
      completeOnboarding,
      addDeal,
      updateDealStage,
      removeDeal,
      addPortfolioCompany,
      addDealNote,
      resetInvestor,
    }),
    [
      investorProfile,
      isOnboarded,
      updateInvestorProfile,
      completeOnboarding,
      addDeal,
      updateDealStage,
      removeDeal,
      addPortfolioCompany,
      addDealNote,
      resetInvestor,
    ],
  );

  return (
    <InvestorContext.Provider value={value}>
      {children}
    </InvestorContext.Provider>
  );
}

/**
 * Access the session investor context. Throws a descriptive error when called
 * outside an `InvestorProvider` rather than returning `undefined` silently
 * (Req 1.6).
 */
export function useInvestor(): InvestorContextValueWithNotes {
  const context = useContext(InvestorContext);
  if (context === undefined) {
    throw new Error("useInvestor must be used within an InvestorProvider");
  }
  return context;
}

/**
 * Default, fully-not-onboarded context value used as a graceful fallback by
 * {@link useOptionalInvestor} when no `InvestorProvider` is present. Every
 * mutator is a no-op, so a consumer rendered in isolation behaves exactly like
 * the not-onboarded state (Req 1.5).
 */
const NOT_ONBOARDED_FALLBACK: InvestorContextValueWithNotes = {
  investorProfile: null,
  isOnboarded: false,
  updateInvestorProfile: () => {},
  completeOnboarding: () => {},
  addDeal: () => {},
  updateDealStage: () => {},
  removeDeal: () => {},
  addPortfolioCompany: () => {},
  addDealNote: () => {},
  resetInvestor: () => {},
};

/**
 * Non-throwing variant of {@link useInvestor} for **additive, optional**
 * personalization islands that may be rendered in isolation — such as in
 * foundation component tests — without a surrounding `InvestorProvider`.
 *
 * Inside the real application the provider always wraps the tree (locked in
 * `app/layout.tsx`), so this returns the live session value. When mounted with
 * no provider it returns {@link NOT_ONBOARDED_FALLBACK} instead of throwing.
 * This does NOT relax the Req 1.6 contract: `useInvestor` still throws; this
 * accessor exists solely for islands whose not-onboarded output must equal the
 * pristine state.
 */
export function useOptionalInvestor(): InvestorContextValueWithNotes {
  return useContext(InvestorContext) ?? NOT_ONBOARDED_FALLBACK;
}

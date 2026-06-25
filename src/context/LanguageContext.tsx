"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Supported UI languages. EN (English) and KN (ಕನ್ನಡ / Kannada).
 *
 * NOTE: This slice provides bilingual support as a VISUAL-ONLY toggle.
 * The language value lives entirely in in-memory React state. The toggle
 * performs NO localStorage / sessionStorage / cookie access and NO
 * network / fetch calls (Req 3.12, 18.13).
 */
export type Language = "en" | "kn";

export interface LanguageContextValue {
  /** The currently selected UI language. Defaults to "en". */
  language: Language;
  /** Flip between "en" and "kn". In-memory state change only. */
  toggleLanguage: () => void;
  /** Explicitly set the UI language. In-memory state change only. */
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export interface LanguageProviderProps {
  children: ReactNode;
  /** Optional initial language (used for testing / SSR). Defaults to "en". */
  initialLanguage?: Language;
}

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: LanguageProviderProps): JSX.Element {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const toggleLanguage = useCallback((): void => {
    setLanguageState((current) => (current === "en" ? "kn" : "en"));
  }, []);

  const setLanguage = useCallback((next: Language): void => {
    setLanguageState(next);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, toggleLanguage, setLanguage }),
    [language, toggleLanguage, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { LanguageProvider } from "@/context/LanguageContext";
import { RegistrationProvider } from "@/context/RegistrationContext";
import { InvestorProvider } from "@/context/InvestorContext";
import { IdeaBankProvider } from "@/context/IdeaBankContext";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Footer } from "@/components/layout/Footer";
import { AIAssistantButton } from "@/components/layout/AIAssistantButton";
import { Toaster } from "@/components/ui/sonner";

// Body font → Inter, exposed as the `--font-inter` CSS variable.
// Tailwind maps `fontFamily.sans` → var(--font-inter) (see tailwind.config.ts).
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

// Heading font → Plus Jakarta Sans, exposed as the `--font-jakarta` CSS variable.
// Tailwind maps `fontFamily.heading` → var(--font-jakarta) (see tailwind.config.ts).
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  title: "KITE — Karnataka Innovation & Technology Ecosystem",
  description: "One Portal. One Login. One Ecosystem.",
};

/**
 * RootLayout (task 2.9) — Server Component that wires the global chrome and the
 * semantic landmark structure rendered on every page (Req 21.1).
 *
 * Composition order & landmarks:
 *   - `<LanguageProvider>` (client provider) wraps the body content so the
 *     visual-only EN/ಕನ್ನಡ toggle in the Header/MobileNav has context.
 *   - `<SiteChrome />` — the client coordinator that renders the single banner
 *     `<header>` (with the one PRIMARY `<nav>`), plus the MobileNav and
 *     CommandPalette overlays sharing open/close state.
 *   - `<main id="main">` — the single MAIN landmark wrapping `{children}`, with
 *     `pt-16` to offset the fixed 64px header and `flex-1` so the footer is
 *     pushed to the bottom on short pages.
 *   - `<Footer />` — the single CONTENTINFO landmark.
 *   - `<AIAssistantButton />` — the floating bottom-right AI entry point.
 *   - `<Toaster />` — the sonner toast region so `safeNavigate`'s
 *     "unreachable destination" toast can render.
 *
 * The body is a `min-h-screen` flex column so the footer always sits at or below
 * the fold regardless of page content height.
 */
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <LanguageProvider>
          <RegistrationProvider>
            <InvestorProvider>
              <IdeaBankProvider>
                <SiteChrome />
                <main id="main" className="flex-1 pt-16">
                  {children}
                </main>
                <Footer />
                <AIAssistantButton />
                <Toaster />
              </IdeaBankProvider>
            </InvestorProvider>
          </RegistrationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

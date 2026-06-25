import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * KITE Design System — Tailwind configuration.
 *
 * Canonical design tokens (one name per token, NO `secondary` alias, NO `kite-*`
 * prefixes). Each color wires to an HSL CSS variable authored in globals.css
 * (task 1.4) via `hsl(var(--token))`, so `bg-primary`, `text-accent`, etc. resolve
 * to the KITE palette. Hex references (authored as HSL in globals.css):
 *   primary #1B4D8E  accent #E85D26  dark #0F1B2D  surface #F7F8FA  card #FFFFFF
 *   muted #64748B    border #E2E8F0  success #16A34A  warning #D97706
 *   danger #DC2626   info #0EA5E9   teal #0D9488    purple #7C3AED   pink #DB2777
 */
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        accent: "hsl(var(--accent))",
        dark: "hsl(var(--dark))",
        surface: "hsl(var(--surface))",
        card: "hsl(var(--card))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        info: "hsl(var(--info))",
        teal: "hsl(var(--teal))",
        purple: "hsl(var(--purple))",
        pink: "hsl(var(--pink))",
        // shadcn/ui base tokens (task 1.5) — ADDITIVE. The canonical KITE tokens
        // above are untouched; these add the extra semantic colors and the
        // `*-foreground` pairings that the shadcn primitives reference so that
        // `bg-primary text-primary-foreground`, `border-input`, `bg-popover`,
        // `ring-ring`, etc. resolve. No `secondary` token is introduced.
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        "card-foreground": "hsl(var(--card-foreground))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        popover: "hsl(var(--popover))",
        "popover-foreground": "hsl(var(--popover-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
      },
      // Typography scale: display > h1 > h2 > h3 > body > caption
      // (monotonically non-increasing, distinct sizes).
      fontSize: {
        display: ["3.5rem", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" }],  // 56px
        h1: ["2.5rem", { lineHeight: "1.15", fontWeight: "700", letterSpacing: "-0.02em" }],       // 40px
        h2: ["2rem", { lineHeight: "1.2", fontWeight: "600", letterSpacing: "-0.01em" }],          // 32px
        h3: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],                                  // 24px
        body: ["1rem", { lineHeight: "1.6" }],                                                     // 16px
        caption: ["0.875rem", { lineHeight: "1.5" }],                                              // 14px
      },
      // Border radius scale: cards rounded-xl (12px), buttons rounded-lg (8px),
      // badges rounded-md (6px), pills/chips rounded-full.
      borderRadius: {
        md: "6px",
        lg: "8px",
        xl: "12px",
        full: "9999px",
      },
      // Card shadow expectation: cards use `shadow-sm` (Tailwind default) paired
      // with `border`. No custom shadow needed beyond defaults.
      fontFamily: {
        // Body text → Inter (--font-inter); headings → Plus Jakarta Sans (--font-jakarta).
        // Actual next/font loading is wired in task 1.6.
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        heading: ["var(--font-jakarta)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      // Accordion open/close keyframes consumed by the shadcn Accordion primitive
      // (task 1.5). Additive — no existing animation is altered.
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;

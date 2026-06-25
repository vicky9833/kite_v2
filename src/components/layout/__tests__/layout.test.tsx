/**
 * Component tests — layout structure and interactions (task 2.10).
 *
 * These are EXAMPLE / component tests (not property-based tests). They assert
 * the layout chrome against the ACTUAL implemented components and the VERIFIED
 * data in `src/data/navigation.ts` and `src/data/footer.ts` — NOT the older
 * illustrative nav/footer labels.
 *
 * References Req 3 (Header), 4 (MobileNav), 5 (Footer), 6 (AI Assistant), and
 * 7 (Command Palette) interaction / fixed-content acceptance criteria.
 *
 * Resilience notes for jsdom + Radix/cmdk:
 *  - jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView / pointer
 *    capture) live in `src/test/setup.ts`.
 *  - `next/link` is mocked to a plain anchor so links render without an App
 *    Router provider; `next/navigation`'s `useRouter` is mocked so the
 *    CommandPalette can be rendered and selections never crash.
 *  - Open/close assertions use `findBy*` / `waitFor` to tolerate Radix's async
 *    mount/unmount.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from "@testing-library/react";

import { LanguageProvider } from "@/context/LanguageContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { AIAssistantButton } from "@/components/layout/AIAssistantButton";
import { footerColumns, footerBottom } from "@/data/footer";
import { utilityNav } from "@/data/navigation";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                               */
/* -------------------------------------------------------------------------- */

// Render Next's <Link> as a plain anchor so the layout renders without an App
// Router context provider (the structural tests only care about hrefs/labels).
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string | { pathname?: string };
    children: React.ReactNode;
  }) => (
    <a href={typeof href === "string" ? href : (href?.pathname ?? "#")} {...props}>
      {children}
    </a>
  ),
}));

// Mock the App Router so CommandPalette can render and selection never crashes.
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

beforeEach(() => {
  pushMock.mockClear();
});

/** Render helper that wraps a tree in the LanguageProvider. */
function renderWithLanguage(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

/* -------------------------------------------------------------------------- */
/* 1. Header                                                                  */
/* -------------------------------------------------------------------------- */

describe("Header", () => {
  // The five canonical top-level dropdowns from navigation.ts (Req 3.3–3.7).
  const dropdownLabels = [
    "Ecosystem",
    "Schemes & Benefits",
    "For Stakeholders",
    "Beyond Bengaluru",
    "Connect",
  ];

  it("renders the five dropdown trigger labels", () => {
    renderWithLanguage(<Header />);
    for (const label of dropdownLabels) {
      expect(
        screen.getByRole("button", { name: label }),
      ).toBeInTheDocument();
    }
  });

  it("renders the Register CTA linking to /register", () => {
    renderWithLanguage(<Header />);
    const register = screen.getByRole("link", { name: "Register" });
    expect(register).toHaveAttribute("href", "/register");
  });

  it("renders the Sign In link", () => {
    renderWithLanguage(<Header />);
    const signIn = screen.getByRole("link", { name: "Sign In" });
    expect(signIn).toHaveAttribute("href", utilityNav.signInHref);
  });

  it("exposes accessible names for the hamburger and search controls", () => {
    renderWithLanguage(<Header />);
    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toBeInTheDocument();
    // Two search triggers (compact + full) both labelled "Search".
    const searchButtons = screen.getAllByRole("button", { name: "Search" });
    expect(searchButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows the bilingual language toggle label", () => {
    renderWithLanguage(<Header />);
    expect(
      screen.getByRole("button", { name: utilityNav.languageToggleLabel }),
    ).toBeInTheDocument();
    expect(utilityNav.languageToggleLabel).toBe("EN | ಕನ್ನಡ");
  });

  it("invokes the search / mobile-nav callbacks when their controls are clicked", () => {
    const onOpenSearch = vi.fn();
    const onOpenMobileNav = vi.fn();
    renderWithLanguage(
      <Header onOpenSearch={onOpenSearch} onOpenMobileNav={onOpenMobileNav} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(onOpenMobileNav).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getAllByRole("button", { name: "Search" })[0]!);
    expect(onOpenSearch).toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */
/* 2. Footer                                                                  */
/* -------------------------------------------------------------------------- */

describe("Footer", () => {
  // Canonical column titles + link counts (Req 5.2–5.7).
  const expectedColumns: ReadonlyArray<readonly [string, number]> = [
    ["For Startups", 12],
    ["For Investors", 9],
    ["For Ecosystem Partners", 6],
    ["Programs & Policies", 8],
    ["Support & Resources", 9],
  ];

  it("data source matches the canonical column titles and counts in order", () => {
    // Guards the verified data itself, independent of rendering.
    expect(footerColumns.map((c) => c.title)).toEqual(
      expectedColumns.map(([title]) => title),
    );
    expect(footerColumns.map((c) => c.links.length)).toEqual(
      expectedColumns.map(([, count]) => count),
    );
  });

  it("renders the five column titles in order with the expected link counts", () => {
    render(<Footer />);

    for (const [title, count] of expectedColumns) {
      const heading = screen.getByRole("heading", { name: title });
      expect(heading).toBeInTheDocument();

      // Each column is a <div> containing the <h2> heading and its <ul> of links.
      const column = heading.parentElement as HTMLElement;
      const links = within(column).getAllByRole("link");
      expect(links).toHaveLength(count);
    }
  });

  it("renders the helpline and email as native anchors with external protocols", () => {
    render(<Footer />);

    const helpline = screen.getByRole("link", { name: /Helpline/i });
    expect(helpline).toHaveAttribute("href", "tel:+918022231007");

    const email = screen.getByRole("link", { name: /Email/i });
    expect(email).toHaveAttribute(
      "href",
      "mailto:startupcell@karnataka.gov.in",
    );
  });

  it("renders the tagline and the three legal lines", () => {
    render(<Footer />);

    expect(
      screen.getByText("One Portal. One Login. One Ecosystem."),
    ).toBeInTheDocument();
    expect(footerBottom.legalLines).toHaveLength(3);
    for (const line of footerBottom.legalLines) {
      expect(screen.getByText(line)).toBeInTheDocument();
    }
  });
});

/* -------------------------------------------------------------------------- */
/* 3. AIAssistantButton                                                       */
/* -------------------------------------------------------------------------- */

describe("AIAssistantButton", () => {
  it("renders a trigger with the accessible name 'Ask KITE AI'", () => {
    render(<AIAssistantButton />);
    expect(
      screen.getByRole("button", { name: "Ask KITE AI" }),
    ).toBeInTheDocument();
  });

  it("opens the panel with the title and 3–6 sample questions, and closes on Escape", async () => {
    render(<AIAssistantButton />);

    fireEvent.click(screen.getByRole("button", { name: "Ask KITE AI" }));

    const dialog = await screen.findByRole("dialog");
    // The panel title (Radix Dialog.Title text — distinct from the trigger's
    // aria-label, which has no text content).
    expect(within(dialog).getByText("Ask KITE AI")).toBeInTheDocument();

    // Sample-question buttons: every button inside the panel except the
    // Radix close control (sr-only "Close").
    const sampleButtons = within(dialog)
      .getAllByRole("button")
      .filter((btn) => btn.textContent?.trim() !== "Close");
    expect(sampleButtons.length).toBeGreaterThanOrEqual(3);
    expect(sampleButtons.length).toBeLessThanOrEqual(6);

    // Escape closes the panel.
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});

/* -------------------------------------------------------------------------- */
/* 4. CommandPalette                                                          */
/* -------------------------------------------------------------------------- */

describe("CommandPalette", () => {
  it("shows the search input when open", () => {
    render(<CommandPalette open onOpenChange={vi.fn()} />);
    expect(
      screen.getByPlaceholderText("Search destinations..."),
    ).toBeInTheDocument();
  });

  it("filters the destination list as the query is typed", async () => {
    render(<CommandPalette open onOpenChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search destinations...");
    fireEvent.change(input, { target: { value: "ELEVATE" } });

    // ELEVATE destinations are shown — the expanded list surfaces several
    // (the ELEVATE scheme, the SC/ST track, and the cohort-launch event)…
    expect((await screen.findAllByText(/ELEVATE/i)).length).toBeGreaterThanOrEqual(1);
    // …and an unrelated destination is filtered out.
    await waitFor(() => {
      expect(screen.queryByText("About KITE")).not.toBeInTheDocument();
    });
  });

  it("shows a no-results indication for a non-matching query", async () => {
    render(<CommandPalette open onOpenChange={vi.fn()} />);

    const input = screen.getByPlaceholderText("Search destinations...");
    fireEvent.change(input, { target: { value: "zzzz-no-such-destination" } });

    expect(await screen.findByText("No results found.")).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* 5. MobileNav                                                               */
/* -------------------------------------------------------------------------- */

describe("MobileNav", () => {
  const dropdownLabels = [
    "Ecosystem",
    "Schemes & Benefits",
    "For Stakeholders",
    "Beyond Bengaluru",
    "Connect",
  ];

  it("shows the five accordion triggers and a Register link when open", () => {
    renderWithLanguage(<MobileNav open onOpenChange={vi.fn()} />);

    for (const label of dropdownLabels) {
      expect(
        screen.getByRole("button", { name: label }),
      ).toBeInTheDocument();
    }

    const registerLinks = screen.getAllByRole("link", { name: "Register" });
    expect(registerLinks.length).toBeGreaterThanOrEqual(1);
    expect(registerLinks[0]).toHaveAttribute("href", "/register");
  });

  it("reveals a parent's child links when its accordion trigger is expanded", async () => {
    renderWithLanguage(<MobileNav open onOpenChange={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Ecosystem" }));

    // "About KITE" is a child of the Ecosystem dropdown (navigation.ts).
    expect(
      await screen.findByRole("link", { name: "About KITE" }),
    ).toBeInTheDocument();
  });
});

/**
 * Component tests — Scheme Detail page + islands (task 3.17).
 *
 * These are EXAMPLE / component tests (not property-based tests). They exercise
 * the ACTUAL `/schemes/[id]` SERVER page (`src/app/schemes/[id]/page.tsx`) and
 * its composed pieces: `SchemeDetailContent`, `SchemeDetailSidebar`, and the
 * `PersonalizedEligibilityCard` client island — against the VERIFIED canonical
 * data in `src/data/schemes.ts`.
 *
 * References Req 16.1 (two-column composition), 16.7 (Related Schemes), 16.8 /
 * 16.9 (personalized eligibility island states), and 16.10 (id resolution:
 * direct → alias → notFound).
 *
 * Server-component testing strategy:
 *  - `SchemeDetailPage` is a plain synchronous function `({ params }) => JSX`.
 *    We call it directly and render the returned element inside a
 *    `RegistrationProvider` so the embedded client islands can read context.
 *  - `next/link` is mocked to a plain anchor so links render without an App
 *    Router provider.
 *  - `next/navigation` is mocked: `notFound` is a `vi.fn()` that throws a
 *    sentinel so we can both assert it was called AND stop execution exactly
 *    as the real Next.js `notFound()` (which returns `never`) would.
 *  - jsdom polyfills (matchMedia / ResizeObserver / pointer capture) live in
 *    `src/test/setup.ts`.
 */

import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";

import SchemeDetailPage from "@/app/schemes/[id]/page";
import { PersonalizedEligibilityCard } from "@/components/schemes/PersonalizedEligibilityCard";
import {
  RegistrationProvider,
  useRegistration,
} from "@/context/RegistrationContext";
import { schemes } from "@/data/schemes";
import type { RegistrationProfile, Scheme } from "@/types";

/* -------------------------------------------------------------------------- */
/* Module mocks                                                               */
/* -------------------------------------------------------------------------- */

// A sentinel error the mocked `notFound()` throws. The real Next.js helper
// returns `never` by throwing an internal control-flow error; throwing here
// lets us both assert the call AND halt the page render at the same point.
const NOT_FOUND_SENTINEL = "NEXT_NOT_FOUND";

const { notFoundMock } = vi.hoisted(() => ({
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

// Render Next's <Link> as a plain anchor so the page renders without an App
// Router context provider (these tests only care about hrefs / counts).
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
    <a
      href={typeof href === "string" ? href : (href?.pathname ?? "#")}
      {...props}
    >
      {children}
    </a>
  ),
}));

// Mock the App Router navigation module. `notFound` throws the sentinel;
// `useRouter` is stubbed so any client island that consults it never crashes.
vi.mock("next/navigation", () => ({
  __esModule: true,
  notFound: notFoundMock,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

beforeEach(() => {
  notFoundMock.mockClear();
});

/* -------------------------------------------------------------------------- */
/* Fixtures / helpers                                                         */
/* -------------------------------------------------------------------------- */

/** Look up a real scheme by id (fails loudly if the canonical data changes). */
function schemeById(id: string): Scheme {
  const scheme = schemes.find((s) => s.id === id);
  if (!scheme) throw new Error(`Test fixture: scheme "${id}" not found`);
  return scheme;
}

const ELEVATE = schemeById("elevate");

/**
 * A fully-populated profile that makes ELEVATE `definitely-eligible`
 * (Idea/PoC stage at or below Pre-Seed funding — see the eligibility engine).
 */
const REGISTERED_PROFILE: RegistrationProfile = {
  founderName: "Asha Rao",
  founderEmail: "asha@example.com",
  founderPhone: "9876543210",
  founderAge: 29,
  companyName: "Acme Innovations",
  dpiitRecognized: true,
  gstRegistered: true,
  incorporationDate: "2024-01-01",
  currentStage: "PoC",
  teamSize: 5,
  womenFounderStake: 60,
  womenEmployeePercentage: 40,
  scStFounder: false,
  primarySector: "deeptech",
  secondarySectors: [],
  location: "Mysuru",
  fundingStage: "Pre-Seed",
  fundingRaised: 0,
  isRegistered: false,
  kiteId: "",
  registeredAt: "",
};

/** Render the SERVER detail page (called directly) inside the provider. */
function renderDetailPage(id: string): ReturnType<typeof render> {
  return render(
    <RegistrationProvider>
      {SchemeDetailPage({ params: { id } })}
    </RegistrationProvider>,
  );
}

/**
 * Seeds the registration context once on mount via `updateProfile` +
 * `completeRegistration`, so children render in the Registered_State.
 */
function ProfileSeeder({
  profile,
  children,
}: {
  profile: RegistrationProfile;
  children: React.ReactNode;
}): JSX.Element {
  const { updateProfile, completeRegistration } = useRegistration();
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    updateProfile(profile);
    completeRegistration();
  }, [profile, updateProfile, completeRegistration]);
  return <>{children}</>;
}

/* -------------------------------------------------------------------------- */
/* 1. Full server detail render                                               */
/* -------------------------------------------------------------------------- */

describe("SchemeDetailPage — full render", () => {
  it("renders the scheme name as an <h1>", () => {
    renderDetailPage("elevate");
    expect(
      screen.getByRole("heading", { level: 1, name: ELEVATE.name }),
    ).toBeInTheDocument();
  });

  it("renders the type and status badges", () => {
    renderDetailPage("elevate");
    // ELEVATE is a grant → "Grant-in-Aid"; status "open" → "Open". Each label
    // appears in both the header badge and the Key Facts panel.
    expect(screen.getAllByText("Grant-in-Aid").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Open").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Benefit at a Glance tiles", () => {
    renderDetailPage("elevate");
    const region = screen.getByRole("region", { name: "Benefit at a Glance" });
    expect(within(region).getByText("Amount")).toBeInTheDocument();
    expect(within(region).getByText("Max Benefit")).toBeInTheDocument();
    expect(within(region).getByText("Duration")).toBeInTheDocument();
  });

  it("renders the eligibility list from the canonical scheme data", () => {
    renderDetailPage("elevate");
    const region = screen.getByRole("region", { name: "Eligibility" });
    for (const item of ELEVATE.eligibility) {
      expect(within(region).getByText(item)).toBeInTheDocument();
    }
  });

  it("renders the required documents list from the canonical scheme data", () => {
    renderDetailPage("elevate");
    const region = screen.getByRole("region", { name: "Required Documents" });
    for (const doc of ELEVATE.documents) {
      expect(within(region).getByText(doc)).toBeInTheDocument();
    }
  });

  it("renders the Process Timeline with the grant-flow steps", () => {
    renderDetailPage("elevate");
    const region = screen.getByRole("region", { name: "Process Timeline" });
    // Grant timeline (differs from the fiscal flow).
    expect(within(region).getByText("Apply to call")).toBeInTheDocument();
    expect(
      within(region).getByText("Milestone disbursement"),
    ).toBeInTheDocument();
  });

  it("renders the FAQ section with question triggers", () => {
    renderDetailPage("elevate");
    expect(
      screen.getByRole("heading", { name: "Frequently Asked Questions" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Who is this scheme for?")).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* 2. Related Schemes (sidebar)                                               */
/* -------------------------------------------------------------------------- */

describe("SchemeDetailPage — Related Schemes", () => {
  it("shows exactly three related, linkable scheme cards", () => {
    renderDetailPage("elevate");
    const region = screen.getByRole("region", { name: "Related Schemes" });
    const links = within(region).getAllByRole("link");
    expect(links).toHaveLength(3);
    // Every related card links to a canonical /schemes/<id> detail route.
    for (const link of links) {
      expect(link.getAttribute("href")).toMatch(/^\/schemes\/[\w-]+$/);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* 3. Alias resolution (Req 16.10)                                            */
/* -------------------------------------------------------------------------- */

describe("SchemeDetailPage — alias resolution", () => {
  it("resolves the 'kitven' alias to KITVEN Fund-5", () => {
    renderDetailPage("kitven");
    expect(
      screen.getByRole("heading", { level: 1, name: "KITVEN Fund-5" }),
    ).toBeInTheDocument();
    expect(notFoundMock).not.toHaveBeenCalled();
  });

  it("resolves the 'gck' alias to Grand Challenge Karnataka", () => {
    renderDetailPage("gck");
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Grand Challenge Karnataka",
      }),
    ).toBeInTheDocument();
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */
/* 4. notFound on unknown id (Req 16.10)                                       */
/* -------------------------------------------------------------------------- */

describe("SchemeDetailPage — unknown id", () => {
  it("calls notFound() for an unresolved id", () => {
    expect(() => SchemeDetailPage({ params: { id: "zzz-unknown" } })).toThrow(
      NOT_FOUND_SENTINEL,
    );
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});

/* -------------------------------------------------------------------------- */
/* 5. PersonalizedEligibilityCard island states (Req 16.8, 16.9)              */
/* -------------------------------------------------------------------------- */

describe("PersonalizedEligibilityCard — island states", () => {
  it("shows the register-to-see-eligibility banner when unregistered", () => {
    // The full page render in a fresh provider has no profile → the island
    // renders its unregistered invite banner.
    renderDetailPage("elevate");
    expect(
      screen.getByText(/Register to see your personalized eligibility/i),
    ).toBeInTheDocument();
  });

  it("shows a Your Eligibility card with a status when registered", async () => {
    render(
      <RegistrationProvider>
        <ProfileSeeder profile={REGISTERED_PROFILE}>
          <PersonalizedEligibilityCard scheme={ELEVATE} />
        </ProfileSeeder>
      </RegistrationProvider>,
    );

    // After the seeder runs, the island evaluates the profile and renders the
    // status-bordered "Your Eligibility" card.
    const card = await screen.findByRole("region", { name: "Your Eligibility" });
    expect(card).toBeInTheDocument();
    // ELEVATE with a PoC / Pre-Seed profile is definitely-eligible — the
    // ConfidenceDot's visible label communicates the status (not color-only).
    expect(within(card).getByText("Definitely eligible")).toBeInTheDocument();
    expect(within(card).getByText("Estimated Benefit:")).toBeInTheDocument();

    // Sanity: the unregistered banner is gone once a profile exists.
    await waitFor(() => {
      expect(
        screen.queryByText(/Register to see your personalized eligibility/i),
      ).not.toBeInTheDocument();
    });
  });
});

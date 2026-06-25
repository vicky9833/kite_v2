/**
 * CsrHowToPartner partnership-brief download test (task 12.9) — Requirements
 * 22.3, 33.4.
 *
 * Renders the `CsrHowToPartner` section and asserts the partnership CTAs the
 * design promises:
 *
 *   - The "Download CSR Partnership Brief" button exists.
 *   - Clicking it triggers a client-side `Blob` download through
 *     `URL.createObjectURL` / `revokeObjectURL` with NO `fetch`/network call
 *     (Req 22.3, 33.4). jsdom does not implement the object-URL APIs, so we
 *     install mock functions directly and assert `createObjectURL` is called
 *     with a `Blob`. We also assert `global.fetch` (when present) is never
 *     touched — the brief is assembled entirely in the browser.
 *   - The "Contact KDEM Partnership Team" CTA is a real `mailto:` link.
 *
 * jsdom note: the transient anchor's `.click()` would emit a "Not implemented:
 * navigation" warning, so `HTMLAnchorElement.prototype.click` is stubbed.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { CsrHowToPartner } from "@/components/csr/CsrHowToPartner";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CsrHowToPartner — partnership brief download", () => {
  it("renders the Download CSR Partnership Brief button", () => {
    render(<CsrHowToPartner />);

    expect(
      screen.getByRole("button", { name: /Download CSR Partnership Brief/i }),
    ).toBeInTheDocument();
  });

  it("renders a mailto Contact KDEM Partnership Team link", () => {
    render(<CsrHowToPartner />);

    const contactLink = screen.getByRole("link", {
      name: /Contact KDEM Partnership Team/i,
    });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink.getAttribute("href")).toMatch(/^mailto:/);
  });

  it("triggers a client-side Blob download with no fetch/network call (Req 22.3, 33.4)", async () => {
    // jsdom doesn't implement the object-URL APIs, so install mock functions
    // directly (spyOn needs an existing property) and assert createObjectURL is
    // called on click with a Blob.
    const createObjectURL = vi.fn().mockReturnValue("blob:mock");
    const revokeObjectURL = vi.fn();
    URL.createObjectURL = createObjectURL as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = revokeObjectURL as unknown as typeof URL.revokeObjectURL;

    // Prevent jsdom "Not implemented: navigation" noise from the anchor click.
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    // Guard the no-network invariant: spy on fetch if the runtime defines it.
    const fetchSpy =
      typeof global.fetch === "function"
        ? vi.spyOn(global, "fetch").mockResolvedValue(new Response())
        : null;

    render(<CsrHowToPartner />);

    const downloadButton = screen.getByRole("button", {
      name: /Download CSR Partnership Brief/i,
    });

    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalledTimes(1);
    });
    // The object URL is built from a Blob and the transient anchor is clicked.
    expect(createObjectURL.mock.calls[0]?.[0]).toBeInstanceOf(Blob);
    expect(anchorClick).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock");

    // No network: the brief is assembled entirely in the browser.
    if (fetchSpy) {
      expect(fetchSpy).not.toHaveBeenCalled();
    }
  });
});

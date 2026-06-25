/**
 * Component tests — registration wizard step components (task 2.12).
 *
 * These are EXAMPLE / component tests (not property-based tests). Each step is
 * rendered directly with controlled `StepProps` ({ profile, errors, touched,
 * dispatch }) and a `vi.fn()` dispatch, so we assert the observable step
 * contract in isolation from the wizard controller:
 *   - Step 1 founder inputs + error-after-blur gating + SET_FIELD/BLUR_FIELD wiring
 *   - Step 2 DPIIT/GST Yes/No radio groups + current-stage select
 *   - Step 3 women-led + SC/ST ELEVATE-Unnati unlock affordances
 *   - Step 4 primary/secondary sectors (exclude-primary + cap-at-3)
 *   - Step 5 location / funding-stage selects + funding-raised input
 *   - Step 6 review cards + Edit (GO_TO_STEP) + accuracy (TOGGLE_ACCURACY)
 *   - RegistrationProgress progressbar aria values
 *
 * References Req 3.11, 4.2, 5.3, 6.4, 6.5, 7.5, 9.2, 27.1, 27.3.
 *
 * Resilience notes for jsdom + Radix:
 *  - jsdom polyfills (matchMedia / ResizeObserver / scrollIntoView / pointer
 *    capture) live in `src/test/setup.ts`; without them Radix Select/Slider
 *    would throw on mount.
 *  - Radix Select/Slider open/drag interactions are flaky under jsdom, so we
 *    assert the robust, accessible contract (control is rendered + reachable,
 *    placeholder text present) rather than driving a full portal open. Controls
 *    that dispatch via plain DOM events (inputs, chip buttons, radios, the
 *    checkbox) are exercised directly.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";

import type { RegistrationProfile, WizardFieldErrors } from "@/types";
import { sectors } from "@/data/sectors";

import { RegistrationStep01Founder } from "../RegistrationStep01Founder";
import { RegistrationStep02Company } from "../RegistrationStep02Company";
import { RegistrationStep03Team } from "../RegistrationStep03Team";
import { RegistrationStep04Sectors } from "../RegistrationStep04Sectors";
import { RegistrationStep05Location } from "../RegistrationStep05Location";
import { RegistrationStep06Review } from "../RegistrationStep06Review";
import { RegistrationProgress } from "../RegistrationProgress";

/* -------------------------------------------------------------------------- */
/* Shared render helper                                                        */
/* -------------------------------------------------------------------------- */

interface StepArgs {
  profile?: Partial<RegistrationProfile>;
  errors?: WizardFieldErrors;
  touched?: Record<string, boolean>;
}

/** Build the standard StepProps slice with a fresh spy dispatch. */
function stepProps({ profile = {}, errors = {}, touched = {} }: StepArgs = {}) {
  const dispatch = vi.fn();
  return { profile, errors, touched, dispatch };
}

/* -------------------------------------------------------------------------- */
/* Step 1 — Founder details                                                    */
/* -------------------------------------------------------------------------- */

describe("RegistrationStep01Founder", () => {
  it("renders the name, email, phone, and age inputs", () => {
    render(<RegistrationStep01Founder {...stepProps()} />);

    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Mobile number")).toBeInTheDocument();
    expect(screen.getByLabelText("Your age")).toBeInTheDocument();
  });

  it("shows a field error only once the field has been touched (Req 4.2, 27.3)", () => {
    const props = stepProps({
      errors: { founderEmail: "Enter a valid email address." },
      touched: { founderEmail: true },
    });
    render(<RegistrationStep01Founder {...props} />);

    expect(
      screen.getByText("Enter a valid email address."),
    ).toBeInTheDocument();
  });

  it("does NOT show a field error before the field is touched", () => {
    const props = stepProps({
      errors: { founderEmail: "Enter a valid email address." },
      touched: {}, // not blurred yet
    });
    render(<RegistrationStep01Founder {...props} />);

    expect(
      screen.queryByText("Enter a valid email address."),
    ).not.toBeInTheDocument();
  });

  it("dispatches SET_FIELD on change and BLUR_FIELD on blur", () => {
    const props = stepProps();
    render(<RegistrationStep01Founder {...props} />);

    const name = screen.getByLabelText("Full name");
    fireEvent.change(name, { target: { value: "Anjali Rao" } });
    expect(props.dispatch).toHaveBeenCalledWith({
      type: "SET_FIELD",
      field: "founderName",
      value: "Anjali Rao",
    });

    fireEvent.blur(name);
    expect(props.dispatch).toHaveBeenCalledWith({
      type: "BLUR_FIELD",
      field: "founderName",
    });
  });
});

/* -------------------------------------------------------------------------- */
/* Step 2 — Company basics                                                     */
/* -------------------------------------------------------------------------- */

describe("RegistrationStep02Company", () => {
  it("renders DPIIT and GST as Yes/No radio groups (Req 5.3)", () => {
    render(<RegistrationStep02Company {...stepProps()} />);

    // Two boolean groups → four radios, with Yes/No accessible names.
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(4);
    expect(screen.getAllByRole("radio", { name: "Yes" })).toHaveLength(2);
    expect(screen.getAllByRole("radio", { name: "No" })).toHaveLength(2);

    // Each group's legend is present.
    expect(screen.getByText("DPIIT recognised?")).toBeInTheDocument();
    expect(screen.getByText("GST registered?")).toBeInTheDocument();
  });

  it("dispatches SET_FIELD when a DPIIT radio is selected", () => {
    const props = stepProps();
    render(<RegistrationStep02Company {...props} />);

    // DOM order: [dpiit-yes, dpiit-no, gst-yes, gst-no].
    const dpiitYes = screen.getAllByRole("radio", { name: "Yes" })[0]!;
    fireEvent.click(dpiitYes);

    expect(props.dispatch).toHaveBeenCalledWith({
      type: "SET_FIELD",
      field: "dpiitRecognized",
      value: true,
    });
  });

  it("renders the current-stage select", () => {
    render(<RegistrationStep02Company {...stepProps()} />);

    // The Radix Select trigger is the lone combobox in this step.
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Select your stage")).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* Step 3 — Team composition                                                   */
/* -------------------------------------------------------------------------- */

describe("RegistrationStep03Team", () => {
  it("shows the Women-Led unlock note when the founder stake reaches 51% (Req 6.4)", () => {
    render(
      <RegistrationStep03Team {...stepProps({ profile: { womenFounderStake: 51 } })} />,
    );
    expect(screen.getByText("Women-Led")).toBeInTheDocument();
  });

  it("shows the Women-Led unlock note when the workforce percentage reaches 51%", () => {
    render(
      <RegistrationStep03Team
        {...stepProps({ profile: { womenEmployeePercentage: 51 } })}
      />,
    );
    expect(screen.getByText("Women-Led")).toBeInTheDocument();
  });

  it("does NOT show the Women-Led note when both measures are below 51%", () => {
    render(
      <RegistrationStep03Team
        {...stepProps({
          profile: { womenFounderStake: 50, womenEmployeePercentage: 50 },
        })}
      />,
    );
    expect(screen.queryByText("Women-Led")).not.toBeInTheDocument();
  });

  it("reflects the SC/ST selection and surfaces the ELEVATE Unnati track note (Req 6.5)", () => {
    // The ELEVATE Unnati guidance is always rendered (emphasis changes with the
    // toggle); the robust observable contract is the checkbox's checked state.
    const checked = stepProps({ profile: { scStFounder: true } });
    render(<RegistrationStep03Team {...checked} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByText("ELEVATE Unnati")).toBeInTheDocument();
  });

  it("leaves the SC/ST checkbox unchecked when not selected", () => {
    render(<RegistrationStep03Team {...stepProps({ profile: { scStFounder: false } })} />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
});

/* -------------------------------------------------------------------------- */
/* Step 4 — Sector focus                                                       */
/* -------------------------------------------------------------------------- */

describe("RegistrationStep04Sectors", () => {
  it("renders the primary sector select", () => {
    render(<RegistrationStep04Sectors {...stepProps()} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Select your primary sector")).toBeInTheDocument();
  });

  it("excludes the chosen primary sector from the secondary chip group (Req 7.5)", () => {
    // sectors[0] = Deep Tech, sectors[1] = AI & ML.
    const primary = sectors[0]!;
    const other = sectors[1]!;
    render(
      <RegistrationStep04Sectors
        {...stepProps({ profile: { primarySector: primary.id } })}
      />,
    );

    const fieldset = screen
      .getByText(/Secondary sectors/)
      .closest("fieldset") as HTMLElement;

    expect(
      within(fieldset).queryByRole("button", { name: primary.name }),
    ).not.toBeInTheDocument();
    expect(
      within(fieldset).getByRole("button", { name: other.name }),
    ).toBeInTheDocument();
  });

  it("dispatches SET_FIELD when a secondary chip is toggled on", () => {
    const target = sectors[1]!; // AI & ML
    const props = stepProps();
    render(<RegistrationStep04Sectors {...props} />);

    fireEvent.click(screen.getByRole("button", { name: target.name }));
    expect(props.dispatch).toHaveBeenCalledWith({
      type: "SET_FIELD",
      field: "secondarySectors",
      value: [target.id],
    });
  });

  it("prevents adding a 4th secondary sector by disabling the remaining chips (Req 7.4)", () => {
    // Three secondaries already chosen → remaining unselected chips are disabled.
    const chosen = [sectors[1]!, sectors[2]!, sectors[3]!];
    const candidate = sectors[4]!; // a 4th, not yet selected
    render(
      <RegistrationStep04Sectors
        {...stepProps({
          profile: {
            primarySector: sectors[0]!.id,
            secondarySectors: chosen.map((s) => s.id),
          },
        })}
      />,
    );

    const fieldset = screen
      .getByText(/Secondary sectors/)
      .closest("fieldset") as HTMLElement;

    // The 4th candidate cannot be added.
    expect(
      within(fieldset).getByRole("button", { name: candidate.name }),
    ).toBeDisabled();
    // An already-selected chip stays interactive (can be toggled off).
    expect(
      within(fieldset).getByRole("button", { name: chosen[0]!.name }),
    ).not.toBeDisabled();
  });
});

/* -------------------------------------------------------------------------- */
/* Step 5 — Location & funding                                                 */
/* -------------------------------------------------------------------------- */

describe("RegistrationStep05Location", () => {
  it("renders the location and funding-stage selects and the funding-raised input", () => {
    render(<RegistrationStep05Location {...stepProps()} />);

    // Two Radix Select triggers (location + funding stage).
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
    expect(screen.getByText("Select your location")).toBeInTheDocument();
    expect(screen.getByText("Select your funding stage")).toBeInTheDocument();

    // The funding-raised number input is present and labelled.
    expect(screen.getByLabelText(/Funding raised/)).toBeInTheDocument();
  });

  it("dispatches SET_FIELD when the funding-raised amount changes", () => {
    const props = stepProps();
    render(<RegistrationStep05Location {...props} />);

    fireEvent.change(screen.getByLabelText(/Funding raised/), {
      target: { value: "25" },
    });
    expect(props.dispatch).toHaveBeenCalledWith({
      type: "SET_FIELD",
      field: "fundingRaised",
      value: 25,
    });
  });
});

/* -------------------------------------------------------------------------- */
/* Step 6 — Review & submit                                                    */
/* -------------------------------------------------------------------------- */

describe("RegistrationStep06Review", () => {
  const profile: Partial<RegistrationProfile> = {
    founderName: "Anjali Rao",
    founderEmail: "anjali@example.com",
    companyName: "Acme Innovations",
    primarySector: sectors[0]!.id,
  };

  it("renders review values from the profile (Req 9.2)", () => {
    render(
      <RegistrationStep06Review
        {...stepProps({ profile })}
        accuracyConfirmed={false}
      />,
    );

    expect(screen.getByText("Anjali Rao")).toBeInTheDocument();
    expect(screen.getByText("anjali@example.com")).toBeInTheDocument();
    expect(screen.getByText("Acme Innovations")).toBeInTheDocument();
    // Primary sector is rendered by display name, not raw id.
    expect(screen.getByText(sectors[0]!.name)).toBeInTheDocument();
  });

  it("dispatches GO_TO_STEP when an Edit control is activated", () => {
    const props = stepProps({ profile });
    render(<RegistrationStep06Review {...props} accuracyConfirmed={false} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Edit Founder details" }),
    );
    expect(props.dispatch).toHaveBeenCalledWith({
      type: "GO_TO_STEP",
      step: 1,
    });
  });

  it("dispatches TOGGLE_ACCURACY when the accuracy checkbox is toggled", () => {
    const props = stepProps({ profile });
    render(<RegistrationStep06Review {...props} accuracyConfirmed={false} />);

    fireEvent.click(screen.getByRole("checkbox"));
    expect(props.dispatch).toHaveBeenCalledWith({
      type: "TOGGLE_ACCURACY",
      value: true,
    });
  });
});

/* -------------------------------------------------------------------------- */
/* RegistrationProgress                                                        */
/* -------------------------------------------------------------------------- */

describe("RegistrationProgress", () => {
  it("exposes a progressbar whose value tracks the current step (Req 3.3, 27.1)", () => {
    render(<RegistrationProgress currentStep={3} title="Team composition" />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemin", "1");
    expect(bar).toHaveAttribute("aria-valuemax", "6");
  });
});

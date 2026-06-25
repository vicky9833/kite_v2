/**
 * Unit tests for the pure investor onboarding step validators (task 8.4).
 *
 * Exercises the per-step rules + edge cases of `validateInvestorStep1/2/3`
 * (Req 16.3). These functions are pure and synchronous, so the tests are plain
 * input → output assertions with no DOM, no async, and no mocks.
 */

import { describe, it, expect } from "vitest";

import {
  validateInvestorStep1,
  validateInvestorStep2,
  validateInvestorStep3,
} from "@/lib/investor-onboarding-validators";
import { sectors } from "@/data/sectors";
import type { InvestorProfile } from "@/types";

/* -------------------------------------------------------------------------- */
/* Valid baselines per step                                                    */
/* -------------------------------------------------------------------------- */

const VALID_STEP1: Partial<InvestorProfile> = {
  investorName: "Anjali Rao",
  investorEmail: "anjali@example.com",
  investorPhone: "9876543210",
  role: "GP",
};

const VALID_STEP2: Partial<InvestorProfile> = {
  firmType: "VC",
  assetsUnderManagement: 5000,
  foundedYear: 2015,
};

const VALID_STEP3: Partial<InvestorProfile> = {
  focusSectors: [sectors[0]!.id],
  focusStages: ["Seed"],
  ticketSizeMinLakhs: 50,
  ticketSizeMaxLakhs: 500,
  geographicFocus: ["Karnataka"],
};

/* -------------------------------------------------------------------------- */
/* Step 1 — Identity                                                           */
/* -------------------------------------------------------------------------- */

describe("validateInvestorStep1", () => {
  it("accepts a fully valid identity step (no errors)", () => {
    expect(validateInvestorStep1(VALID_STEP1)).toEqual({});
  });

  it("flags a name shorter than 2 characters", () => {
    const errors = validateInvestorStep1({ ...VALID_STEP1, investorName: "A" });
    expect(errors.investorName).toBeDefined();
    // Only the name is invalid.
    expect(Object.keys(errors)).toEqual(["investorName"]);
  });

  it("flags a malformed email address", () => {
    const errors = validateInvestorStep1({
      ...VALID_STEP1,
      investorEmail: "not-an-email",
    });
    expect(errors.investorEmail).toBeDefined();
  });

  it("flags a phone number that is not 10 digits", () => {
    const errors = validateInvestorStep1({
      ...VALID_STEP1,
      investorPhone: "12345",
    });
    expect(errors.investorPhone).toBeDefined();
  });

  it("flags a missing / out-of-enum role", () => {
    const missing = validateInvestorStep1({
      ...VALID_STEP1,
      role: undefined,
    });
    expect(missing.role).toBeDefined();

    const bad = validateInvestorStep1({
      ...VALID_STEP1,
      role: "Janitor" as InvestorProfile["role"],
    });
    expect(bad.role).toBeDefined();
  });

  it("accepts a phone with a +91 prefix and separators", () => {
    const withPrefix = validateInvestorStep1({
      ...VALID_STEP1,
      investorPhone: "+91 98765-43210",
    });
    expect(withPrefix.investorPhone).toBeUndefined();

    const withParens = validateInvestorStep1({
      ...VALID_STEP1,
      investorPhone: "+91 (98765) 43210",
    });
    expect(withParens.investorPhone).toBeUndefined();
  });

  it("reports every invalid field at once on an empty draft", () => {
    const errors = validateInvestorStep1({});
    expect(errors.investorName).toBeDefined();
    expect(errors.investorEmail).toBeDefined();
    expect(errors.investorPhone).toBeDefined();
    expect(errors.role).toBeDefined();
  });
});

/* -------------------------------------------------------------------------- */
/* Step 2 — Firm                                                               */
/* -------------------------------------------------------------------------- */

describe("validateInvestorStep2", () => {
  it("accepts a fully valid firm step (no errors)", () => {
    expect(validateInvestorStep2(VALID_STEP2)).toEqual({});
  });

  it("flags a firmType outside the FirmType enum", () => {
    const errors = validateInvestorStep2({
      ...VALID_STEP2,
      firmType: "Hedge Fund" as InvestorProfile["firmType"],
    });
    expect(errors.firmType).toBeDefined();
  });

  it("flags a negative assets-under-management value", () => {
    const errors = validateInvestorStep2({
      ...VALID_STEP2,
      assetsUnderManagement: -1,
    });
    expect(errors.assetsUnderManagement).toBeDefined();
  });

  it("accepts an AUM of exactly zero", () => {
    const errors = validateInvestorStep2({
      ...VALID_STEP2,
      assetsUnderManagement: 0,
    });
    expect(errors.assetsUnderManagement).toBeUndefined();
  });

  it("flags a foundedYear before 1900 or after the current year", () => {
    const tooOld = validateInvestorStep2({ ...VALID_STEP2, foundedYear: 1899 });
    expect(tooOld.foundedYear).toBeDefined();

    const nextYear = new Date().getFullYear() + 1;
    const tooNew = validateInvestorStep2({
      ...VALID_STEP2,
      foundedYear: nextYear,
    });
    expect(tooNew.foundedYear).toBeDefined();
  });

  it("accepts the current year as foundedYear (boundary)", () => {
    const currentYear = new Date().getFullYear();
    const errors = validateInvestorStep2({
      ...VALID_STEP2,
      foundedYear: currentYear,
    });
    expect(errors.foundedYear).toBeUndefined();
  });
});

/* -------------------------------------------------------------------------- */
/* Step 3 — Thesis                                                             */
/* -------------------------------------------------------------------------- */

describe("validateInvestorStep3", () => {
  it("accepts a fully valid thesis step (no errors)", () => {
    expect(validateInvestorStep3(VALID_STEP3)).toEqual({});
  });

  it("flags empty focusSectors", () => {
    const errors = validateInvestorStep3({ ...VALID_STEP3, focusSectors: [] });
    expect(errors.focusSectors).toBeDefined();
  });

  it("flags empty focusStages", () => {
    const errors = validateInvestorStep3({ ...VALID_STEP3, focusStages: [] });
    expect(errors.focusStages).toBeDefined();
  });

  it("flags ticketSizeMax below ticketSizeMin", () => {
    const errors = validateInvestorStep3({
      ...VALID_STEP3,
      ticketSizeMinLakhs: 500,
      ticketSizeMaxLakhs: 100,
    });
    expect(errors.ticketSizeMaxLakhs).toBeDefined();
  });

  it("accepts ticketSizeMax equal to ticketSizeMin (boundary)", () => {
    const errors = validateInvestorStep3({
      ...VALID_STEP3,
      ticketSizeMinLakhs: 100,
      ticketSizeMaxLakhs: 100,
    });
    expect(errors.ticketSizeMaxLakhs).toBeUndefined();
  });

  it("flags empty geographicFocus", () => {
    const errors = validateInvestorStep3({
      ...VALID_STEP3,
      geographicFocus: [],
    });
    expect(errors.geographicFocus).toBeDefined();
  });
});

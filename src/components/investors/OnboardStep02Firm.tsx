"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FirmType } from "@/types";

import { OnboardingField, fieldError } from "./OnboardingField";
import type { InvestorStepProps } from "./InvestorOnboardingWizard";

const FIRM_TYPES: readonly FirmType[] = [
  "VC",
  "Angel Network",
  "Family Office",
  "Corporate VC",
  "Government Fund",
  "Accelerator Fund",
];

/**
 * Step 2 — Firm profile (Req 16.2): firmType, assetsUnderManagement (lakhs),
 * foundedYear.
 *
 * Every control wires `onChange → SET_FIELD` and `onBlur → BLUR_FIELD`. Errors
 * surface only after blur inside the field's `aria-live` region.
 */
export function OnboardStep02Firm({
  profile,
  errors,
  touched,
  dispatch,
}: InvestorStepProps) {
  const firmTypeErr = fieldError(errors, touched, "firmType");
  const aumErr = fieldError(errors, touched, "assetsUnderManagement");
  const yearErr = fieldError(errors, touched, "foundedYear");

  return (
    <section aria-labelledby="step-firm-heading" className="space-y-6">
      <div className="space-y-1">
        <h2 id="step-firm-heading" className="font-heading text-h3 text-dark">
          Your firm
        </h2>
        <p className="text-body text-muted">
          A few details about the fund or vehicle you invest through.
        </p>
      </div>

      <div className="grid gap-5">
        <OnboardingField
          id="firmType"
          label="Firm type"
          error={firmTypeErr}
          className="max-w-sm"
        >
          <Select
            value={(profile.firmType as string | undefined) ?? undefined}
            onValueChange={(v) => {
              dispatch({ type: "SET_FIELD", field: "firmType", value: v });
              dispatch({ type: "BLUR_FIELD", field: "firmType" });
            }}
          >
            <SelectTrigger
              id="firmType"
              aria-invalid={Boolean(firmTypeErr)}
              aria-describedby={firmTypeErr ? "firmType-error" : undefined}
            >
              <SelectValue placeholder="Select your firm type" />
            </SelectTrigger>
            <SelectContent>
              {FIRM_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </OnboardingField>

        <OnboardingField
          id="assetsUnderManagement"
          label="Assets under management (₹ lakhs)"
          error={aumErr}
          hint="Approximate total capital you currently manage."
          hintId="assetsUnderManagement-hint"
          className="max-w-[18rem]"
        >
          <Input
            id="assetsUnderManagement"
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="e.g. 5000"
            value={
              typeof profile.assetsUnderManagement === "number" &&
              Number.isFinite(profile.assetsUnderManagement)
                ? String(profile.assetsUnderManagement)
                : ""
            }
            aria-invalid={Boolean(aumErr)}
            aria-describedby={
              aumErr
                ? "assetsUnderManagement-error assetsUnderManagement-hint"
                : "assetsUnderManagement-hint"
            }
            onChange={(e) => {
              const raw = e.target.value;
              dispatch({
                type: "SET_FIELD",
                field: "assetsUnderManagement",
                value: raw === "" ? undefined : Number(raw),
              });
            }}
            onBlur={() =>
              dispatch({ type: "BLUR_FIELD", field: "assetsUnderManagement" })
            }
          />
        </OnboardingField>

        <OnboardingField
          id="foundedYear"
          label="Year founded"
          error={yearErr}
          className="max-w-[12rem]"
        >
          <Input
            id="foundedYear"
            type="number"
            min={1900}
            inputMode="numeric"
            placeholder="e.g. 2015"
            value={
              typeof profile.foundedYear === "number" &&
              Number.isFinite(profile.foundedYear)
                ? String(profile.foundedYear)
                : ""
            }
            aria-invalid={Boolean(yearErr)}
            aria-describedby={yearErr ? "foundedYear-error" : undefined}
            onChange={(e) => {
              const raw = e.target.value;
              dispatch({
                type: "SET_FIELD",
                field: "foundedYear",
                value: raw === "" ? undefined : Number(raw),
              });
            }}
            onBlur={() =>
              dispatch({ type: "BLUR_FIELD", field: "foundedYear" })
            }
          />
        </OnboardingField>
      </div>
    </section>
  );
}

export default OnboardStep02Firm;

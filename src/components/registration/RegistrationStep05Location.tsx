"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FundingStage, LocationKarnataka } from "@/types";

import {
  WizardField,
  fieldError,
  type StepProps,
} from "./RegistrationWizard";

const LOCATIONS: readonly LocationKarnataka[] = [
  "Bengaluru Urban",
  "Bengaluru Rural",
  "Mysuru",
  "Mangaluru",
  "Hubballi-Dharwad-Belagavi",
  "Kalaburagi",
  "Shivamogga",
  "Tumakuru",
  "Other Karnataka",
];

const FUNDING_STAGES: readonly FundingStage[] = [
  "Bootstrapped",
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B Plus",
];

/**
 * Step 5 — Location & funding (Req 8): Karnataka location select (drives the
 * zone → incubation-grant eligibility), funding-stage select, and a
 * funding-raised amount in lakhs defaulting to 0.
 */
export function RegistrationStep05Location({
  profile,
  errors,
  touched,
  dispatch,
}: StepProps) {
  const locationErr = fieldError(errors, touched, "location");
  const fundingStageErr = fieldError(errors, touched, "fundingStage");
  const fundingRaisedErr = fieldError(errors, touched, "fundingRaised");

  const fundingRaised =
    typeof profile.fundingRaised === "number" ? profile.fundingRaised : 0;

  return (
    <section aria-labelledby="step-location-heading" className="space-y-6">
      <div className="space-y-1">
        <h2 id="step-location-heading" className="font-heading text-h3 text-dark">
          Location & funding
        </h2>
        <p className="text-body text-muted">
          Where you operate and how much you have raised shape stage-gated
          benefits.
        </p>
      </div>

      <div className="grid gap-5">
        <WizardField
          id="location"
          label="Primary location"
          error={locationErr}
          hint="Location determines your zone, which drives incubation-grant eligibility."
          hintId="location-hint"
          className="max-w-sm"
        >
          <Select
            value={(profile.location as string | undefined) ?? undefined}
            onValueChange={(v) => {
              dispatch({ type: "SET_FIELD", field: "location", value: v });
              dispatch({ type: "BLUR_FIELD", field: "location" });
            }}
          >
            <SelectTrigger
              id="location"
              aria-invalid={Boolean(locationErr)}
              aria-describedby={
                locationErr ? "location-error location-hint" : "location-hint"
              }
            >
              <SelectValue placeholder="Select your location" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </WizardField>

        <WizardField
          id="fundingStage"
          label="Funding stage"
          error={fundingStageErr}
          className="max-w-sm"
        >
          <Select
            value={(profile.fundingStage as string | undefined) ?? undefined}
            onValueChange={(v) => {
              dispatch({ type: "SET_FIELD", field: "fundingStage", value: v });
              dispatch({ type: "BLUR_FIELD", field: "fundingStage" });
            }}
          >
            <SelectTrigger
              id="fundingStage"
              aria-invalid={Boolean(fundingStageErr)}
              aria-describedby={fundingStageErr ? "fundingStage-error" : undefined}
            >
              <SelectValue placeholder="Select your funding stage" />
            </SelectTrigger>
            <SelectContent>
              {FUNDING_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </WizardField>

        <WizardField
          id="fundingRaised"
          label="Funding raised so far (₹ lakhs)"
          error={fundingRaisedErr}
          hint="Affects KITVEN and stage-gated schemes. Enter 0 if bootstrapped."
          hintId="fundingRaised-hint"
          className="max-w-[16rem]"
        >
          <Input
            id="fundingRaised"
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="0"
            value={Number.isFinite(fundingRaised) ? String(fundingRaised) : "0"}
            aria-invalid={Boolean(fundingRaisedErr)}
            aria-describedby={
              fundingRaisedErr
                ? "fundingRaised-error fundingRaised-hint"
                : "fundingRaised-hint"
            }
            onChange={(e) => {
              const raw = e.target.value;
              dispatch({
                type: "SET_FIELD",
                field: "fundingRaised",
                value: raw === "" ? 0 : Number(raw),
              });
            }}
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "fundingRaised" })}
          />
        </WizardField>
      </div>
    </section>
  );
}

export default RegistrationStep05Location;

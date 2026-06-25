"use client";

import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CurrentStage } from "@/types";

import {
  WizardField,
  fieldError,
  type StepProps,
} from "./RegistrationWizard";

const CURRENT_STAGES: readonly CurrentStage[] = [
  "Idea",
  "PoC",
  "Early Revenue",
  "Growth",
  "Scale",
];

/** Yes/No boolean radio used for DPIIT and GST (explicit selection required). */
function YesNoRadio({
  name,
  label,
  value,
  error,
  hint,
  onSelect,
}: {
  name: string;
  label: string;
  value: boolean | undefined;
  error?: string;
  hint?: string;
  onSelect: (next: boolean) => void;
}) {
  const radioValue = value === true ? "yes" : value === false ? "no" : undefined;
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-caption font-medium text-dark">{label}</legend>
      <RadioGroup
        className="flex gap-6"
        value={radioValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onValueChange={(v) => onSelect(v === "yes")}
      >
        <label className="flex items-center gap-2 text-body text-dark">
          <RadioGroupItem value="yes" id={`${name}-yes`} />
          Yes
        </label>
        <label className="flex items-center gap-2 text-body text-dark">
          <RadioGroupItem value="no" id={`${name}-no`} />
          No
        </label>
      </RadioGroup>
      {hint ? <p className="text-caption text-muted">{hint}</p> : null}
      <div aria-live="polite" className="min-h-[1.25rem]">
        {error ? (
          <p id={`${name}-error`} className="text-caption font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </fieldset>
  );
}

/**
 * Step 2 — Company basics (Req 5): company name, DPIIT & GST Yes/No radios
 * (explicit selection required), incorporation date (not in the future), and
 * the current stage select that drives scheme eligibility.
 */
export function RegistrationStep02Company({
  profile,
  errors,
  touched,
  dispatch,
}: StepProps) {
  const nameErr = fieldError(errors, touched, "companyName");
  const dpiitErr = fieldError(errors, touched, "dpiitRecognized");
  const gstErr = fieldError(errors, touched, "gstRegistered");
  const dateErr = fieldError(errors, touched, "incorporationDate");
  const stageErr = fieldError(errors, touched, "currentStage");

  // ISO date input cannot exceed today.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section aria-labelledby="step-company-heading" className="space-y-6">
      <div className="space-y-1">
        <h2 id="step-company-heading" className="font-heading text-h3 text-dark">
          Company basics
        </h2>
        <p className="text-body text-muted">
          Recognition and stage signals determine which schemes you can access.
        </p>
      </div>

      <div className="grid gap-5">
        <WizardField id="companyName" label="Company name" error={nameErr}>
          <Input
            id="companyName"
            type="text"
            autoComplete="organization"
            placeholder="Registered entity name"
            value={(profile.companyName as string | undefined) ?? ""}
            aria-invalid={Boolean(nameErr)}
            aria-describedby={nameErr ? "companyName-error" : undefined}
            onChange={(e) =>
              dispatch({ type: "SET_FIELD", field: "companyName", value: e.target.value })
            }
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "companyName" })}
          />
        </WizardField>

        <div className="grid gap-5 sm:grid-cols-2">
          <YesNoRadio
            name="dpiitRecognized"
            label="DPIIT recognised?"
            value={profile.dpiitRecognized as boolean | undefined}
            error={dpiitErr}
            hint="Startup India / DPIIT recognition."
            onSelect={(next) => {
              dispatch({ type: "SET_FIELD", field: "dpiitRecognized", value: next });
              dispatch({ type: "BLUR_FIELD", field: "dpiitRecognized" });
            }}
          />
          <YesNoRadio
            name="gstRegistered"
            label="GST registered?"
            value={profile.gstRegistered as boolean | undefined}
            error={gstErr}
            onSelect={(next) => {
              dispatch({ type: "SET_FIELD", field: "gstRegistered", value: next });
              dispatch({ type: "BLUR_FIELD", field: "gstRegistered" });
            }}
          />
        </div>

        <WizardField
          id="incorporationDate"
          label="Incorporation date"
          error={dateErr}
          className="max-w-[16rem]"
        >
          <Input
            id="incorporationDate"
            type="date"
            max={today}
            value={(profile.incorporationDate as string | undefined) ?? ""}
            aria-invalid={Boolean(dateErr)}
            aria-describedby={dateErr ? "incorporationDate-error" : undefined}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "incorporationDate",
                value: e.target.value,
              })
            }
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "incorporationDate" })}
          />
        </WizardField>

        <WizardField
          id="currentStage"
          label="Current stage"
          error={stageErr}
          hint="Your stage drives scheme eligibility."
          hintId="currentStage-hint"
          className="max-w-sm"
        >
          <Select
            value={(profile.currentStage as string | undefined) ?? undefined}
            onValueChange={(v) => {
              dispatch({ type: "SET_FIELD", field: "currentStage", value: v });
              dispatch({ type: "BLUR_FIELD", field: "currentStage" });
            }}
          >
            <SelectTrigger
              id="currentStage"
              aria-invalid={Boolean(stageErr)}
              aria-describedby={
                stageErr ? "currentStage-error currentStage-hint" : "currentStage-hint"
              }
            >
              <SelectValue placeholder="Select your stage" />
            </SelectTrigger>
            <SelectContent>
              {CURRENT_STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </WizardField>
      </div>
    </section>
  );
}

export default RegistrationStep02Company;

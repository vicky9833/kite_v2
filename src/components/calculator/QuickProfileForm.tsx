"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useRegistration } from "@/context/RegistrationContext";
import { sectors } from "@/data/sectors";
import type {
  CurrentStage,
  FundingStage,
  LocationKarnataka,
  RegistrationProfile,
} from "@/types";

// --- Enumeration option lists (mirror the union types in src/types) ---

const CURRENT_STAGES: readonly CurrentStage[] = [
  "Idea",
  "PoC",
  "Early Revenue",
  "Growth",
  "Scale",
];

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
 * Local form state for the compressed quick profile. Mirrors only the
 * `RegistrationProfile` fields the eligibility engine consumes (plus
 * `primarySector` / `fundingRaised` for parity with the wizard). Booleans are
 * tri-state (`undefined`) until the visitor makes an explicit Yes/No choice.
 */
interface QuickProfileState {
  dpiitRecognized: boolean | undefined;
  gstRegistered: boolean | undefined;
  currentStage: CurrentStage | "";
  founderAge: number | undefined;
  womenFounderStake: number;
  womenEmployeePercentage: number;
  scStFounder: boolean;
  primarySector: string;
  location: LocationKarnataka | "";
  fundingStage: FundingStage | "";
  fundingRaised: number;
}

const INITIAL_STATE: QuickProfileState = {
  dpiitRecognized: undefined,
  gstRegistered: undefined,
  currentStage: "",
  founderAge: undefined,
  womenFounderStake: 0,
  womenEmployeePercentage: 0,
  scStFounder: false,
  primarySector: "",
  location: "",
  fundingStage: "",
  fundingRaised: 0,
};

type FieldErrors = Partial<Record<keyof QuickProfileState, string>>;

/**
 * Light inline validation for the required engine inputs. The wizard's
 * `registration-validators` cover the full multi-step rule set; here we keep it
 * deliberately minimal — just enough to guarantee a usable engine profile.
 */
function validate(state: QuickProfileState): FieldErrors {
  const errors: FieldErrors = {};

  if (typeof state.dpiitRecognized !== "boolean") {
    errors.dpiitRecognized = "Select Yes or No for DPIIT recognition.";
  }
  if (typeof state.gstRegistered !== "boolean") {
    errors.gstRegistered = "Select Yes or No for GST registration.";
  }
  if (state.currentStage === "") {
    errors.currentStage = "Select your current stage.";
  }
  if (
    typeof state.founderAge !== "number" ||
    !Number.isFinite(state.founderAge) ||
    state.founderAge < 18 ||
    state.founderAge > 80
  ) {
    errors.founderAge = "Age must be between 18 and 80.";
  }
  if (state.primarySector === "") {
    errors.primarySector = "Select your primary sector.";
  }
  if (state.location === "") {
    errors.location = "Select your location in Karnataka.";
  }
  if (state.fundingStage === "") {
    errors.fundingStage = "Select your funding stage.";
  }
  if (!Number.isFinite(state.fundingRaised) || state.fundingRaised < 0) {
    errors.fundingRaised = "Funding raised cannot be negative.";
  }

  return errors;
}

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

/** A 0–100 percentage slider with its live value shown alongside the label. */
function PercentSlider({
  id,
  label,
  value,
  onValueChange,
}: {
  id: string;
  label: string;
  value: number;
  onValueChange: (next: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-caption font-medium text-dark">
          {label}
        </label>
        <span className="text-caption font-semibold tabular-nums text-dark">
          {value}%
        </span>
      </div>
      <Slider
        id={id}
        min={0}
        max={100}
        step={1}
        value={[value]}
        aria-label={label}
        aria-valuetext={`${value} percent`}
        onValueChange={(vals) => onValueChange(vals[0] ?? 0)}
      />
    </div>
  );
}

/** A labelled field wrapper with an `aria-live` error region. */
function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-caption font-medium text-dark">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="text-caption text-muted">
          {hint}
        </p>
      ) : null}
      <div aria-live="polite" className="min-h-[1.25rem]">
        {error ? (
          <p id={`${id}-error`} className="text-caption font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export interface QuickProfileFormProps {
  /** Invoked after the captured fields are written to the session context. */
  onSaved?: () => void;
  className?: string;
}

/**
 * Compressed, single-screen mirror of the registration wizard for the Policy
 * Calculator (Req 20.3, 20.4). It captures ONLY the fields the eligibility
 * engine consumes and, on save, writes them as a partial Registration_Profile
 * via `updateProfile` — entering Profile_Set_State while leaving `isRegistered`
 * false (the calculator never calls `completeRegistration`).
 */
export function QuickProfileForm({ onSaved, className }: QuickProfileFormProps) {
  const { updateProfile } = useRegistration();
  const [state, setState] = useState<QuickProfileState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showErrors, setShowErrors] = useState(false);

  function update<K extends keyof QuickProfileState>(
    key: K,
    value: QuickProfileState[K],
  ) {
    setState((current) => {
      const next = { ...current, [key]: value };
      // Re-validate live once the visitor has attempted a save.
      if (showErrors) setErrors(validate(next));
      return next;
    });
  }

  /** Show an error only after a save attempt, matching the wizard's UX. */
  const errFor = (key: keyof QuickProfileState): string | undefined =>
    showErrors ? errors[key] : undefined;

  function handleSave() {
    const validationErrors = validate(state);
    setErrors(validationErrors);
    setShowErrors(true);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Build the partial profile from the captured engine fields. The validation
    // above guarantees the required fields are present and well-typed, so the
    // narrowing casts below are safe.
    const partial: Partial<RegistrationProfile> = {
      dpiitRecognized: state.dpiitRecognized as boolean,
      gstRegistered: state.gstRegistered as boolean,
      currentStage: state.currentStage as CurrentStage,
      founderAge: state.founderAge as number,
      womenFounderStake: state.womenFounderStake,
      womenEmployeePercentage: state.womenEmployeePercentage,
      scStFounder: state.scStFounder,
      primarySector: state.primarySector,
      location: state.location as LocationKarnataka,
      fundingStage: state.fundingStage as FundingStage,
      fundingRaised: state.fundingRaised,
    };

    // Enters Profile_Set_State. We deliberately DO NOT call completeRegistration —
    // a quick profile leaves `isRegistered` false (Req 20.4).
    updateProfile(partial);
    onSaved?.();
  }

  const womenLedUnlocked =
    state.womenFounderStake >= 51 || state.womenEmployeePercentage >= 51;

  return (
    <form
      noValidate
      aria-labelledby="quick-profile-heading"
      className={cn("space-y-6", className)}
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <div className="space-y-1">
        <h3
          id="quick-profile-heading"
          className="font-heading text-lg font-semibold text-dark"
        >
          Quick profile
        </h3>
        <p className="text-body text-muted">
          Just the fields the calculator needs to estimate your benefits. This
          stays in your session only — nothing is saved to a server.
        </p>
      </div>

      {/* Recognition + stage */}
      <div className="grid gap-5 sm:grid-cols-2">
        <YesNoRadio
          name="dpiitRecognized"
          label="DPIIT recognised?"
          value={state.dpiitRecognized}
          error={errFor("dpiitRecognized")}
          hint="Startup India / DPIIT recognition."
          onSelect={(next) => update("dpiitRecognized", next)}
        />
        <YesNoRadio
          name="gstRegistered"
          label="GST registered?"
          value={state.gstRegistered}
          error={errFor("gstRegistered")}
          onSelect={(next) => update("gstRegistered", next)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="currentStage"
          label="Current stage"
          error={errFor("currentStage")}
        >
          <Select
            value={state.currentStage || undefined}
            onValueChange={(v) => update("currentStage", v as CurrentStage)}
          >
            <SelectTrigger
              id="currentStage"
              aria-invalid={Boolean(errFor("currentStage"))}
              aria-describedby={
                errFor("currentStage") ? "currentStage-error" : undefined
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
        </Field>

        <Field
          id="founderAge"
          label="Founder age"
          error={errFor("founderAge")}
          hint="Drives age-gated schemes such as RGEP."
        >
          <Input
            id="founderAge"
            type="number"
            min={18}
            max={80}
            inputMode="numeric"
            placeholder="18–80"
            value={
              typeof state.founderAge === "number" &&
              Number.isFinite(state.founderAge)
                ? String(state.founderAge)
                : ""
            }
            aria-invalid={Boolean(errFor("founderAge"))}
            aria-describedby={cn(
              "founderAge-hint",
              errFor("founderAge") && "founderAge-error",
            )}
            onChange={(e) => {
              const raw = e.target.value;
              update("founderAge", raw === "" ? undefined : Number(raw));
            }}
          />
        </Field>
      </div>

      {/* Team composition */}
      <div className="grid gap-6 sm:grid-cols-2">
        <PercentSlider
          id="womenFounderStake"
          label="Women founder equity stake"
          value={state.womenFounderStake}
          onValueChange={(next) => update("womenFounderStake", next)}
        />
        <PercentSlider
          id="womenEmployeePercentage"
          label="Women in the workforce"
          value={state.womenEmployeePercentage}
          onValueChange={(next) => update("womenEmployeePercentage", next)}
        />
      </div>

      <div aria-live="polite">
        {womenLedUnlocked ? (
          <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
            <p className="text-caption text-dark">
              51%+ women representation unlocks{" "}
              <span className="font-semibold">Women-Led</span> preferences across
              eligible schemes.
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
        <label className="flex items-start gap-3">
          <Checkbox
            id="scStFounder"
            checked={state.scStFounder}
            className="mt-0.5"
            onCheckedChange={(checked) =>
              update("scStFounder", checked === true)
            }
          />
          <span className="text-body text-dark">
            At least one founder is from an SC/ST community
          </span>
        </label>
        <p
          className={cn(
            "pl-7 text-caption",
            state.scStFounder ? "text-dark" : "text-muted",
          )}
        >
          Selecting this unlocks the{" "}
          <span className="font-semibold">ELEVATE Unnati</span> track.
        </p>
      </div>

      {/* Sector */}
      <Field
        id="primarySector"
        label="Primary sector"
        error={errFor("primarySector")}
        className="max-w-sm"
      >
        <Select
          value={state.primarySector || undefined}
          onValueChange={(v) => update("primarySector", v)}
        >
          <SelectTrigger
            id="primarySector"
            aria-invalid={Boolean(errFor("primarySector"))}
            aria-describedby={
              errFor("primarySector") ? "primarySector-error" : undefined
            }
          >
            <SelectValue placeholder="Select your primary sector" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((sector) => (
              <SelectItem key={sector.id} value={sector.id}>
                {sector.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Location & funding */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="location"
          label="Primary location"
          error={errFor("location")}
          hint="Location determines your zone, which drives incubation-grant eligibility."
        >
          <Select
            value={state.location || undefined}
            onValueChange={(v) => update("location", v as LocationKarnataka)}
          >
            <SelectTrigger
              id="location"
              aria-invalid={Boolean(errFor("location"))}
              aria-describedby={cn(
                "location-hint",
                errFor("location") && "location-error",
              )}
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
        </Field>

        <Field
          id="fundingStage"
          label="Funding stage"
          error={errFor("fundingStage")}
        >
          <Select
            value={state.fundingStage || undefined}
            onValueChange={(v) => update("fundingStage", v as FundingStage)}
          >
            <SelectTrigger
              id="fundingStage"
              aria-invalid={Boolean(errFor("fundingStage"))}
              aria-describedby={
                errFor("fundingStage") ? "fundingStage-error" : undefined
              }
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
        </Field>
      </div>

      <Field
        id="fundingRaised"
        label="Funding raised so far (₹ lakhs)"
        error={errFor("fundingRaised")}
        hint="Enter 0 if bootstrapped."
        className="max-w-[16rem]"
      >
        <Input
          id="fundingRaised"
          type="number"
          min={0}
          inputMode="decimal"
          placeholder="0"
          value={
            Number.isFinite(state.fundingRaised)
              ? String(state.fundingRaised)
              : "0"
          }
          aria-invalid={Boolean(errFor("fundingRaised"))}
          aria-describedby={cn(
            "fundingRaised-hint",
            errFor("fundingRaised") && "fundingRaised-error",
          )}
          onChange={(e) => {
            const raw = e.target.value;
            update("fundingRaised", raw === "" ? 0 : Number(raw));
          }}
        />
      </Field>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button type="submit" variant="accent">
          Save quick profile
        </Button>
        <p className="text-caption text-muted">
          Calculates your eligibility without a full registration.
        </p>
      </div>
    </form>
  );
}

export default QuickProfileForm;

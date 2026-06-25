"use client";

import { Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { sectors } from "@/data/sectors";
import type { InvestmentStage } from "@/types";

import { OnboardingField, fieldError } from "./OnboardingField";
import type { InvestorStepProps } from "./InvestorOnboardingWizard";

const INVESTMENT_STAGES: readonly InvestmentStage[] = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B Plus",
  "Growth",
];

const GEOGRAPHIC_OPTIONS: readonly string[] = [
  "Karnataka",
  "Karnataka Beyond Bengaluru",
  "India",
  "Global",
];

interface ChipOption {
  value: string;
  label: string;
}

interface ChipMultiSelectProps {
  legend: string;
  options: readonly ChipOption[];
  selected: readonly string[];
  fieldName: string;
  error?: string;
  describedById: string;
  onToggle: (value: string) => void;
}

/** Accessible chip multi-select: toggle buttons with `aria-pressed`. */
function ChipMultiSelect({
  legend,
  options,
  selected,
  fieldName,
  error,
  describedById,
  onToggle,
}: ChipMultiSelectProps) {
  return (
    <fieldset
      className="space-y-3"
      aria-describedby={error ? describedById : undefined}
    >
      <legend className="text-caption font-medium text-dark">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(option.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption transition-colors",
                isSelected
                  ? "border-accent bg-accent/10 text-dark"
                  : "border-border bg-card text-muted hover:border-dark/30 hover:text-dark",
              )}
            >
              {isSelected ? (
                <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              ) : null}
              {option.label}
            </button>
          );
        })}
      </div>
      <div aria-live="polite" className="min-h-[1.25rem]">
        {error ? (
          <p id={describedById} className="text-caption font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </fieldset>
  );
}

/**
 * Step 3 — Investment thesis (Req 16.2): focusSectors (multi-select from the
 * canonical sectors), focusStages (multi-select), ticketSizeMinLakhs /
 * ticketSizeMaxLakhs (numeric inputs), geographicFocus (multi-select).
 *
 * Multi-selects dispatch the full next array on toggle and mark the field
 * blurred; errors surface only after blur inside `aria-live` regions.
 */
export function OnboardStep03Thesis({
  profile,
  errors,
  touched,
  dispatch,
}: InvestorStepProps) {
  const sectorsErr = fieldError(errors, touched, "focusSectors");
  const stagesErr = fieldError(errors, touched, "focusStages");
  const minErr = fieldError(errors, touched, "ticketSizeMinLakhs");
  const maxErr = fieldError(errors, touched, "ticketSizeMaxLakhs");
  const geoErr = fieldError(errors, touched, "geographicFocus");

  const focusSectors = (profile.focusSectors as string[] | undefined) ?? [];
  const focusStages = (profile.focusStages as string[] | undefined) ?? [];
  const geographicFocus =
    (profile.geographicFocus as string[] | undefined) ?? [];

  function toggle(
    field: "focusSectors" | "focusStages" | "geographicFocus",
    current: readonly string[],
    value: string,
  ) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    dispatch({ type: "SET_FIELD", field, value: next });
    dispatch({ type: "BLUR_FIELD", field });
  }

  return (
    <section aria-labelledby="step-thesis-heading" className="space-y-6">
      <div className="space-y-1">
        <h2 id="step-thesis-heading" className="font-heading text-h3 text-dark">
          Your investment thesis
        </h2>
        <p className="text-body text-muted">
          What you back drives the startups and schemes we surface for you.
        </p>
      </div>

      <ChipMultiSelect
        legend="Focus sectors"
        options={sectors.map((s) => ({ value: s.id, label: s.name }))}
        selected={focusSectors}
        fieldName="focusSectors"
        error={sectorsErr}
        describedById="focusSectors-error"
        onToggle={(value) => toggle("focusSectors", focusSectors, value)}
      />

      <ChipMultiSelect
        legend="Focus stages"
        options={INVESTMENT_STAGES.map((s) => ({ value: s, label: s }))}
        selected={focusStages}
        fieldName="focusStages"
        error={stagesErr}
        describedById="focusStages-error"
        onToggle={(value) => toggle("focusStages", focusStages, value)}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <OnboardingField
          id="ticketSizeMinLakhs"
          label="Minimum ticket size (₹ lakhs)"
          error={minErr}
        >
          <Input
            id="ticketSizeMinLakhs"
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="e.g. 50"
            value={
              typeof profile.ticketSizeMinLakhs === "number" &&
              Number.isFinite(profile.ticketSizeMinLakhs)
                ? String(profile.ticketSizeMinLakhs)
                : ""
            }
            aria-invalid={Boolean(minErr)}
            aria-describedby={minErr ? "ticketSizeMinLakhs-error" : undefined}
            onChange={(e) => {
              const raw = e.target.value;
              dispatch({
                type: "SET_FIELD",
                field: "ticketSizeMinLakhs",
                value: raw === "" ? undefined : Number(raw),
              });
            }}
            onBlur={() =>
              dispatch({ type: "BLUR_FIELD", field: "ticketSizeMinLakhs" })
            }
          />
        </OnboardingField>

        <OnboardingField
          id="ticketSizeMaxLakhs"
          label="Maximum ticket size (₹ lakhs)"
          error={maxErr}
        >
          <Input
            id="ticketSizeMaxLakhs"
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="e.g. 500"
            value={
              typeof profile.ticketSizeMaxLakhs === "number" &&
              Number.isFinite(profile.ticketSizeMaxLakhs)
                ? String(profile.ticketSizeMaxLakhs)
                : ""
            }
            aria-invalid={Boolean(maxErr)}
            aria-describedby={maxErr ? "ticketSizeMaxLakhs-error" : undefined}
            onChange={(e) => {
              const raw = e.target.value;
              dispatch({
                type: "SET_FIELD",
                field: "ticketSizeMaxLakhs",
                value: raw === "" ? undefined : Number(raw),
              });
            }}
            onBlur={() =>
              dispatch({ type: "BLUR_FIELD", field: "ticketSizeMaxLakhs" })
            }
          />
        </OnboardingField>
      </div>

      <ChipMultiSelect
        legend="Geographic focus"
        options={GEOGRAPHIC_OPTIONS.map((g) => ({ value: g, label: g }))}
        selected={geographicFocus}
        fieldName="geographicFocus"
        error={geoErr}
        describedById="geographicFocus-error"
        onToggle={(value) => toggle("geographicFocus", geographicFocus, value)}
      />
    </section>
  );
}

export default OnboardStep03Thesis;

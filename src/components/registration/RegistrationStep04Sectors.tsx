"use client";

import { Check } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { sectors } from "@/data/sectors";

import {
  WizardField,
  fieldError,
  type StepProps,
} from "./RegistrationWizard";

const MAX_SECONDARY = 3;

/**
 * Step 4 — Sector focus (Req 7): a single primary sector select drawn from the
 * 20 canonical sectors, plus a secondary-sector chip multi-select that excludes
 * the primary and caps at 3. Clicking a selected chip toggles it off; once 3
 * are chosen the remaining chips are disabled. A small caption reports how many
 * sectors are in play to match schemes against.
 */
export function RegistrationStep04Sectors({
  profile,
  errors,
  touched,
  dispatch,
}: StepProps) {
  const primaryErr = fieldError(errors, touched, "primarySector");
  const secondaryErr = fieldError(errors, touched, "secondarySectors");

  const primarySector = (profile.primarySector as string | undefined) ?? "";
  const secondarySectors = (profile.secondarySectors as string[] | undefined) ?? [];
  const atCap = secondarySectors.length >= MAX_SECONDARY;

  // Founder-judgment match signal: how many sector focus areas are in play.
  const focusCount = (primarySector ? 1 : 0) + secondarySectors.length;

  function toggleSecondary(id: string) {
    const isSelected = secondarySectors.includes(id);
    const next = isSelected
      ? secondarySectors.filter((s) => s !== id)
      : [...secondarySectors, id];
    // Reducer ignores a 4th and strips the primary, so a plain dispatch is safe.
    dispatch({ type: "SET_FIELD", field: "secondarySectors", value: next });
    dispatch({ type: "BLUR_FIELD", field: "secondarySectors" });
  }

  return (
    <section aria-labelledby="step-sectors-heading" className="space-y-6">
      <div className="space-y-1">
        <h2 id="step-sectors-heading" className="font-heading text-h3 text-dark">
          Sector focus
        </h2>
        <p className="text-body text-muted">
          Pick the one sector that best describes you, then up to three adjacent
          areas.
        </p>
      </div>

      <WizardField
        id="primarySector"
        label="Primary sector"
        error={primaryErr}
        className="max-w-sm"
      >
        <Select
          value={primarySector || undefined}
          onValueChange={(v) => {
            dispatch({ type: "SET_FIELD", field: "primarySector", value: v });
            dispatch({ type: "BLUR_FIELD", field: "primarySector" });
          }}
        >
          <SelectTrigger
            id="primarySector"
            aria-invalid={Boolean(primaryErr)}
            aria-describedby={primaryErr ? "primarySector-error" : undefined}
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
      </WizardField>

      <fieldset className="space-y-3">
        <legend className="text-caption font-medium text-dark">
          Secondary sectors{" "}
          <span className="font-normal text-muted">
            (optional, up to {MAX_SECONDARY})
          </span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {sectors
            .filter((sector) => sector.id !== primarySector)
            .map((sector) => {
              const selected = secondarySectors.includes(sector.id);
              const disabled = !selected && atCap;
              return (
                <button
                  key={sector.id}
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => toggleSecondary(sector.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption transition-colors",
                    selected
                      ? "border-accent bg-accent/10 text-dark"
                      : "border-border bg-card text-muted hover:border-dark/30 hover:text-dark",
                    disabled && "cursor-not-allowed opacity-40 hover:border-border hover:text-muted",
                  )}
                >
                  {selected ? <Check className="h-3.5 w-3.5 text-accent" /> : null}
                  {sector.name}
                </button>
              );
            })}
        </div>

        <div aria-live="polite" className="min-h-[1.25rem]">
          {secondaryErr ? (
            <p
              id="secondarySectors-error"
              className="text-caption font-medium text-danger"
            >
              {secondaryErr}
            </p>
          ) : (
            <p className="text-caption text-muted">
              {focusCount === 0
                ? "Select sectors to match schemes against your focus."
                : `${focusCount} focus ${focusCount === 1 ? "area" : "areas"} in play to match schemes against.`}
            </p>
          )}
        </div>
      </fieldset>
    </section>
  );
}

export default RegistrationStep04Sectors;

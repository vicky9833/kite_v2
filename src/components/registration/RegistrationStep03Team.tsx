"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

import {
  WizardField,
  fieldError,
  type StepProps,
} from "./RegistrationWizard";

/** A 0–100 percentage slider with its live value shown alongside the label. */
function PercentSlider({
  id,
  label,
  value,
  onValueChange,
  onCommit,
}: {
  id: string;
  label: string;
  value: number;
  onValueChange: (next: number) => void;
  onCommit: () => void;
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
        onValueCommit={onCommit}
      />
    </div>
  );
}

/**
 * Step 3 — Team composition (Req 6): team size, women-founder stake and
 * women-employee percentage sliders (0–100), and the SC/ST founder toggle.
 * Surfaces the Women-Led unlock note when either stake reaches 51%, and the
 * ELEVATE Unnati note when SC/ST is selected.
 */
export function RegistrationStep03Team({
  profile,
  errors,
  touched,
  dispatch,
}: StepProps) {
  const teamSizeErr = fieldError(errors, touched, "teamSize");

  const womenFounderStake =
    typeof profile.womenFounderStake === "number" ? profile.womenFounderStake : 0;
  const womenEmployeePercentage =
    typeof profile.womenEmployeePercentage === "number"
      ? profile.womenEmployeePercentage
      : 0;
  const scStFounder = profile.scStFounder === true;

  const womenLedUnlocked = womenFounderStake >= 51 || womenEmployeePercentage >= 51;

  return (
    <section aria-labelledby="step-team-heading" className="space-y-6">
      <div className="space-y-1">
        <h2 id="step-team-heading" className="font-heading text-h3 text-dark">
          Team composition
        </h2>
        <p className="text-body text-muted">
          Team make-up unlocks preferential tracks under several schemes.
        </p>
      </div>

      <div className="grid gap-6">
        <WizardField
          id="teamSize"
          label="Team size"
          error={teamSizeErr}
          className="max-w-[12rem]"
        >
          <Input
            id="teamSize"
            type="number"
            min={1}
            max={5000}
            inputMode="numeric"
            placeholder="1–5000"
            value={
              typeof profile.teamSize === "number" && Number.isFinite(profile.teamSize)
                ? String(profile.teamSize)
                : ""
            }
            aria-invalid={Boolean(teamSizeErr)}
            aria-describedby={teamSizeErr ? "teamSize-error" : undefined}
            onChange={(e) => {
              const raw = e.target.value;
              dispatch({
                type: "SET_FIELD",
                field: "teamSize",
                value: raw === "" ? undefined : Number(raw),
              });
            }}
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "teamSize" })}
          />
        </WizardField>

        <div className="grid gap-6 sm:grid-cols-2">
          <PercentSlider
            id="womenFounderStake"
            label="Women founder equity stake"
            value={womenFounderStake}
            onValueChange={(next) =>
              dispatch({ type: "SET_FIELD", field: "womenFounderStake", value: next })
            }
            onCommit={() => dispatch({ type: "BLUR_FIELD", field: "womenFounderStake" })}
          />
          <PercentSlider
            id="womenEmployeePercentage"
            label="Women in the workforce"
            value={womenEmployeePercentage}
            onValueChange={(next) =>
              dispatch({
                type: "SET_FIELD",
                field: "womenEmployeePercentage",
                value: next,
              })
            }
            onCommit={() =>
              dispatch({ type: "BLUR_FIELD", field: "womenEmployeePercentage" })
            }
          />
        </div>

        <div aria-live="polite">
          {womenLedUnlocked ? (
            <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
              <p className="text-caption text-dark">
                51%+ women representation unlocks{" "}
                <span className="font-semibold">Women-Led</span> preferences and
                benefits across eligible schemes.
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-2 rounded-xl border border-border bg-surface p-4">
          <label className="flex items-start gap-3">
            <Checkbox
              id="scStFounder"
              checked={scStFounder}
              className="mt-0.5"
              onCheckedChange={(checked) => {
                dispatch({
                  type: "SET_FIELD",
                  field: "scStFounder",
                  value: checked === true,
                });
                dispatch({ type: "BLUR_FIELD", field: "scStFounder" });
              }}
            />
            <span className="text-body text-dark">
              At least one founder is from an SC/ST community
            </span>
          </label>
          <p
            className={cn(
              "pl-7 text-caption",
              scStFounder ? "text-dark" : "text-muted",
            )}
          >
            Selecting this unlocks the{" "}
            <span className="font-semibold">ELEVATE Unnati</span> track.
          </p>
        </div>
      </div>
    </section>
  );
}

export default RegistrationStep03Team;

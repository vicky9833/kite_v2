"use client";

import { Input } from "@/components/ui/input";

import {
  WizardField,
  fieldError,
  type StepProps,
} from "./RegistrationWizard";

/**
 * Step 1 — Founder details (Req 4): full name, email, phone, age.
 *
 * Every control wires `onChange → SET_FIELD` and `onBlur → BLUR_FIELD`. Errors
 * surface only after blur (via `fieldError`) inside the field's `aria-live`
 * region, and each input points at its error node with `aria-describedby`.
 */
export function RegistrationStep01Founder({
  profile,
  errors,
  touched,
  dispatch,
}: StepProps) {
  const nameErr = fieldError(errors, touched, "founderName");
  const emailErr = fieldError(errors, touched, "founderEmail");
  const phoneErr = fieldError(errors, touched, "founderPhone");
  const ageErr = fieldError(errors, touched, "founderAge");

  return (
    <section aria-labelledby="step-founder-heading" className="space-y-6">
      <div className="space-y-1">
        <h2 id="step-founder-heading" className="font-heading text-h3 text-dark">
          Tell us about you
        </h2>
        <p className="text-body text-muted">
          The founder details we use to issue your KITE ID and tailor scheme
          guidance.
        </p>
      </div>

      <div className="grid gap-5">
        <WizardField id="founderName" label="Full name" error={nameErr}>
          <Input
            id="founderName"
            type="text"
            autoComplete="name"
            placeholder="e.g. Anjali Rao"
            value={(profile.founderName as string | undefined) ?? ""}
            aria-invalid={Boolean(nameErr)}
            aria-describedby={nameErr ? "founderName-error" : undefined}
            onChange={(e) =>
              dispatch({ type: "SET_FIELD", field: "founderName", value: e.target.value })
            }
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "founderName" })}
          />
        </WizardField>

        <WizardField id="founderEmail" label="Email address" error={emailErr}>
          <Input
            id="founderEmail"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={(profile.founderEmail as string | undefined) ?? ""}
            aria-invalid={Boolean(emailErr)}
            aria-describedby={emailErr ? "founderEmail-error" : undefined}
            onChange={(e) =>
              dispatch({ type: "SET_FIELD", field: "founderEmail", value: e.target.value })
            }
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "founderEmail" })}
          />
        </WizardField>

        <WizardField
          id="founderPhone"
          label="Mobile number"
          error={phoneErr}
          hint="10-digit Indian mobile number. An optional +91 prefix is fine."
          hintId="founderPhone-hint"
        >
          <Input
            id="founderPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="98XXXXXXXX"
            value={(profile.founderPhone as string | undefined) ?? ""}
            aria-invalid={Boolean(phoneErr)}
            aria-describedby={
              phoneErr ? "founderPhone-error founderPhone-hint" : "founderPhone-hint"
            }
            onChange={(e) =>
              dispatch({ type: "SET_FIELD", field: "founderPhone", value: e.target.value })
            }
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "founderPhone" })}
          />
        </WizardField>

        <WizardField
          id="founderAge"
          label="Your age"
          error={ageErr}
          className="max-w-[12rem]"
        >
          <Input
            id="founderAge"
            type="number"
            min={18}
            max={80}
            inputMode="numeric"
            placeholder="18–80"
            value={
              typeof profile.founderAge === "number" && Number.isFinite(profile.founderAge)
                ? String(profile.founderAge)
                : ""
            }
            aria-invalid={Boolean(ageErr)}
            aria-describedby={ageErr ? "founderAge-error" : undefined}
            onChange={(e) => {
              const raw = e.target.value;
              dispatch({
                type: "SET_FIELD",
                field: "founderAge",
                value: raw === "" ? undefined : Number(raw),
              });
            }}
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "founderAge" })}
          />
        </WizardField>
      </div>
    </section>
  );
}

export default RegistrationStep01Founder;

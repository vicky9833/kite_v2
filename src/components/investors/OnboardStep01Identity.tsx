"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InvestorRole } from "@/types";

import { OnboardingField, fieldError } from "./OnboardingField";
import type { InvestorStepProps } from "./InvestorOnboardingWizard";

const INVESTOR_ROLES: readonly InvestorRole[] = [
  "GP",
  "Partner",
  "Principal",
  "Associate",
  "Angel",
  "Family Office",
  "Corporate VC",
  "Government Fund",
];

/**
 * Step 1 — Identity (Req 16.2): investorName, firmName, investorEmail,
 * investorPhone, role.
 *
 * Every control wires `onChange → SET_FIELD` and `onBlur → BLUR_FIELD`. Errors
 * surface only after blur (via `fieldError`) inside the field's `aria-live`
 * region, and each input points at its error node with `aria-describedby`.
 */
export function OnboardStep01Identity({
  profile,
  errors,
  touched,
  dispatch,
}: InvestorStepProps) {
  const nameErr = fieldError(errors, touched, "investorName");
  const firmErr = fieldError(errors, touched, "firmName");
  const emailErr = fieldError(errors, touched, "investorEmail");
  const phoneErr = fieldError(errors, touched, "investorPhone");
  const roleErr = fieldError(errors, touched, "role");

  return (
    <section aria-labelledby="step-identity-heading" className="space-y-6">
      <div className="space-y-1">
        <h2 id="step-identity-heading" className="font-heading text-h3 text-dark">
          Tell us about you
        </h2>
        <p className="text-body text-muted">
          The identity details we use to issue your Investor ID and personalize
          your dashboard.
        </p>
      </div>

      <div className="grid gap-5">
        <OnboardingField id="investorName" label="Full name" error={nameErr}>
          <Input
            id="investorName"
            type="text"
            autoComplete="name"
            placeholder="e.g. Anjali Rao"
            value={(profile.investorName as string | undefined) ?? ""}
            aria-invalid={Boolean(nameErr)}
            aria-describedby={nameErr ? "investorName-error" : undefined}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "investorName",
                value: e.target.value,
              })
            }
            onBlur={() =>
              dispatch({ type: "BLUR_FIELD", field: "investorName" })
            }
          />
        </OnboardingField>

        <OnboardingField id="firmName" label="Firm name" error={firmErr}>
          <Input
            id="firmName"
            type="text"
            autoComplete="organization"
            placeholder="e.g. Western Ghats Ventures"
            value={(profile.firmName as string | undefined) ?? ""}
            aria-invalid={Boolean(firmErr)}
            aria-describedby={firmErr ? "firmName-error" : undefined}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "firmName",
                value: e.target.value,
              })
            }
            onBlur={() => dispatch({ type: "BLUR_FIELD", field: "firmName" })}
          />
        </OnboardingField>

        <OnboardingField id="investorEmail" label="Email address" error={emailErr}>
          <Input
            id="investorEmail"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={(profile.investorEmail as string | undefined) ?? ""}
            aria-invalid={Boolean(emailErr)}
            aria-describedby={emailErr ? "investorEmail-error" : undefined}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "investorEmail",
                value: e.target.value,
              })
            }
            onBlur={() =>
              dispatch({ type: "BLUR_FIELD", field: "investorEmail" })
            }
          />
        </OnboardingField>

        <OnboardingField
          id="investorPhone"
          label="Mobile number"
          error={phoneErr}
          hint="10-digit Indian mobile number. An optional +91 prefix is fine."
          hintId="investorPhone-hint"
        >
          <Input
            id="investorPhone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="98XXXXXXXX"
            value={(profile.investorPhone as string | undefined) ?? ""}
            aria-invalid={Boolean(phoneErr)}
            aria-describedby={
              phoneErr
                ? "investorPhone-error investorPhone-hint"
                : "investorPhone-hint"
            }
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "investorPhone",
                value: e.target.value,
              })
            }
            onBlur={() =>
              dispatch({ type: "BLUR_FIELD", field: "investorPhone" })
            }
          />
        </OnboardingField>

        <OnboardingField
          id="role"
          label="Your role"
          error={roleErr}
          className="max-w-sm"
        >
          <Select
            value={(profile.role as string | undefined) ?? undefined}
            onValueChange={(v) => {
              dispatch({ type: "SET_FIELD", field: "role", value: v });
              dispatch({ type: "BLUR_FIELD", field: "role" });
            }}
          >
            <SelectTrigger
              id="role"
              aria-invalid={Boolean(roleErr)}
              aria-describedby={roleErr ? "role-error" : undefined}
            >
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {INVESTOR_ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </OnboardingField>
      </div>
    </section>
  );
}

export default OnboardStep01Identity;

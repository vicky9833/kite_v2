"use client";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { sectors } from "@/data/sectors";

import type {
  InvestorStepProps,
  InvestorWizardStep,
} from "./InvestorOnboardingWizard";

/** Step 4 extends the shared contract with the accuracy flag the controller gates submit on. */
export interface OnboardStep04ReviewProps extends InvestorStepProps {
  accuracyConfirmed: boolean;
}

const NOT_PROVIDED = "Not provided";

function sectorName(id: string): string {
  return sectors.find((s) => s.id === id)?.name ?? id;
}

function text(value: string | undefined): string {
  return value && value.trim().length > 0 ? value : NOT_PROVIDED;
}

function num(value: number | undefined, prefix = "", suffix = ""): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `${prefix}${value}${suffix}`
    : NOT_PROVIDED;
}

function list(values: string[] | undefined, mapLabel?: (v: string) => string): string {
  if (!values || values.length === 0) return NOT_PROVIDED;
  return values.map((v) => (mapLabel ? mapLabel(v) : v)).join(", ");
}

interface ReviewItem {
  label: string;
  value: string;
}

/**
 * Step 4 — Review & submit (Req 16.2, 16.4): a read-only summary of every field
 * entered across steps 1–3, grouped by section with an Edit control that jumps
 * back via `GO_TO_STEP`. A required accuracy attestation checkbox gates the
 * controller's "Submit".
 */
export function OnboardStep04Review({
  profile,
  dispatch,
  accuracyConfirmed,
}: OnboardStep04ReviewProps) {
  const sections: {
    title: string;
    step: InvestorWizardStep;
    items: ReviewItem[];
  }[] = [
    {
      title: "Identity",
      step: 1,
      items: [
        { label: "Full name", value: text(profile.investorName) },
        { label: "Firm name", value: text(profile.firmName) },
        { label: "Email", value: text(profile.investorEmail) },
        { label: "Mobile", value: text(profile.investorPhone) },
        { label: "Role", value: text(profile.role) },
      ],
    },
    {
      title: "Firm profile",
      step: 2,
      items: [
        { label: "Firm type", value: text(profile.firmType) },
        {
          label: "Assets under management",
          value: num(profile.assetsUnderManagement, "₹", " lakh"),
        },
        { label: "Year founded", value: num(profile.foundedYear) },
      ],
    },
    {
      title: "Investment thesis",
      step: 3,
      items: [
        {
          label: "Focus sectors",
          value: list(profile.focusSectors, sectorName),
        },
        { label: "Focus stages", value: list(profile.focusStages) },
        {
          label: "Ticket size",
          value:
            typeof profile.ticketSizeMinLakhs === "number" &&
            typeof profile.ticketSizeMaxLakhs === "number"
              ? `₹${profile.ticketSizeMinLakhs} – ₹${profile.ticketSizeMaxLakhs} lakh`
              : NOT_PROVIDED,
        },
        { label: "Geographic focus", value: list(profile.geographicFocus) },
      ],
    },
  ];

  return (
    <section aria-labelledby="step-review-heading" className="space-y-6">
      <div className="space-y-1">
        <h2 id="step-review-heading" className="font-heading text-h3 text-dark">
          Review & submit
        </h2>
        <p className="text-body text-muted">
          Confirm your details. You can edit any section before submitting.
        </p>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="font-heading text-body text-dark">
                {section.title}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  dispatch({ type: "GO_TO_STEP", step: section.step })
                }
                aria-label={`Edit ${section.title} details`}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {section.items.map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <dt className="text-caption text-muted">{item.label}</dt>
                    <dd className="text-body text-dark">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <label className="flex items-start gap-3">
          <Checkbox
            id="accuracyConfirmed"
            checked={accuracyConfirmed}
            className="mt-0.5"
            onCheckedChange={(checked) =>
              dispatch({ type: "TOGGLE_ACCURACY", value: checked === true })
            }
          />
          <span className="text-body text-dark">
            I confirm the above information is accurate to the best of my
            knowledge.
          </span>
        </label>
      </div>
    </section>
  );
}

export default OnboardStep04Review;

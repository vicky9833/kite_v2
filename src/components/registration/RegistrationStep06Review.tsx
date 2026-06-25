"use client";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { sectors } from "@/data/sectors";
import type { WizardStep } from "@/types";

import type { StepProps } from "./RegistrationWizard";

/** Step 6 extends the shared contract with the accuracy flag the controller gates submit on. */
export interface RegistrationStep06ReviewProps extends StepProps {
  accuracyConfirmed: boolean;
}

const NOT_PROVIDED = "Not provided";

function sectorName(id: string | undefined): string {
  if (!id) return NOT_PROVIDED;
  return sectors.find((s) => s.id === id)?.name ?? id;
}

function yesNo(value: boolean | undefined): string {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return NOT_PROVIDED;
}

function text(value: string | undefined): string {
  return value && value.trim().length > 0 ? value : NOT_PROVIDED;
}

function num(value: number | undefined, suffix = ""): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value}${suffix}`
    : NOT_PROVIDED;
}

interface ReviewItem {
  label: string;
  value: string;
}

/**
 * Step 6 — Review & submit (Req 9): one review card per section (Founder,
 * Company, Team, Sector, Location), each rendering its entered values as a
 * definition list with an Edit control that jumps back via `GO_TO_STEP`. A
 * required accuracy checkbox gates the controller's "Submit Registration".
 */
export function RegistrationStep06Review({
  profile,
  dispatch,
  accuracyConfirmed,
}: RegistrationStep06ReviewProps) {
  const secondaryNames =
    (profile.secondarySectors as string[] | undefined)?.map(sectorName) ?? [];

  const sections: {
    title: string;
    step: WizardStep;
    items: ReviewItem[];
  }[] = [
    {
      title: "Founder",
      step: 1,
      items: [
        { label: "Full name", value: text(profile.founderName) },
        { label: "Email", value: text(profile.founderEmail) },
        { label: "Mobile", value: text(profile.founderPhone) },
        { label: "Age", value: num(profile.founderAge) },
      ],
    },
    {
      title: "Company",
      step: 2,
      items: [
        { label: "Company name", value: text(profile.companyName) },
        { label: "DPIIT recognised", value: yesNo(profile.dpiitRecognized) },
        { label: "GST registered", value: yesNo(profile.gstRegistered) },
        { label: "Incorporated", value: text(profile.incorporationDate) },
        { label: "Current stage", value: text(profile.currentStage) },
      ],
    },
    {
      title: "Team",
      step: 3,
      items: [
        { label: "Team size", value: num(profile.teamSize) },
        { label: "Women founder stake", value: num(profile.womenFounderStake, "%") },
        {
          label: "Women in workforce",
          value: num(profile.womenEmployeePercentage, "%"),
        },
        { label: "SC/ST founder", value: yesNo(profile.scStFounder) },
      ],
    },
    {
      title: "Sector",
      step: 4,
      items: [
        { label: "Primary sector", value: sectorName(profile.primarySector) },
        {
          label: "Secondary sectors",
          value: secondaryNames.length > 0 ? secondaryNames.join(", ") : "None",
        },
      ],
    },
    {
      title: "Location & funding",
      step: 5,
      items: [
        { label: "Location", value: text(profile.location) },
        { label: "Funding stage", value: text(profile.fundingStage) },
        {
          label: "Funding raised",
          value:
            typeof profile.fundingRaised === "number"
              ? `₹${profile.fundingRaised} lakh`
              : NOT_PROVIDED,
        },
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
                onClick={() => dispatch({ type: "GO_TO_STEP", step: section.step })}
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

export default RegistrationStep06Review;

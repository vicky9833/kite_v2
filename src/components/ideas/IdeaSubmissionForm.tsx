"use client";

// IdeaSubmissionForm — the guided, validated Idea Submission Form (Req 26, 35).
//
// A single-column `max-w-3xl` form rendering all 10 Idea_Submission_Form fields
// with plain React state and the pure `validateIdeaForm` validator. Every field
// uses a lightweight NATIVE control — text/number inputs, native `<select>`
// dropdowns, and a native `<input type="radio">` group — so the route bundle
// stays small (no Radix Select / RadioGroup). The submit control is disabled
// (and `aria-disabled`) while the form is invalid and enabled the moment every
// constraint is satisfied. Every field carries a programmatic <label>
// (htmlFor/id) and an `aria-describedby` pointing at its `*-help` constraint
// text, and a polite `aria-live` region announces errors.
//
// On a valid submit the form builds an `IdeaSubmissionDraft` from the current
// values and hands it to the parent via `onSubmit` (the island calls
// `submitIdea`). No network, storage, or other I/O happens here.

import { useEffect, useMemo, useRef, useState } from "react";
import { Lightbulb, User, Users, AlertCircle, Send } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  INNOVATOR_TYPES,
  IDEA_CATEGORIES,
  type InnovatorType,
  type IdeaCategory,
  type LocationKarnataka,
  type IdeaSubmissionDraft,
} from "@/types";

import {
  validateIdeaForm,
  type IdeaFormValues,
  IDEA_TITLE_MIN_LENGTH,
  IDEA_SUMMARY_MIN_LENGTH,
  IDEA_SUMMARY_MAX_LENGTH,
  IDEA_PROBLEM_MIN_LENGTH,
  IDEA_PROBLEM_MAX_LENGTH,
  IDEA_SOLUTION_MIN_LENGTH,
  IDEA_SOLUTION_MAX_LENGTH,
} from "@/lib/idea-form-validation";

// The same Karnataka location list used by the registration form (Req 26.5).
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

/** The shared anchor id for the submission form (spotlight pre-fill scrolls here). */
const DEFAULT_FORM_ID = "idea-form";

// Shared styling for native textual controls (inputs/selects/textareas) so the
// native `<select>`/`<textarea>` match the design-system `<Input>`.
const CONTROL_CLASS =
  "flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const TEXTAREA_CLASS =
  "flex w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export interface IdeaSubmissionFormProps {
  /** Optional pre-filled idea category (the categories spotlight pre-fill). */
  initialCategory?: IdeaCategory | null;
  /** Called with a complete draft when a valid form is submitted. */
  onSubmit: (draft: IdeaSubmissionDraft) => void;
  /** The id applied to the <form> element so the island can scroll to it. */
  formId?: string;
}

// Small editorial field shell: a programmatic <label>, the control, helper /
// constraint text (referenced via aria-describedby through a `*-help` id), and
// an inline polite error.
interface FieldShellProps {
  id: string;
  label: string;
  help: string;
  error?: string;
  showError: boolean;
  children: React.ReactNode;
  className?: string;
}

function FieldShell({
  id,
  label,
  help,
  error,
  showError,
  children,
  className,
}: FieldShellProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-caption font-medium text-dark">
        {label}
      </label>
      {children}
      <p id={`${id}-help`} className="text-caption text-muted">
        {help}
      </p>
      <div aria-live="polite" className="min-h-[1.25rem]">
        {showError && error ? (
          <p
            id={`${id}-error`}
            className="flex items-center gap-1 text-caption font-medium text-danger"
          >
            <AlertCircle aria-hidden className="h-3.5 w-3.5" />
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// `aria-describedby` always references the field's `*-help` node (which always
// exists in the DOM); when an error is showing it also references `*-error`.
function describedBy(id: string, hasError: boolean): string {
  return hasError ? `${id}-error ${id}-help` : `${id}-help`;
}

export function IdeaSubmissionForm({
  initialCategory = null,
  onSubmit,
  formId = DEFAULT_FORM_ID,
}: IdeaSubmissionFormProps) {
  // --- Plain React state for all 10 fields ---
  const [innovatorName, setInnovatorName] = useState("");
  const [innovatorEmail, setInnovatorEmail] = useState("");
  const [ageRaw, setAgeRaw] = useState("");
  const [innovatorType, setInnovatorType] = useState<InnovatorType | null>(null);
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaCategory, setIdeaCategory] = useState<IdeaCategory | null>(
    initialCategory ?? null,
  );
  const [ideaSummary, setIdeaSummary] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [location, setLocation] = useState<LocationKarnataka | null>(null);

  // Keep the dropdown in sync when the spotlight selects a (new) category while
  // the form stays mounted (Req 30.3). Only a non-null change drives the update.
  const prevInitialCategory = useRef<IdeaCategory | null>(initialCategory ?? null);
  useEffect(() => {
    const next = initialCategory ?? null;
    if (next !== null && next !== prevInitialCategory.current) {
      setIdeaCategory(next);
    }
    prevInitialCategory.current = next;
  }, [initialCategory]);

  // Track which fields the user has interacted with, plus a submit attempt, so
  // we surface errors at sensible moments rather than on an untouched form.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const markTouched = (field: string) =>
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));

  // Derive the numeric age: empty → null; otherwise a parsed (possibly NaN) number.
  const innovatorAge = useMemo<number | null>(() => {
    const trimmed = ageRaw.trim();
    if (trimmed === "") return null;
    return Number(trimmed);
  }, [ageRaw]);

  const values: IdeaFormValues = useMemo(
    () => ({
      innovatorName,
      innovatorEmail,
      innovatorAge,
      innovatorType,
      ideaTitle,
      ideaCategory,
      ideaSummary,
      problemStatement,
      proposedSolution,
      location,
    }),
    [
      innovatorName,
      innovatorEmail,
      innovatorAge,
      innovatorType,
      ideaTitle,
      ideaCategory,
      ideaSummary,
      problemStatement,
      proposedSolution,
      location,
    ],
  );

  const { fieldErrors, isValid } = useMemo(
    () => validateIdeaForm(values),
    [values],
  );

  const shouldShow = (field: string): boolean =>
    submitAttempted || Boolean(touched[field]);

  const errFor = (field: string): string | undefined => fieldErrors[field];

  // The polite summary region announces the count of outstanding issues once
  // the user has tried to submit (Req 35.2).
  const errorCount = Object.keys(fieldErrors).length;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    if (!isValid) return;

    // Every constraint holds, so the choice fields are set and age is numeric.
    const draft: IdeaSubmissionDraft = {
      innovatorName: innovatorName.trim(),
      innovatorEmail: innovatorEmail.trim(),
      innovatorAge: innovatorAge as number,
      innovatorType: innovatorType as InnovatorType,
      ideaTitle: ideaTitle.trim(),
      ideaCategory: ideaCategory as IdeaCategory,
      ideaSummary: ideaSummary.trim(),
      problemStatement: problemStatement.trim(),
      proposedSolution: proposedSolution.trim(),
      location: location as LocationKarnataka,
    };
    onSubmit(draft);
  }

  const summaryLen = ideaSummary.trim().length;
  const problemLen = problemStatement.trim().length;
  const solutionLen = proposedSolution.trim().length;

  const innovatorTypeHasError =
    shouldShow("innovatorType") && Boolean(errFor("innovatorType"));

  return (
    <form
      noValidate
      id={formId}
      onSubmit={handleSubmit}
      aria-labelledby="idea-form-heading"
      className="mx-auto w-full max-w-3xl space-y-8"
    >
      <div className="space-y-1">
        <h2
          id="idea-form-heading"
          className="flex items-center gap-2 font-heading text-h3 text-dark"
        >
          <Lightbulb aria-hidden className="h-5 w-5 text-primary" />
          Share your idea
        </h2>
        <p className="text-body text-muted">
          Tell us about you and the idea you want to take forward. Every field
          helps us match you to the right Karnataka schemes. Take your time —
          there are no wrong answers.
        </p>
      </div>

      {/* About you ----------------------------------------------------------- */}
      <fieldset className="space-y-5">
        <legend className="flex items-center gap-2 font-heading text-body font-semibold text-dark">
          <User aria-hidden className="h-4 w-4 text-primary" />
          About you
        </legend>

        <FieldShell
          id="innovatorName"
          label="Your name"
          help="Enter your full name as you would like it to appear."
          error={errFor("innovatorName")}
          showError={shouldShow("innovatorName")}
        >
          <Input
            id="innovatorName"
            type="text"
            autoComplete="name"
            value={innovatorName}
            aria-required
            aria-invalid={shouldShow("innovatorName") && Boolean(errFor("innovatorName"))}
            aria-describedby={describedBy(
              "innovatorName",
              shouldShow("innovatorName") && Boolean(errFor("innovatorName")),
            )}
            onChange={(e) => setInnovatorName(e.target.value)}
            onBlur={() => markTouched("innovatorName")}
          />
        </FieldShell>

        <FieldShell
          id="innovatorEmail"
          label="Email address"
          help="We use this to send your idea confirmation, for example name@example.com."
          error={errFor("innovatorEmail")}
          showError={shouldShow("innovatorEmail")}
        >
          <Input
            id="innovatorEmail"
            type="email"
            autoComplete="email"
            value={innovatorEmail}
            aria-required
            aria-invalid={shouldShow("innovatorEmail") && Boolean(errFor("innovatorEmail"))}
            aria-describedby={describedBy(
              "innovatorEmail",
              shouldShow("innovatorEmail") && Boolean(errFor("innovatorEmail")),
            )}
            onChange={(e) => setInnovatorEmail(e.target.value)}
            onBlur={() => markTouched("innovatorEmail")}
          />
        </FieldShell>

        <FieldShell
          id="innovatorAge"
          label="Age"
          help="Enter your age as a number. This helps match age-specific programs."
          error={errFor("innovatorAge")}
          showError={shouldShow("innovatorAge")}
          className="max-w-[12rem]"
        >
          <Input
            id="innovatorAge"
            type="number"
            min={0}
            inputMode="numeric"
            value={ageRaw}
            aria-required
            aria-invalid={shouldShow("innovatorAge") && Boolean(errFor("innovatorAge"))}
            aria-describedby={describedBy(
              "innovatorAge",
              shouldShow("innovatorAge") && Boolean(errFor("innovatorAge")),
            )}
            onChange={(e) => setAgeRaw(e.target.value)}
            onBlur={() => markTouched("innovatorAge")}
          />
        </FieldShell>

        {/* innovatorType — required NATIVE radio group of the 5 innovator types */}
        <fieldset
          aria-describedby={describedBy("innovatorType", innovatorTypeHasError)}
          className="space-y-1.5"
        >
          <legend className="mb-1.5 flex items-center gap-2 text-caption font-medium text-dark">
            <Users aria-hidden className="h-4 w-4 text-primary" />
            Which best describes you?
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {INNOVATOR_TYPES.map((type) => {
              const itemId = `innovatorType-${type.replace(/\s+/g, "-")}`;
              return (
                <div key={type} className="flex items-center gap-2">
                  <input
                    id={itemId}
                    type="radio"
                    name="innovatorType"
                    value={type}
                    checked={innovatorType === type}
                    onChange={() => {
                      setInnovatorType(type);
                      markTouched("innovatorType");
                    }}
                    className="h-4 w-4 border-border text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <label htmlFor={itemId} className="text-body text-dark">
                    {type}
                  </label>
                </div>
              );
            })}
          </div>
          <p id="innovatorType-help" className="text-caption text-muted">
            Choose the option that fits you best. This guides scheme matching.
          </p>
          <div aria-live="polite" className="min-h-[1.25rem]">
            {innovatorTypeHasError ? (
              <p
                id="innovatorType-error"
                className="flex items-center gap-1 text-caption font-medium text-danger"
              >
                <AlertCircle aria-hidden className="h-3.5 w-3.5" />
                {errFor("innovatorType")}
              </p>
            ) : null}
          </div>
        </fieldset>
      </fieldset>

      {/* Your idea ----------------------------------------------------------- */}
      <fieldset className="space-y-5">
        <legend className="flex items-center gap-2 font-heading text-body font-semibold text-dark">
          <Lightbulb aria-hidden className="h-4 w-4 text-primary" />
          Your idea
        </legend>

        <FieldShell
          id="ideaTitle"
          label="Idea title"
          help={`Give your idea a short, clear name (at least ${IDEA_TITLE_MIN_LENGTH} characters).`}
          error={errFor("ideaTitle")}
          showError={shouldShow("ideaTitle")}
        >
          <Input
            id="ideaTitle"
            type="text"
            value={ideaTitle}
            aria-required
            aria-invalid={shouldShow("ideaTitle") && Boolean(errFor("ideaTitle"))}
            aria-describedby={describedBy(
              "ideaTitle",
              shouldShow("ideaTitle") && Boolean(errFor("ideaTitle")),
            )}
            onChange={(e) => setIdeaTitle(e.target.value)}
            onBlur={() => markTouched("ideaTitle")}
          />
        </FieldShell>

        {/* ideaCategory — required NATIVE <select> of the 8 idea categories.
            The placeholder is the FIRST option (value="") and the real values
            follow, so a chooser can pick options[1] for the first real value. */}
        <FieldShell
          id="ideaCategory"
          label="Category"
          help="Pick the category that best fits your idea."
          error={errFor("ideaCategory")}
          showError={shouldShow("ideaCategory")}
          className="max-w-sm"
        >
          <select
            id="ideaCategory"
            value={ideaCategory ?? ""}
            aria-required
            aria-invalid={shouldShow("ideaCategory") && Boolean(errFor("ideaCategory"))}
            aria-describedby={describedBy(
              "ideaCategory",
              shouldShow("ideaCategory") && Boolean(errFor("ideaCategory")),
            )}
            onChange={(e) => {
              setIdeaCategory((e.target.value || null) as IdeaCategory | null);
              markTouched("ideaCategory");
            }}
            onBlur={() => markTouched("ideaCategory")}
            className={CONTROL_CLASS}
          >
            <option value="">Select a category</option>
            {IDEA_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell
          id="ideaSummary"
          label="Idea summary"
          help={`A short overview of your idea — between ${IDEA_SUMMARY_MIN_LENGTH} and ${IDEA_SUMMARY_MAX_LENGTH} characters (currently ${summaryLen}).`}
          error={errFor("ideaSummary")}
          showError={shouldShow("ideaSummary")}
        >
          <textarea
            id="ideaSummary"
            rows={3}
            value={ideaSummary}
            aria-required
            aria-invalid={shouldShow("ideaSummary") && Boolean(errFor("ideaSummary"))}
            aria-describedby={describedBy(
              "ideaSummary",
              shouldShow("ideaSummary") && Boolean(errFor("ideaSummary")),
            )}
            onChange={(e) => setIdeaSummary(e.target.value)}
            onBlur={() => markTouched("ideaSummary")}
            className={TEXTAREA_CLASS}
          />
        </FieldShell>

        <FieldShell
          id="problemStatement"
          label="What problem does it solve?"
          help={`Describe the problem this addresses. Between ${IDEA_PROBLEM_MIN_LENGTH} and ${IDEA_PROBLEM_MAX_LENGTH} characters (currently ${problemLen}).`}
          error={errFor("problemStatement")}
          showError={shouldShow("problemStatement")}
        >
          <textarea
            id="problemStatement"
            rows={4}
            value={problemStatement}
            aria-required
            aria-invalid={shouldShow("problemStatement") && Boolean(errFor("problemStatement"))}
            aria-describedby={describedBy(
              "problemStatement",
              shouldShow("problemStatement") && Boolean(errFor("problemStatement")),
            )}
            onChange={(e) => setProblemStatement(e.target.value)}
            onBlur={() => markTouched("problemStatement")}
            className={TEXTAREA_CLASS}
          />
        </FieldShell>

        <FieldShell
          id="proposedSolution"
          label="How would you solve it?"
          help={`Describe your proposed solution. Between ${IDEA_SOLUTION_MIN_LENGTH} and ${IDEA_SOLUTION_MAX_LENGTH} characters (currently ${solutionLen}).`}
          error={errFor("proposedSolution")}
          showError={shouldShow("proposedSolution")}
        >
          <textarea
            id="proposedSolution"
            rows={4}
            value={proposedSolution}
            aria-required
            aria-invalid={shouldShow("proposedSolution") && Boolean(errFor("proposedSolution"))}
            aria-describedby={describedBy(
              "proposedSolution",
              shouldShow("proposedSolution") && Boolean(errFor("proposedSolution")),
            )}
            onChange={(e) => setProposedSolution(e.target.value)}
            onBlur={() => markTouched("proposedSolution")}
            className={TEXTAREA_CLASS}
          />
        </FieldShell>

        {/* location — required NATIVE <select> of LocationKarnataka. The
            placeholder is options[0] (value="") with the real values after. */}
        <FieldShell
          id="location"
          label="Location"
          help="Where in Karnataka are you based? This helps match region-specific support."
          error={errFor("location")}
          showError={shouldShow("location")}
          className="max-w-sm"
        >
          <select
            id="location"
            value={location ?? ""}
            aria-required
            aria-invalid={shouldShow("location") && Boolean(errFor("location"))}
            aria-describedby={describedBy(
              "location",
              shouldShow("location") && Boolean(errFor("location")),
            )}
            onChange={(e) => {
              setLocation((e.target.value || null) as LocationKarnataka | null);
              markTouched("location");
            }}
            onBlur={() => markTouched("location")}
            className={CONTROL_CLASS}
          >
            <option value="">Select your location</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </FieldShell>
      </fieldset>

      {/* Form-level polite status + submit ----------------------------------- */}
      <div aria-live="polite" className="min-h-[1.25rem] text-caption text-danger">
        {submitAttempted && !isValid ? (
          <span className="flex items-center gap-1 font-medium">
            <AlertCircle aria-hidden className="h-3.5 w-3.5" />
            {errorCount === 1
              ? "1 field needs your attention before you can submit."
              : `${errorCount} fields need your attention before you can submit.`}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          size="lg"
          disabled={!isValid}
          aria-disabled={!isValid}
          className="w-full sm:w-auto"
        >
          <Send aria-hidden className="h-4 w-4" />
          Submit idea
        </Button>
        <p className="text-caption text-muted">
          Your idea stays in this session only. Submitting assigns an idea ID and
          matches you to relevant Karnataka schemes.
        </p>
      </div>
    </form>
  );
}

export default IdeaSubmissionForm;

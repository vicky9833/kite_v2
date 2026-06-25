/**
 * IdeaSubmissionForm.test.tsx — component test for the Idea Submission Form
 * (Task 15.4; Req 26.1–26.5, 26.11, 26.12, 35.1–35.3).
 *
 * The form is a self-contained client island built on NATIVE controls — text /
 * number inputs, native `<select>` dropdowns for Category and Location, and a
 * native `<input type="radio">` group of the 5 innovator types. State is driven
 * through `fireEvent.change` / `fireEvent.click` (the repo bundles no
 * `@testing-library/user-event`), mirroring the sibling
 * `mentors/__tests__/MentorConnect.test.tsx`.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { IdeaSubmissionForm } from "@/components/ideas/IdeaSubmissionForm";
import { INNOVATOR_TYPES, IDEA_CATEGORIES } from "@/types";
import {
  IDEA_TITLE_MIN_LENGTH,
  IDEA_SUMMARY_MIN_LENGTH,
  IDEA_PROBLEM_MIN_LENGTH,
  IDEA_SOLUTION_MIN_LENGTH,
} from "@/lib/idea-form-validation";

// --- A well-formed set of values that satisfies every validation threshold. ---
const VALID = {
  name: "Anjali Rao",
  email: "anjali@example.com",
  age: "27",
  innovatorType: "Student" as const,
  title: "Smart Crop Advisory", // ≥ 5 chars
  category: "AgriTech" as const,
  // Each long-text field must clear its inclusive minimum length.
  summary: "A".repeat(IDEA_SUMMARY_MIN_LENGTH + 10),
  problem: "B".repeat(IDEA_PROBLEM_MIN_LENGTH + 10),
  solution: "C".repeat(IDEA_SOLUTION_MIN_LENGTH + 10),
  location: "Mysuru" as const,
};

/** Fill every field with valid values via native control events. */
function fillValid() {
  fireEvent.change(screen.getByLabelText("Your name"), {
    target: { value: VALID.name },
  });
  fireEvent.change(screen.getByLabelText("Email address"), {
    target: { value: VALID.email },
  });
  fireEvent.change(screen.getByLabelText("Age"), {
    target: { value: VALID.age },
  });
  fireEvent.click(screen.getByLabelText(VALID.innovatorType));
  fireEvent.change(screen.getByLabelText("Idea title"), {
    target: { value: VALID.title },
  });
  fireEvent.change(screen.getByLabelText("Category"), {
    target: { value: VALID.category },
  });
  fireEvent.change(screen.getByLabelText("Idea summary"), {
    target: { value: VALID.summary },
  });
  fireEvent.change(screen.getByLabelText("What problem does it solve?"), {
    target: { value: VALID.problem },
  });
  fireEvent.change(screen.getByLabelText("How would you solve it?"), {
    target: { value: VALID.solution },
  });
  fireEvent.change(screen.getByLabelText("Location"), {
    target: { value: VALID.location },
  });
}

const getSubmit = () => screen.getByRole("button", { name: /submit idea/i });

describe("IdeaSubmissionForm", () => {
  it("renders a single-column max-w-3xl form with all 10 fields", () => {
    const { container } = render(<IdeaSubmissionForm onSubmit={vi.fn()} />);

    // Single-column, max-w-3xl form shell.
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form).toHaveClass("max-w-3xl");
    expect(form).toHaveClass("mx-auto");

    // Eight labelled text / select fields.
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Age")).toBeInTheDocument();
    expect(screen.getByLabelText("Idea title")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Idea summary")).toBeInTheDocument();
    expect(
      screen.getByLabelText("What problem does it solve?"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("How would you solve it?")).toBeInTheDocument();
    expect(screen.getByLabelText("Location")).toBeInTheDocument();

    // The innovator-type radio group: exactly 5 options, one per InnovatorType.
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
    expect(radios).toHaveLength(INNOVATOR_TYPES.length);
    for (const type of INNOVATOR_TYPES) {
      const radio = screen.getByLabelText(type);
      expect(radio).toBeInTheDocument();
      expect(radio).toHaveAttribute("type", "radio");
    }
  });

  it("renders Category and Location as native <select> with a placeholder first option", () => {
    render(<IdeaSubmissionForm onSubmit={vi.fn()} />);

    const category = screen.getByLabelText("Category") as HTMLSelectElement;
    expect(category.tagName).toBe("SELECT");
    expect(category.options[0]?.value).toBe("");
    expect(category.options[0]?.textContent).toBe("Select a category");
    // Placeholder + one option per category.
    expect(category.options).toHaveLength(IDEA_CATEGORIES.length + 1);

    const location = screen.getByLabelText("Location") as HTMLSelectElement;
    expect(location.tagName).toBe("SELECT");
    expect(location.options[0]?.value).toBe("");
    expect(location.options[0]?.textContent).toBe("Select your location");
  });

  it("exposes a polite aria-live region for errors", () => {
    const { container } = render(<IdeaSubmissionForm onSubmit={vi.fn()} />);
    const liveRegions = container.querySelectorAll('[aria-live="polite"]');
    expect(liveRegions.length).toBeGreaterThan(0);
  });

  it("keeps submit aria-disabled 'true' while the form is invalid", () => {
    render(<IdeaSubmissionForm onSubmit={vi.fn()} />);

    const submit = getSubmit();
    expect(submit).toHaveAttribute("aria-disabled", "true");
    expect(submit).toBeDisabled();

    // A partially-filled form (missing the long-text fields) stays invalid.
    fireEvent.change(screen.getByLabelText("Your name"), {
      target: { value: VALID.name },
    });
    fireEvent.change(screen.getByLabelText("Idea title"), {
      target: { value: "ab" }, // below the 5-char minimum
    });
    expect(getSubmit()).toHaveAttribute("aria-disabled", "true");
  });

  it("flips submit aria-disabled to 'false' once every field is valid", () => {
    render(<IdeaSubmissionForm onSubmit={vi.fn()} />);

    expect(getSubmit()).toHaveAttribute("aria-disabled", "true");

    fillValid();

    const submit = getSubmit();
    expect(submit).toHaveAttribute("aria-disabled", "false");
    expect(submit).toBeEnabled();
  });

  it("calls onSubmit once with a well-formed draft when a valid form is submitted", () => {
    const onSubmit = vi.fn();
    render(<IdeaSubmissionForm onSubmit={onSubmit} />);

    fillValid();
    fireEvent.click(getSubmit());

    expect(onSubmit).toHaveBeenCalledTimes(1);

    const draft = onSubmit.mock.calls[0]![0];
    expect(draft).toMatchObject({
      innovatorName: VALID.name,
      innovatorEmail: VALID.email,
      innovatorType: VALID.innovatorType,
      ideaTitle: VALID.title,
      ideaCategory: VALID.category,
      ideaSummary: VALID.summary,
      problemStatement: VALID.problem,
      proposedSolution: VALID.solution,
      location: VALID.location,
    });
    // Age is coerced to a finite number.
    expect(draft.innovatorAge).toBe(27);
    expect(typeof draft.innovatorAge).toBe("number");
    expect(Number.isFinite(draft.innovatorAge)).toBe(true);
  });
});

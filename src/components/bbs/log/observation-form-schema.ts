import type { FormSchema, TileOption } from "@/components/form-builder";

/** Observation type — rendered as the two tiles from the design. */
export const OBSERVATION_TYPE_OPTIONS: readonly TileOption[] = [
  {
    value: "safe",
    label: "Safe",
    description: "Safe practice observed",
    icon: "mdi:check-circle-outline",
    tone: "positive",
  },
  {
    value: "at-risk",
    label: "At-Risk",
    description: "Risk behavior flagged",
    icon: "mdi:alert-outline",
    tone: "warning",
  },
];

/** Step 1 — what did you observe? */
export function buildObservationTypeSchema(
  categorySuggestions: readonly string[],
): FormSchema {
  return [
    {
      type: "tiles",
      name: "observationType",
      label: "Observation Type",
      required: true,
      colSpan: 12,
      options: OBSERVATION_TYPE_OPTIONS,
      // The card header already asks the question, so the label would repeat it.
      hideLabel: true,
    },
    {
      type: "text",
      name: "category",
      label: "Behavior Category",
      required: true,
      colSpan: 12,
      placeholder: "Search or add new",
      // Free text, with the add button offering categories from the API.
      suggestions: categorySuggestions,
    },
  ];
}

/** Step 2 — where & what happened? */
export const observationDetailsSchema: FormSchema = [
  {
    type: "text",
    name: "location",
    label: "Location",
    required: true,
    colSpan: 12,
    placeholder: "Where did this happen?",
  },
  {
    type: "textarea",
    name: "description",
    label: "Description",
    required: true,
    colSpan: 12,
    rows: 4,
    placeholder: "Describe the behavior in detail — be specific and factual...",
    helperText: "What exactly did you see?",
  },
  {
    type: "photo",
    name: "photos",
    label: "Photo Evidence",
    colSpan: 12,
    placeholder: "Tap to add photo",
    helperText: "Optional — attach up to 10 images.",
  },
];

/** Strongly-typed shape of the submitted observation (both steps combined). */
export type ObservationFormValues = {
  observationType: string;
  category: string;
  location: string;
  description: string;
  /** Secure Cloudinary URLs of the attached photo evidence. */
  photos: string[];
};

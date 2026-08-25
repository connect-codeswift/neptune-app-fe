import {
  createInitialValues,
  type FieldConfig,
  type FormSchema,
  type FormValues,
} from "@/components/form-builder";

export const CAPA_VERIFICATION_FORM_ID = "capa-verification-form";

export const CAPA_VERIFICATION_CHECKLIST = [
  {
    value: "evidence",
    label: "Evidence has been reviewed and is sufficient",
  },
  {
    value: "observed",
    label: "Action described has been physically observed / confirmed",
  },
  {
    value: "rootCause",
    label: "The action addresses the root cause identified in the RCA",
  },
  {
    value: "similar",
    label: "Similar conditions have been checked in other locations",
  },
  {
    value: "training",
    label: "Training or procedure update completed if required",
  },
] as const;

/** FormBuilder schema for CAPA Verification — Figma 846:6031. */
export const CAPA_VERIFICATION_SCHEMA: FormSchema = [
  {
    type: "checkbox-group",
    name: "checklist",
    label: "Verification Checklist",
    required: true,
    colSpan: 12,
    card: true,
    columns: 1,
    variant: "rows",
    // One tick, not all of them - the same floor the API enforces
    // ("Tick at least one verification check before closing"). Which checks matter is the
    // verifier's judgement; requiring every box turned a judgement into a formality.
    requireAll: false,
    options: [...CAPA_VERIFICATION_CHECKLIST],
  },
  {
    type: "tiles",
    name: "effectiveness",
    label: "Effectiveness Assessment",
    required: true,
    colSpan: 12,
    card: true,
    variant: "assessment",
    options: [
      { value: "effective", label: "Effective", tone: "positive" },
      { value: "partial", label: "Partially Effective" },
      { value: "notEffective", label: "Not Effective" },
    ],
  },
  {
    type: "textarea",
    name: "notes",
    label: "Verification Notes",
    colSpan: 12,
    card: true,
    rows: 4,
    placeholder: "Document your verification observations...",
  },
] satisfies FieldConfig[];

export function createCapaVerificationInitialValues(): FormValues {
  return {
    ...createInitialValues(CAPA_VERIFICATION_SCHEMA),
    checklist: [],
    effectiveness: "effective",
    notes: "",
  };
}

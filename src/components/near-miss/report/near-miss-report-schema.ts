import type { FormSchema, SelectOption } from "@/components/form-builder";

export const HAZARD_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: "slip-trip-fall", label: "Slip / Trip / Fall" },
  { value: "electrical", label: "Electrical" },
  { value: "chemical", label: "Chemical" },
  { value: "mechanical", label: "Mechanical" },
  { value: "ergonomic", label: "Ergonomic" },
  { value: "fire-explosion", label: "Fire / Explosion" },
  { value: "environmental", label: "Environmental" },
];

export const LOCATION_OPTIONS: readonly SelectOption[] = [
  { value: "plant-a-line-1", label: "Plant A · Line 1" },
  { value: "plant-a-line-2", label: "Plant A · Line 2" },
  { value: "plant-b-fab-1", label: "Plant B · Fab 1" },
  { value: "warehouse-1", label: "Warehouse 1" },
  { value: "warehouse-2", label: "Warehouse 2" },
  { value: "warehouse-3", label: "Warehouse 3" },
];

export const CONTRIBUTING_FACTOR_OPTIONS: readonly SelectOption[] = [
  { value: "loto-not-applied", label: "LOTO not applied" },
  { value: "ppe-not-worn", label: "PPE not worn" },
  { value: "inadequate-training", label: "Inadequate training" },
  { value: "unsafe-procedure", label: "Unsafe procedure" },
  { value: "equipment-failure", label: "Equipment failure" },
  { value: "distraction-rushing", label: "Distraction / rushing" },
  { value: "environmental-conditions", label: "Environmental conditions" },
  { value: "poor-housekeeping", label: "Poor housekeeping" },
  { value: "other", label: "Other" },
];

/** Strongly-typed shape of a submitted Near-Miss report. */
export type NearMissReportValues = {
  dateOfEvent: string;
  hazardType: string;
  location: string;
  whatHappened: string;
  contributingFactors: string[];
  /** File references for the attached photo evidence; optional, up to 10. */
  photos: string[];
};

export const nearMissReportSchema: FormSchema = [
  {
    type: "date",
    name: "dateOfEvent",
    label: "Date of Event",
    required: true,
    colSpan: 6,
    // A near miss is reported after it happens; nothing can have nearly
    // happened next week.
    limit: "not-future",
  },
  {
    type: "select",
    name: "hazardType",
    label: "Hazard type",
    required: true,
    colSpan: 6,
    placeholder: "Select hazard type",
    helperText:
      "The kind of hazard that almost caused harm — used to classify this near miss.",
    options: HAZARD_TYPE_OPTIONS,
    allowCustom: true,
    addCustomLabel: "Add custom hazard type",
    addCustomPlaceholder: "e.g. Confined space entry",
  },
  {
    type: "select",
    name: "location",
    label: "Location",
    required: true,
    colSpan: 12,
    placeholder: "Select location",
    helperText:
      "Pick the named area. Nearby rooms that are the same space should share one location.",
    options: LOCATION_OPTIONS,
  },
  {
    type: "chips",
    name: "contributingFactors",
    label: "Contributing Factors (select all that apply)",
    colSpan: 12,
    options: CONTRIBUTING_FACTOR_OPTIONS,
    allowCustom: true,
    addCustomPlaceholder: "Add another factor…",
  },
  {
    type: "textarea",
    name: "whatHappened",
    label: "What happened?",
    required: true,
    colSpan: 12,
    rows: 4,
    placeholder:
      "Describe what almost happened and what conditions were present...",
  },
  {
    type: "photo",
    name: "photos",
    label: "Photo / Video Evidence",
    colSpan: 12,
    accept: "media",
    fileModule: "NearMiss",
    maxFiles: 10,
    placeholder: "Attach photos or videos",
    helperText: "Optional. Photos or videos, up to 10.",
  },
];

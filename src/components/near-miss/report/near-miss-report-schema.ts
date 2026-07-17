import type { FormSchema, SelectOption } from "@/components/form-builder";

export const HAZARD_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: "slip-trip-fall", label: "Slip / Trip / Fall" },
  { value: "electrical", label: "Electrical" },
  { value: "chemical", label: "Chemical" },
  { value: "mechanical", label: "Mechanical" },
  { value: "ergonomic", label: "Ergonomic" },
  { value: "fire-explosion", label: "Fire / Explosion" },
  { value: "environmental", label: "Environmental" },
  { value: "other", label: "Other" },
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
];

/** Strongly-typed shape of a submitted Near-Miss report. */
export type NearMissReportValues = {
  dateOfEvent: string;
  hazardType: string;
  location: string;
  whatHappened: string;
  contributingFactors: string[];
};

export const nearMissReportSchema: FormSchema = [
  {
    type: "date",
    name: "dateOfEvent",
    label: "Date of Event",
    required: true,
    colSpan: 6,
  },
  {
    type: "select",
    name: "hazardType",
    label: "Hazard type",
    required: true,
    colSpan: 6,
    placeholder: "Select hazard type",
    options: HAZARD_TYPE_OPTIONS,
  },
  {
    type: "select",
    name: "location",
    label: "Location",
    required: true,
    colSpan: 12,
    placeholder: "Select location",
    options: LOCATION_OPTIONS,
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
    type: "checkbox-group",
    name: "contributingFactors",
    label: "Contributing Factors (select all that apply)",
    colSpan: 12,
    columns: 2,
    options: CONTRIBUTING_FACTOR_OPTIONS,
  },
];

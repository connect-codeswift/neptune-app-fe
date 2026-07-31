import type { FormSchema, SelectOption } from "@/components/form-builder";

/** Options shown in the design's Incident Type dropdown. */
export const INCIDENT_TYPE_OPTIONS: readonly SelectOption[] = [
  { value: "first-aid", label: "First Aid" },
  { value: "osha", label: "OSHA" },
  { value: "time-lost", label: "Time Lost" },
];

/** Mirrors the app's existing severity vocabulary (see NearMissSeverity). */
export const INCIDENT_SEVERITY_OPTIONS: readonly SelectOption[] = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

/** Strongly-typed shape of the convert-to-incident form. */
export type ConvertToIncidentValues = {
  incidentType: string;
  severity: string;
  reasonForConversion: string;
};

export const convertToIncidentSchema: FormSchema = [
  {
    type: "select",
    name: "incidentType",
    label: "Incident Type",
    required: true,
    colSpan: 6,
    placeholder: "Select incident type",
    options: INCIDENT_TYPE_OPTIONS,
  },
  {
    type: "select",
    name: "severity",
    label: "Severity",
    colSpan: 6,
    placeholder: "Select severity",
    options: INCIDENT_SEVERITY_OPTIONS,
  },
  {
    type: "textarea",
    name: "reasonForConversion",
    label: "Reason for Conversion",
    required: true,
    colSpan: 12,
    rows: 3,
    placeholder: "Why is this being converted to a full incident?",
  },
];

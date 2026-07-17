export type ClassificationField = Readonly<{
  id: string;
  label: string;
  defaultValue: "Yes" | "No";
  hint?: string;
}>;

export const CLASSIFICATION_FIELDS: readonly ClassificationField[] = [
  { id: "osha", label: "OSHA Recordable?", defaultValue: "Yes" },
  { id: "workRelated", label: "Work Related?", defaultValue: "Yes" },
  { id: "drugAlcohol", label: "Drug or Alcohol Related?", defaultValue: "No" },
  { id: "canada", label: "Occurred in Canada?", defaultValue: "No" },
  { id: "fleet", label: "Fleet Vehicle Involved?", defaultValue: "No" },
  {
    id: "serious",
    label: "Serious Incident?",
    defaultValue: "No",
    hint: "SIA / SIP",
  },
  { id: "emergency", label: "Emergency Services Called?", defaultValue: "No" },
  {
    id: "tempWorker",
    label: "Temp / Non-Employee Involved?",
    defaultValue: "No",
  },
];

export const YES_NO_OPTIONS = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
] as const;

export const SITE_STATS = [
  { label: "Days w/o LTI", value: "47" },
  { label: "Open hazards", value: "14" },
  { label: "Recent similar", value: "2 in 90d" },
  { label: "Site supervisor", value: "Alicia Chen" },
] as const;

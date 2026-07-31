export type ClassificationField = Readonly<{
  id: string;
  label: string;
  defaultValue: "Yes" | "No";
  hint?: string;
}>;

export const CLASSIFICATION_FIELDS: readonly ClassificationField[] = [
  { id: "osha", label: "OSHA Recordable?", defaultValue: "No" },
  { id: "workRelated", label: "Work Related?", defaultValue: "No" },
  { id: "drugAlcohol", label: "Drug or Alcohol Related?", defaultValue: "No" },
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

/** Placeholder site metrics until a site-stats API exists. */
export const SITE_STATS = [
  { label: "Days w/o LTI", value: "—" },
  { label: "Open hazards", value: "—" },
  { label: "Recent similar", value: "—" },
  { label: "Site supervisor", value: "—" },
] as const;

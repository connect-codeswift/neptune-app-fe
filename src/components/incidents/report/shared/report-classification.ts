/**
 * `""` is the unanswered state.
 *
 * These used to default to "No", which made a question nobody looked at
 * indistinguishable from one deliberately answered "No" — bad for a safety
 * record that gets audited. They now start empty so the reporter has to say.
 */
export type ClassificationValue = "Yes" | "No" | "";

export type ClassificationField = Readonly<{
  id: string;
  label: string;
  defaultValue: ClassificationValue;
  hint?: string;
}>;

export const CLASSIFICATION_FIELDS: readonly ClassificationField[] = [
  { id: "osha", label: "OSHA Recordable?", defaultValue: "" },
  { id: "workRelated", label: "Work Related?", defaultValue: "" },
  { id: "drugAlcohol", label: "Drug or Alcohol Related?", defaultValue: "" },
  { id: "fleet", label: "Fleet Vehicle Involved?", defaultValue: "" },
  {
    id: "serious",
    label: "Serious Incident?",
    defaultValue: "",
    hint: "SIA / SIP",
  },
  { id: "emergency", label: "Emergency Services Called?", defaultValue: "" },
  {
    id: "tempWorker",
    label: "Temp / Non-Employee Involved?",
    defaultValue: "",
  },
];

export const YES_NO_OPTIONS = [
  { value: "", label: "Select…" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
] as const;

/**
 * "OSHA Recordable?" is derived from the severity, not asked separately.
 *
 * First Aid is the one severity OSHA explicitly excludes from recordability;
 * OSHA Recordable, OSHA Lost Time, SIA and SIP all imply Yes. Kept here rather
 * than inline in the picker so the initial form state and the severity handler
 * can't drift apart — the field would otherwise start blank while the severity
 * already said First Aid.
 */
export function oshaRecordableForSeverity(
  severityId: string,
): ClassificationValue {
  return severityId === "first-aid" ? "No" : "Yes";
}

/** Placeholder site metrics until a site-stats API exists. */
export const SITE_STATS = [
  { label: "Days w/o LTI", value: "—" },
  { label: "Open hazards", value: "—" },
  { label: "Recent similar", value: "—" },
  { label: "Site supervisor", value: "—" },
] as const;

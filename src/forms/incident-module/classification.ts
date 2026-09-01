/**
 * Yes/No answers for most classification toggles. The serious-incident field
 * also accepts SIA / SIP / SIF on severities that use that picker.
 * `""` is only kept for typing; live form state normalizes blanks.
 */
export type ClassificationValue = "Yes" | "No" | "SIA" | "SIP" | "SIF" | "";

export type ClassificationField = Readonly<{
  id: string;
  label: string;
  defaultValue: ClassificationValue;
  hint?: string;
}>;

export const CLASSIFICATION_FIELDS: readonly ClassificationField[] = [
  { id: "osha", label: "OSHA Recordable?", defaultValue: "" },
  { id: "drugAlcohol", label: "Drug or Alcohol Related?", defaultValue: "" },
  { id: "fleet", label: "Fleet Vehicle Involved?", defaultValue: "" },
  {
    id: "serious",
    label: "Serious Incident Potential?",
    defaultValue: "",
  },
  { id: "emergency", label: "Emergency Services Called?", defaultValue: "" },
  {
    id: "tempWorker",
    label: "Temp / Non-Employee Involved?",
    defaultValue: "",
  },
];

/** Medical Treatment, Restricted Duty, Lost Time, and Fatality use SIA / SIP / SIF. */
const SIA_SIP_SEVERITY_IDS = [
  "medical-treatment",
  "restricted-duty",
  "lost-time",
  "fatality",
] as const;

export type SiaSipSeverityId = (typeof SIA_SIP_SEVERITY_IDS)[number];

const SERIOUS_INCIDENT_SIA_SIP_LABEL = "Is this a SIA, SIP, or SIF";

const SERIOUS_INCIDENT_SIA_SIP_OPTIONS = [
  { value: "SIP", label: "SIP" },
  { value: "SIA", label: "SIA" },
  { value: "SIF", label: "SIF" },
] as const;

export type SeriousIncidentSiaSipSifValue =
  (typeof SERIOUS_INCIDENT_SIA_SIP_OPTIONS)[number]["value"];

export function usesSiaSipToggle(severityId: string): boolean {
  return (SIA_SIP_SEVERITY_IDS as readonly string[]).includes(severityId);
}

export function seriousFieldLabelForSeverity(severityId: string): string {
  return usesSiaSipToggle(severityId)
    ? SERIOUS_INCIDENT_SIA_SIP_LABEL
    : (CLASSIFICATION_FIELDS.find((field) => field.id === "serious")?.label ??
        "Serious Incident Potential?");
}

export function seriousFieldToggleOptionsForSeverity(
  severityId: string,
): typeof SERIOUS_INCIDENT_SIA_SIP_OPTIONS | undefined {
  return usesSiaSipToggle(severityId)
    ? SERIOUS_INCIDENT_SIA_SIP_OPTIONS
    : undefined;
}

/** Clears answers that don't match the active severity's serious-incident control. */
export function normalizeClassifications(
  classifications: Record<string, ClassificationValue>,
  severityId = "",
): Record<string, ClassificationValue> {
  const next = { ...classifications };

  if (usesSiaSipToggle(severityId)) {
    const serious = next.serious;
    if (serious !== "SIA" && serious !== "SIP" && serious !== "SIF") {
      next.serious = "";
    }
    return next;
  }

  const serious = next.serious;
  if (serious !== "Yes" && serious !== "No") {
    next.serious = "";
  }

  return next;
}

/** Maps SIA / SIP / SIF (or Yes) onto the backend's boolean flag. */
export function isSeriousIncidentClassification(
  value: ClassificationValue | undefined,
): boolean {
  return value === "Yes" || value === "SIA" || value === "SIF";
}

/** Label sent to AI draft assist for the serious-incident answer. */
export function seriousIncidentLabelForDraft(
  value: ClassificationValue | undefined,
): string {
  if (value === "SIA" || value === "SIP" || value === "SIF") {
    return value;
  }

  return value ?? "";
}

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
  if (!severityId) {
    return "";
  }

  return severityId === "first-aid" ? "No" : "Yes";
}

/** Step 1 — OSHA recordable is derived from severity and hidden for First Aid. */
export function classificationFieldsForStepOne(
  severityId: string,
): readonly ClassificationField[] {
  if (severityId === "first-aid") {
    return CLASSIFICATION_FIELDS.filter((field) => field.id !== "osha");
  }

  return CLASSIFICATION_FIELDS;
}

/** Placeholder site metrics until a site-stats API exists. */
export const SITE_STATS = [
  { label: "Days w/o LTI", value: "—" },
  { label: "Open hazards", value: "—" },
  { label: "Recent similar", value: "—" },
  { label: "Site supervisor", value: "—" },
] as const;

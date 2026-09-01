import type { SeverityId } from "@/forms/incident-module/severity";
import type { ReportPhotoFile } from "@/forms/incident-module/attachments";
import type { InjuryLevelId } from "@/forms/incident-module/injury-level";
import { injuryLevelForReport } from "@/forms/incident-module/injury-level";
import type {
  BodyPartId,
  BodyPartSideMap,
  BodySide,
} from "@/forms/incident-module/body-parts";
import {
  CLASSIFICATION_FIELDS,
  type ClassificationValue,
  normalizeClassifications,
} from "@/forms/incident-module/classification";
import { DEFAULT_REPORT_PHOTOS } from "@/forms/incident-module/attachments";
/** Step 2 dropdowns the reporter can extend with their own options. */
/**
 * A witness has to be someone in the system, so the account id travels with the name.
 * This was a single comma-joined string of names, which had nowhere to keep an id — the
 * backend now requires one on create, and a name alone cannot be resolved to an employee.
 */
export type WitnessEntry = Readonly<{ userId: string; name: string }>;

export type CustomOptionField =
  "initialTreatment" | "mechanismOfInjury" | "natureOfInjury";

const EMPTY_CUSTOM_OPTIONS: Readonly<
  Record<CustomOptionField, readonly string[]>
> = {
  initialTreatment: [],
  mechanismOfInjury: [],
  natureOfInjury: [],
};

/**
 * Fields whose text can be accepted from an AI draft. These exact names are
 * what the backend stores in `AiAssistedFields`.
 */
export type AiAssistedFieldName =
  "description" | "injuryDescription" | "actionNotes";

/** Records that a field's text came from a draft. Accepting twice is a no-op. */
export function markAiAssisted(
  current: readonly AiAssistedFieldName[],
  field: AiAssistedFieldName,
): readonly AiAssistedFieldName[] {
  return current.includes(field) ? current : [...current, field];
}

export type ReportIncidentFormState = Readonly<{
  /** `""` until the reporter picks one — no default severity. */
  severity: SeverityId | "";
  affectedPerson: string;
  /**
   * Backend user id of the affected person, when they were picked from the
   * site roster rather than typed. `""` for a free-typed name — contractors and
   * visitors have no account, and those incidents still have to be filable.
   */
  affectedPersonId: string;
  /** Auto-assigned plant / site name. */
  location: string;
  /** Specific areas within the plant — e.g. Line 2, Press #4. */
  incidentLocations: readonly string[];
  /** Reporter-added locations kept in the dropdown for this report. */
  customIncidentLocations: readonly string[];
  reportedBy: string;
  reporterEmail: string;
  incidentDate: string;
  incidentTime: string;
  reportDate: string;
  /** `""` until the reporter answers — see ClassificationValue. */
  classifications: Record<string, ClassificationValue>;
  description: string;
  title: string;
  initialTreatment: string;
  secondaryTreatment: "Yes" | "No";
  mechanismOfInjury: string;
  natureOfInjury: string;
  /**
   * Options the reporter typed themselves, per field. Stored on the form so a
   * custom entry survives navigating between steps. The mapper needs no change:
   * `optionLabel` falls back to the raw value when it isn't a known option, and
   * these are stored with the typed text as both value and label.
   */
  customOptions: Readonly<Record<CustomOptionField, readonly string[]>>;
  objectInvolved: string;
  oshaNotificationRequired: "Yes" | "No";
  witnesses: readonly WitnessEntry[];
  photos: readonly ReportPhotoFile[];
  injuryLevel: InjuryLevelId;
  gender: string;
  /**
   * True while `gender` is the value read off the affected person's own record
   * rather than one the reporter chose. Drives the "From their profile" hint,
   * and is cleared the moment the reporter picks a different answer — a stale
   * provenance claim is worse than none on a regulated record.
   */
  genderFromProfile: boolean;
  bodyParts: readonly BodyPartId[];
  /**
   * Free-text parts the reporter added because the anatomical list didn't
   * cover them. Kept separate from `bodyParts` because that union is closed
   * and drives the clickable SVG regions — a custom entry has no region to
   * map to. Adding one selects it; removing the chip deselects it.
   */
  customBodyParts: readonly string[];
  /** Last / default side for list picks and non-mapped parts. */
  bodySide: BodySide;
  /** Side chosen per body part (allows Left foot + Right hand together). */
  bodyPartSides: BodyPartSideMap;
  injuryDescription: string;
  immediateActions: readonly string[];
  actionNotes: string;
  /**
   * Which fields the reporter accepted an AI draft into. Marked on Accept and
   * kept marked even if they then edit the text — partial provenance is the
   * honest record for what is an OSHA-relevant document.
   */
  aiAssistedFields: readonly AiAssistedFieldName[];
  /** First Aid Step 2 + API required fields */
  whatTreatmentWasGiven: string;
  treatmentProvidedBy: string;
  treatmentLocation: string;
  furtherMedicalRecommended: "Yes" | "No";
  feedback: string;
  caseDisposition: string;
  isFitForFullDuty: string;
}>;

/**
 * Default values for First Aid–only Step 2 fields when severity is not First Aid.
 * Backend still requires these on create; the UI does not collect them otherwise.
 */
export const NON_FIRST_AID_FIELD_DEFAULTS = {
  whatTreatmentWasGiven: "N/A",
  treatmentProvidedBy: "N/A",
  treatmentLocation: "N/A",
  furtherMedicalRecommended: "No" as const,
  isFitForFullDuty: "N/A",
  caseDisposition: "N/A",
  feedback: "N/A",
} satisfies Partial<ReportIncidentFormState>;

/** Empty First Aid–only fields — used when switching back to First Aid. */
export const EMPTY_FIRST_AID_FIELDS = {
  whatTreatmentWasGiven: "",
  treatmentProvidedBy: "",
  treatmentLocation: "",
  furtherMedicalRecommended: "No" as const,
  isFitForFullDuty: "",
  caseDisposition: "",
  feedback: "N/A",
} satisfies Partial<ReportIncidentFormState>;

/** Empty form — no demo/mock incident content. */
export function createInitialReportFormState(): ReportIncidentFormState {
  return {
    severity: "",
    affectedPerson: "",
    affectedPersonId: "",
    location: "",
    incidentLocations: [],
    customIncidentLocations: [],
    reportedBy: "",
    reporterEmail: "",
    incidentDate: "",
    incidentTime: "",
    reportDate: "",
    classifications: Object.fromEntries(
      CLASSIFICATION_FIELDS.map((field) => [field.id, field.defaultValue]),
    ) as Record<string, ClassificationValue>,
    description: "",
    title: "",
    initialTreatment: "",
    secondaryTreatment: "No",
    mechanismOfInjury: "",
    natureOfInjury: "",
    customOptions: EMPTY_CUSTOM_OPTIONS,
    objectInvolved: "",
    oshaNotificationRequired: "No",
    witnesses: [],
    photos: DEFAULT_REPORT_PHOTOS,
    injuryLevel: "no-injury",
    gender: "",
    genderFromProfile: false,
    bodyParts: [],
    customBodyParts: [],
    bodySide: "Left",
    bodyPartSides: {},
    injuryDescription: "",
    immediateActions: [],
    actionNotes: "",
    aiAssistedFields: [],
    whatTreatmentWasGiven: "",
    treatmentProvidedBy: "",
    treatmentLocation: "",
    furtherMedicalRecommended: "No",
    // API-required strings (also collected on First Aid Step 2 where applicable)
    feedback: "N/A",
    caseDisposition: "",
    isFitForFullDuty: "",
  };
}

/**
 * Ensures non–First Aid severities always carry API-required First Aid field defaults
 * in form state. First Aid keeps user-entered values (or cleared defaults when
 * switching into First Aid).
 */
export function applySeverityFieldDefaults(
  form: ReportIncidentFormState,
): ReportIncidentFormState {
  const injuryLevel = injuryLevelForReport(form.severity, form.natureOfInjury);
  const classifications = normalizeClassifications(
    form.classifications,
    form.severity,
  );

  if (form.severity === "first-aid") {
    return { ...form, classifications, injuryLevel };
  }

  return {
    ...form,
    classifications,
    injuryLevel,
    whatTreatmentWasGiven:
      form.whatTreatmentWasGiven.trim() ||
      NON_FIRST_AID_FIELD_DEFAULTS.whatTreatmentWasGiven,
    treatmentProvidedBy:
      form.treatmentProvidedBy.trim() ||
      NON_FIRST_AID_FIELD_DEFAULTS.treatmentProvidedBy,
    treatmentLocation:
      form.treatmentLocation.trim() ||
      NON_FIRST_AID_FIELD_DEFAULTS.treatmentLocation,
    furtherMedicalRecommended:
      form.furtherMedicalRecommended ||
      NON_FIRST_AID_FIELD_DEFAULTS.furtherMedicalRecommended,
    isFitForFullDuty:
      form.isFitForFullDuty.trim() ||
      NON_FIRST_AID_FIELD_DEFAULTS.isFitForFullDuty,
    caseDisposition:
      form.caseDisposition.trim() ||
      NON_FIRST_AID_FIELD_DEFAULTS.caseDisposition,
    feedback: form.feedback.trim() || NON_FIRST_AID_FIELD_DEFAULTS.feedback,
  };
}

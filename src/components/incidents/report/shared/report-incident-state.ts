import type { SeverityId } from "./report-severity";
import type { ReportPhotoFile } from "./report-attachments";
import type { InjuryLevelId } from "./report-injury-level";
import type {
  BodyPartId,
  BodyPartSideMap,
  BodySide,
} from "./report-body-parts";
import {
  CLASSIFICATION_FIELDS,
  oshaRecordableForSeverity,
  type ClassificationValue,
} from "./report-classification";
import { DEFAULT_REPORT_PHOTOS } from "./report-attachments";

/** Step 2 dropdowns the reporter can extend with their own options. */
export type CustomOptionField =
  | "initialTreatment"
  | "mechanismOfInjury"
  | "natureOfInjury";

export const EMPTY_CUSTOM_OPTIONS: Readonly<
  Record<CustomOptionField, readonly string[]>
> = {
  initialTreatment: [],
  mechanismOfInjury: [],
  natureOfInjury: [],
};

export type ReportIncidentFormState = Readonly<{
  severity: SeverityId;
  affectedPerson: string;
  location: string;
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
  witnesses: string;
  photos: readonly ReportPhotoFile[];
  injuryLevel: InjuryLevelId;
  gender: string;
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
  bodyMultiSelect: boolean;
  injuryDescription: string;
  immediateActions: readonly string[];
  actionNotes: string;
  suggestedFollowUp: readonly string[];
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
    severity: "first-aid",
    affectedPerson: "",
    location: "",
    reportedBy: "",
    reporterEmail: "",
    incidentDate: "",
    incidentTime: "",
    reportDate: "",
    // Every question starts unanswered except "OSHA Recordable?", which is
    // derived from the severity above rather than asked — so it is seeded to
    // match the default severity instead of sitting blank.
    classifications: Object.fromEntries(
      CLASSIFICATION_FIELDS.map((field) => [
        field.id,
        field.id === "osha"
          ? oshaRecordableForSeverity("first-aid")
          : field.defaultValue,
      ]),
    ) as Record<string, ClassificationValue>,
    description: "",
    // Mirrors default severity so Live preview title is populated from the start.
    title: "First Aid",
    initialTreatment: "",
    secondaryTreatment: "No",
    mechanismOfInjury: "",
    natureOfInjury: "",
    customOptions: EMPTY_CUSTOM_OPTIONS,
    objectInvolved: "",
    oshaNotificationRequired: "No",
    witnesses: "",
    photos: DEFAULT_REPORT_PHOTOS,
    injuryLevel: "no-injury",
    gender: "",
    bodyParts: [],
    customBodyParts: [],
    bodySide: "Left",
    bodyPartSides: {},
    bodyMultiSelect: false,
    injuryDescription: "",
    immediateActions: [],
    actionNotes: "",
    suggestedFollowUp: [],
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
  if (form.severity === "first-aid") {
    return form;
  }

  return {
    ...form,
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

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

/**
 * Fields whose text can be accepted from an AI draft. These exact names are
 * what the backend stores in `AiAssistedFields`.
 */
export type AiAssistedFieldName =
  | "description"
  | "injuryDescription"
  | "actionNotes";

/**
 * One follow-up action in the Immediate Response step.
 *
 * Unselected items stay in state and are still submitted — declining a
 * suggestion is information worth keeping, and it is the only way "the
 * assistant proposed this and a human rejected it" stays answerable.
 */
export type ReportFollowUpItem = Readonly<{
  /** Client-side key only. Never sent; the backend assigns real ids. */
  id: string;
  text: string;
  isAiSuggested: boolean;
  isSelected: boolean;
}>;

/**
 * Drafts from one `draft-assist` call, held until the reporter accepts or
 * dismisses each one. `null` means either "the model returned nothing for this
 * field" or "already dealt with" — both render as nothing at all, which is the
 * same outcome, so they don't need telling apart.
 */
export type ReportAiDrafts = Readonly<{
  injuryDescription: string | null;
  actionNotes: string | null;
}>;

export const EMPTY_AI_DRAFTS: ReportAiDrafts = {
  injuryDescription: null,
  actionNotes: null,
};

/** Records that a field's text came from a draft. Accepting twice is a no-op. */
export function markAiAssisted(
  current: readonly AiAssistedFieldName[],
  field: AiAssistedFieldName,
): readonly AiAssistedFieldName[] {
  return current.includes(field) ? current : [...current, field];
}

let followUpKeySeq = 0;

/**
 * Ids are generated in event handlers only, never during render, so they can't
 * cause a hydration mismatch.
 */
export function createFollowUpItem(
  text: string,
  options: Readonly<{ isAiSuggested: boolean; isSelected?: boolean }>,
): ReportFollowUpItem {
  followUpKeySeq += 1;

  return {
    id: `follow-up-${String(followUpKeySeq)}`,
    text,
    isAiSuggested: options.isAiSuggested,
    isSelected: options.isSelected ?? true,
  };
}

/**
 * Replaces the AI-suggested follow-ups with a fresh set while keeping every
 * item the reporter typed themselves. Regenerating a draft must never discard
 * their own work.
 */
export function replaceAiFollowUps(
  current: readonly ReportFollowUpItem[],
  suggestions: readonly string[],
): readonly ReportFollowUpItem[] {
  const own = current.filter((item) => !item.isAiSuggested);
  const suggested = suggestions.map((text) =>
    createFollowUpItem(text, { isAiSuggested: true }),
  );

  return [...suggested, ...own];
}

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
  /** AI-suggested and reporter-typed follow-ups, selected or not. */
  followUps: readonly ReportFollowUpItem[];
  /**
   * Which fields the reporter accepted an AI draft into. Marked on Accept and
   * kept marked even if they then edit the text — partial provenance is the
   * honest record for what is an OSHA-relevant document.
   */
  aiAssistedFields: readonly AiAssistedFieldName[];
  /** Pending drafts for steps 3 and 4. */
  aiDrafts: ReportAiDrafts;
  /**
   * The description the current drafts were generated from. Compared against
   * the live description to spot a stale draft when the reporter goes back to
   * step 2 and edits; `""` means nothing has been drafted yet.
   */
  aiDraftSource: string;
  /** True while a draft-assist call is in flight. */
  aiDraftPending: boolean;
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
    followUps: [],
    aiAssistedFields: [],
    aiDrafts: EMPTY_AI_DRAFTS,
    aiDraftSource: "",
    aiDraftPending: false,
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

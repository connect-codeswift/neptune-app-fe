import type { SeverityId } from "./report-severity";
import type { ReportPhotoFile } from "./report-attachments";
import type { InjuryLevelId } from "./report-injury-level";
import type { BodyPartId, BodySide } from "./report-body-parts";
import { CLASSIFICATION_FIELDS } from "./report-classification";
import { DEFAULT_REPORT_PHOTOS } from "./report-attachments";

export type ReportIncidentFormState = Readonly<{
  severity: SeverityId;
  affectedPerson: string;
  location: string;
  reportedBy: string;
  reporterEmail: string;
  incidentDate: string;
  incidentTime: string;
  reportDate: string;
  classifications: Record<string, "Yes" | "No">;
  description: string;
  title: string;
  initialTreatment: string;
  secondaryTreatment: "Yes" | "No";
  mechanismOfInjury: string;
  natureOfInjury: string;
  objectInvolved: string;
  oshaNotificationRequired: "Yes" | "No";
  witnesses: string;
  photos: readonly ReportPhotoFile[];
  injuryLevel: InjuryLevelId;
  gender: string;
  bodyParts: readonly BodyPartId[];
  bodySide: BodySide;
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
    classifications: Object.fromEntries(
      CLASSIFICATION_FIELDS.map((field) => [field.id, field.defaultValue]),
    ) as Record<string, "Yes" | "No">,
    description: "",
    title: "",
    initialTreatment: "",
    secondaryTreatment: "No",
    mechanismOfInjury: "",
    natureOfInjury: "",
    objectInvolved: "",
    oshaNotificationRequired: "No",
    witnesses: "",
    photos: DEFAULT_REPORT_PHOTOS,
    injuryLevel: "no-injury",
    gender: "",
    bodyParts: [],
    bodySide: "Left",
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

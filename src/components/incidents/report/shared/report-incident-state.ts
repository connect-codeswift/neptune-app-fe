import type { SeverityId } from "./report-severity";
import type { ReportPhotoFile } from "./report-attachments";
import type { InjuryLevelId } from "./report-injury-level";
import type { BodyPartId, BodySide } from "./report-body-parts";
import { CLASSIFICATION_FIELDS } from "./report-classification";
import { DEFAULT_REPORT_PHOTOS } from "./report-attachments";

export const DEFAULT_INCIDENT_DESCRIPTION =
  "During second-shift operation, the high-pressure hose on press #4 ruptured at the coupling. Fluid contained within the guarding; no operator contact. Press isolated under LOTO pending hose replacement.";

export const DEFAULT_INJURY_DESCRIPTION =
  "Minor laceration on dorsal side of left hand, ~2cm. Bandaged on-site; sent to clinic for evaluation as a precaution.";

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
}>;

export function createInitialReportFormState(): ReportIncidentFormState {
  return {
    severity: "osha",
    affectedPerson: "Maria Lopez · EMP-04821",
    location: "Plant A · Line 2 — Press #4",
    reportedBy: "Nadir Khan",
    reporterEmail: "nadir.khan@codeswift.org",
    incidentDate: "04/24/2026",
    incidentTime: "09:12 AM",
    reportDate: "04/24/2026",
    classifications: Object.fromEntries(
      CLASSIFICATION_FIELDS.map((field) => [field.id, field.defaultValue]),
    ) as Record<string, "Yes" | "No">,
    description: DEFAULT_INCIDENT_DESCRIPTION,
    title: "Hydraulic press hose rupture — Line 2",
    initialTreatment: "minor-clinic",
    secondaryTreatment: "No",
    mechanismOfInjury: "equipment-failure",
    natureOfInjury: "laceration",
    objectInvolved: "Hydraulic hose coupling",
    oshaNotificationRequired: "No",
    witnesses: "Maria Lopez, Jake Bell",
    photos: DEFAULT_REPORT_PHOTOS,
    injuryLevel: "medical-treatment",
    gender: "Male",
    bodyParts: ["hand-wrist"],
    bodySide: "Left",
    bodyMultiSelect: false,
    injuryDescription: DEFAULT_INJURY_DESCRIPTION,
    immediateActions: ["area-cordoned", "loto", "first-aid", "photos-captured"],
    actionNotes: "Maintenance dispatched, ETA 2h. Replacement hose ordered. Press will remain isolated under LOTO until repair complete and verified.",
    suggestedFollowUp: ["root-cause", "sop-review", "brief-operators"],
  };
}

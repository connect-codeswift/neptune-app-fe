export type ReportStepId = 1 | 2 | 3 | 4 | 5;

export type ReportStep = Readonly<{
  id: ReportStepId;
  title: string;
  description: string;
}>;

export const REPORT_STEPS: readonly ReportStep[] = [
  {
    id: 1,
    title: "What happened",
    description: "Type, severity, time, location",
  },
  {
    id: 2,
    title: "Details",
    description: "Description, photos, witnesses",
  },
  {
    id: 3,
    title: "People & injury",
    description: "Injuries, body part, treatment",
  },
  {
    id: 4,
    title: "Immediate response",
    description: "Actions already taken",
  },
  {
    id: 5,
    title: "Review & submit",
    description: "Check before submitting",
  },
];

export type SeverityId =
  | "first-aid"
  | "osha"
  | "lost-time"
  | "sia"
  | "sip";

export type SeverityOption = Readonly<{
  id: SeverityId;
  label: string;
  lines: readonly string[];
  previewBadge: string;
}>;

export const SEVERITY_OPTIONS: readonly SeverityOption[] = [
  { id: "first-aid", label: "First Aid", lines: ["First Aid"], previewBadge: "Low" },
  {
    id: "osha",
    label: "OSHA Recordable",
    lines: ["OSHA", "Recordable"],
    previewBadge: "Medium",
  },
  {
    id: "lost-time",
    label: "Lost Time",
    lines: ["Lost Time"],
    previewBadge: "High",
  },
  { id: "sia", label: "SIA", lines: ["SIA"], previewBadge: "Critical" },
  { id: "sip", label: "SIP", lines: ["SIP"], previewBadge: "Critical" },
];

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

export type ReportAttachmentKind = "image" | "pdf";

export type ReportPhotoFile = Readonly<{
  id: string;
  publicId?: string;
  name: string;
  sizeLabel: string;
  bytes?: number;
  url?: string;
  secureUrl?: string;
  mimeType?: string;
  format?: string;
  resourceType?: "image" | "raw" | "video" | "auto";
  kind?: ReportAttachmentKind;
  /** Local object URL used while uploading / as optimistic preview */
  previewUrl?: string;
  isUploading?: boolean;
  error?: string;
}>;

export const INITIAL_TREATMENT_OPTIONS = [
  {
    value: "minor-clinic",
    label: "Minor clinic/hospital medical remedies and diagnostic testing",
  },
  { value: "first-aid-on-site", label: "First aid on site" },
  { value: "none", label: "None" },
  { value: "emergency", label: "Emergency care / ER" },
] as const;

export const MECHANISM_OPTIONS = [
  { value: "equipment-failure", label: "Equipment Failure" },
  { value: "slip-trip-fall", label: "Slip / trip / fall" },
  { value: "struck-by", label: "Struck by object" },
  { value: "caught-in", label: "Caught in / between" },
  { value: "other", label: "Other" },
] as const;

export const NATURE_OF_INJURY_OPTIONS = [
  { value: "laceration", label: "Laceration / cut" },
  { value: "bruise", label: "Bruise / contusion" },
  { value: "sprain", label: "Sprain / strain" },
  { value: "burn", label: "Burn" },
  { value: "none", label: "No injury" },
] as const;

export const DEFAULT_REPORT_PHOTOS: readonly ReportPhotoFile[] = [];

export type InjuryLevelId =
  | "no-injury"
  | "first-aid"
  | "medical-treatment"
  | "lost-time";

export type InjuryLevelOption = Readonly<{
  id: InjuryLevelId;
  label: string;
  description: string;
}>;

export const INJURY_LEVEL_OPTIONS: readonly InjuryLevelOption[] = [
  {
    id: "no-injury",
    label: "No injury",
    description: "No one was hurt",
  },
  {
    id: "first-aid",
    label: "First aid only",
    description: "Treated on-site",
  },
  {
    id: "medical-treatment",
    label: "Medical treatment",
    description: "Off-site care needed",
  },
  {
    id: "lost-time",
    label: "Lost time",
    description: "Could not return to work",
  },
];

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Non-binary", label: "Non-binary" },
  { value: "Prefer not to say", label: "Prefer not to say" },
] as const;

export type BodyPartId =
  | "head-face"
  | "neck"
  | "chest-shoulders"
  | "arm"
  | "hand-wrist"
  | "abdomen"
  | "hip-pelvis"
  | "leg-knee"
  | "foot-ankle"
  | "back";

export type BodyPartOption = Readonly<{
  id: BodyPartId;
  label: string;
  sided?: boolean;
}>;

export const BODY_PART_OPTIONS: readonly BodyPartOption[] = [
  { id: "head-face", label: "Head / face" },
  { id: "neck", label: "Neck" },
  { id: "chest-shoulders", label: "Chest / shoulders" },
  { id: "arm", label: "Arm", sided: true },
  { id: "hand-wrist", label: "Hand / wrist", sided: true },
  { id: "abdomen", label: "Abdomen" },
  { id: "hip-pelvis", label: "Hip / pelvis" },
  { id: "leg-knee", label: "Leg / knee", sided: true },
  { id: "foot-ankle", label: "Foot / ankle", sided: true },
  { id: "back", label: "Back" },
];

export type BodySide = "Left" | "Right";

export const STEP_TIPS: Record<ReportStepId, string> = {
  1: "Pick a type that fits — when unsure, choose the higher severity. EHS will adjust if needed.",
  2: 'A clear title beats a perfect one. "Hose rupture, Line 2" is great. Photos help everyone.',
  3: "First aid means treatment beyond a band-aid. Lost time = unable to return for the next shift.",
  4: "Note actions already taken — isolation, LOTO, notifications, and containment.",
  5: "Review classifications and attachments before submitting to EHS.",
};

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
  };
}

export function formatBodyPartSelection(
  bodyParts: readonly BodyPartId[],
  bodySide: BodySide,
): string {
  if (bodyParts.length === 0) {
    return "None selected";
  }

  const labels = bodyParts.map(
    (id) => BODY_PART_OPTIONS.find((part) => part.id === id)?.label ?? id,
  );
  const primary = BODY_PART_OPTIONS.find((part) => part.id === bodyParts[0]);
  const showSide = primary?.sided !== false && bodyParts.some((id) => {
    const option = BODY_PART_OPTIONS.find((part) => part.id === id);
    return option?.sided;
  });

  if (labels.length === 1) {
    return showSide ? `${labels[0]} · ${bodySide}` : labels[0];
  }

  return showSide
    ? `${labels.join(", ")} · ${bodySide}`
    : labels.join(", ");
}

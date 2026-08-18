export type HazcomSignalWord = "Danger" | "Warning";

export type HazcomPictogram =
  | "Flammable"
  | "Toxic"
  | "Irritant"
  | "Environmental"
  | "Corrosive"
  | "Oxidizer"
  | "Explosive"
  | "Compressed Gas"
  | "Health Hazard";

export type HazcomChemicalStatus = "Active" | "Inactive";

export type HazcomStatementCode = Readonly<{
  code: string; // "H314", "P260"
  text: string;
}>;

export type HazcomChemical = Readonly<{
  id: string; // "C001"
  name: string; // "Hydrochloric Acid"
  casNumber: string; // "7647-01-0"
  location: string; // "Lab 1 - Room 131"
  disposeLocation: string | null;
  quantity: string; // "15 Liters"
  hazardClass: string; // "Corrosive"
  pictograms: readonly HazcomPictogram[];
  signalWord: HazcomSignalWord;
  status: HazcomChemicalStatus;
  sdsRecordId: string | null; // "SDS-001"
  sdsFileName: string | null; // "SDS_Hydrochloric_Acid_Rev2026.pdf"
  storageNotes: string;
  hazardStatements: readonly HazcomStatementCode[];
  precautionaryStatements: readonly HazcomStatementCode[];
  addedOn: string; // ISO "2026-03-14"
}>;

export type HazcomSdsStatus = "Compliant" | "Due Soon" | "Overdue";

export type HazcomSdsRecord = Readonly<{
  id: string; // "SDS-001"
  chemicalName: string;
  manufacturer: string; // "Sigma-Aldrich"
  casNumber: string;
  hazardClass: string;
  signalWord: HazcomSignalWord;
  pictograms: readonly HazcomPictogram[];
  revisedOn: string; // ISO "2025-08-01"
  version: string; // "v4.1"
  status: HazcomSdsStatus;
}>;

export type HazcomSdsSection = Readonly<{
  number: number; // 1..16
  title: string; // "Identification"
  body: readonly string[]; // paragraphs
}>;

export type HazcomTrainingMaterial = Readonly<{
  id?: number;
  fileUrl: string;
  fileName: string;
  fileType?: string | null;
}>;

export type HazcomTrainingStatus = "Completed" | "Scheduled";

export type HazcomTrainingSession = Readonly<{
  id: string; // "TR-001"
  date: string; // ISO
  trainer: string; // "TBD" when scheduled
  topic: string;
  chemicals: readonly string[];
  attendees: number;
  /** Server-assigned; `null` when the API has not set a status. */
  status: HazcomTrainingStatus | null;
  materials: readonly HazcomTrainingMaterial[];
  notes: string;
}>;

export type HazcomRiskLevel = "Low" | "Medium" | "High" | "Critical";
export type HazcomAssessmentStatus = "Approved" | "Pending" | "Draft";

export type HazcomHazardRatings = Readonly<{
  health: number; // 0-4
  flammability: number; // 0-4
  reactivity: number; // 0-4
  ppeIndex: number; // 0-4
}>;

export type HazcomRiskAssessment = Readonly<{
  id: string; // "RA-001"
  chemical: string;
  exposureScenario: string; // "Tank filling - 60 min"
  exposureMinutes: number;
  frequency: string; // "Daily"
  ratings: HazcomHazardRatings;
  riskLevel: HazcomRiskLevel;
  status: HazcomAssessmentStatus;
  reviewer: string;
  date: string; // ISO
  ppe: readonly string[];
  controls: string;
}>;

export type HazcomBadgeTone =
  "neutral" | "teal" | "muted" | "danger" | "warn" | "success";

const RISK_LEVEL_LOW_MAX = 3;
const RISK_LEVEL_MEDIUM_MAX = 7;
const RISK_LEVEL_HIGH_MAX = 11;

/** Sum of the four 0-4 hazard ratings; max 16. */
export function hazcomRiskScore(ratings: HazcomHazardRatings): number {
  return (
    ratings.health +
    ratings.flammability +
    ratings.reactivity +
    ratings.ppeIndex
  );
}

/** 0-3 Low, 4-7 Medium, 8-11 High, 12-16 Critical. */
export function hazcomRiskLevel(score: number): HazcomRiskLevel {
  if (score <= RISK_LEVEL_LOW_MAX) {
    return "Low";
  }

  if (score <= RISK_LEVEL_MEDIUM_MAX) {
    return "Medium";
  }

  if (score <= RISK_LEVEL_HIGH_MAX) {
    return "High";
  }

  return "Critical";
}

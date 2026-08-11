import {
  hazcomRiskLevel,
  hazcomRiskScore,
  type HazcomAssessmentStatus,
  type HazcomRiskAssessment,
  type HazcomRiskLevel,
} from "@/components/hazcom/shared";
import {
  asBoolean,
  asLeadingNumber,
  asNumber,
  asString,
  isRecord,
  readProp,
  toIsoDate,
  toStringList,
} from "@/services/mappers/record-readers";

/**
 * Maps rows from the /api/hazcom/risk-assessment endpoints onto the
 * `HazcomRiskAssessment` shape the assessments table renders.
 */

const RISK_LEVELS: readonly HazcomRiskLevel[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

/** Falls back to recomputing from the ratings when the column is blank. */
function toRiskLevel(value: unknown, score: number): HazcomRiskLevel {
  const lower = asString(value).trim().toLowerCase();
  const known = RISK_LEVELS.find((level) => level.toLowerCase() === lower);

  return known ?? hazcomRiskLevel(score);
}

/**
 * The schema has `isDraft` but no status column, so a draft reads as Draft
 * and anything submitted reads as Pending until a status field appears.
 */
function toAssessmentStatus(
  value: unknown,
  isDraft: boolean,
): HazcomAssessmentStatus {
  const lower = asString(value).trim().toLowerCase();
  if (lower === "approved") {
    return "Approved";
  }
  if (lower === "pending") {
    return "Pending";
  }
  if (lower === "draft") {
    return "Draft";
  }

  return isDraft ? "Draft" : "Pending";
}

function mapRiskAssessmentDtoToHazcomAssessment(
  raw: unknown,
): HazcomRiskAssessment {
  const record = isRecord(raw) ? raw : {};

  const ratings = {
    health: asNumber(
      readProp(record, "hazardHealthRating", "HazardHealthRating"),
    ),
    flammability: asNumber(
      readProp(record, "hazardFlammabilityRating", "HazardFlammabilityRating"),
    ),
    reactivity: asNumber(
      readProp(record, "hazardReactivityRating", "HazardReactivityRating"),
    ),
    ppeIndex: asNumber(
      readProp(record, "hazardPpeIndexRating", "HazardPpeIndexRating"),
    ),
  };

  const isDraft = asBoolean(readProp(record, "isDraft", "IsDraft"));
  const score = asNumber(
    readProp(record, "riskScore", "RiskScore"),
    hazcomRiskScore(ratings),
  );

  return {
    id: asString(readProp(record, "id", "Id")),
    // The write body takes `chemicalId`; a name only appears if the response
    // joins it in, so the id is the fallback label.
    chemical: asString(
      readProp(
        record,
        "chemicalName",
        "ChemicalName",
        "chemi_Name",
        "chemical",
        "Chemical",
        "chemicalId",
        "ChemicalId",
      ),
    ),
    exposureScenario: asString(
      readProp(record, "description", "Description", "exposureScenario"),
    ),
    exposureMinutes: asLeadingNumber(
      readProp(record, "exposureDuration", "ExposureDuration"),
    ),
    frequency: asString(readProp(record, "frequency", "Frequency")),
    ratings,
    riskLevel: toRiskLevel(readProp(record, "riskLevel", "RiskLevel"), score),
    status: toAssessmentStatus(readProp(record, "status", "Status"), isDraft),
    // Not a column on this API — the table shows it blank until one exists.
    reviewer: asString(readProp(record, "reviewer", "Reviewer", "reviewedBy")),
    date: toIsoDate(
      readProp(record, "createdAt", "CreatedAt", "createdDate", "date", "Date"),
    ),
    ppe: toStringList(readProp(record, "recommendedPpe", "RecommendedPpe")),
    controls: asString(readProp(record, "notes", "Notes", "controls")),
  };
}

export function mapRiskAssessmentDtosToHazcomAssessments(
  rows: readonly unknown[],
): HazcomRiskAssessment[] {
  return rows.map((row) => mapRiskAssessmentDtoToHazcomAssessment(row));
}

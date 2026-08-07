import type { DashboardKpisDto } from "@/dtos/res/ehs-command-center-response.dto";
import {
  asNumber,
  isRecord,
  readProp,
} from "@/services/mappers/record-readers";

function readNumberList(raw: unknown): number[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => asNumber(entry))
    .filter((entry): entry is number => entry != null);
}

function normalizeHazardsByCategory(raw: unknown): DashboardKpisDto["hazardsByCategory"] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => {
      if (!isRecord(entry)) {
        return null;
      }

      const category = readProp(entry, "category", "Category");
      const count = asNumber(readProp(entry, "count", "Count"));

      if (typeof category !== "string" || count == null) {
        return null;
      }

      return { category, count };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry != null);
}

/** Normalizes GET /api/EHSCommandCenter/GetMainDashboardKpis (camelCase or PascalCase). */
export function normalizeDashboardKpisDto(raw: unknown): DashboardKpisDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    siteId: asNumber(readProp(raw, "siteId", "SiteId")),
    trir: asNumber(readProp(raw, "trir", "Trir", "TRIR")),
    trirTarget: asNumber(readProp(raw, "trirTarget", "TrirTarget")),
    trirTrend: readNumberList(readProp(raw, "trirTrend", "TrirTrend")),
    lostTimeInjuryRate: asNumber(
      readProp(raw, "lostTimeInjuryRate", "LostTimeInjuryRate"),
    ),
    lostTimeInjuryRateTarget: asNumber(
      readProp(raw, "lostTimeInjuryRateTarget", "LostTimeInjuryRateTarget"),
    ),
    lostTimeInjuryRateTrend: readNumberList(
      readProp(raw, "lostTimeInjuryRateTrend", "LostTimeInjuryRateTrend"),
    ),
    totalCompliance: asNumber(
      readProp(raw, "totalCompliance", "TotalCompliance"),
    ),
    compliantCount: asNumber(readProp(raw, "compliantCount", "CompliantCount")),
    compliancePercentage: asNumber(
      readProp(raw, "compliancePercentage", "CompliancePercentage"),
    ),
    complianceTarget: asNumber(
      readProp(raw, "complianceTarget", "ComplianceTarget"),
    ),
    totalCapa: asNumber(readProp(raw, "totalCapa", "TotalCapa")),
    closedCapaCount: asNumber(
      readProp(raw, "closedCapaCount", "ClosedCapaCount"),
    ),
    capaClosurePercentage: asNumber(
      readProp(raw, "capaClosurePercentage", "CapaClosurePercentage"),
    ),
    capaClosureTarget: asNumber(
      readProp(raw, "capaClosureTarget", "CapaClosureTarget"),
    ),
    hazardsByCategory: normalizeHazardsByCategory(
      readProp(raw, "hazardsByCategory", "HazardsByCategory"),
    ),
    workHoursYtd: asNumber(readProp(raw, "workHoursYtd", "WorkHoursYtd")),
    recordableCountYtd: asNumber(
      readProp(raw, "recordableCountYtd", "RecordableCountYtd"),
    ),
    lostTimeCountYtd: asNumber(
      readProp(raw, "lostTimeCountYtd", "LostTimeCountYtd"),
    ),
    ratesAvailable:
      typeof readProp(raw, "ratesAvailable", "RatesAvailable") === "boolean"
        ? (readProp(raw, "ratesAvailable", "RatesAvailable") as boolean)
        : undefined,
  };
}

import type {
  AuditDetail,
  AuditItemBreakdown,
} from "@/app/dashboard/audits/audits-data";
import type { InspectionDetail } from "@/app/dashboard/inspections/inspections-data";
import type { StatMetricCardProps } from "@/components/StatMetricCard";
import type {
  AuditInspectionDetailSummaryDto,
  AuditInspectionSummaryDto,
} from "@/dtos/res/audit-inspection-dashboard.dto";
import {
  asNumber,
  isRecord,
  readProp,
} from "@/services/mappers/record-readers";

/** Normalise summary KPI payload (camelCase or PascalCase). */
export function normalizeSummaryDto(
  raw: unknown,
): AuditInspectionSummaryDto | null {
  if (!isRecord(raw)) return null;

  const averageScoreRaw = readProp(raw, "averageScore", "AverageScore");
  const averageScore =
    averageScoreRaw === null || averageScoreRaw === undefined
      ? null
      : (asNumber(averageScoreRaw) ?? null);

  return {
    total: asNumber(readProp(raw, "total", "Total")) ?? 0,
    scheduled: asNumber(readProp(raw, "scheduled", "Scheduled")) ?? 0,
    inProgress: asNumber(readProp(raw, "inProgress", "InProgress")) ?? 0,
    submitted: asNumber(readProp(raw, "submitted", "Submitted")) ?? 0,
    completed: asNumber(readProp(raw, "completed", "Completed")) ?? 0,
    overdue: asNumber(readProp(raw, "overdue", "Overdue")) ?? 0,
    completionRate:
      asNumber(readProp(raw, "completionRate", "CompletionRate")) ?? 0,
    averageScore,
    auditsYtd: asNumber(readProp(raw, "auditsYtd", "AuditsYtd")) ?? undefined,
    inspectionsYtd:
      asNumber(readProp(raw, "inspectionsYtd", "InspectionsYtd")) ?? undefined,
    openFindings:
      asNumber(readProp(raw, "openFindings", "OpenFindings")) ?? 0,
    onTimeClosureRate:
      asNumber(readProp(raw, "onTimeClosureRate", "OnTimeClosureRate")) ?? 0,
    avgFindingsPerAudit:
      asNumber(
        readProp(raw, "avgFindingsPerAudit", "AvgFindingsPerAudit"),
      ) ?? undefined,
    avgFindingsPerInspection:
      asNumber(
        readProp(raw, "avgFindingsPerInspection", "AvgFindingsPerInspection"),
      ) ?? undefined,
  };
}

function formatRate(value: number): string {
  const rounded =
    Number.isInteger(value) || Math.abs(value - Math.round(value)) < 0.05
      ? String(Math.round(value))
      : value.toFixed(1);
  return `${rounded}%`;
}

function formatAverage(value: number): string {
  return Number.isInteger(value) || Math.abs(value - Math.round(value)) < 0.05
    ? String(Math.round(value))
    : value.toFixed(1);
}

/** Map summary KPIs onto the four dashboard metric cards. */
export function mapSummaryToMetrics(
  dto: AuditInspectionSummaryDto | null | undefined,
  module: "audit" | "inspection",
): readonly StatMetricCardProps[] {
  const ytd =
    module === "audit"
      ? (dto?.auditsYtd ?? dto?.total ?? 0)
      : (dto?.inspectionsYtd ?? dto?.total ?? 0);

  const avgFindings =
    module === "audit"
      ? (dto?.avgFindingsPerAudit ?? 0)
      : (dto?.avgFindingsPerInspection ?? 0);

  return [
    {
      title: module === "audit" ? "Audits YTD" : "Inspections YTD",
      value: ytd,
    },
    {
      title: "Open findings",
      value: dto?.openFindings ?? 0,
    },
    {
      title: "On-time closure",
      value: formatRate(dto?.onTimeClosureRate ?? 0),
    },
    {
      title:
        module === "audit" ? "Avg findings/audit" : "Avg findings/inspection",
      value: formatAverage(avgFindings),
    },
  ];
}

/** Normalise detail-summary payload (camelCase or PascalCase). */
export function normalizeDetailSummaryDto(
  raw: unknown,
): AuditInspectionDetailSummaryDto | null {
  if (!isRecord(raw)) return null;

  const topFindingsRaw = readProp(raw, "topFindings", "TopFindings");
  const topFindings = Array.isArray(topFindingsRaw)
    ? topFindingsRaw.filter((entry): entry is string => typeof entry === "string")
    : [];

  return {
    auditId:
      asNumber(readProp(raw, "auditId", "AuditId")) ?? undefined,
    inspectionId:
      asNumber(readProp(raw, "inspectionId", "InspectionId")) ?? undefined,
    auditTitle:
      (readProp(raw, "auditTitle", "AuditTitle") as string | undefined) ??
      undefined,
    inspectionTitle:
      (readProp(raw, "inspectionTitle", "InspectionTitle") as
        | string
        | undefined) ?? undefined,
    auditCode:
      (readProp(raw, "auditCode", "AuditCode") as string | undefined) ??
      undefined,
    inspectionCode:
      (readProp(raw, "inspectionCode", "InspectionCode") as
        | string
        | undefined) ?? undefined,
    progressPct: asNumber(readProp(raw, "progressPct", "ProgressPct")) ?? 0,
    totalItems: asNumber(readProp(raw, "totalItems", "TotalItems")) ?? 0,
    passCount: asNumber(readProp(raw, "passCount", "PassCount")) ?? 0,
    actionCount: asNumber(readProp(raw, "actionCount", "ActionCount")) ?? 0,
    criticalCount:
      asNumber(readProp(raw, "criticalCount", "CriticalCount")) ?? 0,
    pendingCount: asNumber(readProp(raw, "pendingCount", "PendingCount")) ?? 0,
    topFindings,
  };
}

function toItemBreakdown(
  dto: AuditInspectionDetailSummaryDto,
): AuditItemBreakdown {
  return {
    pass: dto.passCount,
    action: dto.actionCount,
    critical: dto.criticalCount,
    pending: dto.pendingCount,
  };
}

export function mapAuditDetailSummaryToDetail(
  dto: AuditInspectionDetailSummaryDto,
): AuditDetail {
  const id = dto.auditId ?? dto.inspectionId ?? 0;
  return {
    id: String(id),
    code: dto.auditCode ?? dto.inspectionCode,
    title: dto.auditTitle ?? dto.inspectionTitle ?? "Untitled audit",
    progress: dto.progressPct,
    items: toItemBreakdown(dto),
    topFindings: dto.topFindings,
  };
}

export function mapInspectionDetailSummaryToDetail(
  dto: AuditInspectionDetailSummaryDto,
): InspectionDetail {
  const id = dto.inspectionId ?? dto.auditId ?? 0;
  return {
    id: String(id),
    code: dto.inspectionCode ?? dto.auditCode,
    title: dto.inspectionTitle ?? dto.auditTitle ?? "Untitled inspection",
    progress: dto.progressPct,
    items: toItemBreakdown(dto),
    topFindings: dto.topFindings,
  };
}

/** Format average score for display; null → em dash. */

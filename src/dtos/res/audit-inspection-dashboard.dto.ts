import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** Shared KPI payload from GET /api/v1/audits/summary and GET /api/v1/inspections/summary. */
export type AuditInspectionSummaryDto = {
  total: number;
  scheduled: number;
  inProgress: number;
  submitted: number;
  completed: number;
  overdue: number;
  completionRate: number;
  averageScore: number | null;
  /** Audit module — year-to-date count. */
  auditsYtd?: number;
  /** Inspection module — year-to-date count. */
  inspectionsYtd?: number;
  openFindings: number;
  onTimeClosureRate: number;
  avgFindingsPerAudit?: number;
  avgFindingsPerInspection?: number;
};

export type GetAuditSummaryResponseDto =
  ApiEnvelopeDto<AuditInspectionSummaryDto | null>;

export type GetInspectionSummaryResponseDto =
  ApiEnvelopeDto<AuditInspectionSummaryDto | null>;

/** Donut + top findings from GET /api/{Module}/{id}/detail-summary. */
export type AuditInspectionDetailSummaryDto = {
  auditId?: number;
  inspectionId?: number;
  auditTitle?: string;
  inspectionTitle?: string;
  auditCode?: string;
  inspectionCode?: string;
  progressPct: number;
  totalItems: number;
  passCount: number;
  actionCount: number;
  criticalCount: number;
  pendingCount: number;
  topFindings: string[];
};

export type GetAuditDetailSummaryResponseDto =
  ApiEnvelopeDto<AuditInspectionDetailSummaryDto | null>;

export type GetInspectionDetailSummaryResponseDto =
  ApiEnvelopeDto<AuditInspectionDetailSummaryDto | null>;

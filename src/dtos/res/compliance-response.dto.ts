import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** Row from GET /api/Compliance/{id} and list endpoints. */
export type ComplianceDto = {
  id?: number | null;
  code?: string | null;
  title?: string | null;
  category?: string | null;
  jurisdiction?: string | null;
  regulatoryBody?: string | null;
  dueDate?: string | null;
  nextDue?: string | null;
  recurrence?: string | null;
  responsiblePersonId?: number | null;
  responsiblePerson?: string | null;
  priority?: string | null;
  status?: string | null;
  completedDate?: string | null;
  completedBy?: number | null;
  completedByName?: string | null;
  evidenceUrls?: readonly string[] | null;
  markComplete?: boolean | null;
};

/** dataModel from PUT /api/Compliance/Update (mark complete). */
export type ComplianceUpdateResultDto = Readonly<{
  complianceId?: number | null;
  nextCycleId?: number | null;
  nextCycleDueDate?: string | null;
}>;

export type GetAllCompliancesResultDto = {
  items: ComplianceDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
};

export type GetAllCompliancesResponseDto = ApiEnvelopeDto<
  GetAllCompliancesResultDto | ComplianceDto[] | null
>;

/** dataModel shape for GET /api/Compliance/dashboard-kpis. */
export type ComplianceDashboardKpisDto = {
  obligationsTracked?: number | null;
  compliant?: number | null;
  dueIn60Days?: number | null;
  actionRequired?: number | null;
};

export type GetComplianceDashboardKpisResponseDto =
  ApiEnvelopeDto<ComplianceDashboardKpisDto | null>;

/** One entry of GET /api/Compliance/category-stats. */
export type ComplianceCategoryStatDto = {
  category?: string | null;
  /** Compliant / completed obligation count for this category. */
  compliant?: number | null;
  /** Total obligations tracked in this category. */
  total?: number | null;
  /** API alias for `compliant` (normalized in the mapper). */
  completedCount?: number | null;
  /** API alias for `total` (normalized in the mapper). */
  totalCount?: number | null;
};

export type GetComplianceCategoryStatsResponseDto = ApiEnvelopeDto<
  ComplianceCategoryStatDto[] | null
>;

/** One entry of GET /api/Compliance/upcoming-filings. */
export type ComplianceUpcomingFilingDto = {
  id?: number | null;
  title?: string | null;
  code?: string | null;
  dueDate?: string | null;
  nextDue?: string | null;
  jurisdiction?: string | null;
  responsiblePerson?: string | null;
  status?: string | null;
  regulatoryBody?: string | null;
};

export type GetComplianceUpcomingFilingsResponseDto = ApiEnvelopeDto<
  ComplianceUpcomingFilingDto[] | null
>;

/** One entry of GET /api/Compliance/calendar. */
export type ComplianceCalendarEventDto = {
  id?: number | null;
  title?: string | null;
  code?: string | null;
  dueDate?: string | null;
  nextDue?: string | null;
  jurisdiction?: string | null;
  status?: string | null;
  regulatoryBody?: string | null;
  category?: string | null;
};

export type GetComplianceCalendarResponseDto = ApiEnvelopeDto<
  ComplianceCalendarEventDto[] | null
>;

export type AddComplianceResponseDto = ApiEnvelopeDto<ComplianceDto | null>;

export type GetComplianceByIdResponseDto = ApiEnvelopeDto<ComplianceDto | null>;

export type UpdateComplianceResponseDto = ApiEnvelopeDto<
  ComplianceUpdateResultDto | ComplianceDto | null
>;

export type DeleteComplianceResponseDto = ApiEnvelopeDto<unknown>;

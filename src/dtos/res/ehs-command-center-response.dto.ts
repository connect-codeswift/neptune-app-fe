import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** One entry of `hazardsByCategory` on GET /api/EHSCommandCenter/GetMainDashboardKpis. */
export type HazardCategoryCountDto = {
  category?: string | null;
  count?: number | null;
};

/** dataModel shape for GET /api/EHSCommandCenter/GetMainDashboardKpis. */
export type DashboardKpisDto = {
  siteId?: number | null;
  /** OSHA recordable injury rate (cases × 200,000 ÷ hours worked YTD). */
  trir?: number | null;
  trirTarget?: number | null;
  trirTrend?: readonly number[] | null;
  /** Lost-time injury rate (LTI cases × 200,000 ÷ hours worked YTD). */
  lostTimeInjuryRate?: number | null;
  lostTimeInjuryRateTarget?: number | null;
  lostTimeInjuryRateTrend?: readonly number[] | null;
  totalCompliance?: number | null;
  compliantCount?: number | null;
  compliancePercentage?: number | null;
  complianceTarget?: number | null;
  totalCapa?: number | null;
  closedCapaCount?: number | null;
  capaClosurePercentage?: number | null;
  capaClosureTarget?: number | null;
  hazardsByCategory?: HazardCategoryCountDto[] | null;
  workHoursYtd?: number | null;
  recordableCountYtd?: number | null;
  lostTimeCountYtd?: number | null;
  ratesAvailable?: boolean | null;
};

export type GetMainDashboardKpisResponseDto = ApiEnvelopeDto<DashboardKpisDto | null>;

/** One weekly bucket of GET /api/EHSCommandCenter/GetIncidentTrends. */
export type IncidentTrendWeekDto = {
  week?: string | null;
  weekStart?: string | null;
  incidents?: number | null;
  nearMisses?: number | null;
  hazards?: number | null;
};

/** dataModel shape for GET /api/EHSCommandCenter/GetIncidentTrends. */
export type IncidentTrendsDto = {
  siteId?: number | null;
  weeks?: number | null;
  trends?: IncidentTrendWeekDto[] | null;
};

export type GetIncidentTrendsResponseDto = ApiEnvelopeDto<IncidentTrendsDto | null>;

/**
 * One entry of `actions` on GET /api/EHSCommandCenter/GetMyActions.
 * Field names are UNCONFIRMED — the endpoint has only ever returned an empty
 * array so far. These are best-guess candidates (mirroring CAPA-style
 * fields elsewhere in the app); revisit once a populated response exists.
 */
export type MyActionItemDto = Record<string, unknown>;

/** dataModel shape for GET /api/EHSCommandCenter/GetMyActions. */
export type MyActionsDto = {
  siteId?: number | null;
  assignedCount?: number | null;
  dueThisWeekCount?: number | null;
  actions?: MyActionItemDto[] | null;
};

export type GetMyActionsResponseDto = ApiEnvelopeDto<MyActionsDto | null>;

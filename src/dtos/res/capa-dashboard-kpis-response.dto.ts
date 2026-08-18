import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

export type CapaDashboardKpiStatusDto =
  "OnTarget" | "OffTarget" | string | null;

export type CapaDashboardKpiChangeDto = {
  value?: number | null;
  direction?: "up" | "down" | string | null;
  label?: string | null;
};

/** One KPI card in GET /api/CAPA/dashboard-kpis `dataModel`. */
export type CapaDashboardKpiCardDto = {
  value?: number | null;
  unit?: string | null;
  target?: number | null;
  status?: CapaDashboardKpiStatusDto;
  trend?: readonly number[] | null;
  trendDelta?: number | null;
  change?: CapaDashboardKpiChangeDto | null;
};

/** dataModel shape for GET /api/CAPA/dashboard-kpis. */
export type CapaDashboardKpisDto = {
  openCapas?: CapaDashboardKpiCardDto | null;
  overdueCapas?: CapaDashboardKpiCardDto | null;
  onTimeClosurePercentage?: CapaDashboardKpiCardDto | null;
  averageDaysToClose?: CapaDashboardKpiCardDto | null;
};

export type GetCapaDashboardKpisResponseDto =
  ApiEnvelopeDto<CapaDashboardKpisDto | null>;

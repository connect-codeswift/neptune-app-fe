import type { KpiMetricKey } from "@/dtos/res/incident-kpi-response.dto";

/** Request body for PUT /api/v1/kpi-targets. */
export type SaveKpiTargetRequestDto = {
  metric: KpiMetricKey | string;
  targetValue: number;
};

/** Request body for PUT /api/v1/sites/work-hours. */
export type SaveSiteWorkHoursRequestDto = {
  year: number;
  month: number;
  hours: number;
};

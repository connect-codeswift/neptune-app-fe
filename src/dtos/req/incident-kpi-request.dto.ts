import type { KpiMetricKey } from "@/dtos/res/incident-kpi-response.dto";

/** Request body for PUT /api/Incident/kpi-targets. */
export type SaveKpiTargetRequestDto = {
  metric: KpiMetricKey | string;
  targetValue: number;
};

/** Request body for PUT /api/Incident/site-work-hours. */
export type SaveSiteWorkHoursRequestDto = {
  year: number;
  month: number;
  hours: number;
};

import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

export type IncidentKpiStatusDto = "OnTarget" | "OffTarget" | null;

/** One KPI card returned by header/list KPI endpoints. */
export type IncidentKpiCardDto = {
  /** Null means "not measurable yet", never zero. */
  value: number | null;
  unit: string;
  target: number | null;
  status: IncidentKpiStatusDto;
  /** Oldest → newest, one point per week. A null point is a week with no data. */
  trend: (number | null)[];
  trendDelta: number | null;
  /** How many weeks apart the two points behind `trendDelta` sit. 1 = week-over-week. */
  trendDeltaWeeks: number | null;
};

/** dataModel shape for GET /api/Incident/GetHeaderKpi. */
export type HeaderKpiDto = {
  rir: IncidentKpiCardDto;
  ltir: IncidentKpiCardDto;
  mttc: IncidentKpiCardDto;
};

export type GetHeaderKpiResponseDto = ApiEnvelopeDto<HeaderKpiDto | null>;

/** dataModel shape for GET /api/Incident/GetIncidentListKpis. */
export type IncidentListKpiDto = {
  openIncidents: IncidentKpiCardDto;
  mttc: IncidentKpiCardDto;
  rir: IncidentKpiCardDto;
  daysWithoutLti: IncidentKpiCardDto;
};

export type GetIncidentListKpisResponseDto =
  ApiEnvelopeDto<IncidentListKpiDto | null>;

/** Known KPI metric keys used across target save/list and card matching. */
export type KpiMetricKey =
  | "rir"
  | "ltir"
  | "mttc"
  | "openIncidents"
  | "daysWithoutLti";

/** One entry from GET /api/Incident/kpi-targets. */
export type KpiTargetDto = {
  metric: string;
  targetValue: number;
};

export type GetKpiTargetsResponseDto = ApiEnvelopeDto<
  readonly KpiTargetDto[] | null
>;

export type SaveKpiTargetResponseDto = ApiEnvelopeDto<unknown>;

/** Lookup table keyed by normalized metric name. */
export type KpiTargetsLookup = Partial<Record<KpiMetricKey, number>>;

/** One monthly work-hours entry from GET /api/Incident/site-work-hours. */
export type SiteWorkHoursDto = {
  id: number;
  siteId: number;
  year: number;
  month: number;
  hours: number;
};

export type GetSiteWorkHoursResponseDto = ApiEnvelopeDto<
  readonly SiteWorkHoursDto[] | null
>;

export type SaveSiteWorkHoursResponseDto = ApiEnvelopeDto<unknown>;

/** One site row on GET /api/Incident/dashboard-kpis. */
export type RecordablesBySiteDto = {
  site: string;
  count: number;
};

/** One monthly row on GET /api/Incident/dashboard-kpis. */
export type RecordablesMonthlyDto = {
  year: number;
  month: number;
  label: string;
  count: number;
};

/** Recordable mix breakdown on GET /api/Incident/dashboard-kpis. */
export type RecordableMixDto = {
  lostTime: number;
  restricted: number;
  medicalOnly: number;
  firstAid: number;
};

/** Optional targets bundled with GET /api/Incident/dashboard-kpis. */
export type IncidentDashboardTargetsDto = Record<string, number>;

/** dataModel shape for GET /api/Incident/dashboard-kpis. */
export type IncidentDashboardKpisDto = {
  totalRecordable: number;
  lostTimeCount: number;
  restrictedWorkCount: number;
  medicalOnlyCount: number;
  firstAidCount: number;
  fatalityCount: number;
  lostDays: number;
  restrictedDays: number;
  siaCount: number;
  sipCount: number;
  recordablesBySite: readonly RecordablesBySiteDto[];
  recordablesMonthly: readonly RecordablesMonthlyDto[];
  recordableMix: RecordableMixDto;
  targets: IncidentDashboardTargetsDto;
};

export type GetIncidentDashboardKpisResponseDto =
  ApiEnvelopeDto<IncidentDashboardKpisDto | null>;

import type { SaveSiteWorkHoursRequestDto } from "@/dtos/req/incident-kpi-request.dto";
import type {
  GetHeaderKpiResponseDto,
  GetIncidentDashboardKpisResponseDto,
  GetIncidentListKpisResponseDto,
  GetKpiTargetsResponseDto,
  GetSiteWorkHoursResponseDto,
  IncidentDashboardKpisDto,
  KpiTargetDto,
  SaveSiteWorkHoursResponseDto,
  SiteWorkHoursDto,
} from "@/dtos/res/incident-kpi-response.dto";
import { normalizeIncidentDashboardKpisDto } from "@/services/mappers/incident-dashboard.mapper";
import http from "@/lib/axios";

const INCIDENT_HEADER_KPI_PATH = "/incidents/header-kpis";
const INCIDENT_LIST_KPI_PATH = "/incidents/list-kpis";
const INCIDENT_DASHBOARD_KPIS_PATH = "/incidents/dashboard-kpis";
// KPI targets are served by KpiTargetController, NOT by IncidentController. The
// old `/Incident/kpi-targets` this file used had 404'd for months.
const KPI_TARGETS_PATH = "/kpi-targets";
// Site work hours are site configuration; they moved off IncidentController.
const SITE_WORK_HOURS_PATH = "/sites/work-hours";

const SITE_WORK_HOURS_MIN_YEAR = 2000;
const SITE_WORK_HOURS_MAX_YEAR = 2100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined) {
      return record[key];
    }
  }
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function coerceKpiTarget(raw: unknown): KpiTargetDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const metric = asString(readProp(raw, "metric", "Metric"))?.trim();
  const targetValue = asNumber(readProp(raw, "targetValue", "TargetValue"));

  if (!metric || targetValue == null) {
    return null;
  }

  return { metric, targetValue };
}

function normalizeKpiTargets(
  raw: readonly unknown[] | null | undefined,
): readonly KpiTargetDto[] {
  if (!raw?.length) {
    return [];
  }

  return raw
    .map(coerceKpiTarget)
    .filter((item): item is KpiTargetDto => item != null);
}

function coerceSiteWorkHours(raw: unknown): SiteWorkHoursDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = asNumber(readProp(raw, "id", "Id"));
  const siteId = asNumber(readProp(raw, "siteId", "SiteId"));
  const year = asNumber(readProp(raw, "year", "Year"));
  const month = asNumber(readProp(raw, "month", "Month"));
  const hours = asNumber(readProp(raw, "hours", "Hours"));

  if (
    id == null ||
    siteId == null ||
    year == null ||
    month == null ||
    hours == null ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return { id, siteId, year, month, hours };
}

function normalizeSiteWorkHours(
  raw: readonly unknown[] | null | undefined,
): readonly SiteWorkHoursDto[] {
  if (!raw?.length) {
    return [];
  }

  return raw
    .map(coerceSiteWorkHours)
    .filter((item): item is SiteWorkHoursDto => item != null)
    .sort((left, right) => left.year - right.year || left.month - right.month);
}

function validateSiteWorkHoursPayload(payload: SaveSiteWorkHoursRequestDto) {
  if (!Number.isInteger(payload.year)) {
    throw new Error("Year must be a whole number.");
  }

  if (
    payload.year < SITE_WORK_HOURS_MIN_YEAR ||
    payload.year > SITE_WORK_HOURS_MAX_YEAR
  ) {
    throw new Error(
      `Year must be between ${String(SITE_WORK_HOURS_MIN_YEAR)} and ${String(SITE_WORK_HOURS_MAX_YEAR)}.`,
    );
  }

  if (
    !Number.isInteger(payload.month) ||
    payload.month < 1 ||
    payload.month > 12
  ) {
    throw new Error("Month must be between 1 and 12.");
  }

  if (!Number.isFinite(payload.hours) || payload.hours < 0) {
    throw new Error("Hours must be zero or greater.");
  }
}

/** GET /api/v1/incidents/header-kpis */
export async function getHeaderKpi() {
  const { data } = await http.get<GetHeaderKpiResponseDto>(
    INCIDENT_HEADER_KPI_PATH,
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to load dashboard KPIs.");
  }

  return data;
}

/** GET /api/v1/incidents/list-kpis */
export async function getIncidentListKpis() {
  const { data } = await http.get<GetIncidentListKpisResponseDto>(
    INCIDENT_LIST_KPI_PATH,
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to load incident list KPIs.");
  }

  return data;
}

/** GET /api/v1/incidents/dashboard-kpis */
export async function getIncidentDashboardKpis(): Promise<
  GetIncidentDashboardKpisResponseDto & {
    dataModel: IncidentDashboardKpisDto | null;
  }
> {
  const { data } = await http.get<GetIncidentDashboardKpisResponseDto>(
    INCIDENT_DASHBOARD_KPIS_PATH,
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to load incident dashboard KPIs.");
  }

  return {
    ...data,
    dataModel: normalizeIncidentDashboardKpisDto(data.dataModel),
  };
}

/** GET /api/v1/kpi-targets */
export async function getKpiTargets() {
  const { data } = await http.get<GetKpiTargetsResponseDto>(KPI_TARGETS_PATH);

  if (!data.success) {
    throw new Error(data.message || "Failed to load KPI targets.");
  }

  return {
    ...data,
    dataModel: normalizeKpiTargets(data.dataModel),
  };
}

/** PUT /api/v1/kpi-targets */
/** GET /api/v1/sites/work-hours */
export async function getSiteWorkHours() {
  const { data } =
    await http.get<GetSiteWorkHoursResponseDto>(SITE_WORK_HOURS_PATH);

  if (!data.success) {
    throw new Error(data.message || "Failed to load site work hours.");
  }

  return {
    ...data,
    dataModel: normalizeSiteWorkHours(data.dataModel),
  };
}

/** PUT /api/v1/sites/work-hours */
export async function saveSiteWorkHours(payload: SaveSiteWorkHoursRequestDto) {
  validateSiteWorkHoursPayload(payload);

  const { data } = await http.put<SaveSiteWorkHoursResponseDto>(
    SITE_WORK_HOURS_PATH,
    {
      year: payload.year,
      month: payload.month,
      hours: payload.hours,
    },
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to save site work hours.");
  }

  return data;
}

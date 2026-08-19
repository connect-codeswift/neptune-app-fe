import type {
  GetMainDashboardKpisResponseDto,
  GetIncidentTrendsResponseDto,
  GetMyActionsResponseDto,
} from "@/dtos/res/ehs-command-center-response.dto";
import http from "@/lib/axios";
import { normalizeDashboardKpisDto } from "@/services/mappers/dashboard-kpis.mapper";

const DASHBOARD_KPIS_PATH = "/command-center/dashboard-kpis";
const INCIDENT_TRENDS_PATH = "/command-center/incident-trends";
const MY_ACTIONS_PATH = "/command-center/my-actions";

/** GET /api/v1/command-center/dashboard-kpis */
export async function getMainDashboardKpis() {
  const { data } =
    await http.get<GetMainDashboardKpisResponseDto>(DASHBOARD_KPIS_PATH);

  return {
    ...data,
    dataModel: normalizeDashboardKpisDto(data.dataModel),
  } satisfies GetMainDashboardKpisResponseDto;
}

/** GET /api/v1/command-center/incident-trends */
export async function getIncidentTrends() {
  const { data } =
    await http.get<GetIncidentTrendsResponseDto>(INCIDENT_TRENDS_PATH);

  return data;
}

/** GET /api/v1/command-center/my-actions */
export async function getMyActions() {
  const { data } = await http.get<GetMyActionsResponseDto>(MY_ACTIONS_PATH);

  return data;
}

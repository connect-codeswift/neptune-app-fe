import type {
  GetIncidentTrendsResponseDto,
  GetMainDashboardKpisResponseDto,
  GetMyActionsResponseDto,
} from "@/dtos/res/ehs-command-center-response.dto";
import http from "@/lib/axios";

const DASHBOARD_KPIS_PATH = "/EHSCommandCenter/GetMainDashboardKpis";
const INCIDENT_TRENDS_PATH = "/EHSCommandCenter/GetIncidentTrends";
const MY_ACTIONS_PATH = "/EHSCommandCenter/GetMyActions";

/** GET /api/EHSCommandCenter/GetMainDashboardKpis */
export async function getMainDashboardKpis() {
  const { data } = await http.get<GetMainDashboardKpisResponseDto>(
    DASHBOARD_KPIS_PATH,
  );

  return data;
}

/** GET /api/EHSCommandCenter/GetIncidentTrends */
export async function getIncidentTrends() {
  const { data } = await http.get<GetIncidentTrendsResponseDto>(
    INCIDENT_TRENDS_PATH,
  );

  return data;
}

/** GET /api/EHSCommandCenter/GetMyActions */
export async function getMyActions() {
  const { data } = await http.get<GetMyActionsResponseDto>(MY_ACTIONS_PATH);

  return data;
}

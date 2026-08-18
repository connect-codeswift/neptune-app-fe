import type {
  GetAllHazardRequestDto,
  SaveHazardRequestDto,
} from "@/dtos/req/hazard-request.dto";
import type {
  CreateHazardResponseDto,
  GetAllHazardResponseDto,
  GetHazardByIdResponseDto,
  GetHazardKpiResponseDto,
  GetHazardHeatMapResponseDto,
  GetTopHazardUsersResponseDto,
  GetMonthlyHazardUsersResponseDto,
} from "@/dtos/res/hazard-response.dto";
import http from "@/lib/axios";
import { normalizeHazardKpiDto } from "@/lib/map-hazard";

const HAZARD_CREATE_PATH = "/Hazard/Hazards";
const HAZARD_GET_ALL_PATH = "/Hazard/GetAllHazard";
const HAZARD_BY_ID_PATH = "/Hazard/Hazard";
const HAZARD_KPI_COUNT_PATH = "/Hazard/HazardKpiCount";
const HAZARD_TOP_USERS_PATH = "/Hazard/TopHazardUsers";
const HAZARD_MONTHLY_USERS_PATH = "/Hazard/MonthlyHazardUsers";
const HAZARD_HEAT_MAP_PATH = "/Hazard/HazardApiForHeatMap";

export async function createHazard(payload: SaveHazardRequestDto) {
  const { data } = await http.post<CreateHazardResponseDto>(
    HAZARD_CREATE_PATH,
    payload,
  );
  return data;
}

export async function getAllHazard(payload: GetAllHazardRequestDto) {
  const { data } = await http.post<GetAllHazardResponseDto>(
    HAZARD_GET_ALL_PATH,
    payload,
  );

  return data;
}

export async function getHazardKpiCount(params: Readonly<{ userId: number }>) {
  const { data } = await http.get<GetHazardKpiResponseDto>(
    HAZARD_KPI_COUNT_PATH,
    { params: { userId: params.userId } },
  );

  return {
    ...data,
    dataModel: normalizeHazardKpiDto(data.dataModel),
  };
}

export async function getTopHazardUsers() {
  const { data } = await http.get<GetTopHazardUsersResponseDto>(
    HAZARD_TOP_USERS_PATH,
  );

  return data;
}

/** GET /api/Hazard/MonthlyHazardUsers?year=&month= */
export async function getMonthlyHazardUsers(
  params: Readonly<{ year: number; month: number }>,
) {
  const { data } = await http.get<GetMonthlyHazardUsersResponseDto>(
    HAZARD_MONTHLY_USERS_PATH,
    { params: { year: params.year, month: params.month } },
  );

  return data;
}

export async function getHazardHeatMap() {
  const { data } =
    await http.get<GetHazardHeatMapResponseDto>(HAZARD_HEAT_MAP_PATH);
  return data;
}

export async function getHazardById(
  id: string,
  params: Readonly<{ siteId: number; userId: number }>,
) {
  const { data } = await http.get<GetHazardByIdResponseDto>(
    `${HAZARD_BY_ID_PATH}/${encodeURIComponent(id)}`,
    { params },
  );

  return data;
}

export async function dropHazard(
  id: string,
  payload: Readonly<{ siteId: number; userId: number }>,
) {
  const { data } = await http.put<unknown>(
    `/Hazard/DropHazard/${encodeURIComponent(id)}`,
    payload,
  );

  return data;
}

export async function closeHazard(id: string) {
  const { data } = await http.put<unknown>(
    `/Hazard/CloseHazard/${encodeURIComponent(id)}`,
  );

  return data;
}


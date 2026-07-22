import type {
  CreateNearMissRequestDto,
  GetAllNearMissRequestDto,
} from "@/dtos/req/near-miss-request.dto";
import type {
  CreateNearMissResponseDto,
  GetAllNearMissResponseDto,
  GetNearMissByIdResponseDto,
  GetNearMissKpiResponseDto,
  GetNearMissHeatMapResponseDto,
  GetTopNearMissUsersResponseDto,
} from "@/dtos/res/near-miss-response.dto";
import http from "@/lib/axios";

const NEAR_MISS_CREATE_PATH = "/NearMiss/NearMiss";
const NEAR_MISS_GET_ALL_PATH = "/NearMiss/GetAllNearMiss";
const NEAR_MISS_BY_ID_PATH = "/NearMiss/NearMiss";
const NEAR_MISS_KPI_PATH = "/NearMiss/NearMissKpi";
const NEAR_MISS_TOP_USERS_PATH = "/NearMiss/TopNearMissUsers";
const NEAR_MISS_HEAT_MAP_PATH = "/NearMiss/NearMissApiForHeatMap";
const NEAR_MISS_CLOSE_PATH = "/NearMiss/CloseNearMiss";

export async function createNearMiss(payload: CreateNearMissRequestDto) {
  const { data } = await http.post<CreateNearMissResponseDto>(
    NEAR_MISS_CREATE_PATH,
    payload,
  );

  return data;
}

export async function getAllNearMiss(payload: GetAllNearMissRequestDto) {
  const { data } = await http.post<GetAllNearMissResponseDto>(
    NEAR_MISS_GET_ALL_PATH,
    payload,
  );
  return data;
}

export async function getNearMissKpi() {
  const { data } =
    await http.get<GetNearMissKpiResponseDto>(NEAR_MISS_KPI_PATH);

  return data;
}

export async function getTopNearMissUsers() {
  const { data } = await http.get<GetTopNearMissUsersResponseDto>(
    NEAR_MISS_TOP_USERS_PATH,
  );

  return data;
}

export async function getNearMissHeatMap() {
  const { data } = await http.get<GetNearMissHeatMapResponseDto>(
    NEAR_MISS_HEAT_MAP_PATH,
  );

  return data;
}

export async function closeNearMiss(id: string) {
  const { data } = await http.put(
    `${NEAR_MISS_CLOSE_PATH}/${encodeURIComponent(id)}`,
  );

  return data;
}

export async function getNearMissById(id: string) {
  const { data } = await http.get<GetNearMissByIdResponseDto>(
    `${NEAR_MISS_BY_ID_PATH}/${encodeURIComponent(id)}`,
  );

  return data;
}

export async function deleteNearMiss(id: string) {
  const { data } = await http.delete(
    `${NEAR_MISS_BY_ID_PATH}/${encodeURIComponent(id)}`,
  );

  return data;
}

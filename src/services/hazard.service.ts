import type {
  GetAllHazardRequestDto,
  SaveHazardRequestDto,
} from "@/dtos/req/hazard-request.dto";
import type {
  CreateHazardResponseDto,
  GetAllHazardResponseDto,
  GetHazardByIdResponseDto,
  GetHazardKpiResponseDto,
} from "@/dtos/res/hazard-response.dto";
import http from "@/lib/axios";

const HAZARD_CREATE_PATH = "/Hazard/Hazards";
const HAZARD_GET_ALL_PATH = "/Hazard/GetAllHazard";
const HAZARD_BY_ID_PATH = "/Hazard/Hazard";
const HAZARD_KPI_PATH = "/Hazard/HazardKpi";

export async function createHazard(payload: SaveHazardRequestDto) {
  const { data } = await http.post<CreateHazardResponseDto>(
    HAZARD_CREATE_PATH,
    payload,
  );
  console.log("data", data);

  return data;
}

export async function getAllHazard(payload: GetAllHazardRequestDto) {
  const { data } = await http.post<GetAllHazardResponseDto>(
    HAZARD_GET_ALL_PATH,
    payload,
  );
  console.log("getAllHazard", data);

  return data;
}

export async function getHazardKpi() {
  const { data } = await http.get<GetHazardKpiResponseDto>(HAZARD_KPI_PATH);
  console.log("getHazardKpi", data);

  return data;
}

export async function getHazardById(
  id: string,
  params: Readonly<{ subCompanyId: number; userId: number }>,
) {
  const { data } = await http.get<GetHazardByIdResponseDto>(
    `${HAZARD_BY_ID_PATH}/${encodeURIComponent(id)}`,
    { params },
  );

  return data;
}

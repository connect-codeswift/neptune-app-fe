import type {
  GetAllNearMissRequestDto,
  SaveNearMissRequestDto,
} from "@/dtos/req/near-miss-request.dto";
import type {
  CreateNearMissResponseDto,
  GetAllNearMissResponseDto,
  GetNearMissByIdResponseDto,
  GetNearMissKpiResponseDto,
  GetNearMissHeatMapResponseDto,
  GetMonthlyNearMissUsersResponseDto,
  GetTopNearMissUsersResponseDto,
} from "@/dtos/res/near-miss-response.dto";
import http from "@/lib/axios";

const NEAR_MISS_PATH = "/near-misses";
const NEAR_MISS_SEARCH_PATH = "/near-misses/search";
const NEAR_MISS_KPI_PATH = "/near-misses/kpis";
const NEAR_MISS_TOP_USERS_PATH = "/near-misses/top-users";
// NOTE: route-map.md has no row for the old `/NearMiss/MonthlyNearMissUsers`.
// Mapped by parity with `GET /api/v1/hazards/monthly-users`; flagged in the
// handoff report as needing backend confirmation.
const NEAR_MISS_MONTHLY_USERS_PATH = "/near-misses/monthly-users";
const NEAR_MISS_HEAT_MAP_PATH = "/near-misses/heatmap";

/**
 * Create a near miss, or update one when the payload carries an `id`.
 *
 * The v1 rename split the old create-or-update `POST /api/v1/near-misses`
 * into `POST /api/v1/near-misses` and `PUT /api/v1/near-misses/{id}`, so edits
 * are gated on `NearMiss.Update` rather than `NearMiss.Create`. Body shape is
 * unchanged; the branch lives here so the form components are untouched.
 */
export async function createNearMiss(payload: SaveNearMissRequestDto) {
  const id = "id" in payload ? payload.id : undefined;
  const isUpdate = typeof id === "number" && Number.isFinite(id) && id > 0;

  const { data } = isUpdate
    ? await http.put<CreateNearMissResponseDto>(
        `${NEAR_MISS_PATH}/${encodeURIComponent(String(id))}`,
        payload,
      )
    : await http.post<CreateNearMissResponseDto>(NEAR_MISS_PATH, payload);

  return data;
}

export async function getAllNearMiss(payload: GetAllNearMissRequestDto) {
  const { data } = await http.post<GetAllNearMissResponseDto>(
    NEAR_MISS_SEARCH_PATH,
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

/** GET /api/v1/near-misses/monthly-users?year=&month= */
export async function getMonthlyNearMissUsers(
  params: Readonly<{ year: number; month: number }>,
) {
  const { data } = await http.get<GetMonthlyNearMissUsersResponseDto>(
    NEAR_MISS_MONTHLY_USERS_PATH,
    { params: { year: params.year, month: params.month } },
  );

  return data;
}

export async function getNearMissHeatMap() {
  const { data } = await http.get<GetNearMissHeatMapResponseDto>(
    NEAR_MISS_HEAT_MAP_PATH,
  );

  return data;
}

/** POST /api/v1/near-misses/{id}/close — was `PUT /api/NearMiss/CloseNearMiss/{id}`. */
export async function closeNearMiss(id: string) {
  const { data } = await http.post(
    `${NEAR_MISS_PATH}/${encodeURIComponent(id)}/close`,
  );

  return data;
}

export async function getNearMissById(id: string) {
  const { data } = await http.get<GetNearMissByIdResponseDto>(
    `${NEAR_MISS_PATH}/${encodeURIComponent(id)}`,
  );

  return data;
}

export async function deleteNearMiss(id: string) {
  const { data } = await http.delete(
    `${NEAR_MISS_PATH}/${encodeURIComponent(id)}`,
  );

  return data;
}

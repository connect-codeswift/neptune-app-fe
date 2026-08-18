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

const HAZARD_PATH = "/hazards";
const HAZARD_SEARCH_PATH = "/hazards/search";
const HAZARD_KPI_COUNT_PATH = "/hazards/kpis";
const HAZARD_TOP_USERS_PATH = "/hazards/top-users";
const HAZARD_MONTHLY_USERS_PATH = "/hazards/monthly-users";
const HAZARD_HEAT_MAP_PATH = "/hazards/heatmap";

/**
 * Create a hazard, or update one when the payload carries an `id`.
 *
 * The v1 rename split the old create-or-update `POST /api/v1/hazards` into
 * `POST /api/v1/hazards` and `PUT /api/v1/hazards/{id}` — the upsert-on-id
 * branch let any holder of `Hazard.Create` rewrite someone else's record, so
 * edits are now gated on `Hazard.Update`. The branch stays here rather than in
 * the caller so the form components are unchanged; the body shape is unchanged
 * too (the backend ignores the body `id` instead of reading it).
 */
export async function createHazard(payload: SaveHazardRequestDto) {
  const id = "id" in payload ? payload.id : undefined;
  const isUpdate = typeof id === "number" && Number.isFinite(id) && id > 0;

  const { data } = isUpdate
    ? await http.put<CreateHazardResponseDto>(
        `${HAZARD_PATH}/${encodeURIComponent(String(id))}`,
        payload,
      )
    : await http.post<CreateHazardResponseDto>(HAZARD_PATH, payload);

  return data;
}

export async function getAllHazard(payload: GetAllHazardRequestDto) {
  const { data } = await http.post<GetAllHazardResponseDto>(
    HAZARD_SEARCH_PATH,
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

/** GET /api/v1/hazards/monthly-users?year=&month= */
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
    `${HAZARD_PATH}/${encodeURIComponent(id)}`,
    { params },
  );

  return data;
}

/**
 * DELETE /api/v1/hazards/{id} — soft delete.
 * Was `PUT /api/Hazard/DropHazard/{id}`; the v1 rename made soft delete a real
 * DELETE, so this no longer carries a body (siteId/userId come from the JWT).
 */
export async function dropHazard(
  id: string,
  _payload: Readonly<{ siteId: number; userId: number }>,
) {
  const { data } = await http.delete<unknown>(
    `${HAZARD_PATH}/${encodeURIComponent(id)}`,
  );

  return data;
}

/** POST /api/v1/hazards/{id}/close — was `PUT /api/Hazard/CloseHazard/{id}`. */
export async function closeHazard(id: string) {
  const { data } = await http.post<unknown>(
    `${HAZARD_PATH}/${encodeURIComponent(id)}/close`,
  );

  return data;
}

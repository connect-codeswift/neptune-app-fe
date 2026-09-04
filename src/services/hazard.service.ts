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
  GetHazardRecognitionsResponseDto,
  HazardRecognitionDto,
} from "@/dtos/res/hazard-response.dto";
import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import http from "@/lib/axios";
import { normalizeHazardKpiDto } from "@/lib/map-hazard";

const HAZARD_PATH = "/hazards";
const HAZARD_SEARCH_PATH = "/hazards/search";
const HAZARD_KPI_COUNT_PATH = "/hazards/kpis";
const HAZARD_RECOGNITIONS_PATH = "/hazards/recognitions";
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

/**
 * POST /api/v1/hazards/{id}/convert-to-incident - links a hazard to the incident it became.
 *
 * The incident is created first by the report wizard; this only writes the back-link, which is
 * what the "Converted to incidents" tile counts and what hides the convert action afterwards.
 */
export async function convertHazardToIncident(
  hazardId: string | number,
  incidentId: number,
) {
  const { data } = await http.post(
    `${HAZARD_PATH}/${encodeURIComponent(String(hazardId))}/convert-to-incident`,
    {},
    { params: { incidentId } },
  );

  return data;
}

export async function getHazardKpiCount() {
  const { data } = await http.get<GetHazardKpiResponseDto>(HAZARD_KPI_COUNT_PATH);

  return {
    ...data,
    dataModel: normalizeHazardKpiDto(data.dataModel),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined) {
      return record[key];
    }
  }
  return undefined;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * `dataModel` is a bare array, but the card must never crash on a shape it
 * did not expect — a non-array once reached `reporters.map` and took the page
 * down. Anything that is not an array degrades to "no reporters". Rows are read
 * in both casings because the API mixes them.
 */
function normalizeRecognitions(dataModel: unknown): HazardRecognitionDto[] {
  const rows: unknown[] = Array.isArray(dataModel) ? dataModel : [];

  return rows.filter(isRecord).map((row) => ({
    userId: asNumber(readProp(row, "userId", "UserId")),
    userName: asString(readProp(row, "userName", "UserName")),
    hazardCount: asNumber(
      readProp(row, "hazardCount", "HazardCount", "count", "Count"),
    ),
  }));
}

/** GET /api/v1/hazards/recognitions?year=&month= */
export async function getHazardRecognitions(
  params: Readonly<{ year: number; month: number }>,
): Promise<GetHazardRecognitionsResponseDto> {
  const { data } = await http.get<ApiEnvelopeDto<unknown>>(
    HAZARD_RECOGNITIONS_PATH,
    { params: { year: params.year, month: params.month } },
  );

  return { ...data, dataModel: normalizeRecognitions(data.dataModel) };
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

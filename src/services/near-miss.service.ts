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
  GetNearMissRecognitionsResponseDto,
  NearMissRecognitionDto,
} from "@/dtos/res/near-miss-response.dto";
import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import http from "@/lib/axios";

const NEAR_MISS_PATH = "/near-misses";
const NEAR_MISS_SEARCH_PATH = "/near-misses/search";
const NEAR_MISS_KPI_PATH = "/near-misses/kpis";
const NEAR_MISS_RECOGNITIONS_PATH = "/near-misses/recognitions";
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
function normalizeRecognitions(dataModel: unknown): NearMissRecognitionDto[] {
  const rows: unknown[] = Array.isArray(dataModel) ? dataModel : [];

  return rows.filter(isRecord).map((row) => ({
    userId: asNumber(readProp(row, "userId", "UserId")),
    userName: asString(readProp(row, "userName", "UserName")),
    nearMissCount: asNumber(
      readProp(row, "nearMissCount", "NearMissCount", "count", "Count"),
    ),
  }));
}

/** GET /api/v1/near-misses/recognitions?year=&month= */
export async function getNearMissRecognitions(
  params: Readonly<{ year: number; month: number }>,
): Promise<GetNearMissRecognitionsResponseDto> {
  const { data } = await http.get<ApiEnvelopeDto<unknown>>(
    NEAR_MISS_RECOGNITIONS_PATH,
    { params: { year: params.year, month: params.month } },
  );

  return { ...data, dataModel: normalizeRecognitions(data.dataModel) };
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

/** POST /api/v1/near-misses/{id}/convert-to-incident — links a near miss to an incident. */
export async function convertNearMissToIncident(
  nearMissId: string | number,
  incidentId: number,
) {
  const { data } = await http.post(
    `${NEAR_MISS_PATH}/${encodeURIComponent(String(nearMissId))}/convert-to-incident`,
    {},
    { params: { incidentId } },
  );

  return data;
}

export async function deleteNearMiss(id: string) {
  const { data } = await http.delete(
    `${NEAR_MISS_PATH}/${encodeURIComponent(id)}`,
  );

  return data;
}

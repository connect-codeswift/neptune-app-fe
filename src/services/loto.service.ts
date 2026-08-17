import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import type {
  ApplyLotoLockoutRequestDto,
  GetAllLotoEquipmentRequestDto,
  GetAllLotoLockoutsRequestDto,
  RemoveLotoLockoutRequestDto,
  UpsertLotoEquipmentRequestDto,
} from "@/dtos/req/loto-request.dto";
import type {
  ApplyLotoLockoutResponseDto,
  ApplyLotoLockoutResultDto,
  CreateLotoEquipmentResponseDto,
  CreateLotoEquipmentResultDto,
  GetLotoActiveLockoutsResponseDto,
  GetLotoDashboardKpisResponseDto,
  GetLotoEquipmentDetailResponseDto,
  GetLotoEquipmentHistoryResponseDto,
  GetLotoEquipmentResponseDto,
  GetLotoLocationsResponseDto,
  GetLotoLockoutsResponseDto,
  GetLotoPersonnelResponseDto,
  LotoAuthorizedPersonDto,
  LotoDashboardKpisDto,
  LotoEquipmentDetailDto,
  LotoEquipmentGridRowDto,
  LotoEquipmentStatusDto,
  LotoEquipmentStepDto,
  LotoLocationDto,
  LotoLockoutRowDto,
  LotoLockoutStatusDto,
  LotoPersonnelDto,
  RemoveLotoLockoutResponseDto,
} from "@/dtos/res/loto-response.dto";
import http from "@/lib/axios";
import {
  asBoolean,
  asNumber,
  asString,
  isRecord,
  readProp,
} from "@/services/mappers/record-readers";

const LOTO_PATH = "/Loto";
const LOTO_GET_ALL_EQUIPMENT_PATH = `${LOTO_PATH}/GetAllEquipment`;
const LOTO_EQUIPMENT_PATH = `${LOTO_PATH}/equipment`;
const LOTO_LOCATIONS_PATH = `${LOTO_PATH}/locations`;
const LOTO_LOCKOUTS_PATH = `${LOTO_PATH}/lockouts`;
const LOTO_ACTIVE_LOCKOUTS_PATH = `${LOTO_PATH}/active-lockouts`;
const LOTO_GET_ALL_LOCKOUTS_PATH = `${LOTO_PATH}/GetAllLockouts`;
const LOTO_PERSONNEL_PATH = `${LOTO_PATH}/personnel`;
const LOTO_DASHBOARD_KPIS_PATH = `${LOTO_PATH}/dashboard-kpis`;

export type LotoPage<TItem> = Readonly<{
  items: TItem[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
}>;

function unwrapDataModel(envelope: unknown): unknown {
  if (!isRecord(envelope)) {
    return null;
  }

  const success = readProp(envelope, "success", "Success");
  if (success === false) {
    const message = asString(readProp(envelope, "message", "Message"));
    throw new Error(message || "The server rejected the request.");
  }

  return readProp(envelope, "dataModel", "DataModel") ?? null;
}

/** Reads a value as a trimmed string, preserving null for empty/missing. */
function asNullableString(value: unknown): string | null {
  const text = asString(value).trim();
  return text === "" ? null : text;
}

function asNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeEquipmentStatus(value: unknown): LotoEquipmentStatusDto {
  const status = asString(value);
  if (status === "Locked Out" || status === "Maintenance") {
    return status;
  }
  return "Operational";
}

function normalizeLockoutStatus(value: unknown): LotoLockoutStatusDto {
  return asString(value) === "Completed" ? "Completed" : "Active";
}

function normalizeEquipmentGridRow(raw: unknown): LotoEquipmentGridRowDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    id: asNumber(readProp(raw, "id", "Id")),
    equipmentCode: asString(readProp(raw, "equipmentCode", "EquipmentCode")),
    name: asString(readProp(raw, "name", "Name")),
    location: asString(readProp(raw, "location", "Location")),
    energySources: asString(readProp(raw, "energySources", "EnergySources")),
    lastInspectionAt: asNullableString(
      readProp(raw, "lastInspectionAt", "LastInspectionAt"),
    ),
    status: normalizeEquipmentStatus(readProp(raw, "status", "Status")),
  };
}

function normalizeEquipmentStep(raw: unknown): LotoEquipmentStepDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    description: asString(readProp(raw, "description", "Description")),
    isolationPoint: asNullableString(
      readProp(raw, "isolationPoint", "IsolationPoint"),
    ),
    energyType: asNullableString(readProp(raw, "energyType", "EnergyType")),
    lockTagPosition: asNullableString(
      readProp(raw, "lockTagPosition", "LockTagPosition"),
    ),
  };
}

function normalizeAuthorizedPerson(raw: unknown): LotoAuthorizedPersonDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    userId: asNumber(readProp(raw, "userId", "UserId")),
    fullName: asString(readProp(raw, "fullName", "FullName")),
  };
}

function normalizeEquipmentDetail(raw: unknown): LotoEquipmentDetailDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const gridRow = normalizeEquipmentGridRow(raw);
  if (!gridRow) {
    return null;
  }

  const rawSteps = readProp(raw, "steps", "Steps");
  const rawPersonnel = readProp(
    raw,
    "authorizedPersonnel",
    "AuthorizedPersonnel",
  );

  return {
    ...gridRow,
    locationId: asNumber(readProp(raw, "locationId", "LocationId")),
    description: asNullableString(readProp(raw, "description", "Description")),
    hazardLevel: asNullableString(readProp(raw, "hazardLevel", "HazardLevel")),
    isOutOfService: asBoolean(readProp(raw, "isOutOfService", "IsOutOfService")),
    additionalNotes: asNullableString(
      readProp(raw, "additionalNotes", "AdditionalNotes"),
    ),
    steps: Array.isArray(rawSteps)
      ? rawSteps
          .map(normalizeEquipmentStep)
          .filter((step): step is LotoEquipmentStepDto => step !== null)
      : [],
    authorizedPersonnel: Array.isArray(rawPersonnel)
      ? rawPersonnel
          .map(normalizeAuthorizedPerson)
          .filter((person): person is LotoAuthorizedPersonDto => person !== null)
      : [],
    canApply: asBoolean(readProp(raw, "canApply", "CanApply")),
    cannotApplyReason: asNullableString(
      readProp(raw, "cannotApplyReason", "CannotApplyReason"),
    ),
  };
}

function normalizeLocation(raw: unknown): LotoLocationDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    id: asNumber(readProp(raw, "id", "Id")),
    name: asString(readProp(raw, "name", "Name")),
  };
}

function normalizeLockoutRow(raw: unknown): LotoLockoutRowDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    id: asNumber(readProp(raw, "id", "Id")),
    logCode: asString(readProp(raw, "logCode", "LogCode")),
    lotoEquipmentId: asNumber(
      readProp(raw, "lotoEquipmentId", "LotoEquipmentId"),
    ),
    equipmentName: asString(readProp(raw, "equipmentName", "EquipmentName")),
    operatorName: asString(readProp(raw, "operatorName", "OperatorName")),
    lockNumber: asString(readProp(raw, "lockNumber", "LockNumber")),
    purpose: asString(readProp(raw, "purpose", "Purpose")),
    startedAt: asString(readProp(raw, "startedAt", "StartedAt")),
    expectedCompletionAt: asNullableString(
      readProp(raw, "expectedCompletionAt", "ExpectedCompletionAt"),
    ),
    removedAt: asNullableString(readProp(raw, "removedAt", "RemovedAt")),
    status: normalizeLockoutStatus(readProp(raw, "status", "Status")),
    canRemove: asBoolean(readProp(raw, "canRemove", "CanRemove")),
  };
}

function normalizePersonnel(raw: unknown): LotoPersonnelDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const rawEquipment = readProp(raw, "equipment", "Equipment");

  return {
    userId: asNumber(readProp(raw, "userId", "UserId")),
    fullName: asString(readProp(raw, "fullName", "FullName")),
    certifiedAt: asNullableString(readProp(raw, "certifiedAt", "CertifiedAt")),
    expiresAt: asNullableString(readProp(raw, "expiresAt", "ExpiresAt")),
    status: asString(readProp(raw, "status", "Status")) === "Expired"
      ? "Expired"
      : "Current",
    equipment: Array.isArray(rawEquipment)
      ? rawEquipment.map(asString).filter((code) => code !== "")
      : [],
  };
}

function normalizeDashboardKpis(raw: unknown): LotoDashboardKpisDto {
  const record = isRecord(raw) ? raw : {};

  return {
    equipmentOnFile: asNumber(readProp(record, "equipmentOnFile", "EquipmentOnFile")),
    activeLockouts: asNumber(readProp(record, "activeLockouts", "ActiveLockouts")),
    authorizedPersonnel: asNumber(
      readProp(record, "authorizedPersonnel", "AuthorizedPersonnel"),
    ),
    availableEquipment: asNumber(
      readProp(record, "availableEquipment", "AvailableEquipment"),
    ),
  };
}

function toList<T>(payload: unknown, normalize: (raw: unknown) => T | null): T[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map(normalize)
    .filter((item): item is T => item !== null);
}

/** The grid endpoints are POST-with-body RPC style; dataModel may be a bare array or a paged wrapper. */
function toPage<T>(
  payload: unknown,
  normalize: (raw: unknown) => T | null,
  fallback: Readonly<{ pageNumber: number; pageSize: number }>,
): LotoPage<T> {
  if (Array.isArray(payload)) {
    const items = toList(payload, normalize);
    return {
      items,
      totalRecords: items.length,
      pageNumber: fallback.pageNumber,
      pageSize: fallback.pageSize,
    };
  }

  if (isRecord(payload)) {
    const rawItems = readProp(payload, "data", "Data", "items", "Items");
    const items = toList(rawItems, normalize);

    return {
      items,
      totalRecords: asNumber(
        readProp(payload, "totalRecords", "TotalRecords"),
        items.length,
      ),
      pageNumber: asNumber(
        readProp(payload, "pageNumber", "PageNumber"),
        fallback.pageNumber,
      ),
      pageSize: asNumber(
        readProp(payload, "pageSize", "PageSize"),
        fallback.pageSize,
      ),
    };
  }

  return {
    items: [],
    totalRecords: 0,
    pageNumber: fallback.pageNumber,
    pageSize: fallback.pageSize,
  };
}

/** POST /api/Loto/GetAllEquipment — paginated equipment register grid. */
export async function getAllLotoEquipment(
  payload: GetAllLotoEquipmentRequestDto,
): Promise<LotoPage<LotoEquipmentGridRowDto>> {
  const { data } = await http.post<GetLotoEquipmentResponseDto>(
    LOTO_GET_ALL_EQUIPMENT_PATH,
    payload,
  );

  return toPage(unwrapDataModel(data), normalizeEquipmentGridRow, {
    pageNumber: payload.pageNumber,
    pageSize: payload.pageSize,
  });
}

/** GET /api/Loto/equipment/{id} — full equipment + procedure detail. */
export async function getLotoEquipmentById(
  id: number,
): Promise<LotoEquipmentDetailDto | null> {
  const { data } = await http.get<GetLotoEquipmentDetailResponseDto>(
    `${LOTO_EQUIPMENT_PATH}/${String(id)}`,
  );

  return normalizeEquipmentDetail(unwrapDataModel(data));
}

/** POST /api/Loto/equipment — creates the machine and its procedure in one call. */
export async function createLotoEquipment(
  payload: UpsertLotoEquipmentRequestDto,
): Promise<CreateLotoEquipmentResultDto | null> {
  const { data } = await http.post<CreateLotoEquipmentResponseDto>(
    LOTO_EQUIPMENT_PATH,
    payload,
  );

  const model = unwrapDataModel(data);
  if (!isRecord(model)) {
    return null;
  }

  return {
    id: asNumber(readProp(model, "id", "Id")),
    equipmentCode: asString(readProp(model, "equipmentCode", "EquipmentCode")),
  };
}

/** PUT /api/Loto/equipment/{id} — same body as create; the code cannot change. */
export async function updateLotoEquipment(
  id: number,
  payload: UpsertLotoEquipmentRequestDto,
): Promise<void> {
  const { data } = await http.put<ApiEnvelopeDto<unknown>>(
    `${LOTO_EQUIPMENT_PATH}/${String(id)}`,
    payload,
  );

  unwrapDataModel(data);
}

/** GET /api/Loto/locations?search= — the site's location register, ordered by name. */
export async function getLotoLocations(
  search?: string,
): Promise<LotoLocationDto[]> {
  const { data } = await http.get<GetLotoLocationsResponseDto>(
    LOTO_LOCATIONS_PATH,
    {
      params: search?.trim() ? { search: search.trim() } : undefined,
    },
  );

  return toList(unwrapDataModel(data), normalizeLocation);
}

/** POST /api/Loto/lockouts — apply a lockout; the backend assigns the lock number. */
export async function applyLotoLockout(
  payload: ApplyLotoLockoutRequestDto,
): Promise<ApplyLotoLockoutResultDto | null> {
  const { data } = await http.post<ApplyLotoLockoutResponseDto>(
    LOTO_LOCKOUTS_PATH,
    payload,
  );

  const model = unwrapDataModel(data);
  if (!isRecord(model)) {
    return null;
  }

  return {
    id: asNumber(readProp(model, "id", "Id")),
    logCode: asString(readProp(model, "logCode", "LogCode")),
    lockNumber: asString(readProp(model, "lockNumber", "LockNumber")),
  };
}

/** POST /api/Loto/lockouts/{id}/remove — only the operator who applied it may remove it. */
export async function removeLotoLockout(
  id: number,
  payload: RemoveLotoLockoutRequestDto,
): Promise<void> {
  const { data } = await http.post<RemoveLotoLockoutResponseDto>(
    `${LOTO_LOCKOUTS_PATH}/${String(id)}/remove`,
    payload,
  );

  unwrapDataModel(data);
}

/** GET /api/Loto/active-lockouts — every active lockout on the site, newest first. */
export async function getLotoActiveLockouts(): Promise<LotoLockoutRowDto[]> {
  const { data } = await http.get<GetLotoActiveLockoutsResponseDto>(
    LOTO_ACTIVE_LOCKOUTS_PATH,
  );

  return toList(unwrapDataModel(data), normalizeLockoutRow);
}

/** POST /api/Loto/GetAllLockouts — the global, site-wide history log. */
export async function getAllLotoLockouts(
  payload: GetAllLotoLockoutsRequestDto,
): Promise<LotoPage<LotoLockoutRowDto>> {
  const { data } = await http.post<GetLotoLockoutsResponseDto>(
    LOTO_GET_ALL_LOCKOUTS_PATH,
    payload,
  );

  return toPage(unwrapDataModel(data), normalizeLockoutRow, {
    pageNumber: payload.pageNumber,
    pageSize: payload.pageSize,
  });
}

/** GET /api/Loto/equipment/{id}/history — one machine's lockouts, newest first. */
export async function getLotoEquipmentHistory(
  id: number,
): Promise<LotoLockoutRowDto[]> {
  const { data } = await http.get<GetLotoEquipmentHistoryResponseDto>(
    `${LOTO_EQUIPMENT_PATH}/${String(id)}/history`,
  );

  return toList(unwrapDataModel(data), normalizeLockoutRow);
}

/** GET /api/Loto/personnel — everyone authorized on at least one machine on this site. */
export async function getLotoPersonnel(): Promise<LotoPersonnelDto[]> {
  const { data } = await http.get<GetLotoPersonnelResponseDto>(
    LOTO_PERSONNEL_PATH,
  );

  return toList(unwrapDataModel(data), normalizePersonnel);
}

/** GET /api/Loto/dashboard-kpis — KPI strip for the equipment tab. */
export async function getLotoDashboardKpis(): Promise<LotoDashboardKpisDto> {
  const { data } = await http.get<GetLotoDashboardKpisResponseDto>(
    LOTO_DASHBOARD_KPIS_PATH,
  );

  return normalizeDashboardKpis(unwrapDataModel(data));
}

import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import type {
  ApplyLotoLockoutRequestDto,
  GetAllLotoEquipmentRequestDto,
  GetAllLotoLockoutsRequestDto,
  RemoveLotoLockoutRequestDto,
  SaveLotoCertificationRequestDto,
  UpsertLotoEquipmentRequestDto,
} from "@/dtos/req/loto-request.dto";
import type {
  ApplyLotoLockoutResponseDto,
  ApplyLotoLockoutResultDto,
  LotoApplyBlockKindDto,
  CreateLotoEquipmentResponseDto,
  CreateLotoEquipmentResultDto,
  GetLotoActiveLockoutsResponseDto,
  GetLotoDashboardKpisResponseDto,
  GetLotoEquipmentDetailResponseDto,
  GetLotoEquipmentHistoryResponseDto,
  GetLotoEquipmentResponseDto,
  GetLotoLocationsResponseDto,
  LotoCertificationStatus,
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

const LOTO_PATH = "/loto";
const LOTO_EQUIPMENT_PATH = `${LOTO_PATH}/equipment`;
const LOTO_EQUIPMENT_SEARCH_PATH = `${LOTO_EQUIPMENT_PATH}/search`;
const LOTO_LOCKOUTS_PATH = `${LOTO_PATH}/lockouts`;
const LOTO_LOCKOUTS_SEARCH_PATH = `${LOTO_LOCKOUTS_PATH}/search`;
const LOTO_PERSONNEL_PATH = `${LOTO_PATH}/personnel`;
const LOTO_CERTIFICATION_PATH = `${LOTO_PERSONNEL_PATH}/certification`;
// Locations were promoted out of the LOTO controller into a global resource
// every module can reach (`LotoLocation` -> `Location`), so this is no longer
// under `/loto`.
const LOCATIONS_PATH = "/locations";
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

function normalizeEquipmentGridRow(
  raw: unknown,
): LotoEquipmentGridRowDto | null {
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

const APPLY_BLOCK_KINDS = new Set<LotoApplyBlockKindDto>([
  "Unauthorized",
  "CertificationExpired",
  "AlreadyLockedOut",
  "OutOfService",
]);

/** Unrecognized kinds read as null, so an unknown block never hides a control. */
function toApplyBlockKind(raw: unknown): LotoApplyBlockKindDto | null {
  const value = asNullableString(raw);
  return value !== null && APPLY_BLOCK_KINDS.has(value as LotoApplyBlockKindDto)
    ? (value as LotoApplyBlockKindDto)
    : null;
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
    isolationMethod: asNullableString(
      readProp(raw, "isolationMethod", "IsolationMethod"),
    ),
    lockTagPosition: asNullableString(
      readProp(raw, "lockTagPosition", "LockTagPosition"),
    ),
  };
}

function normalizeAuthorizedPerson(
  raw: unknown,
): LotoAuthorizedPersonDto | null {
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
    isOutOfService: asBoolean(
      readProp(raw, "isOutOfService", "IsOutOfService"),
    ),
    verificationMethod: asNullableString(
      readProp(raw, "verificationMethod", "VerificationMethod"),
    ),
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
          .filter(
            (person): person is LotoAuthorizedPersonDto => person !== null,
          )
      : [],
    canApply: asBoolean(readProp(raw, "canApply", "CanApply")),
    cannotApplyReason: asNullableString(
      readProp(raw, "cannotApplyReason", "CannotApplyReason"),
    ),
    cannotApplyKind: toApplyBlockKind(
      readProp(raw, "cannotApplyKind", "CannotApplyKind"),
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
    attachmentFileId: asNullableString(
      readProp(raw, "attachmentFileId", "AttachmentFileId"),
    ),
    canRemove: asBoolean(readProp(raw, "canRemove", "CanRemove")),
  };
}

/**
 * The API derives the badge; this only narrows the string to the union. An unknown value reads as
 * "Not certified" rather than "Current" — on a screen that decides who may isolate a machine, the
 * safe default is the one that shows a gap.
 */
function toCertificationStatus(raw: unknown): LotoCertificationStatus {
  const value = asString(raw);

  return value === "Current" || value === "Expiring" || value === "Expired"
    ? value
    : "Not certified";
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
    attachmentFileId: asNullableString(
      readProp(raw, "attachmentFileId", "AttachmentFileId"),
    ),
    // Taken as the API sent it rather than re-derived here. The old code mapped anything that
    // was not "Expired" to "Current", which is how a row with no dates at all read as green.
    status: toCertificationStatus(readProp(raw, "status", "Status")),
    equipment: Array.isArray(rawEquipment)
      ? rawEquipment.map(asString).filter((code) => code !== "")
      : [],
  };
}

function normalizeDashboardKpis(raw: unknown): LotoDashboardKpisDto {
  const record = isRecord(raw) ? raw : {};

  return {
    equipmentOnFile: asNumber(
      readProp(record, "equipmentOnFile", "EquipmentOnFile"),
    ),
    activeLockouts: asNumber(
      readProp(record, "activeLockouts", "ActiveLockouts"),
    ),
    authorizedPersonnel: asNumber(
      readProp(record, "authorizedPersonnel", "AuthorizedPersonnel"),
    ),
    availableEquipment: asNumber(
      readProp(record, "availableEquipment", "AvailableEquipment"),
    ),
  };
}

function toList<T>(
  payload: unknown,
  normalize: (raw: unknown) => T | null,
): T[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map(normalize).filter((item): item is T => item !== null);
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

/** POST /api/v1/loto/equipment/search — paginated equipment register grid. */
export async function getAllLotoEquipment(
  payload: GetAllLotoEquipmentRequestDto,
): Promise<LotoPage<LotoEquipmentGridRowDto>> {
  const { data } = await http.post<GetLotoEquipmentResponseDto>(
    LOTO_EQUIPMENT_SEARCH_PATH,
    payload,
  );

  return toPage(unwrapDataModel(data), normalizeEquipmentGridRow, {
    pageNumber: payload.pageNumber,
    pageSize: payload.pageSize,
  });
}

/** GET /api/v1/loto/equipment/{id} — full equipment + procedure detail. */
export async function getLotoEquipmentById(
  id: number,
): Promise<LotoEquipmentDetailDto | null> {
  const { data } = await http.get<GetLotoEquipmentDetailResponseDto>(
    `${LOTO_EQUIPMENT_PATH}/${String(id)}`,
  );

  return normalizeEquipmentDetail(unwrapDataModel(data));
}

/** POST /api/v1/loto/equipment — creates the machine and its procedure in one call. */
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

/** PUT /api/v1/loto/equipment/{id} — same body as create; the code cannot change. */
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

/**
 * DELETE /api/v1/loto/equipment/{id} — soft deletes the machine and its procedure.
 * Needs `Loto.Delete`.
 *
 * Refused by the API while an un-removed lockout is on the machine: the worker holding it needs
 * a record to take it off from.
 */
export async function dropLotoEquipment(id: number): Promise<void> {
  const { data } = await http.delete<ApiEnvelopeDto<unknown>>(
    `${LOTO_EQUIPMENT_PATH}/${String(id)}`,
  );

  unwrapDataModel(data);
}

/**
 * PUT /api/v1/loto/personnel/certification — records or replaces one person's LOTO training
 * dates. Needs `Loto.Update`.
 *
 * An upsert keyed on userId, so there is one row per person and re-saving edits it rather than
 * stacking a second. The API refuses an expiry earlier than the certified date.
 */
export async function saveLotoCertification(
  payload: SaveLotoCertificationRequestDto,
): Promise<void> {
  const { data } = await http.put<ApiEnvelopeDto<unknown>>(
    LOTO_CERTIFICATION_PATH,
    payload,
  );

  unwrapDataModel(data);
}

/** GET /api/v1/locations?search= — the site's location register, ordered by name. */
export async function getLotoLocations(
  search?: string,
): Promise<LotoLocationDto[]> {
  const { data } = await http.get<GetLotoLocationsResponseDto>(LOCATIONS_PATH, {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });

  return toList(unwrapDataModel(data), normalizeLocation);
}

/** POST /api/v1/loto/lockouts — apply a lockout; the backend assigns the lock number. */
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

/** POST /api/v1/loto/lockouts/{id}/remove — only the operator who applied it may remove it. */
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

/**
 * GET /api/v1/loto/lockouts?status=active — every active lockout on the site,
 * newest first. The dedicated `/Loto/active-lockouts` path collapsed into a
 * `status` query parameter on the lockouts collection.
 */
export async function getLotoActiveLockouts(): Promise<LotoLockoutRowDto[]> {
  const { data } = await http.get<GetLotoActiveLockoutsResponseDto>(
    LOTO_LOCKOUTS_PATH,
    { params: { status: "active" } },
  );

  return toList(unwrapDataModel(data), normalizeLockoutRow);
}

/** POST /api/v1/loto/lockouts/search — the global, site-wide history log. */
export async function getAllLotoLockouts(
  payload: GetAllLotoLockoutsRequestDto,
): Promise<LotoPage<LotoLockoutRowDto>> {
  const { data } = await http.post<GetLotoLockoutsResponseDto>(
    LOTO_LOCKOUTS_SEARCH_PATH,
    payload,
  );

  return toPage(unwrapDataModel(data), normalizeLockoutRow, {
    pageNumber: payload.pageNumber,
    pageSize: payload.pageSize,
  });
}

/** GET /api/v1/loto/equipment/{id}/history — one machine's lockouts, newest first. */
export async function getLotoEquipmentHistory(
  id: number,
): Promise<LotoLockoutRowDto[]> {
  const { data } = await http.get<GetLotoEquipmentHistoryResponseDto>(
    `${LOTO_EQUIPMENT_PATH}/${String(id)}/history`,
  );

  return toList(unwrapDataModel(data), normalizeLockoutRow);
}

/** GET /api/v1/loto/personnel — everyone authorized on at least one machine on this site. */
export async function getLotoPersonnel(): Promise<LotoPersonnelDto[]> {
  const { data } =
    await http.get<GetLotoPersonnelResponseDto>(LOTO_PERSONNEL_PATH);

  return toList(unwrapDataModel(data), normalizePersonnel);
}

/** GET /api/v1/loto/dashboard-kpis — KPI strip for the equipment tab. */
export async function getLotoDashboardKpis(): Promise<LotoDashboardKpisDto> {
  const { data } = await http.get<GetLotoDashboardKpisResponseDto>(
    LOTO_DASHBOARD_KPIS_PATH,
  );

  return normalizeDashboardKpis(unwrapDataModel(data));
}

import type { CreateRcaCategoryRequestDto } from "@/dtos/req/rca-category-request.dto";
import type {
  CreateRcaCorrectiveActionRequestDto,
  DropRcaCorrectiveActionRequestDto,
  UpdateRcaCorrectiveActionRequestDto,
} from "@/dtos/req/rca-corrective-action-request.dto";
import type {
  CreateContributingFactorRequestDto,
  UpdateContributingFactorRequestDto,
} from "@/dtos/req/rca-contributing-factor-request.dto";
import type {
  CreateRcaWhysRequestDto,
  DropRcaWhyRequestDto,
  UpdateRcaWhyRequestDto,
} from "@/dtos/req/rca-whys-request.dto";
import type {
  RcaCategoriesEnvelopeDto,
  RcaCategoryDto,
  RcaCategoryEnvelopeDto,
} from "@/dtos/res/rca-category-response.dto";
import type {
  RcaContributingFactorDto,
  RcaCorrectiveActionItemDto,
  RcaContributingFactorEnvelopeDto,
  RcaCorrectiveActionEnvelopeDto,
  RcaIncidentEnvelopeDto,
  RcaWhyEnvelopeDto,
  RcaWhysEnvelopeDto,
  RcaWhyItemDto,
} from "@/dtos/res/rca-incident-response.dto";
import http, { HttpError } from "@/lib/axios";

const RCA_CATEGORIES_PATH = "/Rca/Categories";
const RCA_BY_INCIDENT_PATH = "/Rca/Incident";
const CAPA_RCA_BY_ID_PATH = "/CAPA/Rca";
const RCA_CONTRIBUTING_FACTOR_PATH = "/Rca/ContributingFactor";
const RCA_WHYS_PATH = "/Rca/Whys";
const RCA_WHY_PATH = "/Rca/Why";
const RCA_CORRECTIVE_ACTION_PATH = "/Rca/CorrectiveAction";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined) {
      return record[key];
    }
  }
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  return undefined;
}

function coerceRcaCategory(
  raw: Record<string, unknown>,
): RcaCategoryDto | null {
  const id = asNumber(readProp(raw, "id", "Id", "categoryId", "CategoryId"));
  const name = asString(
    readProp(raw, "name", "Name", "label", "Label", "category", "Category"),
  );

  if (id == null || !name) {
    return null;
  }

  return { id, name };
}

function readCategoryList(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return null;
  }

  const nested = readProp(
    payload,
    "dataModel",
    "DataModel",
    "data",
    "Data",
    "items",
    "Items",
    "categories",
    "Categories",
  );

  return Array.isArray(nested) ? nested : null;
}

function normalizeRcaCategoryList(data: unknown): RcaCategoryDto[] {
  const list = readCategoryList(data);

  if (!list) {
    return [];
  }

  return list
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => coerceRcaCategory(item))
    .filter((item): item is RcaCategoryDto => item != null);
}

function normalizeRcaCategory(data: unknown): RcaCategoryDto | null {
  if (isRecord(data)) {
    const single = coerceRcaCategory(data);
    if (single) {
      return single;
    }
  }

  return normalizeRcaCategoryList(data)[0] ?? null;
}

function coerceRcaWhyItem(raw: Record<string, unknown>): RcaWhyItemDto | null {
  const id = asNumber(readProp(raw, "id", "Id", "whyId", "WhyId"));
  const stepNumber = asNumber(
    readProp(raw, "stepNumber", "StepNumber", "num", "Num"),
  );
  const description =
    asString(readProp(raw, "description", "Description")) ?? "";
  const isRootCause =
    asBoolean(readProp(raw, "isRootCause", "IsRootCause")) ?? false;

  if (id == null || stepNumber == null) {
    return null;
  }

  return { id, stepNumber, description, isRootCause };
}

function coerceRcaCorrectiveActionItem(
  raw: Record<string, unknown>,
): RcaCorrectiveActionItemDto | null {
  const id = asNumber(
    readProp(
      raw,
      "id",
      "Id",
      "correctiveActionId",
      "CorrectiveActionId",
    ),
  );
  const description =
    asString(readProp(raw, "description", "Description")) ?? "";

  if (id == null) {
    return null;
  }

  return { id, description };
}

function readObjectList(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return null;
  }

  const nested = readProp(
    payload,
    "dataModel",
    "DataModel",
    "data",
    "Data",
    "items",
    "Items",
  );

  return Array.isArray(nested) ? nested : null;
}

function normalizeRcaWhyList(raw: unknown): RcaWhyItemDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => coerceRcaWhyItem(item))
    .filter((item): item is RcaWhyItemDto => item != null)
    .sort((left, right) => left.stepNumber - right.stepNumber);
}

function normalizeRcaCorrectiveActionList(
  raw: unknown,
): RcaCorrectiveActionItemDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => coerceRcaCorrectiveActionItem(item))
    .filter((item): item is RcaCorrectiveActionItemDto => item != null);
}

function coerceRcaContributingFactor(
  raw: Record<string, unknown>,
): RcaContributingFactorDto | null {
  const id = asNumber(
    readProp(raw, "id", "Id", "contributingFactorId", "ContributingFactorId"),
  );
  const incidentId = asNumber(readProp(raw, "incidentId", "IncidentId"));
  const rcaCategoryId = asNumber(
    readProp(raw, "rcaCategoryId", "RcaCategoryId", "categoryId", "CategoryId"),
  );
  const rcaCategoryName =
    asString(
      readProp(
        raw,
        "rcaCategoryName",
        "RcaCategoryName",
        "categoryName",
        "CategoryName",
      ),
    ) ?? "";
  const siteId = asNumber(readProp(raw, "siteId", "SiteId"));
  const userId = asNumber(readProp(raw, "userId", "UserId"));
  const description =
    asString(readProp(raw, "description", "Description")) ?? "";
  const whys = normalizeRcaWhyList(
    readProp(raw, "whys", "Whys", "whySteps", "WhySteps"),
  );
  const correctiveActions = normalizeRcaCorrectiveActionList(
    readProp(
      raw,
      "correctiveActions",
      "CorrectiveActions",
      "actions",
      "Actions",
    ),
  );

  if (id == null || rcaCategoryId == null) {
    return null;
  }

  return {
    id,
    description,
    incidentId: incidentId ?? 0,
    rcaCategoryId,
    rcaCategoryName,
    siteId: siteId ?? 0,
    userId: userId ?? 0,
    whys,
    correctiveActions,
  };
}

function normalizeRcaContributingFactorList(
  data: unknown,
): RcaContributingFactorDto[] {
  const list = readObjectList(data);

  if (list) {
    return list
      .filter((item): item is Record<string, unknown> => isRecord(item))
      .map((item) => coerceRcaContributingFactor(item))
      .filter((item): item is RcaContributingFactorDto => item != null);
  }

  if (!isRecord(data)) {
    return [];
  }

  const nested = readProp(
    data,
    "contributingFactors",
    "ContributingFactors",
    "factors",
    "Factors",
  );
  if (Array.isArray(nested)) {
    return nested
      .filter((item): item is Record<string, unknown> => isRecord(item))
      .map((item) => coerceRcaContributingFactor(item))
      .filter((item): item is RcaContributingFactorDto => item != null);
  }

  const single = coerceRcaContributingFactor(data);
  return single ? [single] : [];
}

function parseRcaIncidentEnvelope(data: unknown): RcaIncidentEnvelopeDto {
  if (!isRecord(data)) {
    throw new HttpError({
      message: "Invalid RCA incident response.",
      status: 500,
      data,
    });
  }

  const meta = readEnvelopeMeta(data);
  const factors = normalizeRcaContributingFactorList(
    readProp(data, "dataModel", "DataModel") ?? data,
  );

  assertEnvelopeSuccess(data, meta);

  return {
    ...meta,
    dataModel: factors,
  };
}

function parseRcaContributingFactorEnvelope(
  data: unknown,
  fallback?:
    | CreateContributingFactorRequestDto
    | UpdateContributingFactorRequestDto,
): RcaContributingFactorEnvelopeDto {
  if (!isRecord(data)) {
    throw new HttpError({
      message: "Invalid RCA contributing factor response.",
      status: 500,
      data,
    });
  }

  const meta = readEnvelopeMeta(data);
  const dataModelRaw = readProp(data, "dataModel", "DataModel");
  let factor = isRecord(dataModelRaw)
    ? coerceRcaContributingFactor(dataModelRaw)
    : null;

  if (!factor && isRecord(dataModelRaw) && fallback) {
    const contributingFactorId =
      "contributingFactorId" in fallback
        ? fallback.contributingFactorId
        : undefined;

    factor = coerceRcaContributingFactor({
      ...dataModelRaw,
      id:
        readProp(dataModelRaw, "id", "Id", "contributingFactorId", "ContributingFactorId") ??
        contributingFactorId,
      incidentId:
        readProp(dataModelRaw, "incidentId", "IncidentId") ?? fallback.incidentId,
      rcaCategoryId:
        readProp(dataModelRaw, "rcaCategoryId", "RcaCategoryId") ??
        fallback.rcaCategoryId,
      description:
        readProp(dataModelRaw, "description", "Description") ??
        fallback.description,
      userId: readProp(dataModelRaw, "userId", "UserId") ?? fallback.userId,
      siteId:
        readProp(dataModelRaw, "siteId", "SiteId") ??
        ("siteId" in fallback ? fallback.siteId : undefined),
    });
  }

  assertEnvelopeSuccess(data, meta);

  if (!factor) {
    throw new HttpError({
      message: "RCA contributing factor response did not include a factor.",
      status: meta.statusCode,
      data,
    });
  }

  return {
    ...meta,
    dataModel: factor,
  };
}

function readEnvelopeMeta(data: Record<string, unknown>) {
  const isError = asBoolean(readProp(data, "isError", "IsError")) ?? false;
  const success = asBoolean(readProp(data, "success", "Success")) ?? !isError;
  const message =
    asString(readProp(data, "message", "Message")) ??
    "RCA category request failed.";
  const statusCode =
    asNumber(readProp(data, "statusCode", "StatusCode")) ??
    (success ? 200 : 500);

  return {
    isError,
    success,
    message,
    statusCode,
    errorDetails: readProp(data, "errorDetails", "ErrorDetails") ?? null,
  };
}

function assertEnvelopeSuccess(
  data: unknown,
  meta: ReturnType<typeof readEnvelopeMeta>,
): void {
  if (!meta.success || meta.isError) {
    throw new HttpError({
      message: meta.message,
      status: meta.statusCode,
      data,
    });
  }
}

function parseRcaActionEnvelope(data: unknown): void {
  if (!isRecord(data)) {
    throw new HttpError({
      message: "Invalid RCA response.",
      status: 500,
      data,
    });
  }

  const meta = readEnvelopeMeta(data);
  assertEnvelopeSuccess(data, meta);
}

function parseRcaWhysEnvelope(data: unknown): RcaWhysEnvelopeDto {
  if (!isRecord(data)) {
    throw new HttpError({
      message: "Invalid RCA whys response.",
      status: 500,
      data,
    });
  }

  const meta = readEnvelopeMeta(data);
  const whys = normalizeRcaWhyList(
    readProp(data, "dataModel", "DataModel") ?? data,
  );

  assertEnvelopeSuccess(data, meta);

  return {
    ...meta,
    dataModel: whys,
  };
}

function parseRcaWhyEnvelope(
  data: unknown,
  fallback?: UpdateRcaWhyRequestDto,
): RcaWhyEnvelopeDto {
  if (!isRecord(data)) {
    throw new HttpError({
      message: "Invalid RCA why response.",
      status: 500,
      data,
    });
  }

  const meta = readEnvelopeMeta(data);
  const dataModelRaw = readProp(data, "dataModel", "DataModel");
  let why = isRecord(dataModelRaw) ? coerceRcaWhyItem(dataModelRaw) : null;

  if (!why && fallback) {
    why = coerceRcaWhyItem({
      id: fallback.whyId,
      stepNumber: fallback.stepNumber,
      description: fallback.description,
      isRootCause: fallback.isRootCause,
    });
  }

  if (!why) {
    why = normalizeRcaWhyList(
      readProp(data, "dataModel", "DataModel") ?? data,
    )[0] ?? null;
  }

  assertEnvelopeSuccess(data, meta);

  if (!why) {
    throw new HttpError({
      message: "RCA why response did not include a why step.",
      status: meta.statusCode,
      data,
    });
  }

  return {
    ...meta,
    dataModel: why,
  };
}

function parseRcaCorrectiveActionEnvelope(
  data: unknown,
  fallback?:
    | CreateRcaCorrectiveActionRequestDto
    | UpdateRcaCorrectiveActionRequestDto,
): RcaCorrectiveActionEnvelopeDto {
  if (!isRecord(data)) {
    throw new HttpError({
      message: "Invalid RCA corrective action response.",
      status: 500,
      data,
    });
  }

  const meta = readEnvelopeMeta(data);
  const dataModelRaw = readProp(data, "dataModel", "DataModel");
  let action = isRecord(dataModelRaw)
    ? coerceRcaCorrectiveActionItem(dataModelRaw)
    : null;

  if (!action && fallback) {
    action = coerceRcaCorrectiveActionItem({
      id:
        "correctiveActionId" in fallback
          ? fallback.correctiveActionId
          : undefined,
      description: fallback.description,
    });
  }

  if (!action) {
    action =
      normalizeRcaCorrectiveActionList(
        readProp(data, "dataModel", "DataModel") ?? data,
      )[0] ?? null;
  }

  assertEnvelopeSuccess(data, meta);

  if (!action) {
    throw new HttpError({
      message: "RCA corrective action response did not include an action.",
      status: meta.statusCode,
      data,
    });
  }

  return {
    ...meta,
    dataModel: action,
  };
}

function parseRcaCategoriesEnvelope(data: unknown): RcaCategoriesEnvelopeDto {
  if (!isRecord(data)) {
    throw new HttpError({
      message: "Invalid RCA categories response.",
      status: 500,
      data,
    });
  }

  const meta = readEnvelopeMeta(data);
  const categories = normalizeRcaCategoryList(
    readProp(data, "dataModel", "DataModel") ?? data,
  );

  assertEnvelopeSuccess(data, meta);

  return {
    ...meta,
    dataModel: categories,
  };
}

function parseRcaCategoryEnvelope(data: unknown): RcaCategoryEnvelopeDto {
  if (!isRecord(data)) {
    throw new HttpError({
      message: "Invalid RCA category response.",
      status: 500,
      data,
    });
  }

  const meta = readEnvelopeMeta(data);
  const dataModelRaw = readProp(data, "dataModel", "DataModel");
  const category = isRecord(dataModelRaw)
    ? coerceRcaCategory(dataModelRaw)
    : normalizeRcaCategory(data);

  assertEnvelopeSuccess(data, meta);

  if (!category) {
    throw new HttpError({
      message: "RCA category response did not include a category.",
      status: meta.statusCode,
      data,
    });
  }

  return {
    ...meta,
    dataModel: category,
  };
}

/** GET /api/Rca/Categories */
export async function getRcaCategories(): Promise<RcaCategoryDto[]> {
  const { data } = await http.get<unknown>(RCA_CATEGORIES_PATH);
  return parseRcaCategoriesEnvelope(data).dataModel;
}

/** POST /api/Rca/Categories */
export async function createRcaCategory(
  payload: CreateRcaCategoryRequestDto,
): Promise<RcaCategoryDto> {
  const { data } = await http.post<unknown>(RCA_CATEGORIES_PATH, payload);
  return parseRcaCategoryEnvelope(data).dataModel;
}

/** GET /api/Rca/Incident/{incidentId} */
export async function getRcaByIncidentId(
  incidentId: number,
): Promise<RcaContributingFactorDto[]> {
  const { data } = await http.get<unknown>(
    `${RCA_BY_INCIDENT_PATH}/${String(incidentId)}`,
  );
  return parseRcaIncidentEnvelope(data).dataModel;
}

/** GET /api/CAPA/Rca/{rcaId} */
export async function getCapaRcaById(
  rcaId: number,
): Promise<RcaContributingFactorDto[]> {
  if (!Number.isFinite(rcaId) || rcaId <= 0) {
    return [];
  }

  const { data } = await http.get<unknown>(
    `${CAPA_RCA_BY_ID_PATH}/${encodeURIComponent(String(rcaId))}`,
  );
  return parseRcaIncidentEnvelope(data).dataModel;
}

/** POST /api/Rca/ContributingFactor */
export async function createContributingFactor(
  payload: CreateContributingFactorRequestDto,
): Promise<RcaContributingFactorDto> {
  const { data } = await http.post<unknown>(
    RCA_CONTRIBUTING_FACTOR_PATH,
    payload,
  );
  return parseRcaContributingFactorEnvelope(data, payload).dataModel;
}

/** PUT /api/Rca/ContributingFactor */
export async function updateContributingFactor(
  payload: UpdateContributingFactorRequestDto,
): Promise<RcaContributingFactorDto> {
  const { data } = await http.put<unknown>(
    RCA_CONTRIBUTING_FACTOR_PATH,
    payload,
  );
  return parseRcaContributingFactorEnvelope(data, payload).dataModel;
}

/** PATCH /api/Rca/ContributingFactor/Drop/{id} */
/** POST /api/Rca/Whys */
export async function createRcaWhys(
  payload: CreateRcaWhysRequestDto,
): Promise<RcaWhyItemDto[]> {
  const { data } = await http.post<unknown>(RCA_WHYS_PATH, payload);
  return parseRcaWhysEnvelope(data).dataModel;
}

/** PUT /api/Rca/Why */
export async function updateRcaWhy(
  payload: UpdateRcaWhyRequestDto,
): Promise<RcaWhyItemDto> {
  const { data } = await http.put<unknown>(RCA_WHY_PATH, payload);
  return parseRcaWhyEnvelope(data, payload).dataModel;
}

/** PATCH /api/Rca/Why/Drop/{id} */
export async function dropRcaWhy(
  id: number,
  payload: DropRcaWhyRequestDto,
): Promise<void> {
  const { data } = await http.patch<unknown>(
    `${RCA_WHY_PATH}/Drop/${encodeURIComponent(String(id))}`,
    payload,
  );
  parseRcaActionEnvelope(data);
}

/** POST /api/Rca/CorrectiveAction */
export async function createRcaCorrectiveAction(
  payload: CreateRcaCorrectiveActionRequestDto,
): Promise<RcaCorrectiveActionItemDto> {
  const { data } = await http.post<unknown>(
    RCA_CORRECTIVE_ACTION_PATH,
    payload,
  );
  return parseRcaCorrectiveActionEnvelope(data, payload).dataModel;
}

/** PUT /api/Rca/CorrectiveAction */
export async function updateRcaCorrectiveAction(
  payload: UpdateRcaCorrectiveActionRequestDto,
): Promise<RcaCorrectiveActionItemDto> {
  const { data } = await http.put<unknown>(
    RCA_CORRECTIVE_ACTION_PATH,
    payload,
  );
  return parseRcaCorrectiveActionEnvelope(data, payload).dataModel;
}

/** PATCH /api/Rca/CorrectiveAction/Drop/{id} */
export async function dropRcaCorrectiveAction(
  id: number,
  payload: DropRcaCorrectiveActionRequestDto,
): Promise<void> {
  const { data } = await http.patch<unknown>(
    `${RCA_CORRECTIVE_ACTION_PATH}/Drop/${encodeURIComponent(String(id))}`,
    payload,
  );
  parseRcaActionEnvelope(data);
}
